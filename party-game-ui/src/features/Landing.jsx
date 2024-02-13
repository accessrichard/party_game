import '../App.css';

import React, { useEffect } from 'react';

import Logo from './common/Logo';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listGames } from './game/gameSlice';

function sliceArray(array, n) {
    if (array === null) {
        return
    }
    return [...Array(Math.ceil(array.length / n))].map((_, i) => array.slice(i * n, (i + 1) * n));
}

function Landing() {
    const dispatch = useDispatch();
    const serverGames = useSelector(state => state.game.api.list.data);
    const serverGameCols = sliceArray(serverGames, serverGames && Math.ceil(serverGames.length / 3));

    useEffect(() => {
        dispatch({ type: 'logout/logout' });
    }, [dispatch])

    useEffect(() => {
        dispatch(listGames());
    }, []);

    return (
        <>
            <div className='flex-center app pd-5-lr'>
                <Logo logoClass="app-logo bouncy" showSubtitle={true} titleClass="large-title slidein-right" />
                <p className="slidein-left">
                    Create&nbsp;
                    <NavLink className="app-link" to="/start">New</NavLink>
                    &nbsp;or&nbsp;
                    <NavLink className="app-link" to="/join">Join Game</NavLink>
                </p>
            </div>
            <div className='flex flex-row flex-center app-light pd-5-lr'>
                <div className='flex-column text-align-left flex-item pad-5per'>
                    Play Trivia Games!
                    <span className='font-14px'>Play games alone or togather to see who can answer the quickest!
                    </span>
                    <ul className='font-14px'>
                        <li>Learn addition, subtraction, multiplication, division and equations.</li>
                        <li>Play Sports Trivia Games</li>
                        <li>Learn the United States Capitals!</li>
                        <li>Learn about the Solar System!</li>
                    </ul>
                </div>
                <div className='flex-column  flex-item pad-5per'>
                    Make your own Trivia Game to play with friends or Create flashcards to study for a test alone!
                </div>
                <div className='flex-column text-align-left flex-item pad-5per'>
                    Interactive Game Creator
                    <span className='font-14px'>Make your own flashcards or game with our interactive Game creator. Create your game, download it to a text file, and whenever you want to play it again, open the file up and paste it in our import game section.
                    </span>
                </div>
            </div>
            <div className='flex flex-row flex-center'>
                <div className='flex-column  flex-item pad-5per'>
                    No accounts or login necassary. Start playing immediately!
                    <span className='font-14px'>Just enter any name you want on the next screen and you are good to play alone or with a friend.
                    </span>
                </div>
            </div>
            <div className='flex flex-row flex-center app-light pd-5-lr'>
                <div className='flex-column text-align-left flex-item pad-5per'>
                    Trivia Questions and Games are added all the time.
                    <span className='font-14px'>Here are the current game offerings:
                    </span>
</div></div>
<div className='flex flex-row flex-center app-light pd-5per-lr'>
                {(serverGameCols || []).map((x, key) => {

                    return <div key={key} className='flex-column text-align-left flex-item pd-5per-lr'>
                        <ul className='font-14px' >
                            {(x || []).map((game, key) =>
                                <li key={key}>
                                    {game.name}
                                </li>
                            )
                            }
                        </ul>
                    </div>

                })}
            </div>
            


        </>
    );
}

export default Landing;
