import React, { useState } from 'react';

import GenServerTimeout from "./GenServerTimeout";
import { Outlet } from 'react-router';

export default function ExceptionPopup() {

    const [shownError, setShownError] = useState("");


    function ongenServerTimeout() {
    }

    return (
        <>            
            <GenServerTimeout ongenServerTimeout={ongenServerTimeout} />
            <Outlet/>
        </>
    )
}