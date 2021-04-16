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
                    <div className="answer" key={key}>                                                          
                            <input 
                                type="submit"
                                name="group1"
                                className={`fill-space ${correct === ans ? "correct" : ""}`}
                                disabled={isDisabled ? "disabled" : ""}
                                value={ans}
                                autoComplete="off"
                                onClick={e => onAnswerClick(e, key)}
                            ></input>

                </div>
                )}
            </div>
        </React.Fragment>
    );
}
