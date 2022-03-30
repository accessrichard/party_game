import {
    CHANNEL_ERROR,
    CHANNEL_JOINED,
    CHANNEL_JOIN_ERROR,
    SOCKET_CONNECTED,
    SOCKET_CONNECTING,
    SOCKET_DISCONNECTED,
    SOCKET_ERROR,
    channelJoin,
    channelOn,
    channelPush,
    socketConnect
} from '../phoenix/phoenixMiddleware';
import { NavLink, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    changeGame,
    handleChangeOwner,
    handleCorrectAnswer,
    handleGenServerTimeout,
    handleJoin,
    handleNewGameCreated,
    handleWrongAnswer,
    listGames,
    mergeGameList,
    startRound
} from './gameSlice';
import { syncPresenceDiff, syncPresenceState } from './../presence/presenceSlice';
import { useDispatch, useSelector } from 'react-redux';

import Chat from '../chat/Chat';
import GameCodeLink from '../common/GameCodeLink';
import GameList from '../common/GameList';
import Logo from '../common/Logo';
import NewGamePrompt from '../common/NewGamePrompt';
import Timer from './Timer';
import { push } from "redux-first-history";
import { toServerSettings } from './settingsApi';

const persistedEvents = (topic) => [
    {
        event: 'handle_join',
        dispatcher: handleJoin(),
        topic,
    },
    {
        event: 'presence_state',
        dispatcher: syncPresenceState(),
        topic
    },
    {
        event: 'presence_diff',
        dispatcher: syncPresenceDiff(),
        topic
    },
    {
        event: 'handle_correct_answer',
        dispatcher: handleCorrectAnswer(),
        topic,
    },
    {
        event: 'handle_next_question',
        dispatcher: startRound(),
        topic,
    },
    {
        event: 'handle_wrong_answer',
        dispatcher: handleWrongAnswer(),
        topic,
    },
    {
        event: 'handle_game_server_idle_timeout',
        dispatcher: handleGenServerTimeout(),
        topic,
    },
    {
        event: 'handle_room_owner_change',
        dispatcher: handleChangeOwner(),
        topic,
    },
    {
        event: 'handle_new_game_created',
        dispatcher: handleNewGameCreated(),
        topic
    }
]

export default function Lobby() {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [gameList, setGameList] = useState([]);
    const dispatch = useDispatch();
    const { playerName, gameCode, gameChannel, isGameOwner, isGameStarted, name, settings } = useSelector(state => state.game);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.game.api.list.data);
    const serverGamesLoading = useSelector(state => state.game.api.list.loading);
    const channels = useSelector(state => state.phoenix.channels);
    const socketStatus = useSelector(state => state.phoenix.socket.status);

    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }
    }, [gameCode, dispatch]);

    function handleCreateGame(e) {
        if (!e.target.reportValidity()) {
            e.preventDefault();
            return;
        }

        const list = mergeGameList(serverGames, creativeGames);

        let game = list.find(x => x.name === name);

        if (game && game.location === 'client') {
            const creativeGame = creativeGames.find(x => x.game.name === name);
            game = { ...game, questions: creativeGame.game.questions }
        }

        const payload = { game: game, rounds: settings.rounds };
        const data = { name: playerName, settings: toServerSettings(settings),  ...payload };
        dispatch(channelPush({
            topic: gameChannel,
            event: "new_game",
            data: data
        }));

        e.preventDefault();
    }

    useEffect(() => {
        if (serverGamesLoading === 'idle' && (serverGames === null || serverGames.lenght === 0)) {
            dispatch(listGames());
        }

    }, [dispatch, serverGames, serverGamesLoading]);

    useEffect(() => {
        const list = mergeGameList(serverGames, creativeGames);
        setGameList(list);
    }, [creativeGames, serverGames, setGameList]);

    useEffect(() => {
        //// Initialize the game to the first game in the list if not selected.
        if (name) {
            return;
        }

        if (gameList && gameList.length > 0) {
            dispatch(changeGame(gameList[0].name));
        }
    }, [gameList, dispatch, name]);

    useEffect(() => {
        if (!gameCode) {
            return;
        }

        if (socketStatus !== SOCKET_CONNECTED
            && socketStatus !== SOCKET_CONNECTING
            && socketStatus !== SOCKET_DISCONNECTED
            && socketStatus !== SOCKET_ERROR) {
            dispatch(socketConnect({
                host: process.env.REACT_APP_SOCKET_URL,
                params: {}
            }));
        }
    }, [socketStatus, dispatch, gameCode]);

    useEffect(() => {
        const topic = `game:${gameCode}`;

        if (gameCode && channels.some(x => x.topic === topic
            && (x.status === CHANNEL_JOINED 
                || x.status === CHANNEL_ERROR
                || x.status === CHANNEL_JOIN_ERROR))) {
            return;
        }

        dispatch(channelJoin({
            topic,
            data: { name: playerName }
        }));

        persistedEvents(topic).forEach((e) => dispatch(channelOn(e)));

    }, [dispatch, gameCode, playerName, channels]);

    useEffect(() => {
        setIsTimerActive(true);
        return () => { setIsTimerActive(false); };
    }, []);

    function onGameChange(e) {
        dispatch(changeGame(e.target.value));
    }

    function onGenServerTimeout() {
        dispatch(handleGenServerTimeout({ reason: "Game Lobby Timeout" }));
    }

    if (isGameStarted) {
        return <Navigate to="/game" />
    }

    return (
        <React.Fragment>
            <header className="full-width">
                <div className="center-with-right-div">
                    <span>
                        <Logo
                            logoClass="pd-25 small-logo bouncy landscape-hidden"
                            title="Buzz Games"
                            titleClass="larger-title landscape-hidden" />
                    </span>
                </div>
            </header>

            {!isGameOwner &&
                <div className="medium-font">Waiting for game owner to start game.</div>
            }

            <span className="font-14px">
                <Timer
                    isActive={isTimerActive}
                    onTimerCompleted={onGenServerTimeout}
                    numberSeconds={process.env.LOBBY_IDLE_TIMEOUT || 1800} />
            </span>

            {isGameOwner &&
                <div className='flex-grid center-65'>
                    <div className='flex-item full-width '>
                        <div className='item card text-align-left'>
                            <h3>Select Game</h3>
                            <form noValidate onSubmit={handleCreateGame}>
                                <div className="flex-row">
                                    <div className="flex-column flex-center">
                                        <GameList defaultValue={name} value={name} onGameChange={onGameChange} games={gameList} />
                                    </div>
                                </div>
                                <div>
                                    Share link to play with friends:
                                    <div className="pd-5 flex-row ">
                                        <GameCodeLink gameCode={gameCode}></GameCodeLink>
                                    </div>
                                </div>
                                <div className="btn-box">
                                    <button className="btn btn-submit"
                                        disabled={serverGamesLoading === 'pending'}
                                        type="submit"
                                        value="Start">
                                        Start Game
                                    </button>
                                </div>
                            </form>
                            <div>
                                <span>
                                    {isGameOwner &&
                                        <span className="flex-row flex-center">
                                            <NavLink className="pd-5-lr" to="/create">Create Your Own</NavLink>
                                            <NavLink className="pd-5-lr" to="/import">Import</NavLink>
                                            <NavLink className="pd-5-lr" to="/settings" >Settings</NavLink>
                                        </span>}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>}
            <Chat />
            <NewGamePrompt/>
        </React.Fragment >
    );
}
