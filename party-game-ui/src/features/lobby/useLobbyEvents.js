import React, { useEffect, useState } from 'react';
import {
    handleChangeOwner,
    handleGenServerTimeout,
    handleJoin,
    handleDisconnect,
    onRouteToGame    
} from '../lobby/lobbySlice';
import { SOCKET_CONNECTED, SOCKET_DISCONNECTED } from '../phoenix/phoenixMiddleware';

import { syncPresenceDiff, syncPresenceState } from '../presence/presenceSlice';
import { usePhoenixEvents } from '../phoenix/usePhoenix';
import { useSelector } from 'react-redux';


const events = (topic) => [
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
        event: 'handle_disconnect',
        dispatcher: handleDisconnect(),
        topic,
    },
    {
        event: 'route_to_game',
        dispatcher: onRouteToGame(),
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
    },
     {
        event: 'handle_disconnect',
        dispatcher: handleDisconnect(),
        topic,
    },
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
]

export default function useLobbyEvents() {
    const gameCode = useSelector(state => state.lobby.gameCode);
    const socketStatus = useSelector(state => state.phoenix.socket.status);
    usePhoenixEvents(`lobby:${gameCode}`, events);
    const [isDisconnected, setIsDisconnected] = useState(false);



    /**
     * If the client goes offline, we need to elect a new game owner.
     * If the client comes back online, sync the new game owner.
     * In the future will have to resync the entire game but for now this
     * will keep things moving.
     */
    useEffect(() => {
        if (socketStatus === null) {
            return;
        }

        if (socketStatus === SOCKET_CONNECTED && isDisconnected) {
            setIsDisconnected(false);
            dispatch(channelPush({
                topic: `lobby:${gameCode}`,
                event: "handle_disconnect"
            }));
            return;
        }

        if (socketStatus === SOCKET_DISCONNECTED && !isDisconnected) {
            setIsDisconnected(true);
            return;
        }

    }, [socketStatus, isDisconnected])
}
