import React from 'react';

export default function AppBody(props) {
    return (
        <React.Fragment>
            <div className="App max-width app-header">
                {props.children}
            </div>
        </React.Fragment>
    );
}
