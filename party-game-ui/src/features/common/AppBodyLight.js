import React from 'react';

export default function AppBody(props) {
    return (
        <React.Fragment>
            <div className="text-align-center max-width app-light">
                {props.children}
            </div>
        </React.Fragment>
    );
}
