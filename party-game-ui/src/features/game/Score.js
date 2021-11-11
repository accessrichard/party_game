import { useDispatch, useSelector } from 'react-redux';

import Faces from '../common/Faces';
import React from 'react';
import { Redirect } from 'react-router-dom';
import Scores from '../common/Scores';
import { getScores } from './gameSlice';
import { push } from 'connected-react-router'
import { resetState } from './gameSlice';

function Score() {
    const dispatch = useDispatch();
    const rounds = useSelector(state => state.game.rounds);
    const scores = useSelector(getScores);

    if (rounds.length === 0) {
        return <Redirect to="/" />
    }

    function playAgain(e) {
        e.preventDefault();
        dispatch(resetState());
        dispatch(push('/lobby'));
    }

    return (
        <React.Fragment>
            <div className="pd-25 md-5 large-title">{scores.winners && scores.winners.length == 1 ?  scores.winners[0].name + "won!" : scores.winners.map(x => x.name).join(" and ")+ " tied!"}</div>
            <Faces isHappy={true} imgClass="small-logo spin" />
            <Scores scores={scores.scores} />
            <a href="/" className="app-link slidein-right pd-25" onClick={playAgain}>Play Again</a>
        </React.Fragment>
    );
}

export default Score;
