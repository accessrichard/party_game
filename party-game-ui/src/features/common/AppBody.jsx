import { Outlet } from 'react-router-dom';
import React from 'react';
import BannerNotification from './BannerNotification'

export default function AppBody() {
    return (
        <>
        <BannerNotification></BannerNotification>
            <div className="text-align-center max-width app-blue app">
                <Outlet></Outlet>
            </div>
        </>
    );
}
