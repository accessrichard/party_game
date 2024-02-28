import React, { useEffect, useState } from 'react';
import Timer from '../common/Timer';
import ColorPallette from './ColorPallette';
import Canvas from './Canvas';
import GuessInput from './GuessInput';
import GuessList from './GuessList';
import NewGamePrompt from '../common/NewGamePrompt';
import useBackButtonBlock from '../useBackButtonBlock'
import useLobbyEvents from '../lobby/useLobbyEvents';
import { Navigate } from 'react-router-dom';
import { push } from "redux-first-history";
import { getPresences } from '../presence/presenceSlice';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { endGame } from '../lobby/lobbySlice';
import { canvasWidth, canvasHeight, clearCanvas, saveCanvas, clearCommand } from './canvasUtils';
import { useDispatch, useSelector } from 'react-redux';
import { word, commands, reset, handleNewGame, handleGuess } from './canvasSlice'
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';

const events = (topic) => [
    {
        event: 'word',
        dispatcher: word(),
        topic,
    },
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
        event: 'commands',
        dispatcher: commands(),
        topic,
    }
]

export default function CanvasGame() {

    const dispatch = useDispatch();
    const { isGameOwner, playerName, gameCode } = useSelector(state => state.lobby);
    const players = useSelector(getPresences);

    const canvasChannel = `canvas:${gameCode}`;

    usePhoenixSocket();
    usePhoenixChannel(canvasChannel, { name: playerName, size: [canvasWidth(), canvasHeight()] }, { persisted: true });
    usePhoenixEvents(canvasChannel, events);
    useLobbyEvents();

    const {
        word,
        commands,
        turn,
        startTimerTime,
        minSize,
        guesses,
        winner
    } = useSelector(state => state.canvas);

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(1000);    
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);    
    const [isEditable, setIsEditable] = useState(true);
    const [strokeStyle, setStrokeStyle] = useState("#000000");

    useBackButtonBlock(isBackButtonBlocked);

    useEffect(() => {
        return () => { dispatch(reset()); setIsTimerActive(false); };
    }, []);

    useEffect(() => {
        if (winner) {
            setIsTimerActive(false);
            setIsNewGamePrompt(true);
        }
    }, [winner])

    function onTimerCompleted() {
        setIsTimerActive(false);
        setIsNewGamePrompt(true);
    }

    function onStartClick() {
        setIsTimerActive(true);
        onClearClick()
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, {}, winner == "" ? "new_game" : "next_turn")));
        }

        setIsNewGamePrompt(false);
    }

    function onNextClick(e) {
        onClearClick();
        dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
    }

    function onGuessSubmit(guess) {
        dispatch(channelPush(sendEvent(canvasChannel, { guess }, "guess")));
    }

    useEffect(() => {
        if (minSize[0] > 0) {
            setWidth(minSize[0]);
        }
        if (minSize[1] > 0) {
            setHeight(minSize[1])
        }

        setIsEditable(playerName == turn);
        setStrokeStyle("#000000");
    }, [turn]);

    function onClearClick() {
        clearCanvas('paint-canvas');
        dispatch(channelPush(sendEvent(canvasChannel, clearCommand, "commands")));
    }

    function onSaveClick(e) {
        saveCanvas('paint-canvas');
    }

    function onBackClick() {
        dispatch(endGame());
        setIsBackButtonBlocked(false);
        dispatch(push('/lobby'))
    }

    function onColorChange(color) {
        setStrokeStyle(color);
    }

    function onDraw(commands) {
        if (players.length <= 1) {
            return;
        }

        dispatch(channelPush(sendEvent(canvasChannel, { commands }, "commands")));
    }

    if (!gameCode) {
        return <Navigate to="/"/>
    }

    return (
        <>
            <NewGamePrompt
                isNewGamePrompt={isNewGamePrompt}
                onStartGame={onStartClick}
                header={winner != "" && `${winner} won!!!`}
                text={winner != "" ? "Next round starts in: " : "Game Starts in: "}
            />

            <div className="container">
                {winner && <h2>{winner} Won!!!</h2>}
                {!winner && playerName == turn && <h2 id="word-game">Draw: {word}</h2>}
                {!winner && playerName != turn && <h2 id="word-game">Guessing word for {turn}</h2>}
            </div>
            {players.length > 1 && <GuessList className="ul-nostyle list-inline" guesses={guesses.slice(-3)} />}
            <Canvas
                color={strokeStyle}
                commands={commands}
                height={height}
                width={width}
                isEditable={isEditable}
                onDraw={onDraw}
                onColorChange={(color) => setStrokeStyle(color)}
            />

            <div className="container">
                <div>
                    <Timer key={startTimerTime}
                        restartKey={startTimerTime}
                        isActive={isTimerActive}
                        onTimerCompleted={onTimerCompleted}
                        timeIncrement={-1}
                        isIncrement={false}
                        numberSeconds={timerSeconds} />
                </div>
                <div className="break"></div>

                {turn != playerName && isTimerActive &&
                    <GuessInput onSubmit={onGuessSubmit} />}

                <div className="break"></div>

                {turn == playerName && <>
                    <div className="break"></div>
                    <ColorPallette onColorChange={onColorChange} strokeStyle={strokeStyle} />
                </>}

                <div className="break"></div>
                <div>
                    {turn == playerName && word == "" && <button id="start" className="btn md-5" type="button" onClick={onStartClick}>Start</button>}
                    {turn == playerName && word != "" && <button id="next" className="btn md-5" type="button" onClick={onNextClick}>Next</button>}
                    {turn == playerName && <button id="clear" className="btn md-5" type="button" onClick={onClearClick}>Clear</button>}

                    <button id="back" className="btn md-5" type="button" onClick={onBackClick}>Quit</button>
                    <button id="save" className="btn md-5" type="button" onClick={onSaveClick}>Save Image</button>
                </div>
            </div>
        </>
    );
}
