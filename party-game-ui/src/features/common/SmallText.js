import React from 'react';

const SmallText = (props) => {
    return (
        <React.Fragment>
            <div className="typography-dark typography-sm-text">
                {props.children}
            </div>
        </React.Fragment>
    );
}

export default SmallText;
