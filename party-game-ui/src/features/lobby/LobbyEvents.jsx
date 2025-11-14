import useLobbyEvents from './useLobbyEvents';
import { Outlet } from 'react-router';
import {    usePhoenixSocket, usePhoenixChannel} from '../phoenix/usePhoenix';
import { useSelector } from 'react-redux';
export default function LobbyEvents() {

    const playerName = useSelector(state => state.lobby.playerName);
    const gameCode = useSelector(state => state.lobby.gameCode);
    
    usePhoenixSocket();
    usePhoenixChannel(`lobby:${gameCode}`, { name: playerName }, { isPersisted: true });
    useLobbyEvents();

    return <Outlet />;
}