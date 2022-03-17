import React from 'react';

export default function Answers(props) {

    const { isDisabled, answers, correct } = props;

    function onAnswerClick(e, key) {
        props.onAnswerClick(e, e.target.value);
    }

    return (
        <React.Fragment>
            <div className="answer-wrapper">
                {(answers || []).map((ans, key) =>
                    <div className="answer light-background dark-border" key={key}>
                        <input
                            type="submit"
                            name="group1"
                            className={`full-height full-width ${correct === ans ? "correct" : ""}`}
                            disabled={isDisabled ? "disabled" : ""}
                            value={ans}
                            autoComplete="off"
                            onClick={e => onAnswerClick(e, key)}>
                        </input>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
}
