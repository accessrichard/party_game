import {
    SOCKET_CONNECTED,
    channelJoin,
    channelOn,
    channelOff,
    channelPush,
    socketConnect
} from '../phoenix/phoenixMiddleware';
import { NavLink, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    changeGame,
    handleChangeOwner,
    handleGenServerTimeout,
    handleJoin,
    handleNewGameCreated,
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

const events = (topic) => [
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
    },
    {
        event: 'handle_next_question',
        dispatcher: startRound(),
        topic,
    }
]

export default function Lobby() {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [gameList, setGameList] = useState([]);
    const dispatch = useDispatch();
    const {
        playerName,
        gameCode,
        gameChannel,
        isNewGamePrompt,
        isGameOwner,
        isGameStarted,
        name,
        settings } = useSelector(state => state.game);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.game.api.list.data);
    const serverGamesLoading = useSelector(state => state.game.api.list.loading);
    const channels = useSelector(state => state.phoenix.channels);
    const socketStatus = useSelector(state => state.phoenix.socket.status);
    
    console.log(channels)

    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }
    }, [gameCode, dispatch]);

    useEffect(() => {
        setIsTimerActive(true);
        return () => { setIsTimerActive(false); };
    }, []);

    useEffect(() => {
        if (serverGamesLoading === 'idle' && (serverGames === null || serverGames.length === 0)) {
            dispatch(listGames());
        }

    }, [dispatch, serverGames, serverGamesLoading]);

    useEffect(() => {
        const list = mergeGameList(serverGames, creativeGames);
        setGameList(list);
    }, [creativeGames, serverGames, setGameList]);

    /**
     * Set the game to the first game in the list
     * or leave it be what the prior selection was
     */
    useEffect(() => {
        if (name) {
            return;
        }

        if (gameList && gameList.length > 0) {
            dispatch(changeGame(gameList[0].name));
        }
    }, [gameList, dispatch, name]);

    useEffect(() => {
        dispatch(socketConnect({
            host: import.meta.env.VITE_SOCKET_URL || '/socket',
            params: {}
        }));
    }, []);

    useEffect(() => {
        const topic = `game:${gameCode}`;
        if (socketStatus === SOCKET_CONNECTED) {
            dispatch(channelJoin({
                topic,
                data: { name: playerName }
            }));
        }
    }, [dispatch, gameCode, playerName, socketStatus]);


    useEffect(() => {
        const topic = `game:${gameCode}`;

        const hasChannel = channels.find(x => x.topic === topic);
        if (hasChannel) {
            events(topic).forEach((e) => dispatch(channelOn(e)))
        }

        return () => { events(topic).forEach((e) => dispatch(channelOff(e))) }
    }, [gameCode, channels]);



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
        const data = { name: playerName, settings: toServerSettings(settings), ...payload };
        dispatch(channelPush({
            topic: gameChannel,
            event: "new_game",
            data: data
        }));

        e.preventDefault();
    }

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
        <>
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
                    numberSeconds={import.meta.env.LOBBY_IDLE_TIMEOUT || 1800} />
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
                                        disabled={serverGamesLoading === 'pending' || isNewGamePrompt || isGameStarted}
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
            <NewGamePrompt />
        </>
    );
}
