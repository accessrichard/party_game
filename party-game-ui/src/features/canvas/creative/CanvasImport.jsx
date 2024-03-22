import React, { useEffect, useState } from 'react';
import CanvasCreate from './CanvasCreate';
import InputError from '../../common/InputError';
import { gameValidators } from './gameValidator';
import { validate, getErrors } from '../../common/validator';

const initialErrors = {
    words: "",
    name: "",
    type: ""
}

export default function CanvasImport(props) {

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
            const validations = getErrors(gameErrors).map(x => x.error);
            setErrors(validations);

            if (validations.length > 0) {
                return;
            }

            setGame(JSON.stringify(gameObj, null, 2));            
            setGameForm({ ...gameObj, errors: { ...initialErrors } });
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
                                <InputError className="error shake" errors={errors || [""]} />
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
            {gameForm && <CanvasCreate game={gameForm}/>}
        </>
    );
}
