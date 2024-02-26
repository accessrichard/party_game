import React, { useState } from 'react';
import { clearJoinError, joinGame } from '../lobby/lobbySlice';
import { useDispatch, useSelector } from 'react-redux';

import InputError from '../common/InputError';
import Logo from '../common/Logo';
import { useParams } from "react-router-dom";

function Join() {
    let { id } = useParams();

    const dispatch = useDispatch();

    const gameCodeError = useSelector(state => state.lobby.api.join.error);    

    const [form, setForm] = useState({
        username: "",
        errors: {
            username: "",
            gameCode: ""
        },
        gameCode: (id || "").toUpperCase(),
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
            [name]: name === "gameCode" ? (value || "").toUpperCase() : value,
        };

        newForm.errors = { ...newForm.errors, [name]: validationMessage };
        setForm(newForm);

        if (gameCodeError) {
            dispatch(clearJoinError());
        }
    }

    return (
        <div className='flex-grid'>
            <div className='flex-item flex-row flex-center'>
                <div className='margin-15p landscape-hidden'>
                    <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="larger-title"></Logo>
                </div>
            </div>

            <div className='flex-row flex-item'>
                <div className="item card">

                    <h3>Join Game</h3>
                    <form className='form' onSubmit={handleSubmit}>
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
                            <InputError className="error shake" errors={[(gameCodeError && gameCodeError.player_name) || gameCodeError]} />
                            <InputError className="error shake" errors={[(form.errors && form.errors.username) || ""]} />

                        </div>
                        <div className="group">
                            <input
                                required
                                autoComplete="off"
                                name="gameCode"
                                onInvalid={handleChanges}
                                onChange={handleChanges}
                                onBlur={handleChanges}
                                value={form.gameCode}
                            />
                            <span className="highlight">
                            </span>
                            <span className="bar"></span>
                            <label>Game Code</label>
                            <InputError className="error shake" errors={[gameCodeError && gameCodeError.room_name]} />
                            <InputError className="error shake" errors={[(form.errors && form.errors.gameCode) || ""]} />
                        </div>
                        <div className="btn-box">
                            <button className="btn btn-submit" type="submit">Join Game</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Join;
