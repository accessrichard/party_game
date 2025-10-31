import { useState } from 'react';
import InputError from '../common/InputError';
import SelectGameType from '../creative/SelectGameType';
import { getGameFromPath } from '../lobby/games';
import { useDispatch } from 'react-redux';
import { push } from 'redux-first-history';

export default function ImportGame({ text, hideSubmit, onImportGame, form = null, json = "" }) {
    const [game, setGame] = useState(json);

    const dispatch = useDispatch();

    function handleChange(e) {
        setGame(e.target.value);
    }

    function importGame() {
        onImportGame && onImportGame(game)
    }

    function onSelectGameType(e) {
        dispatch(push(e.url + '/import'))
    }

    return (
        <>
            <div className='flex-grid center-65'>
                <div className="flex-row flex-item">
                    <div className="flex-row">
                        <div className='item card'>
                            <SelectGameType value={getGameFromPath().type} onSelectGameType={onSelectGameType} />
                        </div>
                    </div>
                    <div className="flex-row flex-item"></div>
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
                            <label>{text || "Paste your game here:"}</label>
                            <InputError className="error shake" errors={form && form.errors || [""]} />                           
                        </div>

                        {!hideSubmit &&
                            <div className="btn-box">
                                <button className="btn btn-submit" type="Import" onClick={importGame}>Import Game</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
