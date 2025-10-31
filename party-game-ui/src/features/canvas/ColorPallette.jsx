import ColorButton from './ColorButton';

const colorPallette = [
    "#000000", "#808080", "#ff0000",
    "#ffa500", "#008000", "#0000ff",
    "#ffff00", "#800080" 
];

function _toHex(rgb) {
    rgb = rgb.replace(/[^\d,]/g, '').split(',')
    return "#" + (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1);
}

export default function ColorPallette({ strokeStyle, onColorChange }) {

    function onColorButtonClick(e, color) {
        onColorChange && onColorChange(color);
    }

    return (
        <div>
            {colorPallette.map((color, index) =>                
                <ColorButton
                    className="color-button color-button-size"
                    onClick={(e) => onColorButtonClick(e, color)}
                    color={color}
                    active={color == strokeStyle}
                    key={index}></ColorButton>)            
            }
        </div>
    );
}
