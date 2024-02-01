import { Outlet } from 'react-router-dom';
import React from 'react';

export default function AppBody() {
    return (
        <>
            <div className="text-align-center max-width app-light app">
                <Outlet></Outlet>
            </div>
        </>
    );
}
