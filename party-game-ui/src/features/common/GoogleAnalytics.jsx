import { useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';
import ReactGA4 from 'react-ga4';
import {
    useLocation
} from "react-router-dom";

export default function GoogleAnalytics() {

    const location = useLocation();
    const [isEnabled, setIsEnabled] = useState(import.meta.env.PROD);

    useEffect(() => {       
        if (!isEnabled) {
            return;
        }

        if (document.location.hostname.includes('localhost') || !!import.meta.env.VITE_GA4_MEASUREMENT_ID) {
            setIsEnabled(false);
            return;
        }

        ReactGA4.initialize(import.meta.env.VITE_GA4_MEASUREMENT_ID)
    }, [isEnabled]);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        ReactGA4.send({ hitType: 'pageview', page: location.pathname + location.search })
    }, [isEnabled, location]);


    return (
        <>
            <Outlet></Outlet>
        </>
    );
}
