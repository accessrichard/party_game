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
    centerY: 500 / 2,
    radius: 20,
    lineHeight: 30,
    get defaultX() { return this.centerX + this.centerXOffset },
    get defaultY() { return this.centerY + this.centerYOffset }
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
        draw(hangman)
        dispatch(channelPush(sendEvent(hangmanChannel, {}, "new_game")))
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.height, canvas.width)

        draw(hangman)

        context.fillStyle = "red";
        context.letterSpacing = "6px";
        displayText(context, word, 50, 10, 30, canvas.width);

        context.fillStyle = "black";
        context.letterSpacing = "0px";
        displayText(context, (guesses || []).join(" "), canvas.height - 50, 0, hangman.lineHeight, canvas.width)


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

    function drawHanger(context, coords) {
        //hangman top line
        context.beginPath();
        context.moveTo(coords.defaultX - 100, coords.defaultY - 100)
        context.lineTo(coords.defaultX, coords.defaultY - 100)
        context.stroke();

        //hangman side line
        context.beginPath();
        context.moveTo(coords.defaultX - 100, coords.defaultY - 100)
        context.lineTo(coords.defaultX - 100, coords.defaultY + 125)
        context.stroke();

        //hangman bottom line
        context.beginPath();
        context.moveTo(coords.defaultX - 150, coords.defaultY + 125)
        context.lineTo(coords.defaultX + 75, coords.defaultY + 125)
        context.stroke();
    }

    function drawNoose(context, coords) {
        //hangman noose 
        context.beginPath();
        context.moveTo(coords.defaultX, coords.defaultY - 100)
        context.lineTo(coords.defaultX, coords.defaultY - 40)
        context.stroke();

        // noose circle
        context.beginPath();
        context.ellipse(coords.defaultX, coords.defaultY - 20, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.ellipse(coords.defaultX, coords.defaultY - 18, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.ellipse(coords.defaultX, coords.defaultY - 16, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.stroke();
    }

    function drawLeftEye(context, coords) {
        context.beginPath();
        context.arc(coords.defaultX - 5, coords.defaultY - 55, 5, 0, 2 * Math.PI, false);
        context.stroke();
    }

    function drawRightEye(context, coords) {
        context.beginPath();
        context.arc(coords.defaultX + 5, coords.defaultY - 55, 5, 0, 2 * Math.PI, false);
        context.stroke();
    }

    function drawMouth(context, coords) {
        context.beginPath();
        context.ellipse(coords.defaultX, coords.defaultY - 38, 4, 10, Math.PI / 2, 0, 2 * Math.PI)
    }

    function drawHead(context, coords) {
        context.beginPath();
        context.arc(coords.defaultX, coords.defaultY - 50, coords.radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
    }

    function drawLeftLeg(context, coords) {
        context.moveTo(coords.defaultX, coords.defaultY + 50);
        context.lineTo(coords.defaultX + 50, coords.defaultY + 100);
        context.stroke();
    }

    function drawRightLeg(context, coords) {

        context.moveTo(coords.defaultX, coords.defaultY + 50);
        context.lineTo(coords.defaultX - 50, coords.defaultY + 100);
        context.stroke();
    }

    function drawRigthArm(context, coords) {
        context.moveTo(coords.defaultX, coords.defaultY - 10);
        context.lineTo(coords.defaultX + 50, coords.defaultY - 10);
        context.stroke();
    }

    function drawLeftArm(context, coords) {
        context.moveTo(coords.defaultX, coords.defaultY - 10);
        context.lineTo(coords.defaultX - 50, coords.defaultY - 10);
        context.stroke();
    }

    function drawBody(context, coords) {
        context.moveTo(coords.defaultX, coords.defaultY + coords.radius - 50);
        context.lineTo(coords.defaultX, coords.defaultY + 50);
        context.stroke();
    }


    function draw(coords) {
        const canvas = document.getElementById('hangman-canvas');
        canvas.setAttribute('width', coords.width);
        canvas.setAttribute('height', coords.height);

        const context = canvas.getContext('2d');

        context.font = coords.lineHeight + "px Arial";

        drawHanger(context, coords);
    

        hang(context, coords, guesses.length)

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
            drawMouth,
            drawNoose   
        ];
    }

    function hang(context, coords, numParts) {
        const parts = bodyParts();
        for (let i = 0; i < numParts && i < parts.length; i++) {
            parts[i](context, coords);
        }
    }

    function onGuessSubmit(guess) {
        dispatch(channelPush(sendEvent(hangmanChannel, { guess }, "guess")));
    }

    return (
        <>
            <h3>Hangman</h3>
            <canvas ref={canvasRef} id="hangman-canvas">Your browser does not support canvas element.
            </canvas>

            <GuessInput onSubmit={onGuessSubmit} maxLength="1" />
        </>
    )
}
