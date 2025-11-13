import StoryCreate from './StoryCreate';
import { useState } from 'react';
import { clientGameList } from '../../lobby/lobbySlice';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'redux-first-history';
import ImportGame from '../../creative/ImportGame';

const defaultState = {
    type: "alternate_sentence",
    name: "",
    text: "This is a [funny word] example story. [person or animal] went to the [place]. "
}

export default function StoryImport(initialState) {

    const [gameForm, setGameForm] = useState({ ...defaultState, errors: [], ...initialState });
    const [gameJson, setGameJson] = useState("");
    const clientGameMetaList = useSelector(clientGameList);

    const dispatch = useDispatch();

    function handleImportClick(json) {
        setGameJson(json);
        try {
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

            const cleanGame = { 
                type: gameObj.type, 
                subType: gameObj.subType, 
                name: gameObj.name, 
                text: gameObj.text, 
                id: gameObj.id 
            };

            setGameJson(JSON.stringify(cleanGame, null, 2));
            setGameForm(cleanGame);
        } catch (err) {
            setGameForm({ ...gameForm, errors: [err.message] });
        }
    }

    return (
        <>
            {!gameForm.id &&
                <ImportGame
                    onImportGame={handleImportClick}
                    form={gameForm}
                    json={gameJson}
                />}

            {gameForm.id && <StoryCreate game={gameForm} />}
        </>
    );
}
