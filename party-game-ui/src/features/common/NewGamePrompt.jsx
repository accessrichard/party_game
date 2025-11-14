import { useEffect, useState, useCallback } from 'react';
import Timer from '../common/Timer';
import { getPresences } from '../presence/presenceSlice';
import { useSelector } from 'react-redux';


export default function NewGamePrompt(props) {
    const {
        onStartGame,
        isNewGamePrompt,
        seconds = 10,
        text = "Waiting For Players: ",
        header = "" } = props;

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isCountdownVisible, setIsCountdownVisible] = useState(true);
    const [countDownMessage, setCountDownMessage] = useState(text);
    const [countDownSeconds, setCountDownSeconds] = useState(seconds);
    const presenceList = useSelector(getPresences);

    useEffect(() => {
        setIsTimerActive(isNewGamePrompt);
    }, [isNewGamePrompt]);

    useEffect(() => {
        setCountDownMessage(text);
    }, [text]);

    const getMissingPlayers = useCallback(() => {
        return presenceList.filter(presence => presence.location != "game").map(x => x.name)
    }, [presenceList]);

    const onTimerCompleted = useCallback(() => {
        if (isTimerActive) {
            onStartGame && onStartGame();
            setIsTimerActive(false);

        }
    }, [isTimerActive, onStartGame]);

    useEffect(() => {
        if (presenceList.length === 1) {
            onTimerCompleted();
            return;
        }

        //// Sometimes events are lost if they are sent right after channelJoin.
        if (getMissingPlayers().length === 0) {

            setCountDownSeconds(3)
            setCountDownMessage("Players Ready... ")

            const timer = setTimeout(() => {
                setCountDownMessage("Initializing Game... ")
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [getMissingPlayers, onTimerCompleted, presenceList]);


    return (
        <>
            {isTimerActive &&

                <div className='overlay'>
                    <div className='flex-grid flex-center align-center app'>
                        <div className='flex-row flex-center'>
                            <h2 className=''>{header}</h2>
                        </div>
                        <div className='flex-row flex-center'>
                            <h2>{countDownMessage}
                                <Timer numberSeconds={countDownSeconds}
                                    isIncrement={false}
                                    isVisible={isCountdownVisible}
                                    isActive={isTimerActive}
                                    timeFormat="seconds"
                                    onTimerCompleted={onTimerCompleted}
                                />
                            </h2>
                        </div>{isCountdownVisible && <div>

                            <ul className="ul-nostyle">
                                {presenceList.map((x, i) => <li key={i}>{x.name} - {x.location}</li>)}
                            </ul>
                        </div>
                        }
                    </div>

                </div>
            }

            {!isTimerActive && props.children}
        </>
    );
}
