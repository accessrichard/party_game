import { Socket } from "phoenix";

export const SOCKET_CONNECT = 'SOCKET_CONNECT';
export const SOCKET_ERROR = 'SOCKET_ERROR';
export const SOCKET_CONNECTING = 'SOCKET_CONNECTING';
export const SOCKET_CONNECTED = 'SOCKET_CONNECTED';
export const SOCKET_DISCONNECT = 'SOCKET_DISCONNECT';
export const SOCKET_DISCONNECTED = 'SOCKET_DISCONNECTED';
export const CHANNEL_JOIN = 'CHANNEL_JOIN';
export const CHANNEL_JOINED = 'CHANNEL_JOINED';
export const CHANNEL_JOIN_ERROR = 'CHANNEL_JOIN_ERROR';
export const CHANNEL_ERROR = 'CHANNEL_ERROR';
export const CHANNEL_LEAVE = 'CHANNEL_LEAVE';
export const CHANNEL_PUSH = 'CHANNEL_PUSH';
export const CHANNEL_RECEIVE = 'CHANNEL_RECEIVE';
export const CHANNEL_ON = 'CHANNEL_ON';
export const CHANNEL_OFF = 'CHANNEL_OFF';
export const CHANNEL_PUSH_OK = 'CHANNEL_PUSH_OK';
export const CHANNEL_PUSH_ERROR = 'CHANNEL_PUSH_ERROR';

export const socketConnect = payload => ({ type: SOCKET_CONNECT, payload });
export const socketError = payload => ({ type: SOCKET_ERROR, payload });
export const socketConnecting = payload => ({ type: SOCKET_CONNECTING, payload });
export const socketConnected = payload => ({ type: SOCKET_CONNECTED, payload });
export const socketDisconnect = payload => ({ type: SOCKET_DISCONNECT, payload });
export const socketDisconnected = payload => ({ type: SOCKET_DISCONNECTED, payload });
export const channelJoin = payload => ({ type: CHANNEL_JOIN, payload });
export const channelJoined = payload => ({ type: CHANNEL_JOINED, payload });
export const channelJoinError = payload => ({ type: CHANNEL_JOIN_ERROR, payload });
export const channelError = payload => ({ type: CHANNEL_ERROR, payload });
export const channelLeave = payload => ({ type: CHANNEL_LEAVE, payload });
export const channelPush = payload => ({ type: CHANNEL_PUSH, payload });
export const channelOn = payload => ({ type: CHANNEL_ON, payload });
export const channelOff = payload => ({ type: CHANNEL_OFF, payload });
export const channelReceive = payload => ({ type: CHANNEL_RECEIVE, payload });
export const channelPushOk = payload => ({ type: CHANNEL_PUSH_OK, payload });
export const channelPushError = payload => ({ type: CHANNEL_PUSH_ERROR, payload });

const initialState = {
    socket: {
        status: null,
        message: null
    },
    channels: []
};

export function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SOCKET_CONNECTED:
        case SOCKET_CONNECTING:
        case SOCKET_ERROR:
            return {
                ...state,
                socket: {
                    status: action.type,
                    message: action.payload
                }
            };
        case CHANNEL_LEAVE:
            return {
                ...state,
                channels: state.channels.filter(x => x.topic !== action.payload.topic)
            };
        case CHANNEL_ERROR:
        case CHANNEL_JOINED:
        case CHANNEL_JOIN_ERROR:
        case CHANNEL_PUSH_ERROR:
            if (!action.payload.topic) {
                return state;
            }

            const newChannels = state.channels.filter(x => x.topic !== action.payload.topic);
            newChannels.push({
                status: action.type,
                topic: action.payload.topic,
                message: action.payload.data
            });

            return {
                ...state,
                channels: newChannels
            };

        case CHANNEL_RECEIVE:
            //// Channel data can be sent to any redux action by
            //// passing in an action.
            ////
            //// e.g.
            //// dispatch(channelOn({
            ////    event: 'start',
            ////    dispatcher: reduxActionCreator()
            ////    topic: 'channel topic',
            ////  }));
            return state;
        default:
            return state;
    }
}


