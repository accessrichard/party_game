import React from 'react';

const GuessList = (props) => {
    const { guesses } = props;

    return (
        <ul className="ul-nostyle">
            {guesses.map((val, key) =>
                <li key={key}>
                    {val}
                </li>
            )}
        </ul>
    );
}

export default GuessList;
