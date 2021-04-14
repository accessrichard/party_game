import '../App.css';

import React, {useEffect} from 'react';

import { NavLink } from 'react-router-dom';
import logo from '../buzzer.svg';
import { useDispatch } from 'react-redux';

function Landing() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'logout/logout' });
    }, [dispatch])

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Create&nbsp;
                    <NavLink className="App-link" to="/create">New Game</NavLink>
                    &nbsp;or&nbsp;
                    <NavLink className="App-link" to="/join">Join Game</NavLink>
                </p>
            </header>
        </div>
    );
}

export default Landing;
