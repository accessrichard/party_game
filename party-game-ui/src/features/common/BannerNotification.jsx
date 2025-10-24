import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SOCKET_DISCONNECTED, SOCKET_ERROR, socketDisconnect  } from '../phoenix/phoenixMiddleware';
import Timer from './Timer';
import { push } from "redux-first-history";



export default function BannerNotification(props) {
    const { text = "Network Error. Trying to Reconnect" } = props;

    const dispatch = useDispatch();
    const socketStatus = useSelector(state => state.phoenix.socket.status);
    const [isVisible, setIsVisible] = useState(false);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        if (socketStatus === SOCKET_DISCONNECTED || socketStatus === SOCKET_ERROR) {
            setIsVisible(true)
            setIsTimerActive(true)
        } else {
            setIsVisible(false)
            setIsTimerActive(false)
        }

    }, [socketStatus]);


    function onTimerCompleted() {
        dispatch(socketDisconnect());
        dispatch(push("/"));
    }

    return (
        <>
            {isVisible && <div className="header-notification larger-title flex-grid flex-center ">

                <span className='pd-5'>{text}</span>

                <Timer className='pd-5'
                    numberSeconds={30}
                    isIncrement={false}
                    isVisible={isVisible}
                    isActive={isTimerActive}
                    timeFormat="seconds"
                    onTimerCompleted={onTimerCompleted}
                />
            </div>}
        </>
    );
}
