import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InputField from '../common/InputField';
import Logo from '../common/Logo';
import { joinGame } from './gameSlice';
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

    useEffect(() => {
        if (gameCodeError) {
            let newForm = { ...form };
            newForm.errors = { ...newForm.errors, "gameCode": gameCodeError };
            setForm(newForm);
        }
    }, [gameCodeError, form]);


    function handleSubmit(e) {
        if (e.target.reportValidity()) {
            dispatch(joinGame({ username: form.username, gameCode: form.gameCode }));
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
        console.log(newForm);
    };

    return (
        <div className="offset-bottom">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="small-title"></Logo>

            <form className="medium-width" onSubmit={handleSubmit} noValidate>
                <div className="flex-column margin-bottom-5">

                    <InputField
                        placeholder="User Name"
                        id="username"
                        required
                        name="username"
                        autoComplete="off"
                        className="bordered-input max-width line-hieght-medium"
                        onInvalid={handleChanges}
                        onChange={handleChanges}
                        labelClass="align-left typography-emphasize"
                        onBlur={handleChanges}
                        errorClassName="input-error-text shake"
                        value={form.username}
                        errors={[(form.errors && form.errors.username) || ""]}>
                    </InputField>
                </div>
                <div className="flex-column margin-bottom-5">

                    <InputField
                        placeholder="Game Code"
                        id="gameCode"
                        required
                        name="gameCode"
                        autoComplete="off"
                        className="bordered-input max-width line-hieght-medium "
                        onInvalid={handleChanges}
                        onChange={handleChanges}
                        labelClass="align-left typography-emphasize"
                        onBlur={handleChanges}
                        errorClassName="input-error-text shake"
                        value={form.gameCode}
                        errors={[(form.errors && form.errors.gameCode) || ""]}>
                    </InputField>
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
