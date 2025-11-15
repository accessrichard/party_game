import PopupMessage from "./PopupMessage";
import { Outlet } from 'react-router';

export default function ExceptionPopup() {
    return (
        <>
            <PopupMessage />
            <Outlet />
        </>
    )
}