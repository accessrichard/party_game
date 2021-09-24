import React from 'react';

export default function TrueFalse(props) {

    function handleChange(e) {
        props.onChange && props.onChange(e);
    };
    console.log("TRUEFALSE", props.value);

    return (
        <React.Fragment>            
            <span className="small-font label-color lighter-label">&nbsp;&nbsp;Correct Answer: </span>
                <label>
                    <input type="radio"
                        name={"correct-!-" + props.index}
                        value="1"
                        checked={props.value.toString() === "1"}
                        onChange={handleChange} />

                    <span>True</span></label>

                <label>
                    <input type="radio"
                        name={"correct-!-" + props.index}
                        value="2"
                        checked={props.value.toString() === "2"}
                        onChange={handleChange} />

                    <span>False</span></label>                   
        </React.Fragment>
    );
}
