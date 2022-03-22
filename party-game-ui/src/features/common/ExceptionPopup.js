import React, { useState } from 'react';

import IdleTimeout from "./IdleTimeout";
import { Outlet } from 'react-router';
import SocketDisconnect from "./SocketDisconnect";

export default function ExceptionPopup(props) {

    const [shownError, setShownError] = useState("");

    function onDisconnect() {
        if (shownError !== "") {
            setShownError("onDisconnect");
        }
    }

    function onIdleTimeout() {
        if (shownError !== "") {
            setShownError("onIdleTimeout");
        }
    }

    return (
        <>
            {(shownError === "" || shownError === "onDisconnect") && <SocketDisconnect onDisconnect={onDisconnect} />}
            {(shownError === "" || shownError === "onIdleTimeout") && <IdleTimeout onIdleTimeout={onIdleTimeout} />}
            <Outlet/>
        </>
    )
}