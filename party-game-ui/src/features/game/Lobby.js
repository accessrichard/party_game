import React, { useEffect, useState } from 'react';
import { addPlayer, startGame } from './gameSlice';
import {
    channelJoin,
    channelLeave,
    channelOff,
    channelOn,
    channelPush,
    socketConnect,
} from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

import Chat from './../chat/Chat';
import GameCodeLink from '../common/GameCodeLink';
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
    const player = useSelector(state => state.game.playerName);

    const gameCode = useSelector(state => state.game.gameCode);
    const gameOwner = useSelector(state => state.game.gameOwner);
    const isGameStarted = useSelector(state => state.game.isGameStarted);

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
        dispatch(socketConnect({
            host: 'ws://localhost:4000/socket',
            params: {}
        }));

        dispatch(channelJoin({
            topic,
            data: { name: player }
        }));

        return () => dispatch(channelLeave({ topic }));
    }, [dispatch, topic, player]);

    useEffect(() => {
        onEvents(topic).forEach((e) => dispatch(channelOn(e)));
        return () => onEvents(topic).forEach((e) => dispatch(channelOff(e)));
    }, [dispatch, topic]);

    useEffect(() => {
        setIsTimerActive(true);
        return () => { setIsTimerActive(false); };
    }, []);

    return (
        <React.Fragment>

            <div className="App">

                <div className="App-dark App-header lg-12">
                    <header className="App-header1">
                        <div class="small-title pd-25">Lobby</div>
                        <span className="typography-md-text time">
                            <Timer isActive={isTimerActive} timeIncrement={1} startSeconds={0}></Timer>
                        </span>

                        {gameOwner === player
                            ? <div className="typography-lg-text">
                                Provide this link to other players:
                            <div className="light-link typography-md-text2 pd-5"><GameCodeLink gameCode={gameCode}></GameCodeLink></div>
                            </div>
                            : <div className="typography-lg-text">Waiting for game owner to start game.</div>
                        }
                    </header>
                    <div className="small-title pd-25">Players</div>
                    <div className="players-wrapper scroll-flex">
                        <Players></Players>
                    </div>
                    {gameOwner === player &&
                        <React.Fragment>
                            <form className="pd-5" onSubmit={(e) => e.preventDefault()}>
                                <input className="md-5" type="submit" value="Start" onClick={startGameClick} />
                            </form>
                        </React.Fragment>}

                </div>
            </div>
        </React.Fragment >
    );
}
