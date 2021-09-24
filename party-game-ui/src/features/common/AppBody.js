import React from 'react';

export default function AppBody(props) {
    return (
        <React.Fragment>
            <div className="App lg-12 app-header">
                {props.children}
            </div>
        </React.Fragment>
    );
}
