import React from 'react';

const link = (gameCode) => {
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}/join/${gameCode}`;
    }
};

const GameCodeLink = (props) => {
    const { gameCode } = props;

    return (
        <>
            <a href={link(gameCode)} target="_blank" rel="noreferrer noopener">{link(gameCode)}</a>
        </>
    );
}

export default GameCodeLink;
