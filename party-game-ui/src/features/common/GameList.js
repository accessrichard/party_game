import React from 'react';

export default function GameList(props) {
    const { games, defaultValue } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e.target.value);
    }

    return (
        <React.Fragment>
            <label htmlFor="game-list" className="typography-emphasize">Select Game:</label>
            <select defaultValue={defaultValue} 
                    id="game-list" 
                    name="games" 
                    className="bold-select select-height-tall header-bolder lighter-label" 
                    onChange={onGameChange}>
                        
                {(games || []).map((val, key) =>
                    <option key={key} value={val}>{val}</option>
                )}
            </select>
        </React.Fragment>
    );
}
