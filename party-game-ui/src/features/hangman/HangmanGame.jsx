import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleGuess, handleNewGame } from './hangmanSlice';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import GuessInput from './../canvas/GuessInput';

const hangman = {
    width: 400,
    height: 500,
    centerX: 400 / 2,
    centerXOffset: -30,
    centerYOffset: 10,
    centerY:  500 / 2,
    radius: 20,
    lineHeight: 30,

    default: this.centerX + this.centerXOffset,
    defaultY: this.centerY + this.centerYOffset
};


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


    const { playerName, gameCode, isGameStarted } = useSelector(state => state.lobby);
    const { word, guesses } = useSelector(state => state.hangman);
    
    const hangmanChannel = `hangman:${gameCode}`;

    usePhoenixSocket();
    usePhoenixChannel(hangmanChannel, { name: playerName }, { persisted: true });
    usePhoenixEvents(hangmanChannel, events);
    useLobbyEvents();

    useEffect(() => { 
        draw()
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "new_game")))
     }, [])

     useEffect(() => { 
        const lineHeight = 30;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.fillStyle = "red";
        context.letterSpacing = "6px";
        displayText(context, word, 50, 10, lineHeight, canvas.width);
        
        
        //context.clearRect(0, 0, canvas.height, canvas.width)
        
        context.fillStyle = "black";
        context.letterSpacing = "0px";
        displayText(context, (guesses || []).join(" "), canvas.height - 50, 0, lineHeight, canvas.width)

     }, [word, guesses])

    function displayText(context, text, height, width, lineHeight, maxWidth) {
        const lines = getLines(context, text, maxWidth);
        lines.forEach((line, index) => {
            context.fillText(line, width, height + (index * lineHeight));
        });
    }

    function getLines(ctx, text, maxWidth) {
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            console.log(width)
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    function drawHanger(context, centerX, centerXOffset, centerY, centerYoffset) {
        //hangman top line
        context.beginPath();
        context.moveTo(centerX + centerXOffset - 100, centerY + centerYoffset - 100)
        context.lineTo(centerX + centerXOffset, centerY + centerYoffset - 100)
        context.stroke();

        //hangman side line
        context.beginPath();
        context.moveTo(centerX + centerXOffset - 100, centerY + centerYoffset - 100)
        context.lineTo(centerX + centerXOffset - 100, centerY + centerYoffset + 125)
        context.stroke();

        //hangman bottom line
        context.beginPath();
        context.moveTo(centerX + centerXOffset - 150, centerY + centerYoffset + 125)
        context.lineTo(centerX + centerXOffset + 75, centerY + centerYoffset + 125)
        context.stroke();
    }

    function drawNoose(context, centerX, centerXOffset, centerY, centerYoffset) {
        //hangman noose 
        context.beginPath();
        context.moveTo(centerX + centerXOffset, centerY + centerYoffset - 100)
        context.lineTo(centerX + centerXOffset, centerY + centerYoffset - 40)
        context.stroke();

        // noose circle
        context.beginPath();
        context.ellipse(centerX + centerXOffset, centerY + centerYoffset - 20, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.ellipse(centerX + centerXOffset, centerY + centerYoffset - 18, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.ellipse(centerX + centerXOffset, centerY + centerYoffset - 16, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.stroke();
    }

    function drawLeftEye(context, centerX, centerXOffset, centerY, centerYoffset) {
        context.beginPath();
        context.arc(centerX + centerXOffset - 5, centerY + centerYoffset - 55, 5, 0, 2 * Math.PI, false);
        context.stroke();
    }

    function drawRightEye(context, centerX, centerXOffset, centerY, centerYoffset) {
        context.beginPath();
        context.arc(centerX + centerXOffset + 5, centerY + centerYoffset - 55, 5, 0, 2 * Math.PI, false);
        context.stroke();
    }

    function drawMouth(context, centerX, centerXOffset, centerY, centerYoffset) {
        context.beginPath();
        context.ellipse(centerX + centerXOffset, centerY + centerYoffset - 38, 4, 10, Math.PI / 2, 0, 2 * Math.PI)
    }

    function drawHead(context, centerX, centerXOffset, centerY, centerYoffset, radius) {
        context.beginPath();
        context.arc(centerX + centerXOffset, centerY + centerYoffset - 50, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
    }

    function drawLeftLeg(context, centerX, centerXOffset, centerY, centerYoffset) {
        context.moveTo(centerX + centerXOffset, centerY + centerYoffset + 50);
        context.lineTo(centerX + centerXOffset + 50, centerY + centerYoffset + 100);
        context.stroke();
    }

    function drawRightLeg(context, centerX, centerXOffset, centerY, centerYoffset) {
        console.log({
            centerX, centerY, centerXOffset, centerYoffset
        })
        context.moveTo(centerX + centerXOffset, centerY + centerYoffset + 50);
        context.lineTo(centerX + centerXOffset - 50, centerY + centerYoffset + 100);
        context.stroke();
    }

    function drawRigthArm(context, centerX, centerXOffset, centerY, centerYoffset) {
        context.moveTo(centerX + centerXOffset, centerY + centerYoffset - 10);
        context.lineTo(centerX + centerXOffset + 50, centerY + centerYoffset - 10);
        context.stroke();
    }

    function drawLeftArm(context, centerX, centerXOffset, centerY, centerYoffset) {
        context.moveTo(centerX + centerXOffset, centerY + centerYoffset - 10);
        context.lineTo(centerX + centerXOffset - 50, centerY + centerYoffset - 10);
        context.stroke();
    }

    function drawBody(context, centerX, centerXOffset, centerY, centerYoffset, radius) {
        context.moveTo(centerX + centerXOffset, centerY + radius + centerYoffset - 50);
        context.lineTo(centerX + centerXOffset, centerY + centerYoffset + 50);
        context.stroke();
    }

 
    function draw() {
        const canvas = document.getElementById('hangman-canvas');
        canvas.setAttribute('width', coords.width);
        canvas.setAttribute('height', coords.height);

        const context = canvas.getContext('2d');
        const centerX = coords.centerX;
        const centerY = canvas.height / 2;
        const radius = 20;
        const centerYoffset = 10;
        const centerXOffset = -30
        const lineHeight = 30;

        setCoords({
            centerX,
            centerXOffset,
            centerY,
            centerYoffset,
            radius
        });
        context.font = lineHeight + "px Arial";                      

        drawHanger(context, centerX, centerXOffset, centerY, centerYoffset);
        drawNoose(context, centerX, centerXOffset, centerY, centerYoffset);

        hang(context, centerX, centerXOffset, centerY, centerYoffset, radius)

        context.stroke();
    }


    function bodyParts() {
        return [
            drawHead,
            drawBody,
            drawLeftArm,
            drawRigthArm,
            drawLeftLeg,
            drawRightLeg,
            drawLeftEye,
            drawRightEye,
            drawMouth
        ];
    }

    function hang(context, centerX, centerXOffset, centerY, centerYoffset, radius) {
            bodyParts().forEach(func => {
                func(context, centerX, centerXOffset, centerY, centerYoffset, radius);
            });
    }

    function onGuessSubmit(guess) {
        dispatch(channelPush(sendEvent(hangmanChannel, {guess}, "guess")));
    }

    return (
        <>
            <h3>Hangman</h3>
            <canvas ref={canvasRef} id="hangman-canvas">Your browser does not support canvas element.
            </canvas>

            <GuessInput onSubmit={onGuessSubmit} />
        </>
    )
}
