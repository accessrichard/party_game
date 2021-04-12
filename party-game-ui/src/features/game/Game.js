import React, { useEffect, useRef, useState } from 'react';
import {
    channelJoin,
    channelLeave,
    channelOff,
    channelOn,
    channelPush,
} from '../phoenix/phoenixMiddleware';
import { phxReply, setFlash, startRound, stopRound } from './gameSlice';
import { useDispatch, useSelector } from 'react-redux';

import { Redirect } from 'react-router'
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
    const { isRoundStarted, playerName, gameCode, question, answers, flash, isOver } = useSelector(state => state.game);
    const gameOwner = useSelector(state => state.game.roomOwner);
    const [answer, setAnswer] = useState("");
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
    const [radioChecked, setRadioChecked] = useState(null);

    const startedRef = useRef(isRoundStarted);
    startedRef.current = isRoundStarted;

    if (!gameCode) {
        dispatch(push('/'));
    }   

    const topic = `buzzer:${gameCode}`;

    useEffect(() => {
        if (!isRoundStarted) {
            setRadioChecked(-1);
        }
    }, [isRoundStarted]);

    useEffect(() => {
        dispatch(channelJoin({ topic, data: {name: playerName} }));
        return () => dispatch(channelLeave({ topic }));
    }, [dispatch, topic, playerName]);

    useEffect(() => {        
        onEvents(topic).forEach((e) => dispatch(channelOn(e)));
        return () => onEvents(topic).forEach((e) => dispatch(channelOff(e)));
    }, [dispatch, topic]);

    useEffect(() => {
        if (isRoundStarted) {
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [isRoundStarted, isTimerActive]);
    

    function startClick() {
        dispatch(channelPush(sendEvent(topic, { name: playerName }, "start")));
    }

    function buzzClick() {
        setIsQuestionAnswered(true);
        const data = { answer, name: playerName };
        dispatch(channelPush(sendEvent(topic, data, "buzz")));
        pauseOnWrongAnswer();
    }

    function pauseOnWrongAnswer() {
        setTimeout(() => {
            setIsQuestionAnswered(false);
            if (startedRef.current) {
                dispatch(setFlash({ text: "Try Again" }))
            }
        }, 2000)
    }

    function handleOptionChange(e, key) {
        setAnswer(e.target.value);
        setRadioChecked(key);
        dispatch(setFlash({}));
    }

    if (isOver) {
        return <Redirect to="/score" />
    }

    return (
        <React.Fragment>
            <div className="App-dark lg-12">
                <header className="App-header1">
                    <h3>Buzzer Game</h3>
                </header>
                <div>
                    {question}
                </div>
                <div>
                    <span className="typography-md-text">
                        <Timer isActive={isTimerActive} timeIncrement={-1} startSeconds={30}></Timer>
                    </span>
                </div>
                <div>
                    <ul className="ul-nostyle align-left">
                        {(answers || []).map((ans, key) =>
                            <li key={key} className={"pd-5"}>
                                <span className={flash.answer === ans ? "typography-emphasize" : ""}>
                                    <label className="typography-lg-text">
                                        <input type="radio"
                                            name="group1"
                                            disabled={isRoundStarted && !isQuestionAnswered
                                                ? "" : "disabled"}
                                            value={ans}
                                            autoComplete="off"
                                            onChange={e => handleOptionChange(e, key)}
                                            checked={radioChecked === key}></input>
                                        {ans}
                                    </label>
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
                <div>
                    <span className="typography-md-text typography-emphasize">{flash.text}</span>
                </div>
                <div className="flex-container">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {gameOwner === playerName &&
                            <input className="pd-5 md-5"
                                disabled={isRoundStarted ? "disabled" : ""}
                                type="submit"
                                onClick={startClick}
                                value="Start" />}

                        <input className="pd-5 md-5"
                            disabled={isRoundStarted && !isQuestionAnswered && radioChecked !== -1 ? "" : "disabled"}
                            type="submit"
                            onClick={buzzClick}
                            value="Buzz!!!" />
                    </form>
                </div>
            </div>
        </React.Fragment>
    );
}
