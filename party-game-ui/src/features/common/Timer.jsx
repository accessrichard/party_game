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
        onStartDateSet,
        restartKey,
        className
    } = props;

    const [seconds, setSeconds] = useState(isIncrement ? 0 : numberSeconds);
    const [startDate, setStartDate] = useState(null);
    const prevActive = usePrevious(isActive);

    /// If you:
    ///  setIsActive(true); setIsActive(false); setIsActive(true); 
    /// react will batch those ops and the result will be a skipping
    /// of the value false. prevRestartKey is a hack to force re-render
    /// by assigning a new rand value like new Date().toISOString
    const prevRestartKey = usePrevious(restartKey);

    useEffect(() => {
        if ((!prevActive && isActive) || prevRestartKey !== restartKey) {
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
    }, [isActive, seconds, prevActive, numberSeconds, startDate, isIncrement]);

    return (
        <>
            {isVisible &&
                <span className={className}>
                    {formatTime(seconds, timeFormat)}
                </span>}
        </>
    );
}
