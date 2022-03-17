import React from 'react';

const Scores = (props) => {
    const { scores } = props;

    return (
        <React.Fragment>
            <h3>Score</h3>
            <ul className="ul-nostyle text-align-left medium-font">
                {scores.map((score, key) =>
                    <li key={key} className="pd-5">
                        <div><span className="bolder">Player:</span> {score && score.name}</div>
                        <div><span className="bolder">Score:</span> {score && score.score}</div>
                    </li>
                )}
            </ul>
        </React.Fragment >
    );
}

export default Scores;
