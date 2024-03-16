import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { push } from "redux-first-history";
import { updateSettings } from './multipleChoiceSlice';

function Settings() {

    const dispatch = useDispatch();
    const { settings } = useSelector(state => state.canvas);
    const [form, setForm] = useState({
        ...settings, errors: {           
            isNewGamePrompt: true
        }
    });

    function handleSubmit(e) {
        e.preventDefault();

        if (e.target.checkValidity()) {
            dispatch(updateSettings(form));
            dispatch(push("/lobby"));
        }
    }
    
    return (
        <div className="offset-bottom center-65">
   
        </div>
    );
}

export default Settings;
