import React from 'react';

export default function GameList(props) {
    const { games, value } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e);
    }

    return (
        <>
            <div className="group">
                <select
                    required
                    autoComplete="off"
                    id="game-list"
                    name="games"
                    onChange={onGameChange}
                    value={value}
                >
                    {(games || []).map((val) =>
                        <option key={val.name} value={val.name}>{val.name}</option>
                    )}
                </select>
                <span className="highlight"></span>
                <span className="bar"></span>
                <label className="prefilled-select-label">Select Game</label>
            </div>
        </>
    );
}
