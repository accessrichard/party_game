export const games = {
    multiple_choice: {
        url: "/multiple_choice",
        settings: true,
        import: true,
        create: true,
        name: "Multiple Choice" 
    },
    canvas: {
        url: "/canvas",
        settings: true,
        import: true,
        create: true,
        name: "Guess The Drawing" 
    },
    canvas_alternate: {
        url: "/canvas_alternate",
        settings: true,
        import: true,
        create: true,
        name: "Alternate Draw Togather"
    },
    hangman: {
        url: "/hangman",
        settings: true,
        import: true,
        create: true,
        name: "Hangman"
    }
}

export function getGameFromPath() {
    const game = Object.keys(games).find((x) => window.location.pathname.includes(`${games[x].url}/`))
    return { type: game, ...games[game]};
}

export function getGameMetadata(game) {
    if (!Object.prototype.hasOwnProperty.call(games, game)) {
        return { url: "", settings: false, import: false, create: false}
    }

    return games[game];
}