export function saveSessionStorage(game) {
    const currentStorage = getSessionStorage();
    const otherGames = currentStorage.filter((x) => x.id !== game.id || x.name !== game.name);
    otherGames.push(game);
    const json = JSON.stringify(otherGames);
    sessionStorage.setItem("creativeGames", json);
}

export function getSessionStorage() {
    const storage = sessionStorage.getItem("creativeGames");
    return (storage && JSON.parse(storage)) || [];

}

export function getGamesNames() {
    return getSessionStorage().map((game) => game.name);
}

/**
 * Adds the default error objects to all form 
 * fields;
 */
export function addDefaultFormErrors(form, errors) {
    return { ...form, errors: { ...errors } };
}

export function getSessionGame(name) {
    var game = getSessionStorage().filter((game) => game.name === name);
    if (game && game.length > 0) {
        return addDefaultFormErrors(game[0]);
    }

    return game[0];
}

export function isSessionStrorageEnabled() {
    try {
        sessionStorage.setItem("test", null);
        sessionStorage.removeItem("test");
    } catch (e) {
        return false;
    }
}

export function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * Radio groups need unique matching names for them to work.
 * 
 * Therefore the inputs are named, corrct-!-questionindex
 * 
 * That way the radio groups work per question and not across the form.
 * 
 * Removing them here in order to build the form with correct field names.
 */
function removeIndexFromName(name) {
    if (name && name.indexOf("-!-") !== -1) {
        return name.substr(0, name.indexOf("-!-"));
    }

    return name;
}

export function toFieldObject(e) {
    var { name, value } = e.target;

    return {
        [removeIndexFromName(name)]: value
    };
}

export function toErrorObject(e) {
    var { name, validationMessage } = e.target;
    return {
        [removeIndexFromName(name)]: validationMessage
    };
}
