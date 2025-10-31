import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import CreativeControls from './CreativeControls';
import SelectGameType from './SelectGameType';
import { getGameFromPath } from '../lobby/games';
import { push } from 'redux-first-history';
import InputError from '../common/InputError';
import { changeGame } from '../lobby/lobbySlice';
import { createGame } from './creativeSlice';
import {
    download,
    getGamesNames,
    getSessionGame,
    saveSessionStorage,
    toErrorObject,
    toFieldObject,
    getError
} from './creative';

export default function OneWordCreate({ game, defaultState }) {
    const dispatch = useDispatch();
    const formRef = useRef(null);
    const [form, setForm] = useState({ ...defaultState });


    useEffect(() => {
        if (game) {
            setForm({ ...game, errors: defaultState.errors });
        } else {
            setForm({ ...defaultState, ...{ words: [""] } });
        }

    }, [game]);

    function handleChanges(e, index) {
        const input = toFieldObject(e);
        const error = toErrorObject(e);
        let newForm = { ...form };

        if (index !== undefined && newForm.words.length > index) {
            newForm.words[index] = input.word;
            newForm.errors.words[index] = error.word;
        } else if (index !== undefined) {
            newForm.words.push(input.word)
            newForm.errors.words.push(error.word);

        } else {
            newForm = { ...newForm, ...input };
            newForm.errors = { ...newForm.errors, ...error };
        }
        setForm(newForm);
        if (e.type === 'invalid') {
            e.preventDefault();
        }
    }

    function removeWord(e, index) {
        e.preventDefault();
        const newForm = { ...form };
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
            const newForm = { ...form };
            newForm.words.push("");
            setForm(newForm);
        }

        e.preventDefault();
    }

    function onEditGameClick(e, name) {
        e.preventDefault();
        const game = getSessionGame(name)
        game.errors.words = [...Array(game.words.length).keys()].map(() => "")
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
        dispatch(changeGame({ name: game.name, type: getGameFromPath().type }));
        dispatch(createGame({ game: game, redirect: true }));
    }

    function onSelectGameType(e) {
        dispatch(push(e.url + '/create'))
    }

    return (
        <>
            <div className="wrapper center-65 flex-center flex-grid">
                <form className='form' ref={formRef}>

                    <div className="empty-space">
                        <div className="card">
                            <SelectGameType value={getGameFromPath().type} onSelectGameType={onSelectGameType} />
                        </div>
                    </div>

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
                                        <InputError className="error shake" errors={[getError(form.errors, "words", index)]} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <CreativeControls
                        gameNames={getGamesNames(getGameFromPath().type)}
                        onAdd={addWord}
                        onDownload={downloadGame}
                        onPlay={play}
                        onEditGameClick={onEditGameClick}
                    />
                </form>
            </div>
        </>
    );
}
