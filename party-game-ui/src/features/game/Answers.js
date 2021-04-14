import React, { useState } from 'react';

export default function Answers(props) {

    const [radioChecked, setRadioChecked] = useState(null);
    const { isDisabled, answers, correct } = props;

    function onAnswerChangeClick(e, key) {
        setRadioChecked(key);
        props.onAnswerChangeClick(e, e.target.value);
    }

    return (
        <React.Fragment>
            <ul className="ul-nostyle align-left">
                {(answers || []).map((ans, key) =>
                    <li key={key} className={"pd-5"}>
                        <span className={correct === ans ? "correct" : ""}>
                            <label className="typography-lg-text">
                                <input type="radio"
                                    name="group1"
                                    disabled={isDisabled ? "disabled" : ""}
                                    value={ans}
                                    autoComplete="off"
                                    onChange={e => onAnswerChangeClick(e, key)}
                                    checked={radioChecked === key}></input>
                                {ans}
                            </label>
                        </span>
                    </li>
                )}
            </ul>
        </React.Fragment>
    );
}
