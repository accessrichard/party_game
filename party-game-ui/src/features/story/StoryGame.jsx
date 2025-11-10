import { useState, useEffect } from 'react';
import {
    toFieldObject
} from '../creative/creative';
import InputError from '../common/InputError';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket, sendEvent } from '../phoenix/usePhoenix';
import { useDispatch, useSelector } from 'react-redux';
import useLobbyEvents from '../lobby/useLobbyEvents';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { handleNewGame, handleUpdate, returnToLobby, reset } from './storySlice';
import { endGame } from '../lobby/lobbySlice';

const events = (topic) => [
    {
        event: 'handle_new_game',
        dispatcher: handleNewGame(),
        topic,
    },
    {
        event: 'handle_update',
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

export default function StoryGame() {

    const { playerName, gameCode, selectedGame } = useSelector(state => state.lobby);
    const { games } = useSelector(state => state.creative);

    const storyChannel = `story:${gameCode}`;
    usePhoenixSocket();
    usePhoenixChannel(storyChannel, { name: playerName }, { persisted: true });
    usePhoenixEvents(storyChannel, events);
    useLobbyEvents();

    const dispatch = useDispatch();
    const tokens = useSelector(state => state.story.tokens);
    const [isStartGamePrompt, setIsStartGamePrompt] = useState(true);


    useEffect(() => {
        setIsStartGamePrompt(true);
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "game" }
        }));
    }, []);

    useEffect(() => {
        setIsStartGamePrompt(true);
        dispatch(channelPush({
            topic: `story:${gameCode}`,
            event: "new_game",
            data: { location: "game" }
        }));

        dispatch(channelPush(sendEvent(storyChannel, getGame(), "new_game")))

    }, []);

    useEffect(() => {
        if (tokens && tokens.length > 0) {
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

    const [form, setForm] = useState(defaultForm);
    function handleChanges(e, id) {
        const input = toFieldObject(e);
        const oldInput = form.inputs.filter(x => x.id === id);

        if (oldInput.length === 1) {
            const newInput = { ...oldInput[0], ...input, ...{ errors: [e.target.validationMessage] } };
            const newForm = { ...form, inputs: form.inputs.map(item => item.id === id ? newInput : item) };
            setForm(newForm)
        }

        if (e.type === 'invalid') {
            e.preventDefault();
        }
    }

    return (
        <>
            <h3>Story Time</h3>
            <div className='center-65'>

                {form.inputs.map((x) => {
                    if (x.type === "string") {
                        return <span key={x.id}>{x.value}</span>
                    } else if (x.type === "text") {
                        return <span className='inline-flex'>
                            <input
                                placeholder={x.placeholder}
                                required
                                name="value"
                                key={x.id}
                                type='text'
                                onInvalid={(e) => handleChanges(e, x.id)}
                                onChange={(e) => handleChanges(e, x.id)}
                                onBlur={(e) => handleChanges(e, x.id)}
                                value={x.value}
                                id={"value" + x.id}
                            />
                            <span className="message">
                                <InputError key={'error' + x.id} className="error shake" errors={x.errors} />
                            </span>
                        </span>
                    }
                })}
            </div>
        </>
    )
}