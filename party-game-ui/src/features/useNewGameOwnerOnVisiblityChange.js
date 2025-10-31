import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { channelPush } from './phoenix/phoenixMiddleware';
import { selectGameOwner } from './lobby/lobbySlice';


export default function useNewGameOwnerOnVisibilityChange() {


    const dispatch = useDispatch();
    const { gameCode } = useSelector(state => state.lobby);
    const isGameOwner = useSelector(selectGameOwner);

    useEffect(() => {
        const onVisibilitychange = () => {            
            if (!document.hidden && isGameOwner){
                dispatch(channelPush({
                    topic: `lobby:${gameCode}`,
                    event: "visiblity_change",
                    data: { }
                }));
            }
            
        }
        window.addEventListener("visibilitychange", onVisibilitychange);
        return () => {
            window.removeEventListener("visibilitychange", onVisibilitychange);
        };
    }, []);

}


