function _required(value) {
    return typeof (value) === 'undefined'
        || value === null
        || value === ''
        || (Array.isArray(value) && value.length === 0);
}

function _array(value) {
    return !Array.isArray(value);
}

function _minLenght(value, min) {
    return value && value.length < min;
}

function _maxLenght(value, max) {
    return value && value.length > max;
}

function _values(value, values) {
    if (!_array(values)) {
        return !values.includes(value)
    }

    return value !== values;
}

/**
 * e.g.
 * [{ validators: ['required'], field: "username", value: "", name: "User Name"},
*   { validators: ['required'], field: "code", value: "", name: "Code"}]
 */
export function validate(validations, fields) {
    var errors = []
    validations.forEach(validation => {

        if (!validation.validators) {
            return;
        }

        validation.validators.forEach(v => {
            if (fields && !fields.includes(validation.field)) {
                errors.push({
                    field: validation.field,
                    error: "",
                    isValid: true,
                    name: validation.name || validation.field
                });
                return;
            }

            if (v === 'required' && _required(validation.value)) {
                errors.push({
                    field: validation.field,
                    error: `${validation.name} is required.`,
                    isValid: false,
                    name: validation.name || validation.field
                });
                return;
            }

            if (v === 'array' && _array(validation.value)) {
                errors.push({
                    field: validation.field,
                    error: `${validation.name} is not valid.`,
                    isValid: false,
                    name: validation.name || validation.field
                });
                return;
            }

            if (v === 'minLength' && _minLenght(validation.value, validation.minLength)) {
                errors.push({
                    field: validation.field,
                    error: `${validation.name} is less than ${validation.minLength}.`,
                    isValid: false,
                    name: validation.name || validation.field
                });
                return;
            }

            if (v === 'maxLength' && _maxLenght(validation.value, validation.maxLength)) {
                errors.push({
                    field: validation.field,
                    error: `${validation.name} is greater than ${validation.maxLength}.`,
                    isValid: false,
                    name: validation.name || validation.field
                });
                return;
            }

            if (v === 'values' && _values(validation.value, validation.values)) {
                errors.push({
                    field: validation.field,
                    error: `${validation.value} is not valid.`,
                    isValid: false,
                    name: validation.name || validation.field
                });
                return;
            }

            errors.push({
                field: validation.field,
                error: "",
                isValid: true,
                name: validation.name || validation.field
            });
        });
    });

    return errors;
}

export function validateForm(form, fields) {
    const validations = validate(form, fields);
    const isValid = !validations.filter((valid) => !valid.isValid).length > 0;
    return { isValid, errors: getFormErrors(validations, fields) };
}

export function getFormErrors(errors, fields) {
    let obj = {};
    errors.forEach(x => {
        if (fields && !fields.includes(x.field)) {
            return;
        }

        if (x.field in obj) {
            return;
        }

        obj[x.field] = x.error
    });

    return obj;
}

export function getFieldErrors(errors) {
    let obj = {};
    errors.forEach(x => {
        obj[x.field + 'Error'] = x.error
    });

    return obj;
}

export function getErrors(errors) {
    return errors.filter((err) => !err.isValid).map((err) => ({  error: err.error, field: err.field }));
}
