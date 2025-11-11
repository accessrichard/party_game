import { useState, useEffect } from 'react';
import {
    toFieldObject
} from '../creative/creative';
import StoryInputForm from './StoryInputForm';
import StoryInputAltForm from './StoryInputAltForm';
import StoryDisplayForm from './StoryDisplayForm';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import { useDispatch, useSelector } from 'react-redux';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { handleNewGame, handleUpdateTokens, returnToLobby, handleSubmitForm, reset } from './storySlice';
import { endGame, selectGameOwner } from '../lobby/lobbySlice';
import NewGamePrompt from '../common/NewGamePrompt';
import Timer from '../common/Timer';
import useBackButtonBlock from '../useBackButtonBlock'
import { push } from "redux-first-history";

const events = (topic) => [
    {
        event: 'handle_new_game',
        dispatcher: handleNewGame(),
        topic,
    },
    {
        event: 'handle_update_tokens',
        dispatcher: handleUpdateTokens(),
        topic,
    },
    {
        event: 'handle_submit_form',
        dispatcher: handleSubmitForm(),
        topic,
    },
    {
        event: 'handle_quit',
        dispatcher: returnToLobby(),
        topic
    },
    {
        event: 'handle_quit',
        dispatcher: endGame(),
        topic
    }
]

const story = [
    { type: "string", value: "once upon a time in a", errors: [], id: 1 },
    { type: "text", value: "", errors: [], id: 2 },
    { type: "string", value: " far far away. A man wearing a ", errors: [], id: 3 },
    { type: "text", value: "", errors: [], id: 4 },
    { type: "string", value: " strolled down the street. The man went into a ", errors: [], id: 5 },
    { type: "text", value: "", errors: [], id: 6 },
    { type: "string", value: " and bought a brand new ", errors: [], id: 7 },
    { type: "text", value: "", errors: [], id: 8 },
]

const defaultForm = {
    name: "",
    inputs: story,
    id: Date.now(),
    type: "Story"
}

export default function StoryGame() {

    const dispatch = useDispatch();

    const { playerName, gameCode, selectedGame } = useSelector(state => state.lobby);
    const { games } = useSelector(state => state.creative);
    const { tokens, name, turn, type, isOver, forceQuit, startTimerTime, editableTokens, settings } = useSelector(state => state.story);
    const isGameOwner = useSelector(selectGameOwner);

    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const storyChannel = `story:${gameCode}`;
    const [form, setForm] = useState(defaultForm);
    const [isTimerActive, setIsTimerActive] = useState(false);

    usePhoenixSocket();
    usePhoenixChannel(storyChannel, { name: playerName }, { persisted: false });
    usePhoenixEvents(storyChannel, events);
    useLobbyEvents();
    useBackButtonBlock(isBackButtonBlocked);

    useEffect(() => {
        dispatch(reset());
        setIsStartGamePrompt(true);
        setIsTimerActive(true);
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "game" }
        }));
    }, []);


    useEffect(() => {
        if (forceQuit) {
            setIsTimerActive(false);
            onQuitClick();
        }
    }, [forceQuit])

    useEffect(() => {
        if (!gameCode) {
            window.location.href = '/';
        }

    }, [gameCode])


    useEffect(() => {
        if (tokens && tokens.length > 0) {
            setIsStartGamePrompt(false);
            const newForm = { ...form, inputs: tokens }
            setForm(newForm)
        }
    }, [tokens]);

    function getGame() {
        const matching = games.find(x => x.game.name === selectedGame.name);
        return typeof matching === 'undefined'
            ? { type: selectedGame.type, name: selectedGame.name, settings }
            : { type: matching.game.type, name: selectedGame.name, tokens: matching.game.tokens, settings };
    }

    function handleChanges(e, id) {
        const input = toFieldObject(e);
        const oldInput = form.inputs.find(x => x.id === id);

        if (oldInput && e.type == 'change' || e.target.validationMessage) {
            const newInput = { ...oldInput, ...input, ...{ errors: [e.target.validationMessage] } };
            const newForm = { ...form, inputs: form.inputs.map(item => item.id === id ? newInput : item) };
            setForm(newForm);
        }

        if (e.type === 'blur' && type !== "alternate_story") {
            //const field = form.inputs.find(x => x.id === id);
            // dispatch(channelPush(sendEvent(storyChannel, [field], "update_tokens")));
        }

        if (e.type === 'invalid') {
            e.preventDefault();
        }
    }

    function notifyLeave() {
        dispatch(channelPush(sendEvent(storyChannel, {}, "end_game")))
    }

    function onQuitClick(e) {
        if (e) {
            notifyLeave();
        }

        dispatch(endGame());
        setIsBackButtonBlocked(false);
        dispatch(reset());
        setIsTimerActive(false);
        dispatch(push('/lobby'));
    }

    function onTimerCompleted() {
        setIsTimerActive(false);
        if (!isOver) {
            dispatch(channelPush(sendEvent(storyChannel, {
                tokens: form.inputs,
            }, "submit_form")));
            return;
        }
    }

    function handleSubmit(e) {
        //  if (e.target.reportValidity()) { ...noValidate...
        //  }

        if (type == "alternate_story") {
            onTimerCompleted();
        } else {
            const fields = form.inputs.filter(x => editableTokens.includes(x.id))
            dispatch(channelPush(sendEvent(storyChannel, fields, "update_tokens")));
        }





        e.preventDefault();
    }

    function onStartGame() {
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(storyChannel, getGame(), "new_game")))
        }
    }

    return (
        <NewGamePrompt isNewGamePrompt={isStartGamePrompt} onStartGame={() => onStartGame()} >
            <h3>Story Time - {name}</h3>
            <div className='reset-pm smallest-font'>{turn == playerName ? "Your Turn " : `${turn}'s turn`} to fill out form.</div>
            <div>{
                <Timer key={startTimerTime}
                    restartKey={startTimerTime}
                    startDate={startTimerTime}
                    isActive={!isOver}
                    timeIncrement={-1}
                    isIncrement={false}
                    onTimerCompleted={onTimerCompleted}
                    numberSeconds={settings.roundTime} />}
            </div>
            {type == "alternate_story" && !isOver && playerName == turn &&
                <div className='center-65 light-background item card story '>
                    <StoryInputForm
                        handleChanges={handleChanges}
                        handleSubmit={handleSubmit}
                        inputs={form.inputs}
                        formId="story-form"
                    />
                </div>
            }

            {type !== "alternate_story" && !isOver &&
                <div className='center-65 light-background item card story '>
                    <StoryInputAltForm
                        handleChanges={handleChanges}
                        handleSubmit={handleSubmit}
                        inputs={form.inputs}
                        formId="story-form"
                        editableTokens={editableTokens}
                        playerName={playerName}
                        turn={turn}
                    />
                </div>
            }

            {isOver &&
                <div className='center-65 light-background item card story '>
                    <StoryDisplayForm inputs={form.inputs} />
                </div>}

            <div className="container">
                {isGameOwner && <button id="Quit" className="btn md-5" type="button" onClick={onQuitClick}>Quit</button>}
                {(turn == playerName) && !isOver && <button id="Next Turn" className="btn md-5" type="submit" form="story-form">Done</button>}
                {isGameOwner && isOver && <button id="Next Story" className="btn md-5" type="button" onClick={onStartGame}>Next Story</button>}

            </div>
        </NewGamePrompt>
    )
}