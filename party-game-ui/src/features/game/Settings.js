import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Logo from '../common/Logo';
import { push } from "redux-first-history";
import { updateSettings } from './gameSlice';

function Settings() {

    const dispatch = useDispatch();
    const { settings } = useSelector(state => state.game);
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
            [name]: parseInt(value, 10) || ""
        };

        setForm(newForm);
    }

    return (
        <div className="offset-bottom center-65">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>
            <div className="wrapper card flex-center">
                <form onSubmit={handleSubmit} noValidate>
                    <h3>Settings</h3>
                    <div className="group">
                        <input required
                            autoComplete="off"
                            name="rounds"
                            type="number"
                            min="1"
                            max="100"
                            value={form.rounds}
                            onChange={onNumberChange}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Number Of Rounds:</label>
                    </div>
                    <div className="group">
                        <input required
                            autoComplete="off"
                            name="questionTime"
                            type="number"
                            min="1"
                            max="60"
                            value={form.questionTime}
                            onChange={onNumberChange}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Question Time (seconds):</label>
                    </div>
                    <div className="group">
                        <input required
                            autoComplete="off"
                            name="nextQuestionTime"
                            type="number"
                            min="1"
                            max="60"
                            value={form.nextQuestionTime}
                            onChange={onNumberChange}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Next Question Time (seconds):</label>
                    </div>
                    <div className="group">
                        <input required
                            autoComplete="off"
                            name="wrongAnswerTimeout"
                            type="number"
                            min="1"
                            max="60"
                            value={form.wrongAnswerTimeout}
                            onChange={onNumberChange}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Wrong Answer Timeout (seconds):</label>
                    </div>
                    <div className="btn-box">
                        <button className="btn btn-submit" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;
