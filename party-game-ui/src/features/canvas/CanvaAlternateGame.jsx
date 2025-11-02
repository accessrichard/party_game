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
    const { games } = useSelector(state => state.creative);
    const isGameOwner = useSelector(selectGameOwner);
    const canvasChannel = `canvas:${gameCode}`;
    const {
        turn,
        winner,
        word,        
        settings
    } = useSelector(state => state.canvas);
    const players = useSelector(getPresenceUsers);    
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);

    useEffect(() => {
        setIsTimerActive(false);
        setIsTimerActive(!isNewGamePrompt);
    }, [turn, isNewGamePrompt]);

    /**
     * If game owner quits and only 1 person is left,
     * and its not their turn, make it their turn.
     */
    useEffect(() => {
        if (players.length === 1 && turn !== '' && turn !== playerName) {
            onNextClick();
        }

    }, [players, turn, playerName]);
    
    function onTimerCompleted() {
        setIsTimerActive(false);
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, {}, "switch_editable")));
        }
    }

    function onStartClick() {
        setIsTimerActive(true);

        if (isGameOwner) {
            dispatch(channelPush(sendEvent(canvasChannel, getGame(), winner === "" ? "new_game" : "next_turn")));
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
        const matching = games.find(x => x.game.name === gameName);
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
