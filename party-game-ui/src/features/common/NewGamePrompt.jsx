import React, { useEffect, useState } from 'react';
import Timer from '../common/Timer';
import { getPresences } from '../presence/presenceSlice';
import { useSelector } from 'react-redux';


export default function NewGamePrompt(props) {
    const {
        onStartGame,
        isNewGamePrompt,
        seconds = 15,
        text = "Game Starts In: ",
        header = "" } = props;

    const [isTimerActive, setIsTimerActive] = useState(false);
    const presenceList = useSelector(getPresences);    

    

    useEffect(() => {
        setIsTimerActive(isNewGamePrompt);
    }, [isNewGamePrompt]);

    useEffect(() => {
        if (getMissingPlayers().length === 0) {
            onTimerCompleted();
        }
    }, [presenceList])

    function getMissingPlayers() {
        return presenceList.filter(presence => presence.location != "game").map(x => x.name)
    }

    function onTimerCompleted() {
        if (isTimerActive){
            setIsTimerActive(false);
            onStartGame && onStartGame();
        }
    }


    return (
        <>
            {isTimerActive &&

                <div className='overlay'>
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
                        Waiting for players to connect:
                        <ul className="ul-nostyle">
                            {presenceList.map((x, i) => <li key={i}>{x.name} - {x.location}</li>)}
                        </ul>
                    </div>
                </div>
            }

            {!isTimerActive && props.children}
        </>
    );
}
