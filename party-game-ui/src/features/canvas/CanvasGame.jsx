import React, { useEffect, useState } from 'react';
import CanvasUI from './CanvasUI';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '../phoenix/usePhoenix';
import { clearCanvas, clearCommand } from './canvasUtils';

export default function CanvasDrawGame() {

    const dispatch = useDispatch();
    const { isGameOwner, playerName, gameCode, gameName } = useSelector(state => state.lobby);
    const { turn, winner, word, players, settings, isOver } = useSelector(state => state.canvas);
    const { games } = useSelector(state => state.creative);
    const canvasChannel = `canvas:${gameCode}`;
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

        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, getGame(), winner == "" ? "new_game" : "next_turn")));
        }

        setIsNewGamePrompt(false);
    }

    function onNextClick() {
        onClearClick();
        dispatch(channelPush(sendEvent(canvasChannel, {}, "next_turn")));
    }

    function onClearClick() {
        clearCanvas('paint-canvas');
        dispatch(channelPush(sendEvent(canvasChannel, clearCommand, "commands")));
    }

    function getGame() {
        const matching = games.find(x => x.game.name == gameName);
        return typeof matching === 'undefined'
            ? { settings: { difficulty: settings.difficulty } }
            : { type: matching.game.type, name: gameName, words: matching.game.words, settings }
    }

    return (
        <>
            {isOver && <div>No More words for creative game!</div>}
            <CanvasUI
                onTimerCompleted={onTimerCompleted}
                onGuessSubmit={onGuessSubmit}
                isEditable={isEditable}
                setIsNewGamePrompt={setIsNewGamePrompt}
                isTimerActive={isTimerActive}
                timerSeconds={settings.roundTime}
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
