import React from 'react';
import { useSelector } from 'react-redux';

const Players = () => {
    const players = useSelector(state => state.game.players);

    return (
        <React.Fragment>
            <ul className="ul-numbered players reset-pm">
                {players.map((val, key) =>
                    <li key={key}>
                        {val.name}
                    </li>
                )}
            </ul>
        </React.Fragment>
    );
}

export default Players;
