import { NavLink } from 'react-router-dom';
import React from 'react';

export default function GameList(props) {
    const { games, defaultValue } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e);
    }

    return (
        <React.Fragment>
            <div className="flex-center flex-container">
                <label htmlFor="game-list" className="typography-emphasize ">
                    <div className="flex-center flex-container">Select Existing Game or</div>
                    <NavLink className="app-link" to="/import">Import</NavLink>
                    &nbsp;or&nbsp;
            <NavLink className="app-link" to="/create">Create Your Own</NavLink>
                </label>
            </div>
            <select defaultValue={defaultValue}
                id="game-list"
                name="games"
                className="bold-select select-height-tall header-bolder lighter-label"
                onChange={onGameChange}>

                {(games || []).map((val) =>
                    <option key={val.name} value={val.name}>{val.name}</option>
                )}
            </select>
        </React.Fragment>
    );
}
