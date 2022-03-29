import React, { useEffect, useState } from 'react';
import { SOCKET_DISCONNECTED, SOCKET_ERROR, socketDisconnect } from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

import Popup from './Popup';

export default function SocketDisconnect(props) {

    const dispatch = useDispatch();
    const socketStatus = useSelector(state => state.phoenix.socket.status);
    const [isDisconnected, setIsDisconnected] = useState(false);

    useEffect(() => {
        if (socketStatus !== SOCKET_DISCONNECTED || isDisconnected) {
            return;
        }

        setTimeout(() => {
            if (socketStatus === SOCKET_DISCONNECTED
                || socketStatus === SOCKET_ERROR) {
                dispatch(socketDisconnect());
                setIsDisconnected(true);
                props.onDisconnect && props.onDisconnect();
            }
        }, 1000 * 15);

    }, [socketStatus, dispatch, isDisconnected, props]);


    return (
        <React.Fragment>
            {isDisconnected &&
                <Popup
                    title="Lost connnection to server."
                    content={<a href="/">Click here to restart</a>}
                />
            }
        </React.Fragment >
    );
}
