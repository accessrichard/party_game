import React, { useEffect, useState, useRef } from 'react';
import Timer from '../common/Timer';
import ColorPallette from './ColorPallette';
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

const store = {
    drawing: [],
    displays: [],
    mouseMove: [],
    isDrawing: false,
    isColorShared: true,
    reset: function () {
        this.mouseMove = [];
        this.drawing = [];
        this.isDrawing = false;
    }
}

function draw(command, value, op) {
    store.drawing.push({ command, value, op });
}

function move(value) {
    store.mouseMove.push(value);
}

const displaySize = [canvasWidth(), canvasHeight()]


export default function Canvas() {

    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const {
        isGameOwner,
        playerName,
        gameName,
        gameCode
    } = useSelector(state => state.lobby);

    const canvasChannel = `canvas:${gameCode}`;

    usePhoenixSocket();
    usePhoenixChannel(canvasChannel, { name: playerName, size: displaySize }, { persisted: true });
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
    const [timerSeconds, setTimerSeconds] = useState(10);
    const [isIncrement, setIsIncrement] = useState(false);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);

    const [strokeStyle, setStrokeStyle] = useState("black");

    useBackButtonBlock(isBackButtonBlocked);

    if (!gameCode) {
        dispatch(push('/'))
    }

    useEffect(() => {
        return () => { store.reset(); dispatch(reset()) };
    }, []);

    useEffect(() => {
        setIsTimerActive(false);
        if (startTimerTime) {
            setIsTimerActive(true)
        }
    }, [startTimerTime])

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvasWidth();
        canvas.height = canvasHeight();

        const context = canvas.getContext("2d");
        context.strokeStyle = strokeStyle;
        context.lineWidth = 2;

        if (playerName == turn) {
            canvas.addEventListener('mousedown', mouseDown);
            canvas.addEventListener('mousemove', mouseMove);
            canvas.addEventListener('mouseup', mouseUp);
        }

        return () => {
            canvas.removeEventListener('mousedown', mouseDown);
            canvas.removeEventListener('mousemove', mouseMove);
            canvas.removeEventListener('mouseup', mouseUp);
        }
    }, [playerName, turn]);

    useEffect(() => {
        resizeCanvas()
    }, [turn]);

    useEffect(() => {
        if (winner) {
            setIsTimerActive(false);
            setIsNewGamePrompt(true);
        }
    }, [winner])

    function mouseDown(event) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        store.isDrawing = true;

        context.beginPath();
        context.moveTo(event.layerX, event.layerY);

        draw("beginPath", null, "function");
        draw("moveTo", [event.layerX, event.layerY], "function");
    }

    function mouseMove(event) {
        if (!store.isDrawing) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.lineTo(event.layerX, event.layerY);
        context.stroke();
        move([event.layerX, event.layerY]);
    }

    function mouseUp() {
        draw("lineTo", store.mouseMove, "function");
        draw("stroke", null, "function");
        dispatch(channelPush(sendEvent(canvasChannel, { commands: store.drawing }, "commands")));
        store.reset();
    }

    function onTimerCompleted() {
        setIsTimerActive(false);
        setIsNewGamePrompt(true);
    }

    function onStartClick() {
        if (isGameOwner && winner == "") {
            dispatch(channelPush(sendEvent(canvasChannel, {}, "new_game")));
        } else if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
        }

        setIsNewGamePrompt(false);
    }

    function onNextClick(e) {
        onClearClick(e);
        dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
    }

    function resizeCanvas() {
        const canvas = canvasRef.current;
        if (minSize[0] > 0) {
            canvas.width = minSize[0]
        }
        if (minSize[1] > 0) {
            canvas.height = minSize[1];
        }
    }

    function onClearClick(e) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const command = {
            commands: [{
                command: "clearRect",
                value: [0, 0, canvas.width, canvas.height], op: "function"
            }]
        };

        context.clearRect(0, 0, canvas.width, canvas.height);
        dispatch(channelPush(sendEvent(canvasChannel, command, "commands")));
    }

    function onSaveClick(e) {
        var imageName = prompt('Please enter image name');
        if (imageName == null) {
            return;
        }

        var canvasDataURL = canvasRef.current.toDataURL();
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
        const context = canvasRef.current.getContext('2d');
        setStrokeStyle(color);
        context.strokeStyle = color;
        store.drawing.push({ command: "strokeStyle", value: color, op: "assign" });
    }

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");

        let tempStrokeStyle = strokeStyle;

        commands.forEach(command => onCommand(command));

        preventSyncStrokeStyle(context, tempStrokeStyle)
    }, [commands]);

    /**
     * Revert the stroke style of the drawing
     * canvas so this canvas user can continue...
     */
    function preventSyncStrokeStyle(context, color) {
        if (!store.isColorShared) {
            setStrokeStyle(color);
            context.strokeStyle = color;
        }
    }

    /**
     * Stroke style uses state since context.strokeStyle
     * comes back as rgb which requires conversion to figure
     * out what it is in relation to the pallette
     */
    function specialAssign(command) {
        if (command.command == 'strokeStyle') {
            setStrokeStyle(command.value);
        }
    }

    function onCommand(command) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (command.op === "assign") {
            specialAssign(command, context);
            context[command.command] = command.value;
            return;
        }

        if (command.command === "lineTo") {
            command.value.forEach((val) => {
                context.lineTo(val[0], val[1]);
            });
            return;
        }

        if (command.command === "clearRect") {
            context.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        if (command.op === "function") {
            command.value == null
                ? context[command.command]()
                : context[command.command](...command.value);
        }
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
            <div>

                {/*
                An overlay to see viewport of canvas across players without resizing the canvas
                <div id="canvas-overlay" style={{ width: minSize[0], height: minSize[1] }}><div id="visible-area">Visible Area</div></div> 
                */}

                <canvas id="paint-canvas" ref={canvasRef} ></canvas>
            </div>
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
