import React from 'react';

const Rounds = (props) => {
    const { rounds } = props;

    return (
        <React.Fragment>
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
        </React.Fragment >
    );
}

export default Rounds;
