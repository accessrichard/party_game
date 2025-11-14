import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleGuess, handleNewGame, introSceneReset, returnToLobby, reset } from './hangmanSlice';
import { usePhoenixChannel, usePhoenixEvents, sendEvent } from '../phoenix/usePhoenix';
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
    }
]

export default function HangmanGame() {

    const dispatch = useDispatch();
    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);
    const games = useSelector(state => state.creative.games);
    const playerName = useSelector(state => state.lobby.playerName);
    const gameCode = useSelector(state => state.lobby.gameCode);
    const selectedGame = useSelector(state => state.lobby.selectedGame);
    const word = useSelector(state => state.hangman.word);
    const guesses = useSelector(state => state.hangman.guesses);
    const isWinner = useSelector(state => state.hangman.isWinner);
    const startIntroScene = useSelector(state => state.hangman.startIntroScene);
    const winningWord = useSelector(state => state.hangman.winningWord);
    const settings = useSelector(state => state.hangman.settings);
    const isOver = useSelector(state => state.hangman.isOver);
    const forceQuit = useSelector(state => state.hangman.forceQuit);
    const isGameOwner = useSelector(selectGameOwner);

    const prevWord = usePrevious(word);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const hangmanChannel = `hangman:${gameCode}`;

    useBackButtonBlock(isBackButtonBlocked);
    usePhoenixChannel(hangmanChannel, { name: playerName }, { persisted: false });
    usePhoenixEvents(hangmanChannel, events);

    useEffect(() => {
        setIsStartGamePrompt(true);
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "game" }
        }));
    }, [dispatch, gameCode]);

    const canvasRef = useCallback(node => {
        if (node === null) {
            return;
        }
        const animationEvent = (e) => {
            setIsAnimating(e.detail.isRunning);
        };
        node.addEventListener("hangmanAnimation", animationEvent, true);

        return () => {
            node.removeEventListener("hangmanAnimation", animationEvent);
        };
    }, []);

    useEffect(() => {
        if (!startIntroScene) {
            return;
        }

        const canvas = document.getElementById('hangman-canvas');
        if (!canvas || word === 'undefined' || word === '') {
            return;
        }

        canvas.width = window.innerWidth * .9;
        canvas.height = window.innerHeight * .5;
        const radius = window.innerHeight / 16;

        HangmanView.initialize(canvas, 0, canvas.height / 2, radius);
        HangmanView.animations.startGameScene(canvas.width / 4, canvas.width / 2, word, []);
        dispatch(introSceneReset());
    }, [word, prevWord, startIntroScene, dispatch])

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
    }, [word, guesses, winningWord, settings.difficulty, isOver]);

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

    const getGame = useCallback(() => {
        const matching = games.find(x => x.game.name === selectedGame.name);
        return typeof matching === 'undefined'
            ? { settings: { difficulty: settings.difficulty } }
            : { type: matching.game.type, name: selectedGame.name, words: matching.game.words, settings }
    }, [games, selectedGame, settings]);

    const onGuessSubmit = useCallback((guess) => {
        if (!HangmanView.stickMan) {
            return;
        }

        if (isWinner || isOver) {
            return;
        }

        if (guesses.some(x => x.toLowerCase().trim() === guess.toLowerCase().trim())) {
            return;
        }

        const bodyPartsLength = HangmanView.stickMan.getBodyParts(settings.difficulty).length;
        dispatch(channelPush(sendEvent(hangmanChannel, { guess, isOver: guesses.length >= bodyPartsLength - 1 }, "guess")));
    }, [isWinner, isOver, guesses, settings.difficulty, dispatch, hangmanChannel]);

    const onRestartClick = useCallback(() => {
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "new_game")));
    }, [dispatch, hangmanChannel]);

    const onQuitClick = useCallback(() => {
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "end_game")));
        dispatch(endGame());
        setIsBackButtonBlocked(false);
        dispatch(push('/lobby'));
    }, [dispatch, hangmanChannel]);

    const onStartGame = useCallback(() => {
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(hangmanChannel, getGame(), "new_game")))
        }
    }, [isGameOwner, dispatch, hangmanChannel, getGame]);

    if (forceQuit) {
        dispatch(reset());
        dispatch(endGame());
        setIsBackButtonBlocked(false);        
        dispatch(push('/lobby'));
    }

    if (!gameCode) {
        return <Navigate to="/" />
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