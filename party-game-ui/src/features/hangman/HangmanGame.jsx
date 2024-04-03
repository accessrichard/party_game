import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleGuess, handleNewGame, introSceneReset } from './hangmanSlice';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import GuessInput from './../canvas/GuessInput';
import { Navigate } from 'react-router-dom';
import { HangmanView } from './hangmanCanvas';
import usePrevious from '../usePrevious';
import useBackButtonBlock from '../useBackButtonBlock'
import { push } from "redux-first-history";
import { endGame } from '../lobby/lobbySlice';


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
    }
]

export default function HangmanGame() {

    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const [inputStyle, setInputStyle] = useState({});
    const { games } = useSelector(state => state.creative);
    const { playerName, gameCode, isGameOwner, gameName } = useSelector(state => state.lobby);
    const { word, guesses, isWinner, startIntroScene, winningWord, settings } = useSelector(state => state.hangman);
    const prevWord = usePrevious(word);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    const hangmanChannel = `hangman:${gameCode}`;
    useBackButtonBlock(isBackButtonBlocked);
    usePhoenixSocket();
    usePhoenixChannel(hangmanChannel, { name: playerName }, { persisted: true });
    usePhoenixEvents(hangmanChannel, events);
    useLobbyEvents();


    useEffect(() => {
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(hangmanChannel, getGame(), "new_game")))
        }
    }, []);

    function notifyLeave() {
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "end_game")))
    }

    useEffect(() => {
        window.addEventListener("beforeunload", notifyLeave);
        return () => {
            window.removeEventListener("beforeunload", notifyLeave);
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const event = (e) => setIsAnimating(e.detail.isRunning);
        canvasRef.current.addEventListener("animation", event);
        return () => {
            if (!canvasRef.current) {
                return;
            }

            canvasRef.current.removeEventListener("animation", event);
        };
    }, [canvasRef])

    useEffect(() => {
        if (!startIntroScene) {
            return;
        }


        const canvas = canvasRef.current;
        if (!canvas || word === 'undefined' || word === '') {
            return;
        }

        canvas.width = window.innerWidth * .9;
        canvas.height = window.innerHeight * .8;
        const radius = window.innerHeight / 12;
        HangmanView.initialize(canvas, 0, canvas.height / 2, radius);
        HangmanView.animations.startGameScene(canvas.width / 4, canvas.width / 2, word, []);
        setInputStyle({ width: canvas.width - 50, position: "absolute", top: canvas.height - 25 });
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

    function onGuessSubmit(guess) {
        if (isWinner) {
            return;
        }

        if (guesses.some(x => x.toLowerCase().trim() == guess.toLowerCase().trim())) {
            return;
        }

        const bodyPartsLength = HangmanView.stickMan.getBodyParts(settings.difficulty).length;
        const isOver = guesses.length >= bodyPartsLength;
        if (isOver) {
            return;
        }

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
        const matching = games.find(x => x.game.name === gameName);
        return typeof matching === 'undefined'
            ? { settings: { difficulty: settings.difficulty } }
            : { type: matching.game.type, name: gameName, words: matching.game.words, settings }
    }

    if (!gameCode) {
        return <Navigate to="/" />
    }

    return (
        <>
            <h3>Hangman</h3>
            <canvas ref={canvasRef} id="hangman-canvas">Your browser does not support canvas element.
            </canvas>
            <div style={inputStyle}>
                {!isWinner && !winningWord && word && !isAnimating &&
                    <GuessInput className='canvas-card flex-row md-5' onSubmit={onGuessSubmit} maxLength="1" />}
            </div>
            <div className="container">

                {isGameOwner && <button id="Restart" className="btn md-5" type="button" onClick={onRestartClick}>Restart</button>}
                <button id="Quit" className="btn md-5" type="button" onClick={onQuitClick}>Quit</button>
            </div>
        </>
    )
}