import React from 'react';

export default function GameList(props) {
    const { games, value } = props;

    function onGameChange(e) {
        props.onGameChange && props.onGameChange(e);
    }

    const groupedGames = games.reduce((acc, game) => {
        const gamesByCategory = acc[game.category || "Misc"] || [];

        return {
            ...acc,
            [game.category || "Misc"]: [...gamesByCategory, game]
        }
    }, {});

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
                    {
                        Object.keys(groupedGames).map((category) => (
                            <optgroup key={category} label={category}>
                                {
                                    groupedGames[category].map(({ id, name }) => (
                                        <option key={name} value={id}>{name}</option>
                                    ))
                                }
                            </optgroup>
                        ))
                    }
                    
            </select>
            <span className="highlight"></span>
            <span className="bar"></span>
            <label className="prefilled-select-label">Select Game</label>
        </div >
        </>
    );
}
