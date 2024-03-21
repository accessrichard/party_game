import React, { useEffect, useState } from 'react';
import CanvasUI from './CanvasUI';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '../phoenix/usePhoenix';
import { clearCanvas, clearCommand } from './canvasUtils';

export default function CanvasDrawGame() {

    const dispatch = useDispatch();
    const { isGameOwner, playerName, gameCode, gameName } = useSelector(state => state.lobby);
    const { games } = useSelector(state => state.creative);
    const canvasChannel = `canvas:${gameCode}`;
    const { players, settings } = useSelector(state => state.canvas);
    const {
        turn,
        winner,
        word
    } = useSelector(state => state.canvas);

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);

    useEffect(() => {
        setIsTimerActive(false);
        setIsTimerActive(!isNewGamePrompt);
    }, [turn, isNewGamePrompt]);

    function onTimerCompleted() {
        setIsTimerActive(false);
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, {}, "switch_editable")));
        }
    }

    function onStartClick() {
        setIsTimerActive(true);

        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, getGame(), winner == "" ? "new_game" : "next_turn")));
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

    function getGame() {
        const matching = games.find(x => x.game.name == gameName);
        return typeof matching === 'undefined'
            ? { settings: { difficulty: settings.difficulty } }
            : { type: matching.game.type, name: gameName, words: matching.game.words, settings }
    }

    return (
        <>
            <CanvasUI
                onTimerCompleted={onTimerCompleted}
                isEditable={playerName == turn}
                setIsNewGamePrompt={setIsNewGamePrompt}
                isTimerActive={isTimerActive}
                timerSeconds={settings.alternateRoundTime}
                onStartClick={onStartClick}
                onClearClick={onClearClick}
                isNewGamePrompt={isNewGamePrompt}
                onNextClick={onNextClick}
                isGuessInputDisplayed={false}
                isGuessListDisplayed={false}
                players={players}
                playerWaitMessage={`${turn}'s turn to draw: ${word}`}
                playerDrawMessage={`Your turn to draw: ${word}`}
                turn={turn}
                word={word}
                winner={winner}
                game="canvas_alternate"
            />
        </>)
}
