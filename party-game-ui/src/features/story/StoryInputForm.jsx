import InputError from '../common/InputError';


export default function StoryInput(props) {
    const { inputs, handleChanges, handleSubmit, formId = "story-form"} = props;

    return (
        <form id={formId} className='form' onSubmit={handleSubmit} noValidate>
            {inputs.map((x) => {

                if (x.type === "text") {
                    return <span key={x.id}>{x.value}</span>
                } else if (x.type === "input") {
                    return <span key={"span-" + x.id} className='inline-flex group'>
                        <input
                            autoComplete='off'
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