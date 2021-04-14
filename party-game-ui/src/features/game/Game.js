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

import Answers from './Answers';
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
    const { 
        isRoundStarted, 
        playerName, 
        gameCode, 
        gameOwner, 
        question, 
        answers, 
        flash,
        round,
        isOver,
        configuration,
        startCountdown,
    } = useSelector(state => state.game);

    const [answer, setAnswer] = useState("");
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


    function startClick(e, action) {
        setIsQuestionAnswered(false);
        dispatch(channelPush(sendEvent(topic, { name: playerName }, action || "start")));        
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
            if (startedRef.current && roundRef.current === round) {
                dispatch(setFlash({ text: "Try Again" }))
            }
        }, configuration.pauseOnWrongAnswer * 1000)
    }

    function timerDone() {        
        setIsTimerActive(false);       
        startClick(null, question === null ? "start" : "next");
    }

    function onAnswerChangeClick(e, answer) {
        console.log(answer);
        setAnswer(answer);
        console.log(answer);
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
                    <Answers onAnswerChangeClick={onAnswerChangeClick} isDisabled={!isRoundStarted && isQuestionAnswered} answers={answers} correct={flash.answer}></Answers>
                </div>
                <div>
                    <span className={`typography-md-text ${flash.className ? flash.className : "typography-emphasize"}`}>{flash.text}</span>
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
                            disabled={isRoundStarted && !isQuestionAnswered && answer 
                                        ? "" 
                                        : "disabled"}
                            type="submit"
                            onClick={buzzClick}
                            value="Buzz!!!" />
                    </form>
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
