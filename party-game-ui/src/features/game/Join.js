import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Logo from '../common/Logo';
import { joinGame } from './gameSlice';
import { useParams } from "react-router-dom";

function Join() {

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
            <header className="app-header">
                <div className="offset-bottom">
                <Logo logoClass="small-logo bouncy" titleClass="small-title"></Logo>
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
