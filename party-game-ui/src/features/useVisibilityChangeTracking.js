import { useEffect } from 'react';
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
    const  gameCode  = useSelector(state => state.lobby.gameCode);
    const isGameOwner = useSelector(selectGameOwner);


    useEffect(() => {
        const onVisibilitychange = () => {

            if (!isGameOwner) {
                return
            }
            dispatch(channelPush({
                topic: `lobby:${gameCode}`,
                event: "visiblity_change",
                data: { isVisible: !document.hidden }
            }));
        }
        window.addEventListener("visibilitychange", onVisibilitychange);
        return () => {
            window.removeEventListener("visibilitychange", onVisibilitychange);
        };
    }, [isGameOwner]);



}




