import React, { useEffect, useState, useRef } from 'react';
import Timer from '../common/Timer';
import ColorPallette from './ColorPallette';
import CanvasTest from './Canvas';
import GuessInput from './GuessInput';
import GuessList from './GuessList';
import NewGamePrompt from '../common/NewGamePrompt';
import useBackButtonBlock from '../useBackButtonBlock'
import useLobbyEvents from '../lobby/useLobbyEvents';
import { push } from "redux-first-history";
import { channelPush } from '../phoenix/phoenixMiddleware';
import { endGame } from '../lobby/lobbySlice';
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


function canvasWidth() {
    return window.innerWidth - (window.innerWidth * .02);
}

function canvasHeight() {
    return window.innerHeight - (window.innerHeight * .45);
}

export default function CanvasTest2() {

    const dispatch = useDispatch();
    const {
        isGameOwner,
        playerName,
        gameName,
        gameCode
    } = useSelector(state => state.lobby);

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
    const [isIncrement, setIsIncrement] = useState(false);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [isClearRequest, setIsClearRequest] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [strokeStyle, setStrokeStyle] = useState("black");

    useBackButtonBlock(isBackButtonBlocked);

    if (!gameCode) {
        dispatch(push('/'))
    }

    useEffect(() => {
        return () => { dispatch(reset()) };
    }, []);

    useEffect(() => {
        setIsTimerActive(false);
        if (startTimerTime) {
            setIsTimerActive(true)
        }
    }, [startTimerTime])

    useEffect(() => {
        if (minSize[0] > 0) {
            setWidth(minSize[0]);
        }
        if (minSize[1] > 0) {
            setHeight(minSize[1])
        }

        setIsEditable(playerName == turn);
        setStrokeStyle(strokeStyle);

    }, [turn]);
  

    useEffect(() => {
        if (winner) {
            setIsTimerActive(false);
            setIsNewGamePrompt(true);
        }
    }, [winner])

    function onDraw(commands) {
        dispatch(channelPush(sendEvent(canvasChannel, { commands }, "commands")));
        
    }

    function onTimerCompleted() {
        setIsTimerActive(false);
        setIsNewGamePrompt(true);
    }

    function onStartClick() {
        onClearClick()
        if (isGameOwner && winner == "") {
            dispatch(channelPush(sendEvent(canvasChannel, {}, "new_game")));
        } else if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
        }

        setIsNewGamePrompt(false);
    }

    function onNextClick(e) {
        onClearClick();
        dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
    }

    function onClearedClick(command) {
        dispatch(channelPush(sendEvent(canvasChannel, command, "commands")));
    }

    function onClearClick() {
        setIsClearRequest(true);
    }


    useEffect(() => {
        setIsClearRequest(false);
    }, [isClearRequest]);

    function onSaveClick(e) {
        var imageName = prompt('Please enter image name');
        if (imageName == null) {
            return;
        }

        const canvas = document.getElementById("paint-canvas");
        var canvasDataURL = canvas.toDataURL();
        var a = document.createElement('a');
        a.href = canvasDataURL;
        a.download = imageName || 'drawing';
        a.click();
    }

    function onBackClick() {
        dispatch(endGame());
        setIsBackButtonBlocked(false);
        dispatch(push('/lobby'))
    }

    function onColorChange(color) {
        setStrokeStyle(color);        
    }


    function onGuessSubmit(guess) {
        dispatch(channelPush(sendEvent(canvasChannel, { guess }, "guess")));
    }

    return (
        <>
            <NewGamePrompt isNewGamePrompt={isNewGamePrompt} onStartGame={onStartClick}> </NewGamePrompt>

            <div className="container">
                {winner && <h2>{winner} Won!!!</h2>}
                {!winner && playerName == turn && <h2 id="word-game">Draw: {word}</h2>}
                {!winner && playerName != turn && <h2 id="word-game">Guessing word for {turn}</h2>}
            </div>
            <GuessList className="ul-nostyle list-inline" guesses={guesses.slice(-3)} />
            <CanvasTest
                color={strokeStyle}
                commands={commands}
                height={height}
                width={width}
                isEditable={isEditable}
                isClearRequest={isClearRequest}                
                onCleared={onClearedClick}
                onDraw={onDraw}
            />

            <div className="container">
                <div>
                    <Timer key={startTimerTime}
                        restartKey={startTimerTime}
                        isActive={isTimerActive}
                        onTimerCompleted={onTimerCompleted}
                        timeIncrement={isIncrement ? 1 : -1}
                        isIncrement={isIncrement}
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
