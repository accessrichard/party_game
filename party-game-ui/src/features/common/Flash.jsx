import React from 'react';

export default function Flash(props) {
    const { flash } = props;

    return (
        <>
            <span className={`larger-title ${flash.className ? flash.className : "bolder"}`}>
                {flash.text}
            </span>
        </>
    );
}
