import React from 'react';
import { useSelector } from 'react-redux';

const Players = () => {
    const players = useSelector(state => state.game.players);

    return (
        <React.Fragment>
            <div className="card card-50vh flex-container scroll-flex">
                <div className="full-height full-width">
                    <ul className="ul-nostyle card typography-dark typography-large-text card-50vh players reset-pm">
                        {players.map((val, key) =>
                            <li key={key}>
                                {val}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Players;
