import { useEffect, useRef, useState } from 'react';
import CreativeControls from '../../creative/CreativeControls';
import {
    gameToForm,
    toServerSideGame,
    updateQuestion
} from './creative';
import {
    addDefaultFormErrors,
    download,
    getGamesNames,
    getSessionGame,
    saveSessionStorage,
    toErrorObject,
    toFieldObject
} from '../../creative/creative';
import { errors, game, question, questionErrors } from './game';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'redux-first-history';
import InputError from '../../common/InputError';
import { MULTIPLE_CHOICE } from '../../common/questionTypes';
import SelectGameType from '../../creative/SelectGameType';

import QuestionForm from './QuestionForm';
import { changeGame } from '../../lobby/lobbySlice';
import { channelPush } from '../../phoenix/phoenixMiddleware';
import { createGame } from '../../creative/creativeSlice';

const defaultState = {
    ...{ ...game, questions: [question] },
    errors: errors,
    id: Date.now()
}

export default function MultipleChoiceCreate(props) {
    const { game } = props;
    const dispatch = useDispatch();
    const formRef = useRef(null);

    const [form, setForm] = useState(defaultState);
    const [isGenServerDebounced, setIsGenServerDebounced] = useState(false);
    const { gameCode, selectedGame } = useSelector(state => state.lobby);
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

    function onEditGameClick(e, name) {
        e.preventDefault();
        setForm(gameToForm(getSessionGame(name)));
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

    function onAddQuestion(e) {
        if (formRef.current.reportValidity()) {
            const game = toServerSideGame(form);
            saveSessionStorage(game);
            setForm({ ...form, questions: [...form.questions, question] });
        }

        e.preventDefault();
    }

    function removeQuestion(index) {
        let newForm = { ...form };
        newForm.questions.splice(index, 1);
        newForm.errors.questions.splice(index, 1);
        setForm(newForm);
        const game = toServerSideGame(newForm);
        saveSessionStorage(game);
    }

    function onDownloadGame(e) {
        e.preventDefault();
        if (!formRef.current.reportValidity()) {
            return;
        }
        const serverSideGame = toServerSideGame(form);
        dispatch(createGame({ game: serverSideGame, redirect: false }));
        download("Buzztastic Game " + form.name, JSON.stringify(serverSideGame, 2));
    }

    function onPlay(e) {
        e.preventDefault();
        if (!formRef.current.reportValidity()) {
            return;
        }

        const serverSideGame = toServerSideGame(form);
        saveSessionStorage(serverSideGame);

        const gameMeta = {
            name: serverSideGame.name, 
            type: "multiple_choice", 
            url: "/multiple_choice",
            location: "client",
            import: true,
            create: true,
            settings: true
        };

        dispatch(changeGame({ selectedGame: gameMeta }));
        dispatch(createGame({ game: serverSideGame, redirect: true }));
    }

    function getType(index) {
        return (form
            && form.questions
            && typeof form.questions[index] !== 'undefined'
            && form.questions[index].type)
            || MULTIPLE_CHOICE;
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
                            <SelectGameType value="multiple_choice" onSelectGameType={onSelectGameType} />
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
                    {form.questions.map((elem, index) => (
                        <div key={index} className="card margin-bottom-30 pd-25">
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
                    <CreativeControls
                        gameNames={getGamesNames(selectedGame.type)}
                        onAdd={onAddQuestion}
                        onDownload={onDownloadGame}
                        onPlay={onPlay}
                        onEditGameClick={onEditGameClick}
                    />
                </form>
            </div>
        </>
    );
}
