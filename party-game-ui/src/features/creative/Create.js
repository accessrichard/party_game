import { MULTIPLE_CHOICE, TRUE_FALSE } from '../common/questionTypes';
import React, { useEffect, useRef, useState } from 'react';
import { errors, game, question, questionErrors } from './game';

import InputField from '../common/InputField';
import QuestionForm from './QuestionForm';
import { changeGame } from '../game/gameSlice';
import { createGame } from './creativeSlice';
import { useDispatch } from 'react-redux';

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function removeIndexFromName(name) {
    if (name && name.indexOf("-!-") !== -1) {
        return name.substr(0, name.indexOf("-!-"));
    }

    return name;
}

function updateQuestion(newQuestion, field, defaultVal, index) {
    if (typeof newQuestion[index] === 'undefined') {
        newQuestion[index] = { ...defaultVal };
    }

    newQuestion[index] = { ...newQuestion[index], ...field };
}

function mapToTrueFalseQuestion(question) {
    question.answers = ["True", "False"];
    question.correct = (question.correct.toString() === "1" && "True") || "False";
}

function mapToMultipleChoiceQuestion(question) {
    question.correct = question["answer" + question.correct] || question.answer1;
    question.answers = Object.entries(question)
        .filter(([key, value]) => value !== ""
            && key.startsWith("answer"))
        .map(val => val[1]);
}

function toServerSideGame(form) {
    const exportForm = JSON.parse(JSON.stringify(form));
    delete exportForm.errors;

    exportForm.questions.forEach((q) => {
        if (q.type === TRUE_FALSE) {
            mapToTrueFalseQuestion(q);
        } else {
            mapToMultipleChoiceQuestion(q);
        }

        Object.keys(q).filter((key) => key.startsWith("answer") && key !== "answers")
            .forEach((key) => {
                delete q[key];
            });
    });

    return exportForm;
}

function toFieldObject(e) {
    var name = removeIndexFromName(e.target.name);
    const obj = {};
    obj[name] = e.target.value;
    return obj;
}

function toErrorObject(e) {
    var name = removeIndexFromName(e.target.name);
    const obj = {};
    obj[name] = e.target.validationMessage;
    return obj;
}

const defaultState = {
    ...{...game, questions: [question]},
    errors: errors
}

export default function Create(props) {

    const dispatch = useDispatch();
    const formRef = useRef(null);

    const [form, setForm] = useState(defaultState);

    useEffect(() => {
        if (props.game) {
            setForm(props.game);
        } else {
            setForm(defaultState);
        }
    }, [props.game]);


    function handleChanges(e, index) {
        let newForm = { ...form, ...{questions: [...form.questions]} };        
        if (index !== undefined) {
            updateQuestion(newForm.questions, toFieldObject(e), question, index);
            updateQuestion(newForm.errors.questions, toErrorObject(e), questionErrors, index);
        } else {
            newForm = { ...newForm, ...toFieldObject(e) };
            newForm.errors[e.target.name] = e.target.validationMessage;
        }

        setForm(newForm);
    }

    function addQuestion(e) {
        e.preventDefault();
        if (formRef.current.reportValidity()) {
            setForm({ ...form, questions: [...form.questions, question] });
        }
    }

    function removeQuestion(index) {
        let newForm = { ...form };
        newForm.questions.splice(index, 1);
        newForm.errors.questions.splice(index, 1);
        setForm(newForm);
    }  

    function downloadGame(e) {
        e.preventDefault();
        if (!formRef.current.reportValidity()) {
            return;
        }
        const serverSideGame = toServerSideGame(form);
        dispatch(createGame({ game: serverSideGame, redirect: false }));
        download("Buzztastic Game " + form.name, JSON.stringify(serverSideGame, 2));
    }

    function play(e) {
        e.preventDefault();
        if (!formRef.current.reportValidity()) {
            return;
        }
        const serverSideGame = toServerSideGame(form);        
        dispatch(changeGame(serverSideGame.name));
        dispatch(createGame({ game: serverSideGame, redirect: true }));
    }

    function getType(index) {
        return (form
            && form.questions
            && typeof form.questions[index] !== 'undefined'
            && form.questions[index].type)
            || MULTIPLE_CHOICE;
    }

    return (
        <React.Fragment>
            <form noValidate ref={formRef} className="flex-grid flex-column  md-5 form center-65">
                <div className="empty-space">
                    <div className="flex-row">
                        <div className="flex-column md-5">
                            <InputField
                                label="Game Name"
                                id="name"
                                required
                                name="name"
                                value={form.name}
                                onInvalid={handleChanges}
                                onChange={handleChanges}
                                onBlur={handleChanges}
                                errors={[(form.errors && form.errors.name) || ""]}>
                            </InputField>
                        </div>
                    </div>
                </div>
                {form.questions.map((elem, index) => (
                    <div key={index} className={index % 2 === 0 ? "empty-space list-odd" : "empty-space even list-even"}>
                        <QuestionForm
                            errors={form.errors}
                            index={index}
                            type={getType(index)}
                            value={form.questions[index]}
                            onInvalid={(e) => handleChanges(e, index)}
                            onBlur={(e) => handleChanges(e, index)}
                            onChange={(e) => handleChanges(e, index)}>
                        </QuestionForm>

                        {(index !== 0 && index === form.questions.length - 1) && <div className="flex-row">
                            <div className="flex-column md-5 flex-right small-font ">
                                <input type="submit" value={"Delete Question " + (index + 1)} onClick={() => removeQuestion(index)} />
                            </div>
                        </div>}

                    </div>
                ))}

                <div className="flex-row flex-center">
                    <input type="submit" className="bordered-input md-5" value="Add Question" onClick={addQuestion} />
                    <input type="submit" className="bordered-input md-5" value="Download Game" onClick={downloadGame} />
                    <input type="submit" className="bordered-input md-5" value="Play" onClick={play} />
                </div>
            </form>
        </React.Fragment>
    );
}
