import React, { useEffect, useRef, useState } from 'react';
import {
    addDefaultFormErrors,
    download,
    gameToForm,
    getGamesNames,
    getSessionGame,
    saveSessionStorage,
    toErrorObject,
    toFieldObject,
    toServerSideGame,
    updateQuestion
} from './creative';
import { errors, game, question, questionErrors } from './game';
import { useDispatch, useSelector } from 'react-redux';

import InputError from '../common/InputError';
import { MULTIPLE_CHOICE } from '../common/questionTypes';
import QuestionForm from './QuestionForm';
import { changeGame } from '../lobby/lobbySlice';
import { channelPush } from '../phoenix/phoenixMiddleware';
import { createGame } from './creativeSlice';

const defaultState = {
    ...{ ...game, questions: [question] },
    errors: errors,
    id: Date.now()
}

export default function Create(props) {
    const { game } = props;
    const dispatch = useDispatch();
    const formRef = useRef(null);

    const [form, setForm] = useState(defaultState);
    const [isGenServerDebounced, setIsGenServerDebounced] = useState(false);
    const [editGameValue, setEditGameValue] = useState("");
    const gameCode = useSelector(state => state.multipleChoice.gameCode);
    const gameChannel = `game:${gameCode}`;

    useEffect(() => {
        if (game) {
            setForm(addDefaultFormErrors(game));
        } else {
            setForm(defaultState);
        }
    }, [game]);

    function handleChanges(e, index) {
        let newForm = { ...form, ...{ questions: [...form.questions] } };
        if (index !== undefined) {
            updateQuestion(newForm.questions, toFieldObject(e), question, index);
            updateQuestion(newForm.errors.questions, toErrorObject(e), questionErrors, index);
        } else {
            newForm = { ...newForm, ...toFieldObject(e) };
            newForm.errors[e.target.name] = e.target.validationMessage;
        }

        setForm(newForm);

        if (e.type === 'invalid') {
            e.preventDefault();
        }

        if (!isGenServerDebounced) {
            setIsGenServerDebounced(true);    
        }
    }

    function onEditGameChange(e) {
        setEditGameValue(e.target.value);
    }

    function onEditGameClick(e) {
        e.preventDefault();
        setForm(gameToForm(getSessionGame(editGameValue)));
    }

    useEffect(() => {
        if (!isGenServerDebounced) {
            return;
        }

        var timer = setTimeout(() => {
            dispatch(channelPush({
                topic: gameChannel,
                event: 'ping'
            }));

            setIsGenServerDebounced(false);
        }, 1000 * 30);

        return () => clearTimeout(timer);
    }, [isGenServerDebounced, dispatch, gameChannel]);

    function addQuestion(e) {
        if (formRef.current.reportValidity()) {
            saveSessionStorage(form);
            setForm({ ...form, questions: [...form.questions, question] });
        }

        e.preventDefault();
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

        saveSessionStorage(form);
        const serverSideGame = toServerSideGame(form);
        dispatch(changeGame({ name: serverSideGame.name, url: serverSideGame.url, settingsSlug: serverSideGame.options && serverSideGame.options.settingsSlug }));
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
        <>
            <div className="wrapper center-65 flex-center flex-grid">
                <form className='form' ref={formRef}>
                    <div className="empty-space">
                        <div className="flex-row">
                            <div className="flex-column card pd-25">
                                <div className="group-compact">
                                    <input required
                                        autoComplete="off"
                                        name="name"
                                        onInvalid={handleChanges}
                                        onChange={handleChanges}
                                        onBlur={handleChanges}
                                        value={form.name}
                                    />
                                    <span className="highlight"></span>
                                    <span className="bar"></span>
                                    <label>Game Name</label>
                                    <InputError className="error shake" errors={[(form.errors && form.errors.name) || ""]} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {form.questions.map((elem, index) => (
                        <div key={index} className="card  margin-bottom-30 pd-25">
                            {(index > 0 || (index === 0 && form.questions.length > 1)) &&
                                <button className="btn-nostyle close" onClick={() => removeQuestion(index)}>&times;</button>
                            }
                            <QuestionForm
                                errors={form.errors}
                                index={index}
                                type={getType(index)}
                                value={form.questions[index]}
                                onInvalid={(e) => handleChanges(e, index)}
                                onBlur={(e) => handleChanges(e, index)}
                                onChange={(e) => handleChanges(e, index)}>
                            </QuestionForm>
                        </div>
                    ))}

                    <div className='card'>
                        <div className="flex-row flex-center">
                            <div className="btn-box pd-5">
                                <button className="btn btn-submit" type="submit" onClick={addQuestion}>Add Question</button>
                            </div>
                            <div className="btn-box pd-5">
                                <button className="btn btn-submit" type="submit" onClick={downloadGame}>Download Game</button>
                            </div>
                            <div className="btn-box pd-5">
                                <button className="btn btn-submit" type="submit" onClick={play}>Play</button>
                            </div>
                        </div>
                        <span>Games are not saved, however you can download and import them later on...</span>
                        {getGamesNames().length > 0 &&
                            <div className="flex-row">
                                <div className="group flex-inline-form-field">
                                    <select
                                        autoComplete="off"
                                        name="edit-games"
                                        onChange={onEditGameChange}
                                        value={editGameValue}
                                    >
                                        {["", ...(getGamesNames() || [])].map((val, idx) =>
                                            <option key={idx} value={val}>{val}</option>
                                        )}
                                    </select>
                                    <span className="highlight"></span>
                                    <span className="bar"></span>
                                    <label>Edit Game From Session</label>
                                </div>
                                <div className="pd-5-lr flex-inline-form-button">
                                    <button
                                        className="btn btn-submit"
                                        disabled={editGameValue === ''}
                                        type="submit"
                                        onClick={onEditGameClick}>
                                        Edit Game
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </form>
            </div>
        </>
    );
}
