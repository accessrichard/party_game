import React from 'react';

export default function Flash(props) {
    const { flash } = props;

    return (
        <React.Fragment>
            <span className={`small-title ${flash.className ? flash.className : "typography-emphasize"}`}>
                {flash.text}
            </span>
        </React.Fragment>
    );
}
