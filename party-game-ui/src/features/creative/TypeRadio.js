import { MULTIPLE_CHOICE, TRUE_FALSE } from '../common/questionTypes';
import React, { useState } from 'react';

export default function TypeRadio(props) {
    const { errors } = props;

    const [radio, setRadio] = useState(props.value || MULTIPLE_CHOICE);

    function onChange(e) {
        setRadio(e.target.value);
        props.onChange && props.onChange(e);
    }

    return (
        <React.Fragment>
            <label className='pointer-events'>
                <input type="radio"
                    name={"type-!-" + props.index}
                    value={MULTIPLE_CHOICE}
                    checked={radio === MULTIPLE_CHOICE}
                    onChange={onChange} />
                <span>Multiple Choice</span>
            </label>
            <label className='pointer-events'>
                <input type="radio"
                    name={"type-!-" + props.index}
                    value={TRUE_FALSE}
                    checked={radio === TRUE_FALSE}
                    onChange={onChange} />
                <span>True/False</span>
            </label>
            {errors && errors.length > 0 && <ul className="error">
                {errors.map((err, idx) => {
                    return <li key={idx}>{err}</li>
                })}
            </ul>}
        </React.Fragment>
    );
}
