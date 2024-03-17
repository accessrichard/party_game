const games = {
    multiple_choice: {
        url: "/multiple_choice",
        settings: true,
        import: true,
        create: true
    },
    canvas: {
        url: "/canvas",
        settings: true,
        import: true,
        create: true
    },
    canvas_alternate: {
        url: "/canvas_alternate",
        settings: true,
        import: true,
        create: true
    }
}

export function getGameMetadata(game) {
    if (!Object.prototype.hasOwnProperty.call(games, game)) {
        return { url: "", settings: false, import: false, create: false}
    }

    return games[game];
}