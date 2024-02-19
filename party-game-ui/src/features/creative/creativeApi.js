import { post } from '../fetchClient';

const creativeApi = {

    validate(game) {
        return post('api/game/validate', game);
    }
}

export default creativeApi;
