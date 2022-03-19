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
        <div className='flex-grid'>

            <div className='flex-row flex-item flex-center'>
                <div className='margin-20p landscape-hidden'>
                    <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="larger-title"/>
                </div>
            </div>

            <div className='flex-row flex-item'>
                <div className="item card">
                    <h3>New Game</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="group">
                            <input required
                                autoComplete="off"
                                name="username"
                                onInvalid={handleChanges}
                                onChange={handleChanges}
                                onBlur={handleChanges}
                                value={form.username}
                            />
                            <span className="highlight"></span>
                            <span className="bar"></span>
                            <label>Name</label>
                            <InputError className="error shake" errors={[(form.errors && form.errors.username) || ""]} />
                        </div>
                        <div className="btn-box">
                            <button className="btn btn-submit" type="submit">New Game</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Create;
