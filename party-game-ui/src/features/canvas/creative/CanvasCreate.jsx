import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InputError from '../../common/InputError';
import { changeGame } from '../../lobby/lobbySlice';
import { channelPush } from '../../phoenix/phoenixMiddleware';
import { createGame } from '../../creative/creativeSlice';
import {
    addDefaultFormErrors,
    download,
    getGamesNames,
    getSessionGame,
    saveSessionStorage,
    toErrorObject,
    toFieldObject
} from '../../creative/creative';

const defaultState = {
    name: "",
    words: [""],
    id: Date.now(),
    type: "canvas",
    errors: { words: [], name: "" }
}

export default function MultipleChoiceCreate() {
    const dispatch = useDispatch();
    const formRef = useRef(null);

    const [form, setForm] = useState(defaultState);
    const gameCode = useSelector(state => state.lobby.gameCode);
    const [editGameValue, setEditGameValue] = useState("");

    useEffect(() => {
        setForm(defaultState);
    }, []);

    function handleChanges(e, index) {
        const input = toFieldObject(e);
        const error = toErrorObject(e);
        let newForm = { ...form };
        console.log({input, error, index, newForm, i: newForm.words[index]});

        
        if (index !== undefined && newForm.words.length > index) {
            newForm.words[index] = input.word;
            newForm.errors.words[index] = error.word;
        } else if (index !== undefined) {
            newForm.words.push(input.word)
            newForm.errors.words.push(error.word);

        } else {
            newForm = { ...newForm, ...input};
            newForm.errors = {...newForm.errors, ...error};
        }
        setForm(newForm);
        if (e.type === 'invalid') {
            e.preventDefault();
        }
    }

    function removeWord(e, index) {
        e.preventDefault();
        const newForm = {...form};
        newForm.words.splice(index, 1);
        newForm.errors.words.splice(index, 1);
        setForm(newForm);
        const game = toServerSideGame(newForm)
        saveSessionStorage(game);
    }

    function toServerSideGame(f) {
        const game = JSON.parse(JSON.stringify(f));
        delete game.errors;
        return game;
    }

    function addWord(e) {
        if (formRef.current.reportValidity()) {
            const game = toServerSideGame(form)
            saveSessionStorage(game);
            const newForm = {...form};
            newForm.words.push("");
            setForm(newForm);
        }
        
        e.preventDefault();
    }

    function onEditGameChange(e) {
        setEditGameValue(e.target.value);
    }

    function onEditGameClick(e) {
        e.preventDefault();
        const game = getSessionGame(editGameValue)
        game.errors.words = [...Array(game.words.length).keys()].map(x => "")
        setForm(game);
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

        const game = toServerSideGame(form);
        saveSessionStorage(game);
        dispatch(changeGame({ name: game.name, type: game.type }));
        dispatch(createGame({ game: game, redirect: true }));
    }

    /// Remove as dup
    function hasError(field, index) {
        return form.errors && form.errors[field]
            && typeof form.errors[field][index] !== 'undefined';
    }

    /// Remove as dup
    function getError(field, index) {
        if (hasError(field, index)) {            
            return form.errors.words[index];
        }

        return "";
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
                    {form.words.map((elem, index) => (
                        <div key={index} className="card margin-bottom-30 pd-25">
                            {(index > 0 || (index === 0 && form.words.length > 1)) &&
                                <button className="btn-nostyle close" onClick={(e) => removeWord(e, index)}>&times;</button>
                            }

                            <div className="flex-row">
                                <div className="flex-column md-5">
                                    <div className='group-compact'>
                                        <input required
                                            autoComplete="off"
                                            name="word"
                                            onInvalid={(e) => handleChanges(e, index)}
                                            onChange={(e) => handleChanges(e, index)}
                                            onBlur={(e) => handleChanges(e, index)}
                                            value={form.words[index]}
                                            id={"word" + index}
                                        />
                                        <span className="highlight"></span>
                                        <span className="bar"></span>
                                        <label>{"Word " + (index + 1)}</label>
                                        <InputError className="error shake" errors={[getError("words", index)]} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className='card'>
                        <div className="flex-row flex-center">
                            <div className="btn-box pd-5">
                                <button className="btn btn-submit" type="submit" onClick={addWord}>Add Word</button>
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
