import { channelPush } from '../phoenix/phoenixMiddleware';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    changeGame,
    handleServerError,
    listGames,
    mergeGameList,
    selectGameOwner,
    serverGameList
} from './lobbySlice';
import { useDispatch, useSelector } from 'react-redux';
import Chat from '../chat/Chat';
import GameCodeLink from '../common/GameCodeLink';
import GameList from '../common/GameList';
import Logo from '../common/Logo';
import Timer from '../common/Timer';
import { push } from "redux-first-history";
import useVisibilityChangeTracking from '../useVisibilityChangeTracking';

export default function Lobby() {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [gameList, setGameList] = useState([]);
    const dispatch = useDispatch();
    const gameCode = useSelector(state => state.lobby.gameCode);
    const gameOwner = useSelector(state => state.lobby.gameOwner);
    const isGameStarted = useSelector(state => state.lobby.isGameStarted);
    const selectedGame = useSelector(state => state.lobby.selectedGame);
    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(serverGameList);
    const serverGamesLoading = useSelector(state => state.lobby.api.list.loading);
    const isGameOwner = useSelector(selectGameOwner);

    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }
    }, [gameCode]);

    
    useVisibilityChangeTracking();

    useEffect(() => {
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "presence_location",
            data: { location: "lobby" }
        }));
    }, []);

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
     * 
     * When elected new game owner, sync the type and game.
     */
    useEffect(() => {
        if (!gameList || gameList.length === 0) {
            return;
        }

        if (!selectedGame || !selectedGame.name) {
            selectGame(gameList[0].name);
            return;
        }

        if (!gameList.find(game => game.name == selectedGame.name && game.type == selectedGame.type)) {
            selectGame(gameList[0].name);
            return;
        }
    }, [gameList, selectedGame.name]);

    useEffect(() => {
        if (selectedGame.url && isGameStarted) {
            dispatch(push(selectedGame.url))
        }

    }, [selectedGame.url, isGameStarted])

    function handleCreateGame(e) {
        if (!e.target.reportValidity()) {
            e.preventDefault();
            return;
        }
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: "route_to_game",
            data: {selectedGame}
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
            dispatch(changeGame({ selectedGame: game }));
        }
    }

    function onLobbyTimeout() {
        dispatch(handleServerError({ reason: "Game Lobby Timeout" }));
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
                <div className="medium-font">Waiting for game owner: {gameOwner} to start game.</div>
            }

            <span className="font-14px">
                <Timer
                    isActive={isTimerActive}
                    onTimerCompleted={onLobbyTimeout}
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
                                        <GameList value={selectedGame.name} onGameChange={onGameChange} games={gameList} />
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
                                    {selectedGame.create && <NavLink className="pd-5-lr" to={`${selectedGame.url}/create/`}>Create Your Own</NavLink>}
                                    {selectedGame.import && <NavLink className="pd-5-lr" to={`${selectedGame.url}/import/`}>Import</NavLink>}
                                    {selectedGame.settings && <NavLink className="pd-5-lr" to={`${selectedGame.url}/settings/`}>Settings</NavLink>}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>}
            <Chat />
        </>
    );
}
