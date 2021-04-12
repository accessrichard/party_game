import React from 'react';

const Emphasize = (props) => {
    return (
        <React.Fragment>
             <span className="typography-emphasize">
                {props.children}
            </span>
        </React.Fragment >
    );
}

export default Emphasize;
