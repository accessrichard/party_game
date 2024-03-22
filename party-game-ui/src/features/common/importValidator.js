export function nameValidator(gameObj) {
    return [{
        validators: ['required'],
        field: "name",
        value: gameObj.name,
        name: "Game Name"
    }];
}