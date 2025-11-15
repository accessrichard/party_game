import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { channelPush } from '../phoenix/phoenixMiddleware';
import Popup from './Popup';
import { socketDisconnect } from '../phoenix/phoenixMiddleware';
import { clearPopupMessage } from '../lobby/lobbySlice';
import useShallowEqualSelector from '../useShallowEqualSelector'

export default function PopupMessage() {
    const dispatch = useDispatch();
    const popupMessage = useShallowEqualSelector(state => state.lobby.popupMessage);
    const gameCode = useSelector(state => state.lobby.gameCode);
    const [isDisconnected, setIsDisconnected] = useState(false);

    useEffect(() => {
        if (!popupMessage.reason) {
            return;
        }

        if (popupMessage.type == "shutdown") {
            dispatch(socketDisconnect());
            setIsDisconnected(true);
        }

    }, [popupMessage]);

    function handleOnIdleTimeout() {
        dispatch(channelPush({
            topic: `lobby:${gameCode}`,
            event: 'ping'
        }))

        dispatch(clearPopupMessage());
    }

    function messageType() {


        if (popupMessage.action === "idle_timeout") {
            return <>
                <div>{popupMessage.message}</div>
                <button className="btn md-5 btn-submit" type="button" onClick={handleOnIdleTimeout}>Keep Alive</button></>
        }

        if (popupMessage.action === "shutdown") {
            return <>
                <div>{popupMessage.message}</div>
                <button className="btn md-5 btn-submit" type="button" onClick={() => (window.location.href = '/')}>Restart</button>
            </>
        }
    }

    return (
        <>
            {isDisconnected || popupMessage.action &&
                <Popup
                    title={popupMessage.title}
                    content={messageType()}
                />
            }
        </>
    );
}
