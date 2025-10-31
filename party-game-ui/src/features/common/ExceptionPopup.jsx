import GenServerTimeout from "./GenServerTimeout";
import { Outlet } from 'react-router';

export default function ExceptionPopup() {

    function ongenServerTimeout() {
    }

    return (
        <>            
            <GenServerTimeout ongenServerTimeout={ongenServerTimeout} />
            <Outlet/>
        </>
    )
}