import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { joinGame } from './gameSlice';

function Join() {

    const dispatch = useDispatch();
    const gameCodeInput = useRef(null);

    const [username, setUsername] = useState("");
    const [gameCode, setGameCode] = useState("");
    const gameCodeError = useSelector(state => state.game.api.join.error);

    useEffect(() => {
        if (gameCodeError){
            gameCodeInput.current.setCustomValidity(gameCodeError);
        }
    });

    return (
        <div className="App">
            <header className="App-header">
                <h3>Buzz Games</h3>
                <div className="form">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input type="text" 
                               required 
                               placeholder="Name" 
                               value={username} 
                               onChange={(event) => setUsername(event.target.value)} />
                        <input type="text"  ref={gameCodeInput} 
                               required 
                               placeholder="Game Code" 
                               value={gameCode} 
                               onChange={(event) => setGameCode(event.target.value)} />
                        <input type="submit" 
                               value="Join Game" 
                               onClick={() => dispatch(joinGame({username, gameCode}))} />
                    </form>
                </div>
            </header>
        </div>
    );
}

export default Join;
