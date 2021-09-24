import { MULTIPLE_CHOICE, TRUE_FALSE } from '../common/questionTypes';

import AnswerInput from './AnswerInput';
import InputField from '../common/InputField';
import React from 'react';
import TrueFalse from './TrueFalse';
import TypeRadio from './TypeRadio';
import { answer } from './game';

export default function QuestionForm(props) {

    function handleChange(e) {
        props.onChange && props.onChange(e);
    };

    function hasError(field) {
        return props.errors && props.errors[field]
            && typeof props.errors[field][props.index] !== 'undefined';
    }

    function getQuestionErrors() {
        if (hasError("questions")) {
            return props.errors.questions[props.index].question;
        }

        return "";
    }

    function getAnswerErrors() {
        if (hasError("questions")) {
            return props.errors.questions[props.index];
        }

        return answer;
    }

    return (
        <React.Fragment>
            <div className="flex-row">
                <div className="flex-column md-5">
                    <InputField
                        errors={[getQuestionErrors()]}
                        label={"Question " + (props.index + 1)}
                        id={"question" + props.index}
                        name="question"
                        required
                        value={props.value.question}
                        onChange={handleChange}
                        onInvalid={handleChange}
                        onBlur={handleChange}>
                    </InputField>
                </div>
            </div>
            <div className="flex-row">
            <TypeRadio
                errors={[(props.errors && props.errors.type) || ""]}
                index={props.index}
                onChange={handleChange}
                value={props.value.type}></TypeRadio>

            {props.type === TRUE_FALSE &&
                <TrueFalse index={props.index} value={props.value.correct} onChange={handleChange}></TrueFalse>
            }
            </div>

            {props.type === MULTIPLE_CHOICE &&
                <AnswerInput errors={getAnswerErrors()}
                    index={props.index}
                    type={props.value.type}
                    value={props.value}
                    onBlur={handleChange}
                    onChange={handleChange}>
                </AnswerInput>}

        </React.Fragment>
    );
}
