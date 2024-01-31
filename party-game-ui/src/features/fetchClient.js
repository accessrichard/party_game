function client(endpoint, config = {}) {
    const AbortController = window.AbortController;
    const controller = new AbortController();

    var defaultConifg = {
        method: 'GET',
        signal: controller.signal,
        headers: {
            'content-type': 'application/json'
        }
    };

    config = Object.assign(defaultConifg, config);
    const promise = fetch(`${import.meta.env.VITE_API_URL || ''}/${endpoint}`, config);
    setTimeout(() => controller.abort(), import.meta.env.VITE_API_TIMEOUT || 5000);

    return promise.then(response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }

        return response.json();
    });
}

export function get(endpoint) {
    return client(endpoint);
}

export function post(endpoint, body) {
    let config = {
        method: 'POST',
        body: JSON.stringify(body)
    };

    return client(endpoint, config);
}
