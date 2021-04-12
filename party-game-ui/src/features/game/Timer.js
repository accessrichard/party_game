import React, { useEffect, useState } from 'react';

import usePrevious from '../usePrevious';

function formatTime(seconds) {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}

export default function Timer(props) {
    const timeIncrement = props.timeIncrement || 1;
    const startSeconds = props.startSeconds || 0;
    const [seconds, setSeconds] = useState(startSeconds);

    const prevActive = usePrevious(props.isActive);

    useEffect(() => {
        if (!prevActive && props.isActive) {
            setSeconds(startSeconds)
        }

        let interval = null;

        if (props.isActive) {
            interval = setInterval(() => {

                setSeconds(seconds => seconds + timeIncrement);
            }, 1000);

        } else if (!props.isActive && seconds !== 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [props.isActive, seconds, prevActive, startSeconds, timeIncrement]);

    return (
        <React.Fragment>
            <span>
                {formatTime(seconds)}
            </span>
        </React.Fragment>
    );
}
