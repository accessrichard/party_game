import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Popup from './Popup';
import { socketDisconnect } from '../phoenix/phoenixMiddleware';

export default function GenServerTimeout(props) {

    const dispatch = useDispatch();
    const genServerTimeoutLobby = useSelector(state => state.lobby.genServerTimeout);
    const [isDisconnected, setIsDisconnected] = useState(false);

    useEffect(() => {
        if (!genServerTimeoutLobby.reason) {
            return;
        }

        dispatch(socketDisconnect());
        setIsDisconnected(true);
        props.ongenServerTimeout && props.ongenServerTimeout();

    }, [genServerTimeoutLobby]);


    return (
        <>
            {isDisconnected &&
                <Popup
                    title={genServerTimeoutLobby.reason}
                    content={<div>                        
                        <a href="/">Click here to restart</a>
                    </div>}
                />
            }
        </>
    );
}
