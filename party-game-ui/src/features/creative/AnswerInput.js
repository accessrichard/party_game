import InputField from '../common/InputField';
import { MULTIPLE_CHOICE } from '../common/questionTypes';
import React from 'react';

export default function AnswerInput(props) {

    function handleChange(e) {
        props.onChange && props.onChange(e);
    };

    function handleCorrectChange(e, col) {
        props.onChange && props.onChange(e);
    }

    return (
        <React.Fragment>
            <div className="flex-row">
                <div className="flex-column md-5">

                    <InputField errors={[props.errors.answer1]}
                        label="Answer"
                        name="answer1"
                        required
                        className="bordered-input"
                        id={"answer1" + props.index}
                        value={props.value.answer1}
                        onBlur={handleChange}
                        onInvalid={handleChange}
                        onChange={handleChange}>
                    </InputField>
                    <label htmlFor={"answer1-correct" + props.index}>
                        <input type="checkbox" id={"answer1-correct" + props.index} onChange={(e) => handleCorrectChange(e, "correct1")} name="correct" value="1" checked={props.value.correct.toString() === "1"}></input>
                    Correct
                    </label>
                </div>
                <div className="flex-column md-5">
                    <InputField errors={[props.errors.answer2]}
                        label="Answer"
                        name="answer2"
                        required
                        className="bordered-input"
                        id={"answer2" + props.index}
                        value={props.value.answer2}
                        onBlur={handleChange}
                        onInvalid={handleChange}
                        onChange={handleChange}>
                    </InputField>
                    <label htmlFor={"answer2-correct" + props.index}>
                        <input type="checkbox" id={"answer2-correct" + props.index} onChange={(e) => handleCorrectChange(e, "correct2")} name="correct" value="2" checked={props.value.correct.toString() === "2"}></input>
                    Correct
                    </label>
                </div>
            </div>

           
                <div className="flex-row">
                    <div className="flex-column md-5">

                        <InputField errors={[props.errors.answer3]}
                            label="Answer"
                            name="answer3"
                            required={(props.value.type && props.value.type === MULTIPLE_CHOICE) || false}
                            className="bordered-input"
                            id={"answer3" + props.index}
                            value={props.value.answer3}
                            onBlur={handleChange}
                            onInvalid={handleChange}
                            onChange={handleChange}>
                        </InputField>
                        <label htmlFor={"answer3-correct" + props.index}>
                            <input type="checkbox" id={"answer3-correct" + props.index} onChange={(e) => handleCorrectChange(e, "correct3")} name="correct" value="3" checked={props.value.correct.toString() === "3"}></input>
                    Correct
                    </label>
                    </div>
                    <div className="flex-column md-5">

                        <InputField errors={[props.errors.answer4]}
                            label="Answer"
                            name="answer4"
                            required={(props.value.type && props.value.type === MULTIPLE_CHOICE) || false}
                            className="bordered-input"
                            id={"answer4" + props.index}
                            value={props.value.answer4}
                            onBlur={handleChange}
                            onInvalid={handleChange}
                            onChange={handleChange}>
                        </InputField>
                        <label htmlFor={"answer4-correct" + props.index}>
                            <input type="checkbox" id={"answer4-correct" + props.index} onChange={(e) => handleCorrectChange(e, "correct4")} name="correct" value="4" checked={props.value.correct.toString() === "4"}></input>
                    Correct
                    </label>
                    </div>

                </div>
           
        </React.Fragment>
    );
}
