import React from 'react';

const Scores = (props) => {
    const { scores, rounds } = props;

    return (
        <>
            <h3>Score</h3>
            <ul className="ul-nostyle text-align-left medium-font">
                {scores.filter(x => x.name !== "None").map((score, key) =>
                    <li key={key} className="pd-5">
                        <div><span className="bolder">Player:</span> {score && score.name}</div>
                        <div><span className="bolder">Score:</span> {score && score.score} - {score && Math.round((score.score / Math.max(rounds, 1)) * 100) }%</div>
                    </li>
                )}
            </ul>
        </>
    );
}

export default Scores;
