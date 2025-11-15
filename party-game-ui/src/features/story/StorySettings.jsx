import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from './storySlice';
import { push } from "redux-first-history";
import Logo from '../common/Logo';

export default function StorySettings() {
    const dispatch = useDispatch();
    const settings  = useSelector(state => state.story.settings);
    const [form, setForm] = useState({ roundTime: settings.roundTime });    

    function handleChanges(e) {
        e.preventDefault();
        const { name, value, validationMessage } = e.target;
        
        let newForm = {
            ...form,
            [name]: parseInt(value, 10) || "",
            errors: { ...form.errors, [name]: validationMessage }
        };

        setForm(newForm);
    }

    function handleSubmit(e) {
        e.preventDefault();        
        if (!e.target.checkValidity()) {
            return;
        }

        dispatch(updateSettings({roundTime: form.roundTime}));        
        dispatch(push('/lobby'));
    }

    return (
        <div className="offset-bottom center-65">
            <Logo logoClass="small-logo bouncy" showSubtitle={false} titleClass="larger-title"></Logo>
            <div className="wrapper card flex-center">
                <form className='form' id='story-settings-form' onSubmit={handleSubmit} noValidate>
                    <h3>Settings</h3>
                    <div className="group">
                        <input
                            name="roundTime"
                            type="number"
                            min="5"
                            max="480"
                            step="5"
                            onChange={handleChanges}
                            value={form.roundTime}
                            id="roundTime"
                            required
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Round Time (seconds)</label>
                    </div>
                </form>
                 <div className="btn-box">
                <button id="Cancel" className="btn md-5" type="button" onClick={() => dispatch(push('/lobby'))}>Cancel</button>
                <button id="Save" className="btn btn-submit" type="submit" form="story-settings-form">Save</button>
            </div>
            </div>
           
        </div>
    );
}