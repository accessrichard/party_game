import InputError from '../common/InputError';
import { useEffect, useRef } from 'react';


export default function StoryInputAltForm(props) {
    const { inputs, handleChanges, handleSubmit, editableTokens, playerName, turn, formId = "story-form" } = props;
    const firstEditableInputRef = useRef(null);

    useEffect(() => {
        if (firstEditableInputRef.current) {
            firstEditableInputRef.current.focus();
        }

    }, [editableTokens]);

    return (
        <form id={formId} className='form highlight' onSubmit={handleSubmit} noValidate>
            {inputs.map((x) => {

                if (x.type === "text") {
                    return <span key={x.id}>{x.value}</span>
                } else if (!editableTokens.includes(x.id) && x.updated_by == playerName) {
                    return <span key={x.id} className='bolder'>{x.value}</span>
                } else if (!editableTokens.includes(x.id) && x.updated_by != playerName
                    || editableTokens.includes(x.id) && turn != playerName) {
                    return <span key={x.id} className='bolder'>{x.value == '' ? '__________' : ' ******* '}</span>
                } else if (turn == playerName) {
                    return <span key={"span-" + x.id} className='inline-flex group'>
                        <input
                            autoComplete='off'
                            ref={editableTokens && editableTokens[0] === x.id ? firstEditableInputRef : null}
                            required
                            name="value"
                            key={"input-" + x.id}
                            type='text'
                            onInvalid={(e) => handleChanges(e, x.id)}
                            onChange={(e) => handleChanges(e, x.id)}
                            onBlur={(e) => handleChanges(e, x.id)}
                            value={x.value}
                            id={"value" + x.id}
                        />
                        <span className="highlight"></span>
                        <span className="bar"></span>
                        <label>{x.placeholder}</label>
                        <span className="message">
                            <InputError key={"error-" + x.id} className="error shake" errors={x.errors} />
                        </span>
                    </span>
                }
            })}
        </form>
    )
}