import { MULTIPLE_CHOICE, TRUE_FALSE } from '../../common/questionTypes';
import AnswerInput from './AnswerInput';
import InputError from '../../common/InputError';
import TrueFalse from './TrueFalse';
import TypeRadio from './TypeRadio';
import {  getError } from '../../creative/creative';

export default function QuestionForm({index, errors, onChange, value, type }) {

    function handleChange(e) {
        onChange && onChange(e);
    }

    return (
        <>
            <div className="flex-row">
                <div className="flex-column md-5">
                    <div className='group-compact'>
                        <input required
                            autoComplete="off"
                            name="question"
                            onInvalid={handleChange}
                            onChange={handleChange}
                            onBlur={handleChange}
                            value={value.question}
                            id={"question" + index}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>{"Question " + (index + 1)}</label>
                        <InputError className="error shake" errors={[getError(errors, "questions", index).question]} />
                    </div>
                </div>
            </div>
            <div className="flex-row margin-bottom-30">
                <TypeRadio
                    errors={errors && errors.type}
                    index={index}
                    onChange={handleChange}
                    value={value.type}></TypeRadio>

                {type === TRUE_FALSE &&
                    <TrueFalse index={index} value={value.correct} onChange={handleChange}></TrueFalse>
                }
            </div>

            {type === MULTIPLE_CHOICE &&
                <AnswerInput errors={getError(errors, "questions", index)}
                    index={index}
                    type={value.type}
                    value={value}
                    onBlur={handleChange}
                    onChange={handleChange}>
                </AnswerInput>}

        </>
    );
}