const phoenixMiddleware = () => {
    let socket = null;
    const channels = {};

    const hasChannel = (name) => channels.hasOwnProperty(name);

    function getChannel(name) {
        return hasChannel(name) ? channels[name] : null;
    };

    function addChannel(name, channel) {
        channels[name] = channel;
    };

    const formatPayload = (channel, data, event) => ({
        topic: channel.topic,
        data,
        event
    });

    function connect(store, action) {
        socket = new Socket(action.payload.host, { ...action.payload.params });
        socket.connect();
        socket.onOpen(e => store.dispatch(socketConnected(e)));
        socket.onError(e => store.dispatch(socketError(e)));
        socket.onClose(e => store.dispatch(socketDisconnected(e.reason)));
    }

    function disconnect() {
        if (socket !== null) {
            socket.disconnect();
        }
        socket = null;
    }

    function join(store, action) {
        if (!socket) {
            console.log("Socket not connected!");
            return;
        }

        if (hasChannel(action.payload.topic)){
            throw Error("Channel is already joined!");
        }

        const channel = socket.channel(action.payload.topic, action.payload.data);
        addChannel(action.payload.topic, channel);
        channel.join()
            .receive("ok", e => {
                store.dispatch(channelJoined(formatPayload(channel, e)))
            })
            .receive("error", e => {
                store.dispatch(channelError(formatPayload(channel, e)));
                //// Phoenix keeps re-trying errors. This means on channel join if
                //// auth fails, phoenix will retry every second. For simplicity
                //// leaving channel on error. 
                store.dispatch(channelLeave(formatPayload(channel)));
            });

        channel.onError(e => store.dispatch(channelError(formatPayload(channel, e))));
        channel.onClose(() => store.dispatch(channelLeave(formatPayload(channel))));
    }

    function leave(store, action) {
        if (!hasChannel(action.payload.topic)) {
            return;
        }

        const channel = getChannel(action.payload.topic);
        if (channel) {
            delete channels[action.payload.topic];
            channel.leave();
        }
    }

    function push(store, action) {
        if (!hasChannel(action.payload.topic)) {
            return;
        }

        if (!action.payload.event) {
            throw new Error("Missing payload.event!");
        }

        const channel = getChannel(action.payload.topic);
        channel.push(action.payload.event, action.payload.data)
            .receive("ok", e => channelPushOk(formatPayload(channel, e)))
            .receive("error", e => channelPushError(formatPayload(channel, e)));
    }

    function on(store, action) {
        if (!socket) {
            return;
        }
        
        if (!hasChannel(action.payload.topic)) {
            throw new Error("Invalid ChannelOn event. action.payload.topic is required or topic not found!");
        }

        const channel = getChannel(action.payload.topic);

        channel.on(action.payload.event, e => {
            if (action.payload.dispatcher) {
                //// On events are dispatched to the action.payload.dispatcher action
                //// which is simply a redux action.
                store.dispatch({ ...action.payload.dispatcher, payload: e });
                return;
            }

            store.dispatch(channelReceive(formatPayload(channel, e, action.payload.event)));
        });
    }

    function off(store, action) {
        if (!action.payload.topic) {
            throw new Error("Invalid Channel Off: action.payload.topic is required");
        }

        if (!hasChannel(action.payload.topic)) {            
            return;
        }

        const channel = getChannel(action.payload.topic);
        channel.off(action.payload.topic, action.payload.event);
    }

    return store => next => action => {
        switch (action.type) {
            case SOCKET_CONNECT:
                connect(store, action)
                break;
            case SOCKET_DISCONNECT:
                disconnect();
                break;
            case CHANNEL_JOIN:
                join(store, action);
                break;
            case CHANNEL_LEAVE:
                leave(store, action);
                break;
            case CHANNEL_PUSH:
                push(store, action);
                break;
            case CHANNEL_ON:
                on(store, action);
                break;
            case CHANNEL_OFF:
                off(store, action);
                break;
            default:
                return next(action);
        }
    };
};

export default phoenixMiddleware;
