import React, { useState } from 'react';

import { createGame } from './gameSlice';
import { useDispatch } from 'react-redux';

function Create() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState("");

    return (
        <div className="App">
            <header className="App-header">
            <div className="offset-bottom">

                <h3>Buzz Games</h3>
                <div className="form">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            required
                            placeholder="Name"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)} />
                        <input
                            className="bouncy"                       
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
