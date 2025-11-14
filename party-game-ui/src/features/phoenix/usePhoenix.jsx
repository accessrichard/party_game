import { useEffect } from 'react';
import {
    channelJoin,
    channelOn,
    channelOff,
    channelLeave,
    socketConnect,
    hasConnectedChannel,
    hasConnectedSocket,
    hasChannelError
} from './phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

export function usePhoenixSocket() {
    const dispatch = useDispatch();
    const socketStatus = useSelector(state => state.phoenix.socket.status);

    /**
     * Make a socket connection to the server.
     */
    useEffect(() => {
        if (hasConnectedSocket(socketStatus)) {
            return;
        }

        dispatch(socketConnect({
            host: import.meta.env.VITE_SOCKET_URL || '/socket',
            params: {}
        }));
    }, [socketStatus]);
}


export function usePhoenixChannel(topic, channelJoinData, opts = {}) {
    const { isPersisted } = Object.assign({ isPersisted: false }, opts);
    const dispatch = useDispatch();
    const channels = useSelector(state => state.phoenix.channels);
    const socketStatus = useSelector(state => state.phoenix.socket.status);

    /**
    * Join the games channel over the socket.
    * 
    * This can only happen once the socket is connected and 
    * will be triggered off the socket status of connected.
    */
    useEffect(() => {
        if (!hasConnectedSocket(socketStatus)) {
            return;
        }

        if (hasConnectedChannel(channels, topic)) {
            return;
        }

        if (hasChannelError(channels, topic)) {
            return;
        }

        dispatch(channelJoin({
            topic,
            data: channelJoinData
        }));
    }, [topic, channelJoinData, socketStatus, channels]);

    useEffect(() => {
        return () => {
            if (!isPersisted) {
                dispatch(channelLeave({ topic }));
            }
        }
    }, []);
}

export function usePhoenixEvents(topic, channelOnEvents, opts) {
    const { isPersisted } = Object.assign({ isPersisted: false }, opts);
    const dispatch = useDispatch();
    const channels = useSelector(state => state.phoenix.channels);
    const socketStatus = useSelector(state => state.phoenix.socket.status);

    /**
     * Subscribe to events in a channel over a socket.
     * 
     * This can only happen once:
     *  a. The socket is connected
     *  b. The channel is joined.
     */
    useEffect(() => {
        if (!hasConnectedSocket(socketStatus)
            || !hasConnectedChannel(channels, topic)) {
            return
        }

        channelOnEvents(topic).forEach((e) => dispatch(channelOn(e)))

        return () => {
            if (!isPersisted) {
                channelOnEvents(topic).forEach((e) => dispatch(channelOff(e)));
            }

        }
    }, [topic, channels, socketStatus, channelOnEvents]);
}

export const sendEvent = (topic, channelData, action) => (
    {
        topic: topic,
        event: action,
        data: channelData
    });