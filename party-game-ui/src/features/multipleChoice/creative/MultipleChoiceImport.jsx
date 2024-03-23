import React, { useState } from 'react';
import { gameToForm, mergeErrors, removeUnwantedJson, validateQuestions } from './creative';
import MultipleChoiceCreate from './MultipleChoiceCreate';
import { getGameFromPath, getGameMetadata } from '../../lobby/games';
import { gameValidators } from './gameValidator';
import { errors as initialErrors } from './game';
import { validate } from '../../common/validator';
import { useDispatch } from 'react-redux';
import { push } from 'redux-first-history';
import ImportGame from '../../creative/ImportGame';

export default function MultipleChoiceImport({text, hideSubmit}) {

    const [gameForm, setGameForm] = useState({ errors: initialErrors });
    const [gameJson, setGameJson] = useState("");

    const dispatch = useDispatch();


    function importGame(json) {
        setGameJson(json);
        try {
            if (!json || json.trim() === "") {
                setGameForm({ ...gameForm, errors: ["Can't import empty game."] });
                return;
            }

            setGameForm({ ...gameForm, errors: [] });

            const gameObj = JSON.parse(json);
            const gameUrl = getGameFromPath();
            if (gameUrl.game !== gameObj.type) {                
                const gameMeta = getGameMetadata(gameObj.type);
                
                if (gameMeta) {
                    dispatch(push(gameMeta.url + '/import'))
                } else {
                    setGameForm({ ...gameForm, errors: ["Invalid game type."] });
                }

                return;
            }

            const gameErrors = validate(gameValidators(gameObj));
            const questionErrors = validateQuestions(gameObj);
            const merged = mergeErrors(gameErrors, questionErrors)
            
            setGameForm({ ...gameForm, errors: merged.map(x => x.error && x.error || x ) });
            if (merged.length > 0) {
                return;
            }

            const cleanGame = removeUnwantedJson(gameObj);
            setGameJson(JSON.stringify(cleanGame, null, 2));            
            setGameForm({ ...gameToForm(cleanGame), errors: { ...initialErrors } });
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

            {gameForm.id && <MultipleChoiceCreate game={gameForm} />}
        </>
    );
}
