import { useEffect, useRef } from 'react';

export default function usePrevious(value) {

    useEffect(() => {
        window.addEventListener("visibilitychange", notifyLeave);
        return () => {
            window.removeEventListener("visibilitychange", notifyLeave);
        };
    }, []);

}


