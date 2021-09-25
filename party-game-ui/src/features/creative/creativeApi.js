import { post } from '../fetchClient';

const creativeApi = {

    validate(game) {
        return post('api/create/validate', game);
    }
}

export default creativeApi;
