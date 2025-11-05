import { useEffect, useState } from 'react';
import CanvasUI from './CanvasUI';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '../phoenix/usePhoenix';
import { clearCanvas, clearCommand } from './canvasUtils';
import { getPresenceUsers } from '../presence/presenceSlice';
import { selectGameOwner } from '../lobby/lobbySlice';

export default function CanvasDrawGame() {

    const dispatch = useDispatch();
    const { playerName, gameCode, gameName } = useSelector(state => state.lobby);
    const { turn, winner, word, settings, isOver } = useSelector(state => state.canvas);
    const { games } = useSelector(state => state.creative);
    const players = useSelector(getPresenceUsers);
    const isGameOwner = useSelector(selectGameOwner);
    const canvasChannel = `canvas:${gameCode}`;
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);

    useEffect(() => {
        if (winner) {
            setIsTimerActive(false);
        }
    }, [winner])

    /**
     * If game owner quits and only 1 person is left,
     * and its not their turn, make it their turn.
     */
    useEffect(() => {
        if (players.length === 1 && turn !== '' && turn !== playerName) {
            onNextClick();
        }

        setIsEditable(playerName == turn);
    }, [players, turn, playerName]);

    useEffect(() => {
        setIsTimerActive(true);
    }, [word, turn]);

    function onTimerCompleted() {
        setIsTimerActive(false);
    }

    function onGuessSubmit(guess) {
        dispatch(channelPush(sendEvent(canvasChannel, { guess }, "guess")));
    }

    function onStartClick() {
        setIsTimerActive(true);
        setIsNewGamePrompt(false);

        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, getGame(), winner == "" ? "new_game" : "next_turn")));
        }
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
        const matching = games.find(x => x.game.name === gameName);
        const serverSettings = { difficulty: settings.difficulty, roundTime: settings.roundTime };
        return typeof matching === 'undefined'
            ? { settings: serverSettings, name: gameName, type: "canvas" }
            : { type: matching.game.type, name: gameName, words: matching.game.words, serverSettings }
    }

    return (
        <>
            {isOver && <div>No More words for creative game!</div>}
            <CanvasUI
                onTimerCompleted={onTimerCompleted}
                onGuessSubmit={onGuessSubmit}
                onStartClick={onStartClick}
                onNextClick={onNextClick}
                isEditable={isEditable}
                isTimerActive={isTimerActive}
                timerSeconds={settings.roundTime}
                isNewGamePrompt={isNewGamePrompt}
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
