import React, { useEffect, useState } from 'react';

import usePrevious from '../usePrevious';

function formatTime(seconds, timeFormat) {
    const time = new Date(seconds * 1000).toISOString();
    if (timeFormat === "seconds") {
      return time.substr(17, 2);
    } 

    return time.substr(11, 8);
}

export default function Timer(props) {
    const timeIncrement = props.timeIncrement || 1;
    const startSeconds = props.startSeconds || 0;
    const [seconds, setSeconds] = useState(startSeconds);
    const {isActive, timerDone, timeFormat} = props;

    const prevActive = usePrevious(isActive);

    useEffect(() => {
        const isDone = startSeconds > 0 && seconds === 0;
        if (!prevActive && isActive) {
            setSeconds(startSeconds)
        }

        let interval = null;        

        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + timeIncrement);
            }, 1000);

        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
       
        if (isDone) {
            timerDone();
            setSeconds(startSeconds);
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, prevActive, startSeconds, timeIncrement, timerDone]);

    return (
        <React.Fragment>
            <span>
                {formatTime(seconds, timeFormat)}
            </span>
        </React.Fragment>
    );
}
