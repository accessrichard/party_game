import { useEffect, useRef, useState } from 'react';
import CreativeControls from '../../creative/CreativeControls';
import SelectGameType from '../../creative/SelectGameType';
import { useDispatch } from 'react-redux';
import { push } from 'redux-first-history';
import InputError from '../../common/InputError';
import { changeGame } from '../../lobby/lobbySlice';
import { createGame } from '../../creative/creativeSlice';
import {
    download,
    getGamesNames,
    getSessionGame,
    saveSessionStorage,
    toErrorObject,
    toFieldObject
} from '../../creative/creative';

const defaultState = {
    type: "alternate_sentence",
    name: "",
    text: "This is a [funny word] example story. [person or animal] went to the [place]. ",
    id: Date.now()
}

const isValidStory = (str) => {
    let x = 0;
    let hasAtLeastOneBracket = false;
    for (let char of str) {
        if (char === '[') {
            x++;
            hasAtLeastOneBracket = true;
        } else if (char === ']') {
            x--;
        }

        if (x > 1 || x < 0) {
            return false;
        }
    }

    return x === 0 && hasAtLeastOneBracket;
}

export default function StoryCreate({ game, initialState }) {
    const dispatch = useDispatch();
    const formRef = useRef(null);

    const [form, setForm] = useState({ ...defaultState, ...initialState });

    useEffect(() => {
        if (game) {
            setForm({ ...game, errors: defaultState.errors });
        }

    }, [game]);

    function handleChanges(e) {
        const input = toFieldObject(e);
        const error = toErrorObject(e);
        let newForm = { ...form, ...input };
        newForm.errors = { ...newForm.errors, ...error };

        setForm(newForm);
        if (e.type === 'invalid') {
            e.preventDefault();
        }
    }

    function toServerSideGame(f) {
        const game = JSON.parse(JSON.stringify(f));
        delete game.errors;
        return game;
    }

    function toGameMeta(game) {
        return {
            name: game.name,
            type: game.subType,
            url: '/story',
            location: "client",
            import: true,
            create: true,
            settings: true
        };
    }

    function handleEditGameClick(e, name) {
        e.preventDefault();
        const game = getSessionGame(name)        
        setForm(game);
    }

    function handleDownloadGame(e) {    
        e.preventDefault();
        if (!formRef.current.reportValidity() || !validate()) {
            return;
        }

        const serverSideGame = toServerSideGame(form);
        const downloadAbleGame = {...serverSideGame, type: 'story', subType: serverSideGame.type}; 
        dispatch(createGame({ game: serverSideGame, redirect: false }));
        download("Buzztastic Game " + form.name, JSON.stringify(downloadAbleGame, 2));
    }

    function validate() {
        if (!isValidStory(form.text)) {
            let newForm = { ...form };
            newForm.errors = { ...newForm.errors, "text": ["Must have at least one bracket: [ or ], and each opening bracket must have a following closing bracket."] };
            setForm(newForm);
            return false;
        }

        return true;
    }

    

    function handlePlayClick(e) {
        e.preventDefault();
        
        if (!formRef.current.reportValidity() || !validate()) {
            return;
        }

        const game = toServerSideGame(form);
        
        saveSessionStorage(game);
        const selectedGame = toGameMeta(game);
        
        dispatch(changeGame({ selectedGame: selectedGame }));
        dispatch(createGame({ game: { ...game, ...selectedGame }, redirect: true }));

    }

    function onSelectGameType(e) {
        dispatch(push(e.url + '/create'));
        setForm({ ...form, type: e.type });
    }
   return (
        <>
            <div className="wrapper center-65 flex-center flex-grid">
                <form className='form' ref={formRef}>

                    <div className="empty-space">
                        <div className="card">
                            <SelectGameType value={form.subType} onSelectGameType={onSelectGameType} />
                        </div>
                    </div>


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
                    <div className="empty-space" />

                    <div className="flex-row">
                        <div className="flex-column card pd-25">
                            <div className="group-compact">
                                <textarea
                                    required
                                    autoComplete="off"
                                    name="text"
                                    rows="15"
                                    cols="50"
                                    value={form.text}
                                    onInvalid={handleChanges}
                                    onChange={handleChanges}
                                    onBlur={handleChanges}
                                />
                                <span className="highlight"></span>
                                <span className="bar"></span>
                                <label>{"Type your story here. User brackets [] as placeholders. For example: We went to the [place] to ..."}</label>
                                <InputError className="error shake" errors={[(form.errors && form.errors.text) || ""]} />
                            </div>
                        </div>
                    </div>

                    <div className="empty-space" />

                    <CreativeControls
                        gameNames={getGamesNames(defaultState.type)}
                        onDownload={handleDownloadGame}
                        onPlay={handlePlayClick}
                        handleEditGameClick={handleEditGameClick}
                    />
                </form>
            </div>
        </>
    );
}
