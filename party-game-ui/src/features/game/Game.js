import React, { useCallback, useEffect, useRef, useState } from 'react';
import { clearWrongAnswer, setFlash } from './gameSlice';
import { useDispatch, useSelector } from 'react-redux';

import Answers from './Answers';
import Faces from '../common/Faces';
import Flash from '../common/Flash';
import Timer from './Timer';
import {
    channelPush
} from '../phoenix/phoenixMiddleware';
import { history } from '../store';
import { push } from "redux-first-history";

const sendEvent = (topic, channelData, action) => (
    {
        topic: topic,
        event: topic,
        data: Object.assign(channelData, {
            action
        })
    });

export default function Game() {

    const dispatch = useDispatch();
    const {
        isRoundStarted,
        playerName,        
        gameChannel,
        isGameOwner,
        question,
        answers,
        flash,
        isWrong,
        round,
        isOver,
        correct,
        roundWinner,
        settings,
        startCountdown,
    } = useSelector(state => state.game);

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(settings.nextQuestionTime);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

    const startedRef = useRef(isRoundStarted);
    startedRef.current = isRoundStarted;

    const roundRef = useRef(round);
    roundRef.current = round;

    if (!gameChannel) {
        dispatch(push('/'));
    }

    useEffect(() => {
        if (startCountdown) {
            setTimerSeconds(settings.nextQuestionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [startCountdown, isTimerActive, settings.nextQuestionTime]);

    useEffect(() => {
        if (isRoundStarted) {
            setTimerSeconds(settings.questionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [isRoundStarted, isTimerActive, settings.questionTime]);

    function startClick(e, action, payload = {}) {
        e && e.preventDefault();
        startClickCallback(action, payload);
    }

    function timerDone() {
        setIsTimerActive(false);
        startClickCallback(correct ? "start_round" : "next_question");
    }

    function onAnswerClick(e, answer) {
        setIsQuestionAnswered(true);
        const data = { answer, name: playerName };
        dispatch(channelPush(sendEvent(gameChannel, data, "buzz")));
    }

    const startClickCallback = useCallback((action, payload = {}) => {
        setIsQuestionAnswered(false);
        const data = { name: playerName, ...payload };
        dispatch(channelPush(sendEvent(gameChannel, data, action || "start_round")));
    }, [gameChannel, dispatch, playerName])

    useEffect(() => {
        setTimeout(() => {
            //In case round ends before timer is reset - 
            //if (startedRef.current && roundRef.current === round) {
            if (isWrong) {
                dispatch(clearWrongAnswer());
                setIsQuestionAnswered(false);
                dispatch(setFlash({ text: "" }))
            }
        }, settings.wrongAnswerTimeout * 1000);

    }, [dispatch, isWrong, settings.wrongAnswerTimeout]);

    useEffect(() => {
        if (isOver) {
            setTimeout(() => {
                dispatch(push('/score'));
            }, settings.nextQuestionTime * 1000);
        }
    }, [isOver, dispatch, settings.nextQuestionTime]);

    useEffect(() => {
        const unblock = history.block((tx) => {
            if (tx.action === "POP" && tx.location.pathname === "/lobby"){                
                return false;
            }

            if (tx.action === "PUSH" && tx.location.pathname === "/") {
                //// Prevent console error when refresh page.
                unblock();
                return true;
            }

            unblock();
            tx.retry();
            return true;
        });

        return () => {
            unblock();
          };
    }, []);

    function isHappy() {
        return roundWinner === playerName && correct !== "";
    }

    return (
        <React.Fragment>
            <div className="full-width full-height flex-container flex-column">
                <header>
                    <h2 class="landscape-hidden">Buzz Game</h2>
                </header>

                <div className='flex-column'>
                    {(isHappy() || isWrong) && <Faces isHappy={!isWrong} className="no-pointer flex-column" />}

                    <Flash flash={flash}></Flash>
                    {isWrong && <span>Wrong</span>}
                    {isWrong && settings.wrongAnswerTimeout > 1 &&
                        //Bug: Round ends before wrong timeout 
                        <span>, Try again in&nbsp;
                            <Timer key={isWrong + settings.wrongAnswerTimeout}
                                isActive={isWrong}
                                timeIncrement={-1}
                                timeFormat={"seconds"}
                                startSeconds={settings.wrongAnswerTimeout}>
                            </Timer>
                            &nbsp;seconds
                        </span>
                    }
                </div>


                <div className='flex-coumn empty-space offset-phone-addressbar'>
                    <div className="question">
                        {question}
                    </div>
                    <div>
                        <span className="typography-md-text">
                            {startCountdown && "Game starts in "}
                            {!startCountdown && isRoundStarted && "Round ends in "}

                            <Timer key={isTimerActive + timerSeconds}
                                isActive={isTimerActive}
                                timeIncrement={-1}
                                timerDone={timerDone}
                                timeFormat={"seconds"}
                                startSeconds={timerSeconds}>
                            </Timer>
                        </span>
                    </div>

                    <Answers onAnswerClick={onAnswerClick}
                        isDisabled={(!isRoundStarted && isQuestionAnswered) || (correct !== "" || isWrong)}
                        answers={answers}
                        correct={correct}>
                    </Answers>

                    <div className="flex-container">
                        {isGameOwner && !isRoundStarted && settings.nextQuestionTime > 2 &&
                            <a className="app-link" href="/#" onClick={startClick}>Next</a>}
                    </div>
                </div>

            </div>
        </React.Fragment>
    );
}
