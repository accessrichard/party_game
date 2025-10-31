import InputError from '../../common/InputError';
import { MULTIPLE_CHOICE } from '../../common/questionTypes';

export default function AnswerInput(props) {

    function handleChange(e) {
        props.onChange && props.onChange(e);
    }
    
    return (
        <>
            <div className="flex-row margin-bottom-30">
                <div className="flex-column md-5">
                    <div className="group-compact">
                        <input required
                            autoComplete="off"
                            name="answer1"
                            value={props.value.answer1}
                            onBlur={handleChange}
                            onInvalid={handleChange}
                            onChange={handleChange}
                            id={"answer1" + props.index}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Correct Answer</label>
                        <InputError className="error shake" errors={[props.errors.answer1]} />
                    </div>
                </div>
                <div className="flex-column md-5">
                    <div className="group-compact">
                        <input required
                            autoComplete="off"
                            name="answer2"
                            value={props.value.answer2}
                            onBlur={handleChange}
                            onInvalid={handleChange}
                            onChange={handleChange}
                            id={"answer2" + props.index}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Answer 2</label>
                        <InputError className="error shake" errors={[props.errors.answer2]} />
                    </div>
                </div>
            </div>
            <div className="flex-row margin-bottom-30">
                <div className="flex-column md-5">
                    <div className="group-compact">
                        <input
                            required={(props.value.type && props.value.type === MULTIPLE_CHOICE) || false}
                            autoComplete="off"
                            name="answer3"
                            value={props.value.answer3}
                            onBlur={handleChange}
                            onInvalid={handleChange}
                            onChange={handleChange}
                            id={"answer3" + props.index}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Answer 3</label>
                        <InputError className="error shake" errors={[props.errors.answer3]} />
                    </div>
                </div>
                <div className="flex-column md-5">
                    <div className="group-compact">
                        <input
                            required={(props.value.type && props.value.type === MULTIPLE_CHOICE) || false}
                            autoComplete="off"
                            name="answer4"
                            value={props.value.answer4}
                            onBlur={handleChange}
                            onInvalid={handleChange}
                            onChange={handleChange}
                            id={"answer4" + props.index}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Answer 4</label>
                        <InputError className="error shake" errors={[props.errors.answer4]} />
                    </div>
                </div>
            </div>
        </>
    );
}
