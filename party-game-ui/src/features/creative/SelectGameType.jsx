import { useState } from 'react';
import { games, getGameMetadata } from '../lobby/games';

export default function SelectGameType({value = "multiple_choice", onSelectGameType}) {

    const [game, setGame] = useState(value)    

    function onChange(e) {
        setGame(e.target.value);
        onSelectGameType && onSelectGameType(getGameMetadata(e.target.value));
    }

    return (
        <div>
            <select
                autoComplete="off"
                name="game"
                onChange={onChange}
                value={game}
            >
                {Object.keys(games).map((x) => ( 
                    <option key={x} value={x}>{games[x].name}</option>
                ))}
                
            </select>
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>Game Type</label>
    </div>
    )
}