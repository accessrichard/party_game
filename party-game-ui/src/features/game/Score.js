import React, { useEffect } from 'react';
import { getScores, resetState } from './gameSlice';
import { useDispatch, useSelector } from 'react-redux';

import Faces from '../common/Faces';
import IdleTimeout from '../common/IdleTimeout';
import { Navigate } from 'react-router-dom';
import Scores from '../common/Scores';
import {
    channelPush
} from '../phoenix/phoenixMiddleware';
import { push } from "redux-first-history";

function Score() {
    const dispatch = useDispatch();
    const scores = useSelector(getScores);

    const {isGameStarted, gameChannel, isOver }  = useSelector(state => state.game);
    
    useEffect(() => {
        dispatch(channelPush({
            topic: gameChannel,
            event: gameChannel,
            data: { action: "update_location", location: "score" }
        }));

    }, [dispatch, gameChannel]);

    if (isGameStarted && !isOver) {
        return <Navigate to="/game" />
    }

    if (!gameChannel) {
        return <Navigate to="/" />
    }

    function playAgain(e) {
        e.preventDefault();
        dispatch(resetState());
        dispatch(push('/lobby'));
    }

    return (
        <React.Fragment>
            <IdleTimeout/>
            <div className="pd-25 md-5 large-title">{scores.winners && scores.winners.length === 1
                ? scores.winners[0].name + " won!"
                : scores.winners.map(x => x.name).join(" and ") + " tied!"}</div>
                
            <Faces isHappy={true} imgClass="small-logo spin" />
            <Scores scores={scores.scores} />
            <a href="/" className="app-link slidein-right pd-25" onClick={playAgain}>Play Again</a>
        </React.Fragment>
    );
}

export default Score;
