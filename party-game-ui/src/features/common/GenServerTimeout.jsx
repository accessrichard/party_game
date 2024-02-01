import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Popup from './Popup';
import { socketDisconnect } from '../phoenix/phoenixMiddleware';

export default function GenServerTimeout(props) {

    const dispatch = useDispatch();
    const genServerTimeout = useSelector(state => state.game.genServerTimeout);

    useEffect(() => {
        if (!genServerTimeout) {
            return;
        }

        dispatch(socketDisconnect());
        props.ongenServerTimeout && props.ongenServerTimeout();

    }, [genServerTimeout, dispatch, props]);


    return (
        <>
            {genServerTimeout &&
                <Popup
                    title="Game idle timeout expired."
                    content={<div>
                        <div>{genServerTimeout.reason && genServerTimeout.reason}</div>
                        <a href="/">Click here to restart</a>
                    </div>}
                />
            }
        </>
    );
}
