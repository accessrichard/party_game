import { Outlet } from 'react-router-dom';
import React from 'react';

export default function AppBody(props) {
    return (
        <React.Fragment>
            <div className="text-align-center max-width app-blue app">
                <Outlet></Outlet>
            </div>
        </React.Fragment>
    );
}
