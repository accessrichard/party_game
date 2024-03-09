import React, { useEffect, useState } from 'react';
import CanvasUI from './CanvasUI';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '../phoenix/usePhoenix';
import { clearCanvas, clearCommand } from './canvasUtils';
import { getPresences } from '../presence/presenceSlice';

export default function CanvasDrawGame() {

    const dispatch = useDispatch();
    const { isGameOwner, playerName, gameCode } = useSelector(state => state.lobby);

    const canvasChannel = `canvas:${gameCode}`;
    const players = useSelector(getPresences);
    const {
        turn,
        winner,
        word
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
        dispatch(channelPush(sendEvent(`lobby:${gameCode}`, {location: "canvas_game"}, "user:location")));
    }, []);


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
        dispatch(channelPush(sendEvent(canvasChannel, {}, "switch_editable")));
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
                timerSeconds={45}
                onStartClick={onStartClick}
                onClearClick={onClearClick}
                isNewGamePrompt={isNewGamePrompt}
                onNextClick={onNextClick}
                isGuessInputDisplayed={playerName != turn}
                isGuessListDisplayed={players.length > 1}
                players={players}
                playerWaitMessage={`Guessing word for: ${turn}`}
                playerDrawMessage={`Draw: ${word}`}
                word={word}
                turn={turn}
                winner={winner}
                game="canvas_game"
            />
        </>)
}
