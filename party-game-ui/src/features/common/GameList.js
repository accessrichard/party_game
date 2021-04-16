import React from 'react';

export default function GameList(props) {
    const { games, defaultValue } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e.target.value);
    }

    return (
        <React.Fragment>
            <label htmlFor="game-list">Select Game:</label>
            <select defaultValue={defaultValue} id="game-list" name="games" className="bold-select" onChange={onGameChange}>
                {(games || []).map((val, key) =>
                    <option key={key} value={val}>{val}</option>
                )}
            </select>
        </React.Fragment>
    );
}
