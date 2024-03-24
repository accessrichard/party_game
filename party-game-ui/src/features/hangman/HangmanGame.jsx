import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';


export default function HangmanGame({ text, hideSubmit, onImportGame, form = null, json = "" }) {
    const [game, setGame] = useState(json);

    const dispatch = useDispatch();

    function handleChange(e) {
        setGame(e.target.value);
    }

    useEffect(() => { drawHead() }, [])

    function drawHead() {
        const canvas = document.getElementById('hangman-canvas');
        canvas.setAttribute('width', '800');
        canvas.setAttribute('height', '800');

        const context = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 4;
        const radius = 20;

        //hangman top line
        context.beginPath();
        context.moveTo(centerX - 100, centerY - 50)
        context.lineTo(centerX, centerY - 50)
        context.stroke();

        //hangman side line
        context.beginPath();
        context.moveTo(centerX - 100, centerY - 50)
        context.lineTo(centerX - 100, centerY + 175)
        context.stroke();


        //hangman bottom line
        context.beginPath();
        context.moveTo(centerX - 150, centerY + 175)
        context.lineTo(centerX + 75, centerY + 175)
        context.stroke();

        //hangman noose 
        context.beginPath();
        context.moveTo(centerX, centerY - 50)
        context.lineTo(centerX, centerY + 10)
        context.stroke();

        // noose circle
        context.beginPath();
        context.ellipse(centerX, centerY + 30, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.ellipse(centerX, centerY + 34, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.ellipse(centerX, centerY + 36, 2, 5, Math.PI / 2, 0, 2 * Math.PI)
        context.stroke();

        //head
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();


        //left eye
        context.beginPath();
        context.arc(centerX - 5, centerY - 5, 5, 0, 2 * Math.PI, false);
        context.stroke();

        //right eye
        context.beginPath();
        context.arc(centerX + 5, centerY - 5, 5, 0, 2 * Math.PI, false);
        context.stroke();

        //mouth
        context.beginPath();
        context.ellipse(centerX, centerY + 12, 4, 10, Math.PI / 2, 0, 2 * Math.PI)

        //body
        context.moveTo(centerX, centerY + radius);
        context.lineTo(centerX, centerY + 100);

        //left leg
        context.moveTo(centerX, centerY + 100);
        context.lineTo(centerX + 50, centerY + 150);

        //right leg
        context.moveTo(centerX, centerY + 100);
        context.lineTo(centerX - 50, centerY + 150);

        //right arm
        context.moveTo(centerX, centerY + 40);
        context.lineTo(centerX + 50, centerY + 40);

        //left arm
        context.moveTo(centerX, centerY + 40);
        context.lineTo(centerX - 50, centerY + 40);




        context.stroke();

    }

    return (
        <>
            <canvas id="hangman-canvas">Your browser does not support canvas element.
            </canvas>
        </>
    )
}
