import React from 'react';
import {
    handleChangeOwner,
    handleGenServerTimeout,
    onRouteToGame
} from '../lobby/lobbySlice';
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
        event: 'route_to_game',
        dispatcher: onRouteToGame(),
        topic
    }
]

export default function useLobbyEvents() {
    const gameCode = useSelector(state => state.lobby.gameCode);
    usePhoenixEvents(`lobby:${gameCode}`, events);
}
