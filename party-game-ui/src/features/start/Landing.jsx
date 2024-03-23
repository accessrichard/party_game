import '../../App.css';

import React, { useEffect } from 'react';

import Logo from '../common/Logo';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listGames } from '../lobby/lobbySlice';

function sliceArray(array, numCols) {
    if (array === null) {
        return
    }

    const numPerCol = Math.ceil(array.length / numCols)

    return [...Array(Math.ceil(array.length / numPerCol))]
        .map((_, i) => array.slice(i * numPerCol, (i + 1) * numPerCol));
}

function Landing() {
    const dispatch = useDispatch();
    const serverGames = useSelector(state => state.lobby.api.list.data);
    const serverGameCols = sliceArray(serverGames, 3);

    useEffect(() => {
        dispatch({ type: 'logout/logout' });
    }, [dispatch])

    useEffect(() => {
        dispatch(listGames());
    }, []);

    return (
        <>
            <div className='flex-center app pd-5-lr full-width'>
                <Logo logoClass="app-logo bouncy" showSubtitle={true} titleClass="large-title slidein-right" />
                <p className="slidein-left">
                    Create&nbsp;
                    <NavLink className="app-link" to="/start">New</NavLink>
                    &nbsp;or&nbsp;
                    <NavLink className="app-link" to="/join">Join Game</NavLink>
                </p>
            </div>
            <div className='flex flex-row flex-center app-light pd-5-lr'>
                <div className='flex-column text-align-left flex-item pad-5pc'>
                    Play Trivia Games!
                    <span className='font-14px'>Play games alone or togather to see who can answer the quickest!
                    </span>
                    <ul className='font-14px'>
                        <li>Learn to become proficient in Addition, Subtraction, Multiplication, Division and Equations.</li>
                        <li>Play Sports Trivia Games</li>
                        <li>Learn the United States Capitals!</li>
                        <li>Learn about the Solar System!</li>
                    </ul>
                </div>
                <div className='flex-column  flex-item pad-5pc'>
                    <div className='flex-column  flex-item'>
                        Play with friends or alone
                    </div>
                    <div className='flex-column  flex-item'>
                        Create your own Trivia Game
                    </div>
                </div>
                <div className='flex-column text-align-left flex-item pad-5pc'>
                    Interactive Game Creator
                    <span className='font-14px'>Make your own flashcards or game with our interactive Game creator. Create your game, download it to a text file, and whenever you want to play it again, open the file up and paste it in our import game section.</span>
                </div>
            </div>
            <div className='flex flex-row flex-center'>
                <div className='flex-column flex-item pad-5pc'>
                    Start playing immediately!
                    <span className='font-14px'>Just enter any name you want on the next screen and select your game.</span>
                </div>
            </div>
            <div className='flex flex-row flex-center app-light pad-5pc-top'>
                <div className='flex-column text-align-left flex-item pad-5pc-lr'>
                    Trivia Questions and Games are added all the time.
                    <span className='font-14px'>Here are the current trivia offerings:</span>
                </div>
            </div>
            <div className='flex flex-row flex-center app-light pad-5pc-lr pad-5pc-bottom'>
                {(serverGameCols || []).map((x, key) => {
                    let cat = x.category
                    return <div key={key} className='flex-column text-align-left flex-item pad-5pc-lr pad-5pc-bottom '>
                        <ul className='font-14px' >
                            <h3>{x.category}</h3>
                            {(x || []).map((game, key) =>
                                <li key={key}>
                                    {(game.category || "") + " - " + game.name}
                                </li>
                            )}
                        </ul>
                    </div>
                })}
            </div>
        </>
    );
}

export default Landing;
