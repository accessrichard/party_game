import React from 'react';

const Scores = (props) => {
    const { scores } = props;

    return (
        <React.Fragment>
            <h3>Score</h3>
            <ul className="ul-nostyle typography-left-align typography-sm-text2 ">
                {scores.map((score, key) =>
                    <li key={key} className="pd-5">
                        <div><span className="typography-emphasize">Player:</span> {score && score.name}</div>
                        <div><span className="typography-emphasize">Score:</span> {score && score.score}</div>
                    </li>
                )}
            </ul>
        </React.Fragment >
    );
}

export default Scores;
