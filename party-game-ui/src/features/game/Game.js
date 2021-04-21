import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    channelJoin,
    channelLeave,
    channelOff,
    channelOn,
    channelPush,
} from '../phoenix/phoenixMiddleware';
import { clearWrongAnswer, phxReply, setFlash, startRound, stopRound } from './gameSlice';
import { useDispatch, useSelector } from 'react-redux';

import Answers from './Answers';
import Faces from '../common/Faces';
import Flash from '../common/Flash';
import Timer from './Timer';
import { push } from 'connected-react-router'

const onEvents = (topic) => [
    {
        event: 'buzz',
        dispatcher: stopRound(),
        topic,
    },
    {
        event: 'startstop',
        dispatcher: startRound(),
        topic,
    },
    {
        event: 'phx_reply',
        dispatcher: phxReply(),
        topic,
    }
]

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
        gameCode,
        gameOwner,
        question,
        answers,
        flash,
        isWrong,
        round,
        game,
        isOver,
        correct,
        roundWinner,
        configuration,
        startCountdown,
    } = useSelector(state => state.game);

    const gameList = useSelector(state => state.game.api.list.data);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(configuration.nextQuestionTime);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

    const startedRef = useRef(isRoundStarted);
    startedRef.current = isRoundStarted;
    
    const roundRef = useRef(round);
    roundRef.current = round;

    if (!gameCode) {
        dispatch(push('/'));
    }

    const topic = `buzzer:${gameCode}`;

    useEffect(() => {
        if (startCountdown) {
            setTimerSeconds(configuration.nextQuestionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [startCountdown, isTimerActive, configuration.nextQuestionTime]);

    useEffect(() => {
        dispatch(channelJoin({ topic, data: { name: playerName } }));
        return () => dispatch(channelLeave({ topic }));
    }, [dispatch, topic, playerName]);

    useEffect(() => {
        onEvents(topic).forEach((e) => dispatch(channelOn(e)));
        return () => onEvents(topic).forEach((e) => dispatch(channelOff(e)));
    }, [dispatch, topic]);

    useEffect(() => {
        if (isRoundStarted) {
            setTimerSeconds(configuration.questionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [isRoundStarted, isTimerActive, configuration.questionTime]);

    useEffect(() => {
        setTimeout(() => {
            if (isWrong) {
                dispatch(clearWrongAnswer());
            }
        }, 1000);

    }, [dispatch, isWrong]);

    function startClick(e, action, payload = {}) {
        e && e.preventDefault();
        startClickCallback(action, payload);
    }

    function pauseOnWrongAnswer() {
        setTimeout(() => {
            setIsQuestionAnswered(false);
            if (startedRef.current && roundRef.current === round) {
                dispatch(setFlash({ text: "Try Again" }))
            }
        }, configuration.pauseOnWrongAnswer * 1000)
    }

    function timerDone() {
        setIsTimerActive(false);
        startClickCallback(correct ? "start" : "next");
    }

    function onAnswerClick(e, answer) {
        setIsQuestionAnswered(true);
        const data = { answer, name: playerName };
        dispatch(channelPush(sendEvent(topic, data, "buzz")));
        pauseOnWrongAnswer();
    }

    const startClickCallback = useCallback((action, payload = {}) => {
        setIsQuestionAnswered(false);
        const data = { name: playerName, ...payload };
        dispatch(channelPush(sendEvent(topic, data, action || "start")));
      }, [topic, dispatch, playerName])

    useEffect(() => {
        setIsTimerActive(false);
        
        startClickCallback("new", { game: game || (gameList && gameList[0]), rounds: 5 });
    }, [game, startClickCallback, gameList]);

    useEffect(() => {
        setTimeout(() => {
            if (isWrong) {
                dispatch(clearWrongAnswer());
            }
        }, 1000);

    }, [dispatch, isWrong]);

    if (isOver) {
        setTimeout(() => {
            dispatch(push('/score'));
        }, 1000);
    }

    return (
        <React.Fragment>
            <div className="app-light lg-12">
                <header className="app-header1">
                    <h3>Buzz Game</h3>
                    {roundWinner === playerName && correct !== "" && <Faces isHappy={true} />}
                    {isWrong && <Faces key={isWrong} isHappy={false} />}
                </header>
                <div className="question">
                    {question}
                </div>

                <Answers onAnswerClick={onAnswerClick}
                    isDisabled={(!isRoundStarted && isQuestionAnswered) || (correct !== "" || isWrong)}
                    answers={answers}
                    correct={correct}>
                </Answers>

                <div>
                    <Flash flash={flash}></Flash>
                </div>
                <div className="flex-container">
                    {gameOwner === playerName && !isRoundStarted &&
                        <a className="app-link" href="/#" onClick={startClick}>Next</a>}
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
            </div>
        </React.Fragment>
    );
}
