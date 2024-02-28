import React, { useEffect, useState } from 'react';
import Timer from '../common/Timer';
import ColorPallette from './ColorPallette';
import Canvas from './Canvas';
import GuessInput from './GuessInput';
import GuessList from './GuessList';
import NewGamePrompt from '../common/NewGamePrompt';
import WinnerList from './WinnerList';
import useBackButtonBlock from '../useBackButtonBlock'
import useLobbyEvents from '../lobby/useLobbyEvents';
import { Navigate } from 'react-router-dom';
import { push } from "redux-first-history";
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

export default function CanvasUI({
    onTimerCompleted = () => {}, 
    onGuessSubmit = () => {},
    onStartClick = () => {}, 
    onNextClick = () => {},
    isEditable = true,
    isNewGamePrompt = false,
    timerSeconds = 30,
    isGuessInputDisplayed = false,
    isTimerActive = false,
    isGuessListDisplayed = false,
    players = []
}) {

    const dispatch = useDispatch();
    const { playerName, gameCode } = useSelector(state => state.lobby);

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
        winner,
        winners
    } = useSelector(state => state.canvas);
    
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);        
    const [strokeStyle, setStrokeStyle] = useState("#000000");

    useBackButtonBlock(isBackButtonBlocked);

    useEffect(() => {
        return () => { dispatch(reset()); };
    }, []); 

    useEffect(() => {
        if (minSize[0] > 0) {
            setWidth(minSize[0]);
        }
        if (minSize[1] > 0) {
            setHeight(minSize[1])
        }

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
            <WinnerList winners={winners}/>
            <div className="container">
                {winner && <h2>{winner} Won!!!</h2>}
                {!winner && playerName == turn && <h2 id="word-game">Draw: {word}</h2>}
                {!winner && playerName != turn && <h2 id="word-game">Guessing word for {turn}</h2>}
            </div>
            {isGuessListDisplayed && <GuessList className="ul-nostyle list-inline" guesses={guesses.slice(-3)} />}
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

                {isGuessInputDisplayed &&
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
