import { useState, useEffect } from 'react';
import {
    toFieldObject
} from '../creative/creative';
import InputError from '../common/InputError';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import { useDispatch, useSelector } from 'react-redux';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { handleNewGame, handleUpdate, returnToLobby } from './storySlice';
import { endGame, selectGameOwner } from '../lobby/lobbySlice';
import NewGamePrompt from '../common/NewGamePrompt';

import useBackButtonBlock from '../useBackButtonBlock'
import { push } from "redux-first-history";

const events = (topic) => [
    {
        event: 'handle_new_game',
        dispatcher: handleNewGame(),
        topic,
    },
    {
        event: 'handle_update_token',
        dispatcher: handleUpdate(),
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

export default function StoryGameAltSentance() {

    const dispatch = useDispatch();

    const { playerName, gameCode, selectedGame } = useSelector(state => state.lobby);
    const { games } = useSelector(state => state.creative);
    const { tokens, name, turn, tokenIndex } = useSelector(state => state.story);
    const isGameOwner = useSelector(selectGameOwner);

    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);
    const [isBackButtonBlocked, setIsBackButtonBlocked] = useState(true);
    const storyChannel = `story:${gameCode}`;
    const [form, setForm] = useState(defaultForm);

    usePhoenixSocket();
    usePhoenixChannel(storyChannel, { name: playerName }, { persisted: false });
    usePhoenixEvents(storyChannel, events);
    useLobbyEvents();
    useBackButtonBlock(isBackButtonBlocked);

    useEffect(() => {
        setIsStartGamePrompt(true);
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "game" }
        }));
    }, []);

    useEffect(() => {
        dispatch(channelPush({
            topic: `story:${gameCode}`,
            event: "new_game",
            data: { location: "game" }
        }));
    }, []);

    useEffect(() => {
        if (tokens && tokens.length > 0) {
            setIsStartGamePrompt(false);
            const newForm = { ...form, inputs: tokens }
            setForm(newForm)
        }
    }, [tokens]);

    function getGame() {
        const settings = { difficulty: "easy" };
        const matching = games.find(x => x.game.name === selectedGame.name);
        return typeof matching === 'undefined'
            ? { settings: { difficulty: settings.difficulty } }
            : { type: matching.game.type, name: selectedGame.name, tokens: matching.game.tokens, settings }
    }

    function handleChanges(e, id) {
        const input = toFieldObject(e);
        const oldInput = form.inputs.find(x => x.id === id);
        if (oldInput && e.type == 'change') {            
            const newInput = { ...oldInput, ...input, ...{ errors: [e.target.validationMessage] } };
            const newForm = { ...form, inputs: form.inputs.map(item => item.id === id ? newInput : item) };
            setForm(newForm);
        }

        if (e.type === 'blur') {            
            const field = form.inputs.find(x => x.id === id);
            dispatch(channelPush(sendEvent(storyChannel, field, "update_token")));
        }

        if (e.type === 'invalid') {
            e.preventDefault();
        }


    }

    function notifyLeave() {
        dispatch(channelPush(sendEvent(storyChannel, {}, "end_game")))
    }

    function onQuitClick() {
        notifyLeave();
        dispatch(endGame());
        setIsBackButtonBlocked(false);
        dispatch(push('/lobby'))
    }

    function onStartGame() {
        if (isGameOwner) {
            dispatch(channelPush(sendEvent(storyChannel, getGame(), "new_game")))
        }
    }

    return (
        <NewGamePrompt isNewGamePrompt={isStartGamePrompt} onStartGame={() => onStartGame()} >
            <h3>Story Time - {name}</h3>
            <div className='center-65 light-background item card story '>
                <form className='form'>
                    {form.inputs.map((x) => {
                        
                        if (x.type === "text") {
                            return <span key={x.id}>{x.value}</span>
                        } else if (x.type === "input" && tokenIndex !== x.id && x.updated_by == playerName) {
                            return <span key={x.id} className='bolder'>{x.value}</span>
                        } else if (x.type === "input" && tokenIndex !== x.id && x.updated_by != playerName) {
                            return <span key={x.id} className='bolder'>____________________</span>
                        } else if (x.type === "input") {
                            return <span key={"span-" + x.id} className='inline-flex group'>

                                <input
                                    required

                                    name="value"
                                    key={"input-" + x.id}
                                    type='text'
                                    onInvalid={(e) => handleChanges(e, x.id)}
                                    onChange={(e) => handleChanges(e, x.id)}
                                    onBlur={(e) => handleChanges(e, x.id)}
                                    value={x.value}
                                    id={"value" + x.id}
                                />
                                <span className="highlight"></span>
                                <span className="bar"></span>
                                <label>{x.placeholder}</label>
                                <span className="message">
                                    <InputError key={"error-" + x.id} className="error shake" errors={x.errors} />
                                </span>
                            </span>
                        }
                    })}
                </form>
            </div>
            <div className="container">
                {isGameOwner && <button id="Quit" className="btn md-5" type="button" onClick={onQuitClick}>Quit</button>}
            </div>
        </NewGamePrompt>
    )
}