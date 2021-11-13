import React, { useEffect, useState } from 'react';
import {
    SOCKET_CONNECTED,
    SOCKET_CONNECTING,
    channelJoin,
    channelLeave,
    channelOff,
    channelOn,
    channelPush,
    socketConnect
} from '../phoenix/phoenixMiddleware';
import { addPlayer, changeGame, listGames, mergeGameList, startGame } from './gameSlice';
import { syncPresenceState, syncPresenceDiff } from './../presence/presenceSlice';
import { useDispatch, useSelector } from 'react-redux';

import GameCodeLink from '../common/GameCodeLink';
import GameList from '../common/GameList';
import Logo from '../common/Logo';
import Players from './Players';
import Timer from './Timer';
import { push } from 'connected-react-router';
import { Link  } from "react-router-dom";

const onEvents = (topic) => [
    {
        event: 'join',
        dispatcher: addPlayer(),
        topic,
    },
    {
        event: 'start',
        dispatcher: startGame(),
        topic
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
    }
]

export default function Lobby() {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [gameList, setGameList] = useState([]);
    const dispatch = useDispatch();
    const { playerName, gameCode, gameOwner, isGameStarted, name } = useSelector(state => state.game);

    const creativeGames = useSelector(state => state.creative.games);
    const serverGames = useSelector(state => state.game.api.list.data);
    const serverGamesLoading = useSelector(state => state.game.api.list.loading);

    const socketStatus = useSelector(state => state.phoenix.socket.status);

    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }

        if (isGameStarted) {
            dispatch(push('/game'));
        }
    });

    const topic = `lobby:${gameCode}`

    function handleCreateGame(e) {
        if (e.target.reportValidity()) {
            dispatch(channelPush({
                topic: topic,
                event: topic,
                data: { action: 'start' }
            }));
        }
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
        if (socketStatus !== SOCKET_CONNECTED
            && socketConnect !== SOCKET_CONNECTING) {
            dispatch(socketConnect({
                host: process.env.REACT_APP_SOCKET_URL,
                params: {}
            }));
        }
    }, [socketStatus, dispatch]);

    useEffect(() => {
        dispatch(channelJoin({
            topic,
            data: { name: playerName }
        }));

        return () => dispatch(channelLeave({ topic }));
    }, [dispatch, topic, playerName]);

    useEffect(() => {
        onEvents(topic).forEach((e) => dispatch(channelOn(e)));
        return () => onEvents(topic).forEach((e) => dispatch(channelOff(e)));
    }, [dispatch, topic]);

    useEffect(() => {
        setIsTimerActive(true);
        return () => { setIsTimerActive(false); };
    }, []);

    function onGameChange(e) {
        dispatch(changeGame(e.target.value));
    }

    return (
        <React.Fragment>

            <header className="app-header1">

                <Logo logoClass="pd-25 small-logo bouncy" title="Players" titleClass="small-title"></Logo>

                <span className="typography-md-text">
                    <Timer isActive={isTimerActive} timeIncrement={1} startSeconds={0}></Timer>
                </span>
            </header>

            {gameOwner === playerName
                ? <div className="typography-lg-text">
                    Share this link to play with friends:
                                <div className="light-link pd-5"><GameCodeLink gameCode={gameCode}></GameCodeLink></div>
                </div>
                : <div className="typography-lg-text">Waiting for game owner to start game.</div>
            }

            <div className="players-wrapper scroll-flex">
                <Players></Players>
            </div>


            {gameOwner === playerName &&
                <React.Fragment>
                    <form className="flex-grid flex-column md-5 form lg-6" noValidate onSubmit={handleCreateGame}>
                        <div className="flex-row">
                            <div className="flex-column margin-bottom-5 flex-center">
                                <GameList defaultValue={name} onGameChange={onGameChange} games={gameList} />            
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="flex-column margin-bottom-5 flex-center">
                                <Link to="/settings" className="app-link">Settings</Link>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="flex-column margin-bottom-5">
                                <input className="line-hieght-medium" disabled={serverGamesLoading === 'pending'} type="submit" value="Start" />
                            </div>
                        </div>
                    </form>
                </React.Fragment>}

        </React.Fragment >
    );
}
