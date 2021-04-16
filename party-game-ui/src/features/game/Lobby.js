import React, { useEffect, useState } from 'react';
import { addPlayer, changeGame, listGames, startGame } from './gameSlice';
import {
    channelJoin,
    channelLeave,
    channelOff,
    channelOn,
    channelPush,
    socketConnect,
} from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

import GameCodeLink from '../common/GameCodeLink';
import GameList from '../common/GameList';
import Logo from '../common/Logo';
import Players from './Players';
import Timer from './Timer';
import { push } from 'connected-react-router';

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
    }
]

export default function Lobby() {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const dispatch = useDispatch();
    const { playerName, gameCode, gameOwner, isGameStarted } = useSelector(state => state.game);
    const games = useSelector(state => state.game.api.list.data);

    useEffect(() => {
        if (!gameCode) {
            dispatch(push('/'));
        }

        if (isGameStarted) {
            dispatch(push('/game'));
        }
    });

    const topic = `lobby:${gameCode}`

    function startGameClick() {
        dispatch(channelPush({
            topic: topic,
            event: topic,
            data: { action: 'start' }
        }));
    }

    useEffect(() => {
        dispatch(listGames());
    }, [dispatch]);

    useEffect(() => {
        dispatch(socketConnect({
            host: 'ws://localhost:4000/socket',
            params: {}
        }));

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
        dispatch(changeGame(e));
    }

    return (
        <React.Fragment>

            <div className="App">

                <div className="app-light lg-12">
                    <header className="app-header1">
                        <Logo logoClass="pd-25 small-logo bouncy" title="Players" titleClass="small-title"></Logo>
                        <span className="typography-md-text time">
                            <Timer isActive={isTimerActive} timeIncrement={1} startSeconds={0}></Timer>
                        </span>
                    </header>
                    <div className="players-wrapper scroll-flex">
                        <Players></Players>
                    </div>
                    {gameOwner === playerName
                            ? <div className="typography-lg-text">
                                Share this link to play with friends:
                                <div className="light-link pd-5"><GameCodeLink gameCode={gameCode}></GameCodeLink></div>
                            </div>
                            : <div className="typography-lg-text">Waiting for game owner to start game.</div>
                        }

                    {gameOwner === playerName &&
                        <React.Fragment>

                            <form className="pd-5" onSubmit={(e) => e.preventDefault()}>

                                <GameList defaultValue={games && games[0]} onGameChange={onGameChange} games={games} />
                                <input className="md-5" type="submit" value="Start" onClick={startGameClick} />
                            </form>
                        </React.Fragment>}

                </div>
            </div>
        </React.Fragment >
    );
}
