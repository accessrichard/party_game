import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';
import { socketDisconnect } from '../phoenix/phoenixMiddleware';

export default function IdleTimeout(props) {

    const dispatch = useDispatch();
    const isIdleTimeout = useSelector(state => state.game.isIdleTimeout);

    useEffect(() => {
        if (!isIdleTimeout) {
            return;
        }

        dispatch(socketDisconnect());

    }, [isIdleTimeout, dispatch]);


    return (
        <React.Fragment>
            {isIdleTimeout && <div className="overlay overlay-visible">
                <div className="popup">
                    <h2>Game idle timeout expired.</h2>
                    <div className="content">
                        <Link to="/">Click here to restart.</Link>
                    </div>
                </div>
            </div>
            }
        </React.Fragment >
    );
}
