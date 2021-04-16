import React, { useState } from 'react';

import Logo from '../common/Logo';
import { createGame } from './gameSlice';
import { useDispatch } from 'react-redux';

function Create() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState("");

    return (
        <div className="App">
            <header className="app-header">
            <div className="offset-bottom">
            <Logo logoClass="small-logo bouncy" titleClass="small-title"></Logo>

                <div className="form">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            required
                            placeholder="Name"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)} />
                        <input                            
                            type="submit"
                            value="Create Game"
                            onClick={() => dispatch(createGame(username))} />
                    </form>
                </div>
                </div>
            </header>
          
        </div>
    );
}

export default Create;
