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
            <div className="App-dark lg-12">
                <header className="App-header1">
                    <h3>Lobby</h3>
                    {gameOwner === player 
                        ?  <div className="typography-lg-text">
                                Provide this game code to other players:
                                &nbsp;<span className="typography-emphasize">{gameCode}</span>
                            </div>
                        :   <div className="typography-lg-text">Waiting for game owner to start game.</div>
                    }
                    <span className="typography-md-text">
                        <Timer isActive={isTimerActive} timeIncrement={1} startSeconds={0}></Timer>
                    </span>

                    {gameOwner === player &&
                        <React.Fragment>
                            <form className="pd-0 lg-6" onSubmit={(e) => e.preventDefault()}>
                                <input type="submit" value="Start" onClick={startGameClick} />
                            </form>
                        </React.Fragment>}

                </header>
                <div className="flex-container lg-12 flex-1 pd-5 flex-center">
                    <div className="flex-item lg-3  flex-row">
                        <div className="flex-1 flex-container flex-column md-5 pd-5">
                            <span className="subtitle pd-5 md-5">Players</span>
                            <Players></Players>
                        </div>
                    </div>
                    <div className="flex-item lg-3  flex-row">
                        <div className="flex-1 flex-container flex-column md-5 pd-5">
                            <span className="subtitle pd-5 md-5">Chat</span>
                            <Chat></Chat>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment >
    );
}
