import InputError from '../common/InputError';


export default function StoryInputAltForm(props) {
    const { inputs, handleChanges, handleSubmit, editableTokens, playerName, turn, formId = "story-form" } = props;
    return (
        <form id={formId} className='form highlight' onSubmit={handleSubmit} noValidate >
            {inputs.map((x) => {

                if (x.type === "text") {
                    return <span key={x.id}>{x.value}</span>
                } else if (!editableTokens.includes(x.id) && x.updated_by == playerName) {
                    return <span key={x.id} className='bolder'>{x.value}</span>
                } else if (!editableTokens.includes(x.id) && x.updated_by != playerName) {
                    return <span key={x.id} className='bolder'>{x.value == '' ? '__________' : ' ******* '}</span>
                } else if (turn == playerName) {
                    return <span key={"span-" + x.id} className='inline-flex group'>
                        <input
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