import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { joinGame } from './gameSlice';
import { useParams } from "react-router-dom";

function Join(props) {

    let { id } = useParams();

    const dispatch = useDispatch();
    const gameCodeInput = useRef(null);

    const [username, setUsername] = useState("");
    const [gameCode, setGameCode] = useState(id || "");
    const gameCodeError = useSelector(state => state.game.api.join.error);

    
    useEffect(() => {
        if (gameCodeError) {
            gameCodeInput.current.setCustomValidity(gameCodeError);
        }
    });

    return (
        <div className="App">
            <header className="App-header">
                <div className="offset-bottom">
                    <h3>Buzz Games</h3>
                    <div className="form">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input type="text"
                                required
                                placeholder="Name"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)} />
                            <input type="text" ref={gameCodeInput}
                                required
                                placeholder="Game Code"
                                value={gameCode}
                                onChange={(event) => setGameCode(event.target.value)} />
                            <input type="submit"
                                value="Join Game"
                                onClick={() => dispatch(joinGame({ username, gameCode }))} />
                        </form>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Join;
