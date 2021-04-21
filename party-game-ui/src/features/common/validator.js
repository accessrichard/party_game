function _required(value) {
    return typeof (value) === 'undefined' || value === null || value === '';
}

/**
 * e.g.
 * [{ validators: ['required'], field: "username", value: "", name: "User Name"},
*   { validators: ['required'], field: "code", value: "", name: "Code"}]
 */
export function validate(validations) {
    var errors = []
    validations.forEach(validation => {

        validation.validators.forEach(v => {
            if (v === 'required' && _required(validation.value)) {
                errors.push({
                    field: validation.field,
                    error: `${validation.name} is required.`,
                    isValid: false,
                    name: validation.name || validation.field
                });
            }
        });
    });

    return errors;
}

export function getFieldErrors(errors) {
    let obj = {};
    errors.forEach(x => {
        obj[x.field + 'Error'] = x.error
    });
    
    return obj;
}
