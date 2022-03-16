import React from 'react';

export default function TrueFalse(props) {

    function handleChange(e) {
        props.onChange && props.onChange(e);
    };

    return (
        <React.Fragment>
            <span>&nbsp;&nbsp;Correct Answer: </span>
            <label className='pointer-events'>
                <input type="radio"
                    name={"correct-!-" + props.index}
                    value="1"
                    checked={props.value.toString() !== "2"}
                    onChange={handleChange} />
                <span>True</span>
            </label>
            <label className='pointer-events'>
                <input type="radio"
                    name={"correct-!-" + props.index}
                    value="2"
                    checked={props.value.toString() === "2"}
                    onChange={handleChange} />

                <span>False</span>
            </label>
        </React.Fragment>
    );
}
