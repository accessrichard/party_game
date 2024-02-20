import {
    channelPush
} from '../phoenix/phoenixMiddleware';
import {
    usePhoenixChannel,
    usePhoenixEvents,
    usePhoenixSocket
} from '../phoenix/usePhoenix';
import { NavLink, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    changeGame,
    handleChangeOwner,
    handleGenServerTimeout,
    handleJoin,
    onRouteToGame,
    listGames,
    mergeGameList,
    startRound
} from '../game/gameSlice';
import { syncPresenceDiff, syncPresenceState } from '../presence/presenceSlice';
import { useDispatch, useSelector } from 'react-redux';

import Chat from '../chat/Chat';
import GameCodeLink from '../common/GameCodeLink';
import GameList from '../common/GameList';
import Logo from '../common/Logo';
import NewGamePrompt from '../common/NewGamePrompt';
import Timer from '../common/Timer';
import { push } from "redux-first-history";
import { toServerSettings } from '../game/settingsApi';

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
        event: 'route_to_game',
        dispatcher: onRouteToGame(),
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
        url,
        settings } = useSelector(state => state.game);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.game.api.list.data);
    const serverGamesLoading = useSelector(state => state.game.api.list.loading);

    usePhoenixSocket();
    usePhoenixChannel(`lobby:${gameCode}`, { name: playerName }, {persisted: true});
    usePhoenixEvents(`lobby:${gameCode}`, events);

    /**
     * Redirect to home page if there is no game code at this point.
     */
    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }
    }, [gameCode]);

    /**
     * Display a count-up timer of lobby wait time.
     */
    useEffect(() => {
        setIsTimerActive(true);
        return () => { setIsTimerActive(false); };
    }, []);

    /**
     * Load the server game list drop-down.
     */
    useEffect(() => {
        if (serverGamesLoading === 'idle' && (serverGames === null || serverGames.length === 0)) {
            dispatch(listGames());
        }

    }, [serverGames, serverGamesLoading]);

    /**
     * Merge the user created games with the server game list.
     */
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
            dispatch(changeGame({ name: gameList[0].name, location: gameList[0].url }));
        }
    }, [gameList, name]);

    useEffect(() => {
        if (url && (isGameStarted || isNewGamePrompt)) {
            dispatch(push(url))
        }

    }, [url, isGameStarted, isNewGamePrompt])

    /**
     * Create and kicks off a new game:
     *   a. Send the new_game event to the server.
     *   b. Server replies with route_to_game
     *      which is dispatched to redux via channel events.
     *   c. Game route then creates game and starts it
     */
    function handleCreateGame(e) {
        if (!e.target.reportValidity()) {
            e.preventDefault();
            return;
        }
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "new_game",
            data: {}
        }));
        e.preventDefault();
        return;
    }

    function onGameChange(e) {
        const game = gameList.find(x => x.name == e.target.value);
        dispatch(changeGame({ name: game.name, url: game.url }));
    }

    function onGenServerTimeout() {
        dispatch(handleGenServerTimeout({ reason: "Game Lobby Timeout" }));
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
        </>
    );
}
