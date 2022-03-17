import React from 'react';
import {getPresences} from '../presence/presenceSlice';
import { useSelector } from 'react-redux';

const Players = () => {
    const players = useSelector(getPresences);

    return (
        <React.Fragment>
            <ul className="players ul-nostyle">
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
