import React from 'react';
import { Redirect } from 'react-router-dom';
import { getScores } from './gameSlice';
import { push } from 'connected-react-router'
import { resetState } from './gameSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

function Score() {
    const dispatch = useDispatch();
    const rounds = useSelector(state => state.game.rounds);
    const scores = useSelector(getScores);

    if (rounds.length === 0) {
        return <Redirect to="/" />
    }

    function playAgain(e) {
        e.preventDefault();
        //dispatch(resetState());        
        //TODO: reset game questions on server
        //dispatch(push('/lobby'));
        dispatch(push('/'));
    }

    return (
        <div className="App App-dark">
            <h3>Winner</h3>
            <div>{scores && scores[0] && scores[0].name}</div>

            <a href="/" onClick={playAgain}>Play Again</a>
            <h3>Score</h3>
            <ul className="ul-nostyle typography-left-align">
                {scores.map((score, key) =>
                    <li key={key} className="pd-5">
                        <div>Player: {score && score.name}</div>
                        <div>Score: {score && score.score}</div>
                    </li>
                )}
            </ul>
            <h3>Rounds</h3>
            <ul className="ul-nostyle typography-left-align">
                {rounds.map((round, key) =>
                    <li key={key} className="pd-5">
                        <div>Round Winner: {round && round.winner}</div>
                        <div>Question: {round && round.question.question}</div>
                        <div>Answer: {round && round.answer}</div>
                    </li>
                )}
            </ul>
        </div>

    );
}

export default Score;
