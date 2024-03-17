import { channelPush } from '../phoenix/phoenixMiddleware';
import { usePhoenixChannel, usePhoenixEvents, usePhoenixSocket } from '../phoenix/usePhoenix';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
    changeGame,
    handleChangeOwner,
    handleGenServerTimeout,
    handleJoin,
    onRouteToGame,
    listGames,
    mergeGameList
} from './lobbySlice';
import { getGameMetadata } from './games';
import { syncPresenceDiff, syncPresenceState } from '../presence/presenceSlice';
import { useDispatch, useSelector } from 'react-redux';
import Chat from '../chat/Chat';
import GameCodeLink from '../common/GameCodeLink';
import GameList from '../common/GameList';
import Logo from '../common/Logo';
import Timer from '../common/Timer';
import { push } from "redux-first-history";

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
    }
]

export default function Lobby() {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [gameList, setGameList] = useState([]);
    const dispatch = useDispatch();
    const {
        playerName,
        gameCode,
        isGameOwner,
        isGameStarted,
        gameName,
        type
    } = useSelector(state => state.lobby);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.lobby.api.list.data);
    const serverGamesLoading = useSelector(state => state.lobby.api.list.loading);
    const gameMetaData = getGameMetadata(type);

    usePhoenixSocket();
    usePhoenixChannel(`lobby:${gameCode}`, { name: playerName }, { persisted: true });
    usePhoenixEvents(`lobby:${gameCode}`, events);

    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }
    }, [gameCode]);

    useEffect(() => {
        setIsTimerActive(true);
        return () => { setIsTimerActive(false); };
    }, []);

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
     * Default the selected game on first page visit.
     */
    useEffect(() => {
        if (gameName) {
            return;
        }

        if (gameList && gameList.length > 0) {
            selectGame(gameList[0].name);
        }
    }, [gameList, gameName]);

    useEffect(() => {
        if (gameMetaData.url && isGameStarted) {
            dispatch(push(gameMetaData.url))
        }

    }, [gameMetaData.url, isGameStarted])

    function handleCreateGame(e) {
        if (!e.target.reportValidity()) {
            e.preventDefault();
            return;
        }
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "new_game",
            data: { name: gameName, type: type || '/multiple_choice' }
        }));
        e.preventDefault();
        return;
    }

    function onGameChange(e) {
        selectGame(e.target.value)
    }

    function selectGame(name) {
        const game = gameList.find(x => x.name == name);
        if (game) {
            dispatch(changeGame({ name: game.name, type: game.type }));
        }
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
                            <form className='form' noValidate onSubmit={handleCreateGame}>
                                <div className="flex-row">
                                    <div className="flex-column flex-center">
                                        <GameList defaultValue={gameName} value={gameName} onGameChange={onGameChange} games={gameList} />
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
                                        disabled={serverGamesLoading === 'pending' || isGameStarted}
                                        type="submit"
                                        value="Start">
                                        Start Game
                                    </button>
                                </div>
                            </form>
                            <div>
                                <span className="flex-row flex-center">
                                    {gameMetaData.create && <NavLink className="pd-5-lr" to={`${gameMetaData.url}/create/`}>Create Your Own</NavLink>}
                                    {gameMetaData.import && <NavLink className="pd-5-lr" to={`${gameMetaData.url}/import/`}>Import</NavLink>}
                                    {gameMetaData.settings && <NavLink className="pd-5-lr" to={`${gameMetaData.url}/settings/`}>Settings</NavLink>}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>}
            <Chat />
        </>
    );
}
