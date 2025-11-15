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
    const playerName = useSelector(state => state.lobby.playerName);
    const gameCode = useSelector(state => state.lobby.gameCode);
    const selectedGame = useSelector(state => state.lobby.selectedGame);
    const games = useSelector(state => state.creative.games);
    const isGameOwner = useSelector(selectGameOwner);
    const canvasChannel = `canvas:${gameCode}`;
    const turn = useSelector(state => state.canvas.turn);
    const winner = useSelector(state => state.canvas.winner);
    const word = useSelector(state => state.canvas.word);
    const settings = useSelector(state => state.canvas.settings);
    const players = useSelector(getPresenceUsers);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isNewGamePrompt, setIsNewGamePrompt] = useState(true);
    
    /**
     * If game owner quits and only 1 person is left,
     * and its not their turn, make it their turn.
     */
    useEffect(() => {
        if (players.length === 1 && turn !== '' && turn !== playerName) {
            onNextClick();
        }

    }, [players, turn, playerName]);

    useEffect(() => {
        setIsTimerActive(!isNewGamePrompt);
    }, [word, turn, isNewGamePrompt]);


    function onTimerCompleted() {
        setIsTimerActive(false);
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
        const matching = games.find(x => x.game.name === selectedGame.name);
        const serverSettings = { difficulty: settings.difficulty, roundTime: settings.roundTime };       
        return typeof matching === 'undefined'
            ? { settings: serverSettings, name: selectedGame.name, type: selectedGame.type }
            : { settings: serverSettings, name: selectedGame.name, type: selectedGame.type, words: matching.game.words }
    }

    return (
        <>
            <CanvasUI
                onTimerCompleted={onTimerCompleted}
                onStartClick={onStartClick}
                onNextClick={onNextClick}
                isEditable={playerName == turn}
                isTimerActive={isTimerActive && players.length !== 1}
                timerSeconds={settings.roundTime}
                isNewGamePrompt={isNewGamePrompt}
                isGuessInputDisplayed={false}
                isGuessListDisplayed={false}
                players={players}
                playerWaitMessage={`${turn}'s turn to draw: ${word}`}
                playerDrawMessage={`Your turn to draw: ${word}`}
                turn={turn}
                word={word}
                winner={winner}
                game="canvas_alternate"
                isTimerDisplayed={players.length !== 1}
            />
        </>)
}
