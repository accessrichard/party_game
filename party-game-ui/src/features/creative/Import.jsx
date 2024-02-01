import React, { useEffect, useState } from 'react';
import { gameToForm, mergeErrors, removeUnwantedJson, validateQuestions } from './creative';

import Create from './Create';
import InputError from '../common/InputError';
import { gameValidators } from './gameValidator';
import { errors as initialErrors } from './game';
import { validate } from '../common/validator';

export default function Import(props) {

    const [game, setGame] = useState(props.game || "");
    const [errors, setErrors] = useState([]);
    const [gameForm, setGameForm] = useState(null);

    useEffect(() => setGame(props.game), [props.game]);

    function handleChange(e) {
        setGame(e.target.value);

        if (errors.length !== 0) {
            setErrors([]);
        }
    }

    function importGame() {
        try {
            if (!game || game.trim() === "") {
                setErrors(["Can't import empty game."]);
                return;
            }

            setErrors([]);

            const gameObj = JSON.parse(game);
            const gameErrors = validate(gameValidators(gameObj));
            const questionErrors = validateQuestions(gameObj);
            const merged = mergeErrors(gameErrors, questionErrors)

            setErrors(merged);

            const cleanGame = removeUnwantedJson(gameObj);
            setGame(JSON.stringify(cleanGame, null, 2));            
            setGameForm({ ...gameToForm(cleanGame), errors: { ...initialErrors } });
        } catch (err) {
            setErrors([err.message]);
        }
    }


    return (
        <>
            {!gameForm &&
                <div className='flex-grid center-65'>
                    <div className="flex-row flex-item">
                        <div className='item card'>
                            <div className="group">
                                <textarea required
                                    autoComplete="off"
                                    name="import-game"
                                    rows="15"
                                    cols="50"
                                    value={game}
                                    onChange={handleChange}
                                />
                                <span className="highlight"></span>
                                <span className="bar"></span>
                                <label>{props.text || "Paste your game here:"}</label>
                                <InputError className="error shake" errors={[errors || ""]} />
                                {false && <ul className="error shake">
                                    {errors.map((err, idx) => {
                                        return <li className="input-error-text red" key={idx}>{err}</li>
                                    })}
                                </ul>}
                            </div>

                            {!props.hideSubmit &&
                                <div className="btn-box">
                                    <button className="btn btn-submit" type="Import" onClick={importGame}>Import Game</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
            {gameForm && <Create game={gameForm}></Create>}
        </>
    );
}
