import React, { useCallback, useEffect, useState } from 'react';
import Answers from './Answers';
import Faces from '../common/Faces';
import Flash from '../common/Flash';
import Timer from '../common/Timer';
import usePrevious from '../usePrevious';
import useBackButtonBlock from '../useBackButtonBlock';
import NewGamePrompt from '../common/NewGamePrompt';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { Navigate } from 'react-router-dom';
import { push } from "redux-first-history";
import { channelPush } from '../phoenix/phoenixMiddleware';
import { toServerSettings } from './settingsApi';
import { useDispatch, useSelector } from 'react-redux';
import { mergeGameList, endGame } from '../lobby/lobbySlice';
import { usePhoenixEvents, usePhoenixChannel, sendEvent } from '../phoenix/usePhoenix';
import {
    clearWrongAnswer,
    unansweredTimeout,
    handleCorrectAnswer,
    handleNewGameCreated,
    startRound,
    handleWrongAnswer,
    setFlash,
    resetGame
} from './multipleChoiceSlice';

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
        event: 'handle_new_game_created',
        dispatcher: handleNewGameCreated(),
        topic
    }
]


export default function MultipleChoiceGame() {

    const dispatch = useDispatch();
    const {
        isRoundStarted,
        question,
        id,
        answers,
        isWrong,
        round,
        correct,
        flash,
        roundWinner,
        settings,
        startCountdown,
        isOver
    } = useSelector(state => state.multipleChoice);

    const {
        isGameOwner,
        playerName,
        gameName,
        gameCode
    } = useSelector(state => state.lobby);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.lobby.api.list.data);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(settings.nextQuestionTime);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
    const [timerStartDate, setTimerStartDate] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);
    const [canRetryWrongAnswer, setCanRetryWrongAnswer] = useState(true);

    const prevRound = usePrevious(round);
    const gameChannel = `game:${gameCode}`;

    usePhoenixChannel(gameChannel, { name: playerName });
    usePhoenixEvents(gameChannel, events);
    useLobbyEvents();
    useBackButtonBlock(true);

    useEffect(() => {
        dispatch(resetGame());
        setIsStartGamePrompt(true);
    }, []);

    /**
     * Sets a delay timeout on wrong answers as configured in the settings.
     * 
     * Synchronizes with the round timer so the wrong answer timeout doesn't
     * override the round timer. 
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
     * Sets a countdown timer after a question is answered
     * correctly or timed out...allowing users to see the
     * correct answer.
     */
    useEffect(() => {
        if (startCountdown) {
            setTimerSeconds(settings.nextQuestionTime);
            setIsTimerActive(true);
        }

        return () => { setIsTimerActive(false); };
    }, [startCountdown, isTimerActive, settings.nextQuestionTime]);


    /**
     * Ensures the timer is going when a round is started
     * and reset on new rounds.
     */
    useEffect(() => {                
        if (isRoundStarted) {
            setIsStartGamePrompt(false);
        }

        if (isRoundStarted && round === prevRound) {                        
            setTimerSeconds(settings.questionTime);
            setIsTimerActive(true);
            setIsDisabled(false);
        } else if (round !== prevRound && isRoundStarted) {
            /// Force reset of timer when round changes
            /// since timers can go out of sync across players.
            setIsStartGamePrompt(false);
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
        setIsDisabled(true);

        if (!isGameOwner) {
            return;
        }

        setIsTimerActive(false);
        if (!isQuestionAnswered && isRoundStarted) {
            dispatch(unansweredTimeout());
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
    }, [gameCode, playerName])

    function onWrongAnswerTimerCompleted() {
        //// In case round ends before timer is reset.
        if (isWrong) {
            dispatch(clearWrongAnswer());
            setIsQuestionAnswered(false);
            dispatch(setFlash({ text: "" }))
        }
    }

    useEffect(() => {
        setIsDisabled(isQuestionAnswered || !isRoundStarted || (correct !== "" || isWrong))
    }, [isQuestionAnswered, isRoundStarted, correct, isWrong]);

    useEffect(() => {
        let timeout;
        if (isOver) {
            
            dispatch(endGame());
            
            timeout = setTimeout(() => {
                dispatch(push('/multiple_choice/score'));
            }, 1000);
        }

        return () => {
            timeout && clearTimeout(timeout);
        }
    }, [isOver, settings.nextQuestionTime]);

    function handleCreateGame() {
        const list = mergeGameList(serverGames, creativeGames);
        let game = list.find(x => x.name === gameName);

        if (game && game.location === 'client') {
            const creativeGame = creativeGames.find(x => x.game.name === gameName);
            game = { ...game, questions: creativeGame.game.questions }
        }

        const data = { name: playerName, settings: toServerSettings(settings), game: game };

        dispatch(channelPush(sendEvent(gameChannel, data, "new_game")));
    }

    function isHappy() {
        return roundWinner === playerName && correct !== "";
    }

    if (!gameCode) {
        return <Navigate to="/" />
    }

    function onStartGame() {
        if (isGameOwner)
        {
            handleCreateGame();
        }
    }

    return (
        <>
            <NewGamePrompt isNewGamePrompt={isStartGamePrompt} onStartGame={() => onStartGame()} >
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
                            isDisabled={isDisabled}
                            answers={answers}
                            correct={correct}>
                        </Answers>

                        <div className="flex-column">
                            {isGameOwner && !isRoundStarted && settings.nextQuestionTime > 2 &&
                                <a className="app-link" href="/#" onClick={startClick}>Next</a>}
                        </div>
                    </div>
                </div>
            </NewGamePrompt>
        </>
    );
}
