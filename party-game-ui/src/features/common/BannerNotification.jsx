import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SOCKET_DISCONNECTED, SOCKET_ERROR } from '../phoenix/phoenixMiddleware';
import Timer from './Timer';

export default function BannerNotification(props) {

    const { text = "Network Error. Trying to Reconnect" } = props;
    const socketStatus = useSelector(state => state.phoenix.socket.status);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        if (socketStatus === SOCKET_DISCONNECTED || socketStatus === SOCKET_ERROR) {
            setIsTimerActive(true)
        } else {
            setIsTimerActive(false)
        }
    }, [socketStatus]);


    function onTimerCompleted() {
        window.location.href = "/";
    }

    return (
        <>
            {isTimerActive && <div className="header-notification larger-title flex-grid flex-center ">

                <span className='pd-5'>{text}</span>

                <Timer className='pd-5'
                    numberSeconds={30}
                    isIncrement={false}
                    isVisible={isTimerActive}
                    isActive={isTimerActive}
                    timeFormat="seconds"
                    onTimerCompleted={onTimerCompleted}
                />
            </div>}
        </>
    );
}
