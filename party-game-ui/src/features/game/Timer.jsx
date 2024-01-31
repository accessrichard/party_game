import React, { useEffect, useState } from 'react';

import usePrevious from '../usePrevious';

function formatTime(seconds, timeFormat) {
    const time = new Date(seconds * 1000).toISOString();
    if (timeFormat === "seconds") {
        return time.substring(17, 19);
    }

    return time.substring(11, 19);
}

function getDateDiff(startDate) {
    return Math.round((new Date() - startDate) / 1000);
}

function isTimerComplete(startDate, numberSeconds, isIncrement) {
    if (startDate === null) {
        return false;
    }

    return isIncrement
        ? getDateDiff(startDate) >= numberSeconds
        : numberSeconds - getDateDiff(startDate) <= 0
}

export default function Timer(props) {

    const {
        numberSeconds = 10,
        isIncrement = true,
        isVisible = true,
        isActive = false,
        onTimerCompleted,
        timeFormat,
        onStartDateSet
    } = props;

    const [seconds, setSeconds] = useState(isIncrement ? 1 : numberSeconds);
    const [startDate, setStartDate] = useState(null);

    const prevActive = usePrevious(isActive);

    useEffect(() => {
        if (!prevActive && isActive) {
            const date = new Date();
            if (isIncrement) {
                date.setSeconds(date.getSeconds() - 1);
            }

            setStartDate(date);
            onStartDateSet && onStartDateSet(date);
        }

        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setSeconds(isIncrement ? getDateDiff(startDate) : numberSeconds - getDateDiff(startDate));
            }, 1000);
        } else {
            clearInterval(interval);
        }

        if (isTimerComplete(startDate, numberSeconds, isIncrement)) {
            onTimerCompleted && onTimerCompleted();
            const date = new Date();
            setStartDate(date.setSeconds(date.getSeconds() + 1));
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, prevActive, numberSeconds, onTimerCompleted, startDate, isIncrement, onStartDateSet]);

    return (
        <React.Fragment>
            {isVisible &&
                <span>
                    {formatTime(seconds, timeFormat)}
                </span>}
        </React.Fragment>
    );
}
