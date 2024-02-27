import React, { useEffect, useState } from 'react';
import Timer from '../common/Timer';

export default function NewGamePrompt(props) {
    const {
        onStartGame, 
        isNewGamePrompt, 
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
            {isTimerActive && <div className='overlay'>
                <div className='flex-center align-center flex-container full-height'>
                    <h2>{header}</h2>
                    <h2>{text} 
                        <Timer numberSeconds={3}
                            isIncrement={false}
                            isVisible={true}
                            isActive={isTimerActive}
                            timeFormat="seconds"
                            onTimerCompleted={onTimerCompleted}
                        />
                    </h2>
                </div>
            </div>}

            {!isTimerActive && props.children}
        </>
    );
}
