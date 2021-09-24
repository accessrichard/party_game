import React from 'react';

export default function InputField(props) {
    const { id, label, name, errors } = props;

    function onChange(e) {
        props.onChange && props.onChange(e);
        e.preventDefault();
    }

    function onBlur(e) {
        const obj = {};
        obj[name] = e.target.value;
        props.onBlur && props.onBlur(e);
        e.preventDefault();
    }

    function onInvalid(e) {
        props.onInvalid && props.onInvalid(e);
        e.preventDefault();
    }

    function hasError() {
        return errors
            && Array.isArray(errors)
            && errors.length > 0
            && errors.filter((err) => err && err.length > 0).length > 0;
    }

    return (
        <React.Fragment>
            
                {props.label && <label className={props.labelClass || "align-left header-bolder lighter-label"}
                    htmlFor={id}>{label}
                </label>}
                <input
                    type={props.type || "text"}
                    id={id}
                    required={props.required || false}
                    name={name}
                    disabled={props.disabled || ""}
                    placeholder={props.placeholder || ""}
                    autoComplete={props.autoComplete || "off"}
                    className={props.className || "bordered-input"}                    
                    onChange={onChange}
                    onInvalid={onInvalid}
                    value={props.value}
                    onBlur={onBlur}>                    
                </input>
                
                {hasError() && <ul className={props.errorClassName || "small-font input-error-text error-color shake"}>
                    {errors.map((err, idx) => {
                        return <li key={idx}>{err}</li>
                    })}
                </ul>}            
        </React.Fragment>
    );
}
