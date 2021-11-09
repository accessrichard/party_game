import { get, post } from '../fetchClient';

const gameApi = {

    create(player_name) {
        return post('api/game', { player_name });
    },

    join(player_name, room_name) {
        const player = {
            location: "lobby",
            status: "online",
            name: player_name
        };
        
        return post('api/game/join', { room_name, player });
    },

    stop(room_name) {
        return post('api/game/stop', { room_name });
    },

    list() {
        return get('api/game/list');
    }
}

export default gameApi;
