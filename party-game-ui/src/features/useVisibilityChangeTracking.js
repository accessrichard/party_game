import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { channelPush } from './phoenix/phoenixMiddleware';
import { selectGameOwner } from './lobby/lobbySlice';

/**
 * On mobile the browser can go to the background or be closed
 * and the game still be active. Its unknown whether the game 
 * will be picked back up or killed. 
 * 
 * Set a debounced timeout on the game going to the background.
 * Once the timeout fires the server event, the server can track
 * whether the user comes back or not and take action.
 */
export default function useVisibilityChangeTracking() {


    const dispatch = useDispatch();
    const { gameCode } = useSelector(state => state.lobby);
    const [isVisible, setIsVisible] = useState(true);
    const [isVisibleEventSent, setIsVisibleEventSent] = useState(false);
    const isGameOwner = useSelector(selectGameOwner);


    useEffect(() => {
        const onVisibilitychange = () => {
            setIsVisible(!document.hidden);
        }
        window.addEventListener("visibilitychange", onVisibilitychange);
        return () => {
            window.removeEventListener("visibilitychange", onVisibilitychange);
        };
    }, []);

    useEffect(() => {
        if (isGameOwner) {
            return;
        }
        
        let timeout;
        if (isVisible && isVisibleEventSent) {
            setIsVisibleEventSent(false)
            dispatch(channelPush({
                topic: `lobby:${gameCode}`,
                event: "visiblity_change",
                data: { isVisible: isVisible }
            }));
        } else if (!isVisible && !isVisibleEventSent) {
            timeout = setTimeout(() => {
                setIsVisibleEventSent(true)
                dispatch(channelPush({
                    topic: `lobby:${gameCode}`,
                    event: "visiblity_change",
                    data: { isVisible: isVisible }
                }));
            }, 1000 * 1);

        }
        return () => clearTimeout(timeout)
    }, [isVisible, isVisibleEventSent, isGameOwner]);



}




