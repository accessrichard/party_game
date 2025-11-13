import { useState } from 'react';
import { clientGameList } from '../lobby/lobbySlice';
import { useSelector } from 'react-redux';


export default function SelectGameType({ value = "multiple_choice", onSelectGameType }) {

    const [game, setGame] = useState(value);
    const clientGameMetaList = useSelector(clientGameList);
    
    function onChange(e) {
        setGame(e.target.value);        
        const gameMeta = clientGameMetaList.find(x => x.type === e.target.value);
        onSelectGameType && onSelectGameType(gameMeta);
    }

    return (
        <div>
            <select
                autoComplete="off"
                name="game"
                onChange={onChange}
                value={game}
            >
                {clientGameMetaList.map((x) => (
                    <option key={x.type} value={x.type}>{x.name}</option>
                ))}

            </select>
            <span className="highlight"></span>
            <span className="bar"></span>
            <label>Game Type</label>
        </div>
    )
}