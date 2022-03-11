import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Faces from '../common/Faces';
import { Navigate } from 'react-router-dom';
import Scores from '../common/Scores';
import {
    channelPush
} from '../phoenix/phoenixMiddleware';
import { getScores } from './gameSlice';
import { push } from "redux-first-history";
import { resetState } from './gameSlice';

function Score() {
    const dispatch = useDispatch();
    const scores = useSelector(getScores);

    const {isGameStarted, gameChannel }  = useSelector(state => state.game);


    
    useEffect(() => {
        dispatch(channelPush({
            topic: gameChannel,
            event: gameChannel,
            data: { action: "update_location", location: "score" }
        }));

    }, [dispatch, gameChannel]);

    if (isGameStarted) {
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
