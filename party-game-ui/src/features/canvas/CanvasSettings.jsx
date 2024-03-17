import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InputError from '../common/InputError';
import Logo from '../common/Logo';
import { updateSettings } from './canvasSlice';

import { push } from "redux-first-history";

function CanvasSettings() {

    const dispatch = useDispatch();
    const { settings } = useSelector(state => state.canvas);
    const { type } = useSelector(state => state.lobby );

    const [form, setForm] = useState({...settings, errors: { roundTime: "", alternateRoundTime: ""} });

    function handleSubmit(e) {
        e.preventDefault();

        if (e.target.checkValidity()) {
            dispatch(updateSettings(form));
            dispatch(push("/lobby"));
        }
    }

    function onNumberChange(e) {
        e.preventDefault();
        const { name, value, validationMessage } = e.target;
        let newForm = {
            ...form,
            [name]: parseInt(value, 10) || "",
            errors: { ...form.errors, [name]: validationMessage }
        };

        setForm(newForm);
    }

    
    return (
        <div className="offset-bottom center-65">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="larger-title"></Logo>
            <div className="wrapper card flex-center">
                <form className='form' onSubmit={handleSubmit} noValidate>
                    <h3>Settings</h3>
                    <div className="group">
                        <input required
                            autoComplete="off"
                            name={type == "canvas" ? "roundTime" : "alternateRoundTime"}
                            type="number"
                            min="5"
                            max="120"
                            value={type == "canvas" ? form.roundTime : form.alternateRoundTime}
                            onChange={onNumberChange}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Round Time In Seconds:</label>
                        <InputError className="error shake" errors={[form.errors.roundTime]} />

                    </div>   
                    <div className="btn-box">
                        <button className="btn btn-submit" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CanvasSettings;
