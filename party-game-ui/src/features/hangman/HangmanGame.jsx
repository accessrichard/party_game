import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleGuess, handleNewGame } from './hangmanSlice';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import GuessInput from './../canvas/GuessInput';
import { Navigate } from 'react-router-dom';
import { HangmanView } from './hangmanCanvas';
import usePrevious from '../usePrevious';

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
    const [isStarted, setIsStarted] = useState(false);
    const { playerName, gameCode } = useSelector(state => state.lobby);
    const { word, guesses, isWinner } = useSelector(state => state.hangman);
    const prevWord = useState(word);

    const hangmanChannel = `hangman:${gameCode}`;

    usePhoenixSocket();
    usePhoenixChannel(hangmanChannel, { name: playerName }, { persisted: true });
    usePhoenixEvents(hangmanChannel, events);
    useLobbyEvents();

    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        canvas.width = window.innerWidth * .9;
        canvas.height = window.innerHeight * .8;
        const radius = window.innerHeight / 12;
        HangmanView.initialize(canvas, 0, canvas.height / 2, radius);
        HangmanView.animations.startGameScene(canvas.width / 4, canvas.width / 2, word, guesses);
        setInputStyle({ width: canvas.width - 50, position: "absolute", top: canvas.height });
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "new_game")))
      
    }, [isStarted, prevWord]);


    useEffect(() => {
        if (!HangmanView.stickMan) {
            return;
        }

        const bodyParts = HangmanView.stickMan.getBodyParts();
        if (guesses.length >= bodyParts.length) {
            HangmanView.animations.loseScene(word, guesses);
            return;
        }

        if (word && word !== "" && !isStarted) {
            HangmanView.animations.addWord(word, guesses);
            setIsStarted(true);
        }

        if (guesses.length > 0) {
            HangmanView.animations.drawGame(word, guesses);
        }

    }, [word, guesses, isStarted]);

    useEffect(() => {       
        if (isWinner) {
            HangmanView.animations.winScene(word, guesses);
            setIsStarted(false);
        }
    }, [isWinner, word, guesses])


    function onGuessSubmit(guess) {
        if (guesses.some(x => x.toLowerCase().trim() == guess.toLowerCase().trim())) {
            return;
        }
        dispatch(channelPush(sendEvent(hangmanChannel, { guess }, "guess")));
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
                <GuessInput className='canvas-card flex-row md-5' onSubmit={onGuessSubmit} maxLength="1" />
            </div>
        </>
    )
}