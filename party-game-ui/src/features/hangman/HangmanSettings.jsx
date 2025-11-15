import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../common/Logo';
import { updateSettings } from './hangmanSlice';
import { push } from "redux-first-history";

function HangmanSettings() {

    const dispatch = useDispatch();
    const settings  = useSelector(state => state.hangman.settings);
    const [form, setForm] = useState({ ...settings, errors: { difficulty: "easy" } });

    function handleSubmit(e) {
        e.preventDefault();

        if (e.target.checkValidity()) {
            dispatch(updateSettings(form));
            dispatch(push("/lobby"));
        }
    }

    function onChange(e) {
        e.preventDefault();
        const { name, value, validationMessage } = e.target;
        let newForm = {
            ...form,
            [name]: value || "",
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
                    <div className="flex-row">
                        <div className="group flex-inline-form-field">
                            <select
                                autoComplete="off"
                                name="difficulty"
                                onChange={onChange}
                                value={form.difficulty}
                            >
                                <option value="easy">Easy - 14 Guessses</option>
                                <option value="hard">Hard - 10 Guesses</option>
                            </select>
                            <span className="highlight"></span>
                            <span className="bar"></span>
                            <label>Difficulty</label>
                        </div>
                    </div>

                    <div className="btn-box">
                        <button id="Cancel" className="btn md-5" type="button" onClick={() => dispatch(push('/lobby'))}>Cancel</button>
                        <button className="btn btn-submit" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default HangmanSettings;
