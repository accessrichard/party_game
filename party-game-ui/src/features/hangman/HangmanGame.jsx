import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleGuess, handleNewGame, introSceneReset, returnToLobby, reset } from './hangmanSlice';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { Navigate } from 'react-router-dom';
import { HangmanView } from './hangmanCanvas';
import usePrevious from '../usePrevious';
import useBackButtonBlock from '../useBackButtonBlock'
import { push } from "redux-first-history";
import { endGame, selectGameOwner } from '../lobby/lobbySlice';
import NewGamePrompt from '../common/NewGamePrompt';
import Keyboard from '../common/Keyboard';


const events = (topic) => [
    {
        event: 'handle_new_game',
        dispatcher: handleNewGame(),
        topic,
    },
    {
        event: 'handle_guess',
        dispatcher: handleGuess(),
        topic,
    },
    {
        event: 'handle_quit',
        dispatcher: returnToLobby(),
        topic
    },
    {
        event: 'handle_quit',
        dispatcher: endGame(),
        topic
    }
]

export default function HangmanGame() {

    const dispatch = useDispatch();
    const canvasRef = useRef(null);    
    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);
    const { games } = useSelector(state => state.creative);
    const { playerName, gameCode, selectedGame } = useSelector(state => state.lobby);
    const {
        word,
        guesses,
        isWinner,
        startIntroScene,
        winningWord,
        settings,
        isOver,
        forceQuit
    } = useSelector(state => state.hangman);
    const isGameOwner = useSelector(selectGameOwner);

    const prevWord = usePrevious(word);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const hangmanChannel = `hangman:${gameCode}`;

    useBackButtonBlock(isBackButtonBlocked);
    usePhoenixSocket();
    usePhoenixChannel(hangmanChannel, { name: playerName }, { persisted: false });
    usePhoenixEvents(hangmanChannel, events);
    useLobbyEvents();

    useEffect(() => {
        setIsStartGamePrompt(true);
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "game" }
        }));
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const event = (e) => setIsAnimating(e.detail.isRunning);
        canvasRef.current.addEventListener("hangmanAnimation", event, true);
        return () => {
            if (!canvasRef.current) {
                return;
            }

            canvasRef.current.removeEventListener("hangmanAnimation", event);
        };
    }, [canvasRef.current])

    useEffect(() => {
        if (!startIntroScene) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas || word === 'undefined' || word === '') {
            return;
        }

        canvas.width = window.innerWidth * .9;
        canvas.height = window.innerHeight * .5;
        const radius = window.innerHeight / 16;

        HangmanView.initialize(canvas, 0, canvas.height / 2, radius);
        HangmanView.animations.startGameScene(canvas.width / 4, canvas.width / 2, word, []);
        dispatch(introSceneReset());
    }, [word, prevWord, startIntroScene])

    useEffect(() => {
        if (!HangmanView.stickMan) {
            return;
        }

        const bodyParts = HangmanView.stickMan.getBodyParts(settings.difficulty);
        if (guesses.length >= bodyParts.length) {
            HangmanView.animations.loseScene(word, winningWord, guesses, settings.difficulty);
            return;
        }

        HangmanView.animations.drawGame(word, guesses);
    }, [word, guesses, winningWord, settings.difficulty]);

    useEffect(() => {
        if (isWinner) {
            HangmanView.animations.winScene(word, guesses);
        }
    }, [isWinner, word, guesses])

    useEffect(() => {
        if (isOver && winningWord) {
            HangmanView.animations.loseScene(word, winningWord, guesses, settings.difficulty);
        }
    }, [isOver, winningWord, word, guesses, settings.difficulty])

    function notifyLeave() {
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "end_game")))
    }

    function onGuessSubmit(guess) {
        if (isWinner || isOver) {
            return;
        }

        if (guesses.some(x => x.toLowerCase().trim() == guess.toLowerCase().trim())) {
            return;
        }

        const bodyPartsLength = HangmanView.stickMan.getBodyParts(settings.difficulty).length;
        dispatch(channelPush(sendEvent(hangmanChannel, { guess, isOver: guesses.length >= bodyPartsLength - 1 }, "guess")));
    }

    function onRestartClick() {
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "new_game")));
    }

    function onQuitClick() {
        notifyLeave();
        dispatch(endGame());
        setIsBackButtonBlocked(false);
        dispatch(push('/lobby'))
    }

    function getGame() {
        const matching = games.find(x => x.game.name === selectedGame.name);
        return typeof matching === 'undefined'
            ? { settings: { difficulty: settings.difficulty } }
            : { type: matching.game.type, name: selectedGame.name, words: matching.game.words, settings }
    }

    if (forceQuit) {
        dispatch(reset());
        dispatch(push('/lobby'));
    }

    if (!gameCode) {
        return <Navigate to="/" />
    }

    function onStartGame() {
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(hangmanChannel, getGame(), "new_game")))
        }
    }

    return (
        <>
            <NewGamePrompt isNewGamePrompt={isStartGamePrompt} onStartGame={() => onStartGame()} >
                <h3>Hangman</h3>
                <canvas ref={canvasRef} id="hangman-canvas">Your browser does not support canvas element.
                </canvas>
                <div className={(isAnimating ? 'keyboard_disabled  ' : '') + 'keyboard_container'}>{
                    <Keyboard onClick={(_e, g) => { onGuessSubmit(g) }} />}
                </div>
                <div className="container">
                    {isGameOwner && <button id="Restart" className="btn md-5" type="button" onClick={onRestartClick}>Restart</button>}
                    {isGameOwner && <button id="Quit" className="btn md-5" type="button" onClick={onQuitClick}>Quit</button>}
                </div>

            </NewGamePrompt>
        </>
    )
}