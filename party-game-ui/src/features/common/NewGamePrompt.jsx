import React, { useEffect, useState } from 'react';
import Timer from '../common/Timer';

export default function NewGamePrompt(props) {
    const {
        onStartGame,
        isNewGamePrompt,
        seconds = 3,
        text = "Game Starts In: ",
        header = "" } = props;

    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        setIsTimerActive(isNewGamePrompt);
    }, [isNewGamePrompt]);

    function onTimerCompleted() {
        setIsTimerActive(false);
        onStartGame && onStartGame();
    }

    return (
        <>
            {/**
         *  
         */}
            {isTimerActive && <div className='overlay'>
                <div className='flex-grid flex-center align-center app'>
                    <div className='flex-row flex-center'>
                        <h2 className=''>{header}</h2>
                    </div>
                    <div className='flex-row flex-center'>
                        <h2>{text}
                            <Timer numberSeconds={seconds}
                                isIncrement={false}
                                isVisible={true}
                                isActive={isTimerActive}
                                timeFormat="seconds"
                                onTimerCompleted={onTimerCompleted}
                            />
                        </h2>
                    </div>
                </div>
            </div>
            }

            {!isTimerActive && props.children}
        </>
    );
}
