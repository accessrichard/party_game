import { useCallback, useEffect, useState } from 'react';
import Answers from './Answers';
import Faces from '../common/Faces';
import Flash from '../common/Flash';
import Timer from '../common/Timer';
import usePrevious from '../usePrevious';
import useBackButtonBlock from '../useBackButtonBlock';
import NewGamePrompt from '../common/NewGamePrompt';
import { Navigate } from 'react-router-dom';
import { push } from "redux-first-history";
import { channelPush } from '../phoenix/phoenixMiddleware';
import { toServerSettings } from './settingsApi';
import { useDispatch, useSelector } from 'react-redux';
import { mergeGameList, endGame, selectGameOwner } from '../lobby/lobbySlice';
import { usePhoenixEvents, usePhoenixChannel, sendEvent } from '../phoenix/usePhoenix';
import {
    clearWrongAnswer,
    unansweredTimeout,
    handleCorrectAnswer,
    handleNewGameCreated,
    startRound,
    handleWrongAnswer,
    setFlash,
    resetGame,
    newGameTimeout,
    quitGame
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
    },
    {
        event: 'new_game_timeout',
        dispatcher: newGameTimeout(),
        topic
    },
    {
        event: 'quit_game',
        dispatcher: quitGame(),
        topic
    }
]

export default function MultipleChoiceGame() {

    const dispatch = useDispatch();
    const isRoundStarted = useSelector(state => state.multipleChoice.isRoundStarted);
    const question = useSelector(state => state.multipleChoice.question);
    const id = useSelector(state => state.multipleChoice.id);
    const answers = useSelector(state => state.multipleChoice.answers);
    const isWrong = useSelector(state => state.multipleChoice.isWrong);
    const round = useSelector(state => state.multipleChoice.round);
    const correct = useSelector(state => state.multipleChoice.correct);
    const flash = useSelector(state => state.multipleChoice.flash);
    const roundWinner = useSelector(state => state.multipleChoice.roundWinner);
    const settings = useSelector(state => state.multipleChoice.settings);
    const startCountdown = useSelector(state => state.multipleChoice.startCountdown);
    const isOver = useSelector(state => state.multipleChoice.isOver);
    const isNewGameTimeout = useSelector(state => state.multipleChoice.isNewGameTimeout);
    const startRoundTimeSync = useSelector(state => state.multipleChoice.startRoundTimeSync);
    const isQuit = useSelector(state => state.multipleChoice.isQuit);

    const playerName = useSelector(state => state.lobby.playerName);
    const selectedGame = useSelector(state => state.lobby.selectedGame);
    const gameCode = useSelector(state => state.lobby.gameCode);

    const isGameOwner = useSelector(selectGameOwner);
    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.lobby.api.list.data);
    const newGamePromtTime = useSelector(state => state.lobby.settings.newGamePromtTime);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(settings.nextQuestionTime);
    const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);

    const isDisabled = isQuestionAnswered || !isRoundStarted || correct !== "" || isWrong;
    const prevRound = usePrevious(round);
    const gameChannel = `game:${gameCode}`;

    usePhoenixChannel(gameChannel, { name: playerName });
    usePhoenixEvents(gameChannel, events);
    useBackButtonBlock(true);

    useEffect(() => {
        dispatch(resetGame());
        setIsStartGamePrompt(true);
        
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "game" }
        }));
    }, [dispatch, gameCode]);

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
    }, [startCountdown, settings.nextQuestionTime]);


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
        } else if (round !== prevRound && isRoundStarted) {
            /// Force reset of timer when round changes
            /// since timers can go out of sync across players.
            setIsTimerActive(new Date());
            setIsQuestionAnswered(false);
        }
    }, [isRoundStarted, settings.questionTime, round, prevRound]);

     useEffect(() => {
        if (!isRoundStarted) {
            setIsTimerActive(false);
        }
    }, [isRoundStarted]);

    useEffect(() => {
        if (isQuit) {
            dispatch(endGame());
            dispatch(resetGame());
            dispatch(push('/lobby'))
        }
    }, [isQuit, dispatch]);

    function startClick(e) {
        e && e.preventDefault();
        startClickCallback(correct ? "start_round" : "next_question");
    }

    function quitClick(e) {
        e && e.preventDefault();
        dispatch(channelPush(sendEvent(gameChannel, {}, "quit_game")));
    }

    function onTimerCompleted() {
        setIsTimerActive(false);
        if (!isQuestionAnswered && isRoundStarted) {
            dispatch(unansweredTimeout());
            return;
        }
        //// This event was pushed to the server            
        //// startClickCallback(correct ? "start_round" : "next_question");
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
    }, [isOver, dispatch]);

    /**
     * If not all clients have connected after NewGamePrompt timeout expires,
     * we need to start the game for people connected.
     * 
     * Usually the game owner will kick this off from the client side but
     * if that fails, we need a fallback. If the game is a client game this is problematic
     * as the client game may not yet be created on the server. Currently, this is by design as each
     * game channel can be a completely different game.
     * 
     * Instead of trying to elect a new game owner and pass the game around, just going
     * to push users back to the lobby for now.
     */
    useEffect(() => {
        if (isNewGameTimeout) {
            dispatch(push("/lobby"))
        }

    }, [isNewGameTimeout, dispatch]);

    function isHappy() {
        return roundWinner === playerName && correct !== "";
    }

    if (!gameCode) {
        return <Navigate to="/" />
    }

    function onStartGame() {
        if (!isGameOwner) {
            return;
        }

        const list = mergeGameList(serverGames, creativeGames);
        let game = list.find(x => x.name === selectedGame.name);

        if (game && game.location === 'client') {
            const creativeGame = creativeGames.find(x => x.game.name === selectedGame.name);
            game = { ...game, questions: creativeGame.game.questions }
        }

        const data = { name: playerName, settings: toServerSettings(settings), game: game };
        dispatch(channelPush(sendEvent(gameChannel, data, "new_game")));
    }

    return (
        <>
            <NewGamePrompt isNewGamePrompt={isStartGamePrompt} seconds={newGamePromtTime} onStartGame={() => onStartGame()} >
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
                            <span>Wrong, Try again in&nbsp;

                                <Timer key={"wrongAnswer" + isWrong + settings.wrongAnswerTimeout}
                                    isActive={isWrong}
                                    isVisible={true}
                                    timeFormat={"seconds"}
                                    onTimerCompleted={onWrongAnswerTimerCompleted}
                                    isIncrement={false}
                                    numberSeconds={settings.wrongAnswerTimeout}>
                                </Timer>
                                &nbsp;seconds
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
                                    startDate={startRoundTimeSync}
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
                            {isGameOwner && <a className="app-link" href="/#" onClick={quitClick}>Quit</a>}
                        </div>
                    </div>
                </div>
            </NewGamePrompt>
        </>
    );
}
