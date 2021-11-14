import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InputError from '../common/InputError';
import Logo from '../common/Logo';
import { joinGame, clearJoinError } from './gameSlice';
import { useParams } from "react-router-dom";

function Join() {
    let { id } = useParams();

    const dispatch = useDispatch();

    const gameCodeError = useSelector(state => state.game.api.join.error);

    const [form, setForm] = useState({
        username: "",
        errors: {
            username: "",
            gameCode: ""
        },
        gameCode: id || "",
    });


    function handleSubmit(e) {
        if (e.target.reportValidity()) {
            dispatch(joinGame({ username: form.username, gameCode: form.gameCode }));
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

        newForm.errors = { ...newForm.errors, [name]: validationMessage, gameCode: "" };
        setForm(newForm);

        if (gameCodeError) {
            dispatch(clearJoinError());
        }
    };

    return (
        <div className="offset-bottom">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>

            <form className="medium-width" onSubmit={handleSubmit} noValidate>
                


                <div className="flex-column margin-bottom-5">
                    <label className="text-align-left typography-emphasize" htmlFor="username"></label>
                    <input
                        placeholder="User Name"
                        id="username"
                        required
                        name="username"
                        autoComplete="off"
                        className="bordered-input max-width line-hieght-medium"
                        onInvalid={handleChanges}
                        onChange={handleChanges}
                        onBlur={handleChanges}
                        value={form.username}
                    >
                    </input>
                    <InputError className="input-error-text shake" errors={[gameCodeError && gameCodeError.player_name]} />
                    <InputError className="input-error-text shake" errors={[(form.errors && form.errors.username) || ""]} />
                </div>
                <div className="flex-column margin-bottom-5">
                    <label className="text-align-left typography-emphasize" htmlFor="gameCode"></label>
                    <input
                        placeholder="Game Code"
                        id="gameCode"
                        required
                        name="gameCode"
                        autoComplete="off"
                        className="bordered-input max-width line-hieght-medium "
                        onInvalid={handleChanges}
                        onChange={handleChanges}
                        onBlur={handleChanges}
                        value={form.gameCode}
                    >
                    </input>
                    <InputError className="input-error-text shake" errors={[gameCodeError && gameCodeError.room_name]} />
                    <InputError className="input-error-text shake" errors={[(form.errors && form.errors.gameCode) || ""]} />

                </div>


                <input
                    type="submit"
                    value="Join Game"
                    className="fill-space" />

            </form>

        </div>
    );
}

export default Join;
