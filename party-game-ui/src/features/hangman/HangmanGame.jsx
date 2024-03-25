import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateWord, handleGuess, handleNewGame } from '../canvas/canvasSlice';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import useLobbyEvents from '../lobby/useLobbyEvents';

const events = (topic) => [
    {
        event: 'word',
        dispatcher: updateWord(),
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
    }
]

export default function HangmanGame({ text, hideSubmit, onImportGame, form = null, json = "" }) {
    const [game, setGame] = useState(json);

    const dispatch = useDispatch();

    const { playerName, gameCode, isGameStarted } = useSelector(state => state.lobby);

    const hangmanChannel = `hangman:${gameCode}`;

    usePhoenixSocket();
    usePhoenixChannel(hangmanChannel, { name: playerName }, { persisted: false });
    usePhoenixEvents(hangmanChannel, events);
    useLobbyEvents();

    function handleChange(e) {
        setGame(e.target.value);
    }

    useEffect(() => { draw() }, [])

    function word(context, text, height, width, lineHeight, maxWidth) {
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

    function guess(context, canvas, lineHeight, letter) {
        context.fillStyle = "black";
        word(context, "T A B C D E F G H I I A B C D E ", canvas.height - 50, 0, lineHeight, canvas.width)
    }

    function draw() {
        const canvas = document.getElementById('hangman-canvas');
        canvas.setAttribute('width', '400');
        canvas.setAttribute('height', '500');

        const context = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 20;
        const centerYoffset = 10;
        const centerXOffset = -30

        const lineHeight = 30;
        context.font = lineHeight + "px Arial";
        context.fillStyle = "red";
        word(context, "Hello world this is wrapping text so be it a wrap", 50, 0, lineHeight, canvas.width)

        guess(context, canvas, lineHeight);
        

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

    return (
        <>
            <h3>Hangman</h3>
            <canvas id="hangman-canvas">Your browser does not support canvas element.
            </canvas>
        </>
    )
}
