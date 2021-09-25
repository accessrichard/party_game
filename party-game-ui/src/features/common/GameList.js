import { NavLink } from 'react-router-dom';
import React from 'react';

export default function GameList(props) {
    const { games, defaultValue } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e.target.value);
    }

    return (
        <React.Fragment>
            <label htmlFor="game-list" className="typography-emphasize">Select Existing Game
            <NavLink className="app-link" to="/import">Import Game</NavLink>
                    &nbsp;or&nbsp;
            <NavLink className="app-link" to="/create">Create Your Own</NavLink>
             </label>
            <select 
                    id="game-list" 
                    name="games" 
                    className="bold-select select-height-tall header-bolder lighter-label" 
                    onChange={onGameChange}>
                        
                {(games || []).map((val) =>
                    <option key={val.name} value={val.name} selected={defaultValue === val.name}>{val.name}</option>
                )}
            </select>
        </React.Fragment>
    );
}
