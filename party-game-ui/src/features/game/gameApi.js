import { get, post } from '../fetchClient';

const gameApi = {

    create(player_name) {
        return post('api/game', { player_name });
    },

    join(player_name, room_name) {
        return post('api/game/join', { player_name, room_name });
    },

    stop(room_name) {
        return post('api/game/stop', { room_name });
    },

    list() {
        return get('api/game/list');
    }
}

export default gameApi;
