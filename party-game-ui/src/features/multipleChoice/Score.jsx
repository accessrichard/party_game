import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Faces from '../common/Faces';
import { Navigate } from 'react-router-dom';
import Scores from '../common/Scores';
import { getScores, resetGame } from './gameSlice';
import { push } from "redux-first-history";
import { Confetti } from '@neoconfetti/react';
import useLobbyEvents from '../lobby/useLobbyEvents';

function displayWinner(scores) {
    const winners = scores.winners.filter(x => x.name !== "None");
    if (winners.length === 0) {
        return "Please try again!"
    }

    if (winners.length > 1) {
        return winners.map(x => x.name).join(" and ") + " tied!"
    }

    if (winners.length === 1) {
        return scores.winners[0].name + " won!";
    }
}

function Score() {
    const dispatch = useDispatch();
    const scores = useSelector(getScores);
    const [confetti, setConfetti] = useState(new Date().toISOString())
    useLobbyEvents();

    const { isGameStarted, gameCode, url } = useSelector(state => state.lobby);
    const { round } = useSelector(state => state.game);

    const gameChannel = `game:${gameCode}`;
    
    useEffect(() => {
        setConfetti(new Date().toISOString());
    }, []);


    if (isGameStarted) {
        dispatch(resetGame());
        return <Navigate to={url || '/game'}/>
    }

    if (!gameChannel) {
        return <Navigate to="/" />
    }

    function playAgain(e) {
        e.preventDefault();
        dispatch(resetGame());
        dispatch(push('/lobby'));
    }
    return (
        <>
            <div className="pd-25 md-5 large-title">{displayWinner(scores)}</div>
            <Faces isHappy={true} className="small-logo spin" />
            <Confetti key={confetti} />

            <Scores scores={scores.scores} rounds={round} />
            <a href="/" className="app-link slidein-right pd-25" onClick={playAgain}>Play Again</a>
        </>
    );
}

export default Score;
