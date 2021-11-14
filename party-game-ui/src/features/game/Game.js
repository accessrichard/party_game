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
        event: 'startstop',
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
        gameOwner,
        question,
        answers,
        flash,
        isWrong,
        round,
        name,
        isOver,
        correct,
        roundWinner,
        configuration,
        startCountdown,
    } = useSelector(state => state.game);

    const rounds = useSelector(state => state.game.configuration.rounds);
    const wrongAnswerTimeout = useSelector(state => state.game.configuration.wrongAnswerTimeout);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.game.api.list.data);

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



    function startClick(e, action, payload = {}) {
        e && e.preventDefault();
        startClickCallback(action, payload);
    }


    function timerDone() {
        setIsTimerActive(false);
        startClickCallback(correct ? "start" : "next");
    }

    function onAnswerClick(e, answer) {
        setIsQuestionAnswered(true);
        const data = { answer, name: playerName };
        dispatch(channelPush(sendEvent(topic, data, "buzz")));
    }

    const startClickCallback = useCallback((action, payload = {}) => {
        setIsQuestionAnswered(false);
        const data = { name: playerName, ...payload };
        dispatch(channelPush(sendEvent(topic, data, action || "start")));
    }, [topic, dispatch, playerName])

    useEffect(() => {
        ////Auto start game from lobby.
        setIsTimerActive(false);

        const list = mergeGameList(serverGames, creativeGames);

        let game = list.find(x => x.name === name);

        if (game && game.location === 'client') {
            const creativeGame = creativeGames.find(x => x.game.name === name);
            game = { ...game, questions: creativeGame.game.questions }
        }

        startClickCallback("new", { game: game, rounds: rounds });

    }, [name, startClickCallback, serverGames, creativeGames, rounds]);

    useEffect(() => {
        setTimeout(() => {
            //In case round ends before timer is reset - 
            //if (startedRef.current && roundRef.current === round) {
            if (isWrong) {
                dispatch(clearWrongAnswer());
                setIsQuestionAnswered(false);
                dispatch(setFlash({ text: "" }))
            }
        }, wrongAnswerTimeout * 1000);

    }, [dispatch, isWrong, wrongAnswerTimeout]);

    if (isOver) {
        setTimeout(() => {
            dispatch(push('/score'));
        }, 1000);
    }

    function isHappy() {
        return roundWinner === playerName && correct !== "";
    }

    return (
        <React.Fragment>
            <div className="app-light full-width">
                <header className="app-header1">
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
                    {isWrong && configuration.wrongAnswerTimeout > 1 && 
                    //Bug: Round ends before wrong timeout 
                        <span> Wrong, Try again in&nbsp;
                        <Timer key={isWrong + configuration.wrongAnswerTimeout}
                                isActive={isWrong}
                                timeIncrement={-1}
                                timeFormat={"seconds"}
                                startSeconds={configuration.wrongAnswerTimeout}>
                            </Timer>
                        &nbsp;seconds
                        </span>
                    }
                </div>

                <div className="flex-container">
                    {gameOwner === playerName && !isRoundStarted && configuration.nextQuestionTime > 2 && 
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
