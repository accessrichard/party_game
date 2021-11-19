import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    channelJoin,
    channelLeave,
    channelOff,
    channelOn,
    channelPush,
} from '../phoenix/phoenixMiddleware';
import { clearWrongAnswer, mergeGameList, phxReply, setFlash, startRound, stopRound } from './gameSlice';
import { useDispatch, useSelector } from 'react-redux';
import { syncPresenceState, syncPresenceDiff } from './../presence/presenceSlice';

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
        event: 'next_question',
        dispatcher: startRound(),
        topic,
    },
    {
        event: 'phx_reply',
        dispatcher: phxReply(),
        topic,
    },
    {
        event: 'presence_state',
        dispatcher: syncPresenceState(),
        topic
    },
    {
        event: 'presence_diff',
        dispatcher: syncPresenceDiff(),
        topic
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
        isGameOwner,
        question,
        answers,
        flash,
        isWrong,
        round,
        name,
        isOver,
        correct,
        roundWinner,
        settings,
        startCountdown,
    } = useSelector(state => state.game);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.game.api.list.data);

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(settings.nextQuestionTime);
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
            setTimerSeconds(settings.nextQuestionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [startCountdown, isTimerActive, settings.nextQuestionTime]);

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
        dispatch(channelPush(sendEvent(topic, data, "buzz")));
    }

    const startClickCallback = useCallback((action, payload = {}) => {
        setIsQuestionAnswered(false);
        const data = { name: playerName, ...payload };
        dispatch(channelPush(sendEvent(topic, data, action || "start_round")));
    }, [topic, dispatch, playerName])

    useEffect(() => {
        ////Auto start game from lobby.
        setIsTimerActive(false);

        if (!isGameOwner) {
            return;
        }

        const list = mergeGameList(serverGames, creativeGames);

        let game = list.find(x => x.name === name);

        if (game && game.location === 'client') {
            const creativeGame = creativeGames.find(x => x.game.name === name);
            game = { ...game, questions: creativeGame.game.questions }
        }


        startClickCallback("new_game", { game: game, rounds: settings.rounds });

    }, [name, startClickCallback, serverGames, isGameOwner, creativeGames, settings]);

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



    function isHappy() {
        return roundWinner === playerName && correct !== "";
    }

    return (
        <React.Fragment>
            <div className="full-width">
                <header>
                    <h3>Buzz Game</h3>
                    {(isHappy() || isWrong) && <Faces isHappy={!isWrong} />}
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

                <div className="flex-container">
                    {isGameOwner && !isRoundStarted && settings.nextQuestionTime > 2 &&
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
