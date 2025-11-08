import { useState } from 'react';
import {
    toFieldObject
} from '../creative/creative';
import InputError from '../common/InputError';

const story = [
    { type: "string", value: "once upon a time in a", errors: [], id: 1 },
    { type: "text", value: "", errors: [], id: 2 },
    { type: "string", value: " far far away. A man wearing a ", errors: [], id: 3 },
    { type: "text", value: "", errors: [], id: 4 },
    { type: "string", value: " strolled down the street. The man went into a ", errors: [], id: 5 },
    { type: "text", value: "", errors: [], id: 6 },
    { type: "string", value: " and bought a brand new ", errors: [], id: 7 },
    { type: "text", value: "", errors: [], id: 8 },
]

const defaultForm = {
    name: "",
    inputs: story,
    id: Date.now(),
    type: "Story"
}

export default function StoryGame() {

    const [form, setForm] = useState(defaultForm);
    function handleChanges(e, id) {
        const input = toFieldObject(e);
        const oldInput = form.inputs.filter(x => x.id === id);

        if (oldInput.length === 1) {
            const newInput = { ...oldInput[0], ...input, ...{ errors: [e.target.validationMessage] } };
            const newForm = { ...form, inputs: form.inputs.map(item => item.id === id ? newInput : item) };
            setForm(newForm)
        }

        if (e.type === 'invalid') {
            e.preventDefault();
        }
    }

    return (
        <>

            <h3>Story Time</h3>
            <div className='center-65'>

                {form.inputs.map((x) => {
                    if (x.type === "string") {
                        return <span key={x.id}>{x.value}</span>
                    } else if (x.type === "text") {
                        return <span className='inline-flex'>
                            <input
                                required
                                name="value"
                                key={x.id}
                                type='text'
                                onInvalid={(e) => handleChanges(e, x.id)}
                                onChange={(e) => handleChanges(e, x.id)}
                                onBlur={(e) => handleChanges(e, x.id)}
                                value={x.value}
                                id={"value" + x.id}
                            />
                            <span class="message">
                                <InputError key={'error' + x.id} className="error shake" errors={x.errors} />
                            </span>
                        </span>
                    }
                })}
            </div>
        </>
    )
}