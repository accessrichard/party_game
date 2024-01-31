import React from 'react';
import { getPresences } from '../presence/presenceSlice';
import { useSelector } from 'react-redux';

const Players = () => {
    const players = useSelector(getPresences);
    const playerName = useSelector(state => state.game.playerName);

    return (
        <React.Fragment>
            <ul className="players ul-nostyle">                
                {players.map((val, key) =>
                    <li key={key}>                        
                        {val.name} {val.name !== playerName && val.isTyping && <i className='smallest-font'> - typing</i>}
                    </li>
                )}
            </ul>
        </React.Fragment>
    );
}

export default Players;
