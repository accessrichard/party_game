import React, { useState } from 'react';

export default function GuessInput({ onSubmit }) {
    const [text, setText] = useState("");

    function onKeyDown(e) {
        if (e.key === 'Enter' && text.trim() !== '') {
            onSubmit && onSubmit(text);
            setText("")
        }
    }

    function onClick() {
        onSubmit && onSubmit(text);
        setText("")
    }

    return (
        <>
            <div className='card flex-row'>
                <form className='form-compact' noValidate onSubmit={(e) => e.preventDefault()}>
                    <div className="group-compact">
                        <input
                            required
                            autoComplete="off"
                            name="guess-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}                            
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Enter your Guess</label>
                        <button className='btn-nostyle close' onClick={onClick}>&gt;</button>
                    </div>                    
                </form>
            </div>
        </>
    );
}
