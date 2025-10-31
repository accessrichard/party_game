import { useState } from 'react';

export default function GuessInput({ onSubmit, maxLength = 500, className = "card flex-row md-5" }) {
    const [text, setText] = useState("");

    function onClick() {
        onSubmit && onSubmit(text);
        setText("")
    }

    return (
        <>
            <div className={className}>
                <form className='form-compact' noValidate onSubmit={(e) => e.preventDefault()}>
                    <div className="group-compact">
                        <input
                            required
                            autoComplete="off"
                            name="guess-input"
                            value={text}
                            maxLength={maxLength}
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
