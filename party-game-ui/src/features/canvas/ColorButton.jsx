import React from 'react';

export default function ColorButton(props) {
    const { color, className, onClick, index, active } = props;
    return (
        <>
            <button data-id={index} className={`${className} ${active && "active"}`} onClick={onClick}>{color}</button>
        </>
    );
}
