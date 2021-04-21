import React, { useState } from 'react';
import { getFieldErrors, validate } from '../common/validator';

import Logo from '../common/Logo';
import { createGame } from './gameSlice';
import { useDispatch } from 'react-redux';

function Create() {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        username: "",
        usernameError: ""
    });

    function handleSubmit() {
        const result = validate([
            {
                validators: ['required'],
                name: "User Name",
                field: "username",
                value: form.username
            }]);

        if (result.length === 0) {
            dispatch(createGame(form.username));
        } else {
            const fieldNames = getFieldErrors(result);
            setForm(prevState => ({
                ...prevState,
                ...fieldNames
            }));
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;


        setForm(prevState => ({
            ...prevState,
            [name]: value,
            [name + 'Error']: ''
        }));
    };


    return (
        <div className="App">
            <header className="app-header">
                <div className="offset-bottom">
                    <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>

                    <div className="form">
                        <form onSubmit={(e) => e.preventDefault()} noValidate>
                            <input
                                type="text"
                                required
                                autoComplete="off"
                                className={form.usernameError && "input-error"}
                                placeholder="Name"
                                value={form.username}
                                name="username"
                                onChange={handleChange} />
                            {form.usernameError && <div class="input-error-text shake">{form.usernameError}</div>}
                            <input
                                type="submit"
                                value="Create Game"
                                onClick={handleSubmit} />
                        </form>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Create;
