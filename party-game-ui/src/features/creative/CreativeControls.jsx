
import React, {  useState } from 'react';

export default function CreativeControls({gameNames = [], onAdd, onDownload, onPlay, onEditGameClick}) {
    const [editGameValue, setEditGameValue] = useState("");
    
    function onEditGameChange(e) {
        setEditGameValue(e.target.value);
    }

    return (
        <div className='card'>
            <div className="flex-row flex-center">
                <div className="btn-box pd-5">
                    <button className="btn btn-submit" type="submit" onClick={onAdd}>Add</button>
                </div>
                <div className="btn-box pd-5">
                    <button className="btn btn-submit" type="submit" onClick={onDownload}>Download Game</button>
                </div>
                <div className="btn-box pd-5">
                    <button className="btn btn-submit" type="submit" onClick={onPlay}>Play</button>
                </div>
            </div>
            <span>Games are not saved, however you can download and import them later on...</span>
            {gameNames.length > 0 &&
                <div className="flex-row">
                    <div className="group flex-inline-form-field">
                        <select
                            autoComplete="off"
                            name="edit-games"
                            onChange={onEditGameChange}
                            value={editGameValue}
                        >
                            {["", ...(gameNames || [])].map((val, idx) =>
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
                            onClick={(e) => onEditGameClick(e, editGameValue)}>
                            Edit Game
                        </button>
                    </div>
                </div>
            }
        </div>)
}