import { post } from '../fetchClient';

const createApi = {

    isValid(game) {
        return post('api/create/validate', game);
    }
}

export default createApi;
