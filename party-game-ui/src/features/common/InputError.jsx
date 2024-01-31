import React from 'react';

export default function InputError(props) {
    const { errors, className } = props;

    function hasError() {
        return errors
            && Array.isArray(errors)
            && errors.length > 0
            && errors.filter((err) => err && err.length > 0).length > 0;
    }

    return (
        <React.Fragment>                
                {hasError() && <ul className={className || "medium-font input-error-text error-color shake"}>
                    {errors.map((err, idx) => {
                        return <li key={idx}>{err}</li>
                    })}
                </ul>}            
        </React.Fragment>
    );
}
