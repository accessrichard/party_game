import '../App.css';

import React, {useEffect} from 'react';

import { NavLink } from 'react-router-dom';
import logo from '../balloons-party-svgrepo-com.svg';
import { useDispatch } from 'react-redux';

function Landing() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'logout/logout' });
    }, [dispatch])

    return (
        <div className="App">
         
            <header className="App-header">
                <div className="offset-bottom">
                <img src={logo} className="App-logo bouncy" alt="logo" />

                <div className="large-title slidein-right">Buzz Games</div>
                <p className="slidein-left">
                    Create&nbsp;
                    <NavLink className="App-link" to="/create">New</NavLink>
                    &nbsp;or&nbsp;
                    <NavLink className="App-link" to="/join">Join Game</NavLink>
                </p>
                </div>
            </header>            
        </div>
    );
}

export default Landing;
