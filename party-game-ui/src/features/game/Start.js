import React, { useState } from 'react';

import InputError from '../common/InputError';
import Logo from '../common/Logo';
import { startNewGame } from './gameSlice';
import { useDispatch } from 'react-redux';

function Create() {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        username: "",
        errors: {
            username: ""
        }
    });

    function handleSubmit(e) {
        if (e.target.reportValidity()) {
            dispatch(startNewGame(form.username));
        }
        e.preventDefault();
    }

    function handleChanges(e) {
        e.preventDefault();
        const { name, value, validationMessage } = e.target;

        let newForm = {
            ...form,
            [name]: value,
        };

        newForm.errors = { ...newForm.errors, [name]: validationMessage };
        setForm(newForm);
    }

    return (
        <div className="offset-bottom  center-screen">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>

            <form className="flex-grid flex-column form fill-space" onSubmit={handleSubmit} noValidate>

                <div className="margin-bottom-5">
                    <label className="text-align-left typography-emphasize" htmlFor="username">User Name</label>
                    <input
                        type="text"
                        placeholder="User Name"
                        id="username"
                        required
                        name="username"
                        autoComplete="off"
                        className="bordered-input max-width line-hieght-medium "
                        onInvalid={handleChanges}
                        onChange={handleChanges}

                        onBlur={handleChanges}
                    />
                    <InputError className="input-error-text shake" errors={[(form.errors && form.errors.username) || ""]} />
                </div>

                <input
                    type="submit"
                    value="Start Game"
                    className="fill-space line-hieght-medium"
                />
            </form>
        </div>
    );
}

export default Create;
