import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Logo from '../common/Logo';
import { push } from "redux-first-history";
import { updateSettings } from './gameSlice';

function Settings() {

    const dispatch = useDispatch();
    const {settings }  = useSelector(state => state.game);
    const [form, setForm] = useState({ ...settings });    

    function handleSubmit(e) {
        if (e.target.reportValidity()) {           
           dispatch(updateSettings(form));
           dispatch(push("/lobby"));
        }
        e.preventDefault();
    }

    function onNumberChange(e) {
        e.preventDefault();
        const { name, value } = e.target;

        let newForm = {
            ...form,
            [name]: parseInt(value, 10),
        };

        setForm(newForm);
    }

    return (
        <div className="offset-bottom">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>

            <form className="medium-width" onSubmit={handleSubmit} noValidate>

                <div className="flex-row">
                    <div className="flex-column margin-bottom-5 flex-center">
                        <label htmlFor="rounds">Number Of Rounds:</label>
                        <input className="select select-height-tall bordered-input max-width" name="rounds" type="number" min="1" max="100" value={form.rounds} onChange={onNumberChange} />
                    </div>
                </div>

                <div className="flex-row">
                    <div className="flex-column margin-bottom-5 flex-center">
                        <label htmlFor="questionTime">Question Time (seconds):</label>
                        <input className="select select-height-tall bordered-input max-width" name="questionTime" type="number" min="1" max="60" value={form.questionTime} onChange={onNumberChange} />
                    </div>
                </div>

                <div className="flex-row">
                    <div className="flex-column margin-bottom-5 flex-center">
                        <label htmlFor="nextQuestionTime">Next Question Delay After Anwsered (seconds):</label>
                        <input className="select select-height-tall bordered-input max-width" name="nextQuestionTime" type="number" min="1" max="60" value={form.nextQuestionTime} onChange={onNumberChange} />
                    </div>
                </div>

                <div className="flex-row">
                    <div className="flex-column margin-bottom-5 flex-center">
                        <label htmlFor="wrongAnswerTimeout">Wrong Answer Delay (seconds):</label>
                        <input className="select select-height-tall bordered-input max-width" name="wrongAnswerTimeout" type="number" min="1" max="60" value={form.wrongAnswerTimeout} onChange={onNumberChange} />
                    </div>
                </div>

                <input
                    type="submit"
                    value="Save"
                    className="fill-space" />
            </form>
        </div>
    );
}

export default Settings;
