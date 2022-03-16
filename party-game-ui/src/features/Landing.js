import '../App.css';

import React, { useEffect } from 'react';

import Logo from './common/Logo';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';

function Landing() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'logout/logout' });
    }, [dispatch])

    return (
        <div className='flex-center app'>
            <Logo logoClass="app-logo bouncy" showSubtitle={true} titleClass="large-title slidein-right" />
            <p className="slidein-left">
                Create&nbsp;
                    <NavLink className="app-link" to="/start">New</NavLink>
                    &nbsp;or&nbsp;
                    <NavLink className="app-link" to="/join">Join Game</NavLink>
            </p>
        </div>
    );
}

export default Landing;
