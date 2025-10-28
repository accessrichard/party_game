import React from 'react';
import {
    handleChangeOwner,
    handleGenServerTimeout,
    handleDisconnect,
    onRouteToGame
} from '../lobby/lobbySlice';
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
    }
]

export default function useLobbyEvents() {
    const gameCode = useSelector(state => state.lobby.gameCode);
    usePhoenixEvents(`lobby:${gameCode}`, events);
}
