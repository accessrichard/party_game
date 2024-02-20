import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Answers from './Answers';
import Faces from '../common/Faces';
import Flash from '../common/Flash';
import { Navigate } from 'react-router-dom';
import Timer from '../common/Timer';
import { push } from "redux-first-history";
import usePrevious from '../usePrevious';
import { usePhoenixEvents } from '../phoenix/usePhoenix';
import useBackButtonBlock from '../useBackButtonBlock';

import {
    channelPush, channelOn, channelOff
} from '../phoenix/phoenixMiddleware';

import {
    clearWrongAnswer,
    setFlash,
    unansweredTimeout, handleChangeOwner,
    handleCorrectAnswer,
    handleGenServerTimeout,
    startRound,
    handleWrongAnswer,
} from './gameSlice';

const sendEvent = (topic, channelData, action) => (
    {
        topic: topic,
        event: action,
        data: channelData
    });

const events = (topic) => [
    {
        event: 'handle_correct_answer',
        dispatcher: handleCorrectAnswer(),
        topic,
    },
    {
        event: 'handle_next_question',
        dispatcher: startRound(),
        topic,
    },
    {
        event: 'handle_wrong_answer',
        dispatcher: handleWrongAnswer(),
        topic,
    },
    {
        event: 'handle_game_server_idle_timeout',
        dispatcher: handleGenServerTimeout(),
        topic,
    },
    {
        event: 'handle_room_owner_change',
        dispatcher: handleChangeOwner(),
        topic,
    }
]

export default function Game() {

    const dispatch = useDispatch();
    const {
        isRoundStarted,
        playerName,
        gameChannel,
        gameCode,
        isGameOwner,
        question,
        id,
        answers,
        flash,
        isWrong,
        round,
        isOver,
        correct,
        roundWinner,
        settings,
        startCountdown
    } = useSelector(state => state.game);

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(settings.nextQuestionTime);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
    const [timerStartDate, setTimerStartDate] = useState(null);

    const [canRetryWrongAnswer, setCanRetryWrongAnswer] = useState(true);

    const prevRound = usePrevious(round);

    usePhoenixEvents(`game:${gameCode}`, events);
    useBackButtonBlock();


    /**
     * Sets a delay timeout on wrong answers as configured in the settings.
     */
    useEffect(() => {
        if (timerStartDate === null) {
            setCanRetryWrongAnswer(true);
            return;
        }

        const countDownSeconds = Math.round((new Date() - timerStartDate) / 1000);
        setCanRetryWrongAnswer(countDownSeconds - settings.wrongAnswerTimeout > 0);
    }, [timerStartDate, isWrong, settings.wrongAnswerTimeout]);

    /**
     * Sets a countdown timer until the question can no longer be answered
     * or until the next question is displayed as configured in settings.
     */
    useEffect(() => {
        if (startCountdown) {
            setTimerSeconds(settings.nextQuestionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [startCountdown, isTimerActive, settings.nextQuestionTime]);


    /**
     * Activates the timer when a round is started.
     */
    useEffect(() => {
        if (isRoundStarted && round === prevRound) {
            setTimerSeconds(settings.questionTime);
            setIsTimerActive(true);
        } else if (round !== prevRound && isRoundStarted) {
            /// Force reset of timer when round changes
            /// since timers can go out of sync across players.
            setIsTimerActive(new Date());
            setIsQuestionAnswered(false);
        }

        return () => { setIsTimerActive(false); };
    }, [isRoundStarted, isTimerActive, settings.questionTime, round, prevRound]);

    function startClick(e) {
        e && e.preventDefault();
        startClickCallback(correct ? "start_round" : "next_question");
    }

    function onTimerCompleted() {
        if (!isGameOwner) {
            return;
        }

        setIsTimerActive(false);
        if (!isQuestionAnswered && isRoundStarted) {
            dispatch(unansweredTimeout())
            return;
        }

        startClickCallback(correct ? "start_round" : "next_question");
    }

    function onAnswerClick(e, answer) {
        setIsQuestionAnswered(true);
        const data = { answer, name: playerName, id: id };
        dispatch(channelPush(sendEvent(gameChannel, data, "answer_click")));
    }

    const startClickCallback = useCallback((action, payload = {}) => {
        setIsQuestionAnswered(false);
        const data = { name: playerName, ...payload };
        dispatch(channelPush(sendEvent(gameChannel, data, action || "start_round")));
    }, [gameChannel, dispatch, playerName])

    function onWrongAnswerTimerCompleted() {
        //// In case round ends before timer is reset.
        if (isWrong) {
            dispatch(clearWrongAnswer());
            setIsQuestionAnswered(false);
            dispatch(setFlash({ text: "" }))
        }
    }

    useEffect(() => {
        let timeout;
        if (isOver) {
            timeout = setTimeout(() => {
                dispatch(push('/score'));
            }, 1000);
        }

        return () => {
            timeout && clearTimeout(timeout);
        }
    }, [isOver, settings.nextQuestionTime]);

    function isHappy() {
        return roundWinner === playerName && correct !== "";
    }

    if (!gameChannel) {
        return <Navigate to="/" />
    }

    return (
        <>
            <div className="full-width full-height flex-container flex-column">
                <header>
                    <h2 className="landscape-hidden">Buzz Game</h2>
                </header>
                <div className='flex-column'>
                    {isOver && <span>Game Over</span>}
                    {(isHappy() || isWrong) && <Faces isHappy={!isWrong} className="no-pointer flex-column" />}
                </div>
                <div className='flex-coumn empty-space offset-phone-addressbar'>
                    <Flash flash={flash}></Flash>

                    {isWrong &&
                        <span>Wrong{!canRetryWrongAnswer && settings.wrongAnswerTimeout > 1 && <span>, Try again in&nbsp;</span>}

                            <Timer key={"wrongAnswer" + isWrong + settings.wrongAnswerTimeout}
                                isActive={isWrong}
                                isVisible={!canRetryWrongAnswer && settings.wrongAnswerTimeout > 1}
                                timeFormat={"seconds"}
                                onTimerCompleted={onWrongAnswerTimerCompleted}
                                isIncrement={false}
                                numberSeconds={settings.wrongAnswerTimeout}>
                            </Timer>
                            {!canRetryWrongAnswer && isWrong && settings.wrongAnswerTimeout > 1 && <span>&nbsp;seconds</span>}
                        </span>
                    }
                    <div className={(question || "").length < 40 ? "question question-big" : "question question-small"}>
                        {question}
                    </div>
                    <div>
                        <span className="font-14px">
                            {startCountdown && "Game starts in "}
                            {!startCountdown && isRoundStarted && "Round ends in "}

                            {!isOver && <Timer key={"onTimerCompleted" + isTimerActive + timerSeconds}
                                isActive={isTimerActive}
                                timeIncrement={-1}
                                onStartDateSet={setTimerStartDate}
                                isIncrement={false}
                                onTimerCompleted={onTimerCompleted}
                                timeFormat={"seconds"}
                                numberSeconds={timerSeconds} />}
                        </span>
                    </div>
                    <Answers onAnswerClick={onAnswerClick}
                        isDisabled={isQuestionAnswered || !isRoundStarted || (correct !== "" || isWrong)}
                        answers={answers}
                        correct={correct}>
                    </Answers>

                    <div className="flex-column">
                        {isGameOwner && !isRoundStarted && settings.nextQuestionTime > 2 &&
                            <a className="app-link" href="/#" onClick={startClick}>Next</a>}
                    </div>
                </div>

            </div>
        </>
    );
}
