import React, { useEffect, useState } from 'react';
import { getFieldErrors, validate } from '../common/validator';
import { useDispatch, useSelector } from 'react-redux';

import Logo from '../common/Logo';
import { joinGame } from './gameSlice';
import { useParams } from "react-router-dom";

function Join() {
    let { id } = useParams();
    
    const dispatch = useDispatch();
    
    const gameCodeError = useSelector(state => state.game.api.join.error);
    
    const [form, setForm] = useState({
        username: "",
        usernameError: "",
        gameCode: id || "",
        gameCodeError: ""
    });

    useEffect(() => {
        if (gameCodeError) {
            setForm(prevState => ({
                ...prevState,
                gameCodeError: gameCodeError
            }));
        }
    }, [gameCodeError]);

    function handleSubmit() {
        const result = validate([
            {
                validators: ['required'],
                name: "User Name",
                field: "username",
                value: form.username
            },
            {
                validators: ['required'],
                name: "Game Code",
                field: "gameCode",
                value: form.gameCode
            }]);

        if (result.length) {
            const fieldNames = getFieldErrors(result);
            setForm(prevState => ({
                ...prevState,
                ...fieldNames
            }));
        } else {
            dispatch(joinGame({ username: form.username, gameCode: form.gameCode }));
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
                        <form noValidate onSubmit={(e) => e.preventDefault()}>
                            <input type="text"
                                required
                                autoComplete="off"
                                name="username"
                                placeholder="Name"
                                className={form.usernameError && "input-error"}
                                value={form.username}
                                onChange={handleChange} />
                            {form.usernameError && <div class="input-error-text shake">{form.usernameError}</div>}

                            <input type="text"
                                required
                                name="gameCode"
                                autoComplete="off"
                                className={form.gameCodeError && "input-error"}
                                placeholder="Game Code"
                                value={form.gameCode}
                                onChange={handleChange} />
                            {form.gameCodeError && <div class="input-error-text shake">{form.gameCodeError}</div>}
                            <input type="submit"
                                value="Join Game"
                                onClick={handleSubmit} />
                        </form>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Join;
