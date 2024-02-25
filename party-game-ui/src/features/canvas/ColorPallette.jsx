import React, {useEffect, useState} from 'react';
import ColorButton from './ColorButton';

const colorPallette = [
    "Black", "Gray", "Red",
    "Orange", "Green", "Blue",
    "Yellow", "Purple"
];

function toHex(rgb) {
    rgb = rgb.replace(/[^\d,]/g, '').split(',')
    return "#" + (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1);
}

export default function ColorPallette(props) {
    const {onColorChange, strokeStyle} = props;
    const [activeColorIndex, setActiveColorIndex] = useState(0);

    function onColorButtonClick(e) {
        setActiveColorIndex(e.target.getAttribute("data-id"));
        const color = colorPallette[e.target.getAttribute("data-id")];
        props.onColorChange && props.onColorChange(color);
    }

    useEffect(() => {
        if (!strokeStyle) {
            return;
        }
        
        colorPallette.forEach((color, idx) => {
            if (color === strokeStyle) {
               setActiveColorIndex(idx);
            }
        });
    }, [strokeStyle])


    return (

        <div>
            {colorPallette.map((color, index) =>
                <ColorButton
                    className={`color-button color-button-size ${color.toLowerCase()} light-text`}
                    onClick={onColorButtonClick}
                    color={color}
                    index={index}
                    active={activeColorIndex == index}
                    key={index}></ColorButton>)
            }
        </div>

    );
}
