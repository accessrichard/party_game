import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Popup from './Popup';
import { socketDisconnect } from '../phoenix/phoenixMiddleware';

export default function IdleTimeout(props) {

    const dispatch = useDispatch();
    const isIdleTimeout = useSelector(state => state.game.isIdleTimeout);

    useEffect(() => {
        if (!isIdleTimeout) {
            return;
        }

        dispatch(socketDisconnect());
        props.onIdleTimeout && props.onIdleTimeout();

    }, [isIdleTimeout, dispatch, props]);


    return (
        <React.Fragment>
            {isIdleTimeout &&
                <Popup
                    title="Game idle timeout expired."
                    content={<a href="/">Click here to restart</a>}
                />
            }
        </React.Fragment >
    );
}
