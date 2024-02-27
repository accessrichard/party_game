import React, { useEffect, useState, useRef } from 'react';

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

export default function CanvasTest({ isClearRequest, onCleared, color, isEditable, onDraw, width, height, onCreated, commands }) {

    const canvasRef = useRef(null);
    const [strokeStyle, setStrokeStyle] = useState("black");

    useEffect(() => {
        return () => { store.reset(); };
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvasWidth();
        canvas.height = canvasHeight();

        const context = canvas.getContext("2d");
        context.strokeStyle = strokeStyle;
        context.lineWidth = 2;      
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (isEditable) {
            canvas.addEventListener('mousedown', mouseDown);
            canvas.addEventListener('mousemove', mouseMove);
            canvas.addEventListener('mouseup', mouseUp);
        }

        return () => {
            canvas.removeEventListener('mousedown', mouseDown);
            canvas.removeEventListener('mousemove', mouseMove);
            canvas.removeEventListener('mouseup', mouseUp);
        }
    }, [isEditable]);

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
        onDraw && onDraw(store.drawing)
        store.reset();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (width > 100) {
            canvas.width = width;
        }
        if (height > 100) {
            canvas.height = height;
        }
    }, [width, height])

    useEffect(() => {
        if (!isClearRequest) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const command = {
            commands: [{
                command: "clearRect",
                value: [0, 0, canvas.width, canvas.height], op: "function"
            }]
        };

        onCleared && onCleared(command);
        context.clearRect(0, 0, canvas.width, canvas.height);
    }, [isClearRequest])

    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        setStrokeStyle(color);
        context.strokeStyle = color;
        store.drawing.push({ command: "strokeStyle", value: color, op: "assign" });
    }, [color]);


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

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");

        let tempStrokeStyle = strokeStyle;

        commands.forEach(command => onCommand(command));

        preventSyncStrokeStyle(context, tempStrokeStyle)
    }, [commands]);

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

    return (
        <div>

            {/*
                An overlay to see viewport of canvas across players without resizing the canvas
                <div id="canvas-overlay" style={{ width: minSize[0], height: minSize[1] }}><div id="visible-area">Visible Area</div></div> 
                */}

            <canvas id="paint-canvas" ref={canvasRef} ></canvas>
        </div>
    );
}
