import React, { useState } from 'react';

import InputField from '../common/InputField';
import Logo from '../common/Logo';
import { createGame } from './gameSlice';
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
            dispatch(createGame(form.username));
        }
        e.preventDefault();
    }

    function handleChanges(e) {
        const { name, value, validationMessage } = e.target;

        let newForm = {
            ...form,
            [name]: value,
        };

        newForm.errors = { ...newForm.errors, [name]: validationMessage };
        setForm(newForm);
    }

    return (
        <div className="offset-bottom">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>

            <form className="flex-grid flex-column form fill-space" onSubmit={handleSubmit} noValidate>
                <div className="empty-space margin-bottom-5">
                    <InputField
                        placeholder="User Name"
                        id="username"
                        required
                        name="username"
                        autoComplete="off"
                        className="bordered-input line-hieght-medium"
                        onInvalid={handleChanges}
                        onChange={handleChanges}
                        labelClass="align-left typography-emphasize"
                        onBlur={handleChanges}
                        errorClassName="input-error-text shake"
                        errors={[(form.errors && form.errors.username) || ""]}>
                    </InputField>
                </div>

                <input
                    type="submit"
                    value="Create Game"
                    className="fill-space line-hieght-medium"
                />
            </form>
        </div>
    );
}

export default Create;
