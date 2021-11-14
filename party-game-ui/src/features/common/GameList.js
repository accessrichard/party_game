import React from 'react';

export default function GameList(props) {
    const { games, value } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e);
    }

    return (
        <React.Fragment>        
            <label htmlFor="game-list" className="typography-emphasize ">Select Game:</label>
            <select 
                id="game-list"
                name="games"
                value={value}
                className="select bold-select select-height-tall header-bolder lighter-label"
                onChange={onGameChange}>

                {(games || []).map((val) =>
                    <option key={val.name} value={val.name}>{val.name}</option>
                )}
            </select>
        </React.Fragment>
    );
}
