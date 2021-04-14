import React from 'react';

export default function Flash(props) {
    const { flash } = props;

    return (
        <React.Fragment>
            <span className={`typography-md-text ${flash.className ? flash.className : "typography-emphasize"}`}>
                {flash.text}
            </span>
        </React.Fragment>
    );
}
