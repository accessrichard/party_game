import React, { useEffect, useState } from 'react';

import usePrevious from '../usePrevious';

function formatTime(seconds, timeFormat) {
    const time = new Date(seconds * 1000).toISOString();
    if (timeFormat === "seconds") {
        return time.substring(17, 19);
    }

    return time.substring(11, 19);
}

function getIncrementDiff(startDate) {
    const dateDiff = (new Date() - startDate);
    return Math.round(dateDiff / 1000)
}

function getDecrementDiff(startDate, numberSeconds) {
    const dateDiff = (new Date() - startDate);
    return Math.round(numberSeconds - (dateDiff / 1000))
}

function isDone(startDate, numberSeconds, isIncrement) {
    if (startDate === null) {
        return false;
    }

    if (isIncrement) {
        return getIncrementDiff(startDate) >= numberSeconds
    }

    return getDecrementDiff(startDate, numberSeconds) <= 0
}

export default function Timer(props) {

    const {
        numberSeconds = 10,
        isIncrement = true,
        isVisible = true,
        isActive = false,
        timerDone,
        timeFormat
    } = props;

    const [seconds, setSeconds] = useState(isIncrement ? 1 : numberSeconds);
    const [startDate, setStartDate] = useState(null)

    const prevActive = usePrevious(isActive);

    useEffect(() => {

        if (!prevActive && isActive) {
            const date = new Date();
            if (isIncrement) {
                date.setSeconds(date.getSeconds() - 1)
            }

            setStartDate(date)
        }

        let interval = null;

        if (isActive) {
            interval = setInterval(() => {

                setSeconds(isIncrement
                    ? getIncrementDiff(startDate)
                    : getDecrementDiff(startDate, numberSeconds))

            }, 1000);
        } else {
            clearInterval(interval);
        }

        if (isDone(startDate, numberSeconds, isIncrement)) {
            timerDone && timerDone();
            const date = new Date();
            setStartDate(date.setSeconds(date.getSeconds() + 1));
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, prevActive, numberSeconds, timerDone, startDate]);

    return (
        <React.Fragment>
            {isVisible && <span>
                {formatTime(seconds, timeFormat)}
            </span>}
        </React.Fragment>
    );
}
