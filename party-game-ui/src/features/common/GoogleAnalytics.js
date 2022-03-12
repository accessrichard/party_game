import React, { useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';
import ReactGA4 from 'react-ga4';
import {
    useLocation
} from "react-router-dom";

export default function GoogleAnalytics(props) {

    const location = useLocation();
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        setIsEnabled(!document.location.hostname.includes('localhost') && !!process.env.GA_MEASUREID)

        if (!isEnabled) {
            return;
        }

        ReactGA4.initialize('G-YSXHFW8BVQ')
    }, [isEnabled]);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        ReactGA4.send({ hitType: 'pageview', page: location.pathname + location.search })
    }, [isEnabled, location]);


    return (
        <React.Fragment>
            <Outlet></Outlet>
        </React.Fragment>
    );
}
