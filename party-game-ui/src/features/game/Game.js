import React, { useEffect, useRef, useState } from 'react';
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
        isOver,
        correct,
        configuration,
        startCountdown,
    } = useSelector(state => state.game);

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

    
    function startClick(e, action) {
        setIsQuestionAnswered(false);
        dispatch(channelPush(sendEvent(topic, { name: playerName }, action || "start")));
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
        startClick(null, correct ? "start" : "next");
    }

    function onAnswerClick(e, answer) {
        setIsQuestionAnswered(true);
        const data = { answer, name: playerName };
        dispatch(channelPush(sendEvent(topic, data, "buzz")));
        pauseOnWrongAnswer();
    }

    useEffect(() => {
        setIsTimerActive(false);
        startClick(null, "start");
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (isWrong) {
                dispatch(clearWrongAnswer());
            }            
        }, 1000);
        
    }, [dispatch, isWrong]);

    if (isOver) {
        setTimeout(()=>{
            dispatch(push('/score'));
        }, 1000);
    }

    return (
        <React.Fragment>
            <div className="App-dark lg-12">
                <header className="App-header1">
                    <h3>Buzzer Game</h3>
                    {correct !== "" &&  <Faces isHappy={true}/>}
                    {isWrong &&  <Faces key={isWrong} isHappy={false}/>}
                </header>
                <div className="question">
                    {question}
                </div>


                <Answers onAnswerClick={onAnswerClick}
                    isDisabled={!isRoundStarted && isQuestionAnswered}
                    answers={answers}
                    correct={correct}>
                </Answers>

                <div>
                    <Flash flash={flash}></Flash>
                </div>
                <div className="flex-container">
                    {gameOwner === playerName && !isRoundStarted &&
                        <a className="App-link" onClick={startClick}>Next</a>}
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
