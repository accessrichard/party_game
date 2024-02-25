import React, { useState } from 'react';

export default function GuessInput(props) {
    const [text, setText] = useState("");
    function onChange(e) {
        setText(e.target.value);
    }

    function onKeyDown(e) {
        if (e.key === 'Enter' && text.trim() !== '') {
            props.onSubmit && props.onSubmit(text);
            setText("")
        }
    }

    return (
        <>
            <div className='item card'>
                <form noValidate onSubmit={(e) => e.preventDefault()}>
                    <div className="group">
                        <input
                            autoComplete="off"
                            name="guess-input"
                            value={text}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>Guess the Drawing</label>
                    </div>
                </form>
            </div>
        </>
    );
}
