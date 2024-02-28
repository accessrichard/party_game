import React, { useEffect, useState } from 'react';
import CanvasUI from './CanvasUI';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import { word, commands, reset, handleNewGame, handleGuess } from './canvasSlice'
import { sendEvent } from '../phoenix/usePhoenix';
import { canvasWidth, canvasHeight, clearCanvas, saveCanvas, clearCommand } from './canvasUtils';

export default function CanvasDrawGame() {

    const dispatch = useDispatch();
    const { isGameOwner, playerName, gameCode } = useSelector(state => state.lobby);

    const canvasChannel = `canvas:${gameCode}`;

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
    const [isEditable, setIsEditable] = useState(true);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);

    useEffect(() => {
        if (winner) {
            setIsTimerActive(false);
            setIsNewGamePrompt(true);
        }
    }, [winner])

    function onTimerCompleted() {
        setIsTimerActive(false);
        setIsNewGamePrompt(true);
    }

    function onGuessSubmit(guess) {
        dispatch(channelPush(sendEvent(canvasChannel, { guess }, "guess")));
    }

    useEffect(() => {
        setIsEditable(playerName == turn);
    }, [turn]);

    function onStartClick() {
        setIsTimerActive(true);
        onClearClick()
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, {}, winner == "" ? "new_game" : "next_turn")));
        }

        setIsNewGamePrompt(false);
    }

    function onNextClick(e) {
        onClearClick();
        dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
    }    

    function onClearClick() {
        clearCanvas('paint-canvas');
        dispatch(channelPush(sendEvent(canvasChannel, clearCommand, "commands")));
    }


    return (
        <>
            <CanvasUI
                onTimerCompleted={onTimerCompleted}
                onGuessSubmit={onGuessSubmit}
                isEditable={isEditable}
                setIsNewGamePrompt={setIsNewGamePrompt}
                isTimerActive={isTimerActive}
                timerSeconds={1000}
                onStartClick={onStartClick}
                onClearClick={onClearClick}
                isNewGamePrompt={isNewGamePrompt}
                onNextClick={onNextClick}
            />
        </>)
}
