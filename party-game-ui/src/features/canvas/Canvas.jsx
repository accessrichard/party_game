import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useBackButtonBlock from '../useBackButtonBlock'
import Flash from '../common/Flash';
import { Navigate } from 'react-router-dom';
import Timer from '../common/Timer';
import { push } from "redux-first-history";
import usePrevious from '../usePrevious';
import ColorButton from './ColorButton';
import { word, commands, reset } from './canvasSlice'
import {
    usePhoenixChannel,
    usePhoenixEvents,
    usePhoenixSocket
} from '../phoenix/usePhoenix';
import { channelPush } from '../phoenix/phoenixMiddleware';

import {
    setFlash,
    unansweredTimeout,
    handleChangeOwner,
    handleGenServerTimeout,
    startRound
} from '../game/gameSlice';

const sendEvent = (topic, channelData, action) => (
    {
        topic: topic,
        event: action,
        data: channelData
    });

const events = (topic) => [
    {
        event: 'handle_next_question',
        dispatcher: startRound(),
        topic,
    },
    /*    {
            event: 'handle_game_server_idle_timeout',
            dispatcher: handleGenServerTimeout(),
            topic,
        },
    */
    {
        event: 'handle_room_owner_change',
        dispatcher: handleChangeOwner(),
        topic,
    },
    {
        event: 'word',
        dispatcher: word(),
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
    isColorShared: false,
    strokeStyle: 'black',

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

function toHex(rgb) {
    rgb = rgb.replace(/[^\d,]/g, '').split(',')
    return "#" + (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1);
}

const colorPallette = [
    "Black", "Gray", "Red",
    "Orange", "Green", "Blue",
    "Yellow", "Purple"
];

export default function Canvas() {

    useBackButtonBlock();
    usePhoenixSocket();
    usePhoenixChannel(`canvas:J`, { name: "d" });
    usePhoenixEvents(`canvas:J`, events);

    const {
        word,
        commands
    } = useSelector(state => state.canvas);

    const [activeColorIndex, setActiveColorIndex] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(10);
    const [isIncrement, setIsIncrement] = useState(true);

    const dispatch = useDispatch();
    const canvasRef = useRef(null);

    useEffect(() => {
        return () => {store.reset(); dispatch(reset())}; 
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvasWidth();
        canvas.height = canvasHeight();

        const context = canvas.getContext("2d");
        context.strokeStyle = 'black';
        context.lineWidth = 2;

        canvas.addEventListener('mousedown', mouseDown);
        canvas.addEventListener('mousemove', mouseMove);
        canvas.addEventListener('mouseup', mouseUp);

        return () => {
            canvas.removeEventListener('mousedown', mouseDown);
            canvas.removeEventListener('mousemove', mouseMove);
            canvas.removeEventListener('mouseup', mouseUp);
        }
    }, []);

    const mouseDown = useCallback((event) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        store.isDrawing = true;

        context.beginPath();
        context.moveTo(event.layerX, event.layerY);

        draw("strokeStyle", context.strokeStyle, "assign");
        draw("beginPath", null, "function");
        draw("moveTo", [event.layerX, event.layerY], "function");
    }, []);

    const mouseMove = useCallback((event) => {
        if (!store.isDrawing) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.lineTo(event.layerX, event.layerY);
        context.stroke();
        move([event.layerX, event.layerY]);
    }, []);

    const mouseUp = useCallback((event) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        draw("lineTo", store.mouseMove, "function");
        draw("stroke", null, "function");

        dispatch(channelPush(sendEvent("canvas:J", { commands: store.drawing }, "commands")));

        store.reset();
    }, []);

    function onStartClick(e) {
        setTimerSeconds(10);
        setIsTimerActive(!isTimerActive);

        dispatch(channelPush(sendEvent("canvas:J", {}, "word")));
    }

    function onNextClick(e) {
        dispatch(channelPush(sendEvent("canvas:J", {}, "word")));
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
        dispatch(channelPush(sendEvent("canvas:J", command, "commands")));
    }

    function onSaveClick(e) {
        var imageName = prompt('Please enter image name');
        var canvasDataURL = canvasRef.current.toDataURL();
        var a = document.createElement('a');
        a.href = canvasDataURL;
        a.download = imageName || 'drawing';
        a.click();
    }

    function onBackClick(e) {
        dispatch(push("/lobby"));
    }

    function onColorButtonClick(e) {
        setActiveColorIndex(e.target.getAttribute("data-id"));
        const context = canvasRef.current.getContext('2d');
        const color = colorPallette[e.target.getAttribute("data-id")];
        context.strokeStyle = colorPallette[e.target.getAttribute("data-id")];
        store.drawing.push({ command: "strokeStyle", value: color, op: "assign" });
    }

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");

        store.strokeStyle = context.strokeStyle;

        commands.forEach(command => onCommand(command));

        syncColors();
    }, [commands]);

    function onCommand(command) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (command.op === "assign") {
            context[command.command] = command.value;
            return;
        }

        if (command.command === "resize") {
            // resize(command.value, store.displays, canvas);
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

    function syncColors() {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (store.isColorShared) {
            context.strokeStyle = store.strokeStyle;
            return;
        }

        let colors = document.getElementsByClassName('color-button');
        Array.from(colors).forEach((color, idx) => {

            let colorButton = window.getComputedStyle(color).backgroundColor;
            if (toHex(colorButton) === context.strokeStyle) {
                setActiveColorIndex(idx);
            }
        });
    }

    return (
        <>
            <div className="container">
                <h1 id="word-game">Drawing Game - {word}</h1>
            </div>
            <div id="canvas-overlay"><div id="visible-area">Visible Area</div></div>
            <canvas ref={canvasRef} ></canvas>
            <div className="container">
                <div>
                <Timer
                    isActive={isTimerActive}
                    onTimerCompleted={() => {}}
                    timeIncrement={isIncrement ? 1 : -1}
                    isIncrement={isIncrement}
                    numberSeconds={timerSeconds} />
                </div>
                <div className="break"></div>
                <div>
                    {colorPallette.map((color, index) =>
                        <ColorButton
                            className={`color-button color-button-size ${color.toLowerCase()} light-text`}
                            onClick={onColorButtonClick}
                            color={color}
                            index={index}
                            active={activeColorIndex == index}
                            key={index}></ColorButton>)
                    }
                </div>
                <div className="break"></div>
                <div>
                    <button id="start" className="btn-default" type="button" onClick={onStartClick}>Start</button>
                    <button id="next" className="btn-default" type="button" onClick={onNextClick}>Next</button>
                    <button id="back" className="btn-default" type="button" onClick={onBackClick}>Back</button>
                    <button id="clear" className="btn-default" type="button" onClick={onClearClick}>Clear</button>
                    <button id="save" className="btn-default" type="button" onClick={onSaveClick}>Save</button>
                </div>
            </div>
        </>
    );
}
