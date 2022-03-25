import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Popup from './Popup';
import { socketDisconnect } from '../phoenix/phoenixMiddleware';

export default function GenServerTimeout(props) {

    const dispatch = useDispatch();
    const isGenServerTimeout = useSelector(state => state.game.isGenServerTimeout);

    useEffect(() => {
        if (!isGenServerTimeout) {
            return;
        }

        dispatch(socketDisconnect());
        props.ongenServerTimeout && props.ongenServerTimeout();

    }, [isGenServerTimeout, dispatch, props]);


    return (
        <React.Fragment>
            {isGenServerTimeout &&
                <Popup
                    title="Game idle timeout expired."
                    content={<a href="/">Click here to restart</a>}
                />
            }
        </React.Fragment >
    );
}
