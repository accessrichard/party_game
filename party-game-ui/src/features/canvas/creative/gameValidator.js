import { nameValidator } from "../../common/importValidator"

export function gameValidators(gameObj) {
    return [       
        {
            validators: ['required', 'array', 'minLength'],
            field: "words",
            value: gameObj.words,
            name: "Words",
            minLength: 1
        },
        {
            validators: ['required', 'minLength'],
            field: "type",
            value: gameObj.type,
            name: "Type",
            minLength: 5
        }
        
    ].concat(nameValidator(gameObj))
}