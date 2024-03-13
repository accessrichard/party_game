import React, { useEffect, useState, useRef } from 'react';
import { canvasWidth, canvasHeight } from './canvasUtils';

const store = {
    drawing: [],
    displays: [],
    mouseMove: [],
    isDrawing: false,    
    reset: function () {
        this.mouseMove = [];
        this.drawing = [];
        this.isDrawing = false;
    }
}

export default function Canvas({ color, isEditable, onDraw, width, height, commands, onColorChange }) {

    const canvasRef = useRef(null);    

    useEffect(() => {
        return () => { store.reset(); };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvasWidth();
        canvas.height = canvasHeight();

        const context = canvas.getContext("2d");
        context.strokeStyle = color;
        context.lineWidth = 2;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (isEditable) {
            canvas.addEventListener('pointerdown', mouseDown);
            canvas.addEventListener('pointermove', mouseMove);
            canvas.addEventListener('pointerup', mouseUp);
        }

        return () => {
            canvas.removeEventListener('pointerdown', mouseDown);
            canvas.removeEventListener('pointermove', mouseMove);
            canvas.removeEventListener('pointerup', mouseUp);
        }
    }, [isEditable]);

    function mouseDown(event) {
        store.isDrawing = true;
        const context = canvasRef.current.getContext("2d");
        context.beginPath();
        context.moveTo(event.layerX, event.layerY);
        store.drawing.push({ command: "beginPath", value: null, op: "function" });
        store.drawing.push({ command: "moveTo", value: [event.layerX, event.layerY], op: "function" });
        event.preventDefault();
    }

    function mouseMove(event) {
        if (!store.isDrawing) {
            return;
        }

        const context = canvasRef.current.getContext("2d");
        context.lineTo(event.layerX, event.layerY);
        context.stroke();
        store.mouseMove.push([event.layerX, event.layerY]);
        event.preventDefault();
    }

    function mouseUp(event) {
        store.drawing.push({ command: "lineTo", value: store.mouseMove, op: "function" });
        store.drawing.push({ command: "stroke", value: null, op: "function" });
        onDraw && onDraw(store.drawing)
        store.reset();
        event.preventDefault();
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
        const context = canvasRef.current.getContext('2d');        
        context.strokeStyle = color;
        store.drawing.push({ command: "strokeStyle", value: color, op: "assign" });
    }, [color]);


    /**
     * Stroke style uses state since context.strokeStyle
     * comes back as rgb which requires conversion to figure
     * out what it is in relation to the pallette
     */
    function specialAssign(command) {
        if (command.command == 'strokeStyle') {
            onColorChange && onColorChange(command.value);
        }
    }

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        commands.forEach(command => onCommand(command));
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

            <canvas id="paint-canvas" ref={canvasRef} >Your browser does not support canvas element.
</canvas>
        </div>
    );
}
