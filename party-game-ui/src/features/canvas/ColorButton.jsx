import React from 'react';

export default function ColorButton({ color, className, onClick, active }) {
    if (active) 
    {
        className += " active";
    }

    return (
        <button className={className} onClick={onClick}>{color}</button>
    );
}
