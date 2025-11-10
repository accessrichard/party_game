import { useState, cloneElement } from 'react';
import { validate, getErrors } from '../common/validator';
import ImportGame from './ImportGame';
import { clientGameList } from '../lobby/lobbySlice';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'redux-first-history';
import { gameValidators } from './oneWordValidators'

const initialErrors = {
    words: "",
    name: "",
    type: ""
}

export default function OneWordImport({ children }) {
    const [gameForm, setGameForm] = useState({ errors: initialErrors });
    const [gameJson, setGameJson] = useState("");
    const clientGameMetaList = useSelector(clientGameList);
    const dispatch = useDispatch();

    function importGame(json) {
        try {

            setGameJson(json);
            if (!json || json.trim() === "") {
                setGameForm({ ...gameForm, errors: ["Can't import empty game."] });
                return;
            }


            setGameForm({ ...gameForm, errors: [] });

            const gameObj = JSON.parse(json);
            
            if (!window.location.href.includes(gameObj.type)) {
                
                const gameMeta = clientGameMetaList.find(x => x.type === gameObj.type);
                if (gameMeta) {
                    dispatch(push(gameMeta.url + '/import'))
                } else {
                    setGameForm({ ...gameForm, errors: ["Invalid game type."] });
                }

                return;
            }

            const gameErrors = validate(gameValidators(gameObj));
            const validations = getErrors(gameErrors).map(x => x.error);
            setGameForm({ ...gameForm, errors: validations });

            if (validations.length > 0) {
                return;
            }

            setGameJson(JSON.stringify(gameObj, null, 2));
            setGameForm({ ...gameObj, errors: { ...initialErrors } });
        } catch (err) {
            setGameForm({ ...gameForm, errors: [err.message] });
        }
    }


    return (
        <>
            {!gameForm.id &&
                <ImportGame
                    onImportGame={importGame}
                    form={gameForm}
                    json={gameJson}
                />}

            {gameForm.id && cloneElement(children, { game: gameForm, gameValidators })}
        </>
    );
}
