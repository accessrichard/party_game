import React from 'react';

export default function TrueFalse(props) {

    function handleChange(e) {
        props.onChange && props.onChange(e);
    };

    return (
        <React.Fragment>            
            <span className="small-font label-color ">&nbsp;&nbsp;Correct Answer: </span>
                <label>
                    <input type="radio"
                        name={"correct-!-" + props.index}
                        value="1"
                        checked={props.value.toString() !== "2"}
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
