import React, { useState } from 'react';

import GenServerTimeout from "./GenServerTimeout";
import { Outlet } from 'react-router';
import SocketDisconnect from "./SocketDisconnect";

export default function ExceptionPopup() {

    const [shownError, setShownError] = useState("");

    function onDisconnect() {
        if (shownError !== "") {
            setShownError("onDisconnect");
        }
    }

    function ongenServerTimeout() {
        if (shownError !== "") {
            setShownError("onGenServerTimeout");
        }
    }

    return (
        <>
            {(shownError === "" || shownError === "onDisconnect") && <SocketDisconnect onDisconnect={onDisconnect} />}
            {(shownError === "" || shownError === "onGenServerTimeout") && <GenServerTimeout ongenServerTimeout={ongenServerTimeout} />}
            <Outlet/>
        </>
    )
}