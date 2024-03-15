import React from 'react';

const GuessList = (props) => {
    const { guesses, className } = props;

    return (
        <div className='flex-row'>
            <div className='flex-column align-left'>
                <ul className={className}>
                    {guesses.map((val, key) =>
                        <li key={key}>
                            {val}{key == guesses.length - 1 ? '' : ', '}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default GuessList;
