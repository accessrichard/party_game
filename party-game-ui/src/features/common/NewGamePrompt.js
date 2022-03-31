import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Timer from '../game/Timer';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { push } from 'redux-first-history';

export default function NewGamePrompt() {

    const dispatch = useDispatch();
    const { isNewGamePrompt, gameChannel, isGameOwner } = useSelector(state => state.game);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        setIsTimerActive(isNewGamePrompt);
    }, [isNewGamePrompt, dispatch]);

    function onTimerCompleted() {
        if (isGameOwner) {
            dispatch(channelPush({
                topic: gameChannel,
                event: "start_round"
            }));
        }

        setIsTimerActive(false);
        dispatch(push('/game'));
    }

    return (
        <>
            {isTimerActive && <div className='overlay'>
                <div className='flex-center align-center  flex-container full-height'>
                    <h2>Game Starts In:&nbsp;
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
        </>
    );
}
