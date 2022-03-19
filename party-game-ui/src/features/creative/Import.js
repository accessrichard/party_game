import React, { useEffect, useState } from 'react';
import { gameValidators, questionValidators } from './gameValidator';
import { getErrors, validate } from '../common/validator';

import Create from './Create';
import InputError from '../common/InputError';
import { errors as initialErrors } from './game';

function mergeErrors(gameErrors, questionErrors) {
    let allErrors = [];
    if (gameErrors.length) {
        allErrors = getErrors(gameErrors);
    }

    if (questionErrors.length) {
        questionErrors.forEach((error) => {

            if (error.question) {
                allErrors.push(`Question #${error.index} titled ${error.question} field ${error.field}: ${error.errors}`);
            } else {
                allErrors.push(`Question #${error.index}: ${error.errors}`);
            }
        });
    }

    return allErrors;
}

function validateQuestions(gameObj) {
    let index = 0;
    const questionErrors = [];
    gameObj.questions.forEach((question) => {
        index++;
        const errors = validate(questionValidators(question));
        const err = getErrors(errors);
        if (err.length) {
            err.forEach((e) => {
                questionErrors.push({ index, question: question.question, errors: e.error, field: e.field });
            });

        }
    });

    return questionErrors;
}

function removeUnwantedJson(gameObj) {
    let cleanGame = {};
    cleanGame.name = gameObj.name;
    cleanGame.questions = [];
    gameObj.questions.forEach((question) => {
        cleanGame.questions.push({
            question: question.question,
            type: question.type,
            answers: question.answers,
            correct: question.correct
        })
    });

    return cleanGame;
}

export default function Import(props) {

    const [game, setGame] = useState(props.game || "");
    const [errors, setErrors] = useState([]);
    const [gameForm, setGameForm] = useState(null);

    useEffect(() => setGame(props.game), [props.game]);

    function handleChange(e) {
        setGame(e.target.value);

        if (errors !== []) {
            setErrors([]);
        }
    }

    function importGame() {
        try {
            if (game === "") {
                setErrors(["Can't import empty game."]);
                return;
            }

            setErrors([]);

            const gameObj = JSON.parse(game);
            const gameErrors = validate(gameValidators(gameObj));
            const questionErrors = validateQuestions(gameObj);
            const merged = mergeErrors(gameErrors, questionErrors)

            setErrors(merged);

            const cleanGame = removeUnwantedJson(gameObj);
            setGame(JSON.stringify(cleanGame, null, 2));

            setGameForm({ ...gameToForm(cleanGame), errors: { ...initialErrors } });
        } catch (err) {
            setErrors([err.message]);
        }
    }

    function gameToForm(game) {
        let newGame = { ...game };
        newGame.questions.forEach((question, index) => {
            let newQuestion = { ...question };
            newQuestion.correct = toCorrectAnswer(newQuestion);
            newQuestion = { ...newQuestion, ...toAnswerFields(newQuestion.answers) };
            delete newQuestion.answers;
            newGame.questions[index] = newQuestion;
        });

        return newGame;
    }

    function toCorrectAnswer(question) {
        return question.answers.indexOf(question.correct) + 1;
    }

    function toAnswerFields(answers) {
        let newAnswers = {};
        answers.forEach((ans, index) => {
            newAnswers["answer" + (index + 1)] = ans;
        });

        return newAnswers;
    }

    return (
        <React.Fragment>
            {!gameForm &&
                <div className='flex-grid center-65'>
                    <div className="flex-row flex-item">
                        <div className='item card'>
                            <div className="group">
                                <textarea required
                                    autoComplete="off"
                                    name="import-game"
                                    rows="15"
                                    cols="50"
                                    value={game}
                                    onChange={handleChange}
                                />
                                <span className="highlight"></span>
                                <span className="bar"></span>
                                <label>{props.text || "Paste your game here:"}</label>
                                <InputError className="error shake" errors={[errors || ""]} />
                                {false && <ul className="error shake">
                                    {errors.map((err, idx) => {
                                        return <li className="input-error-text red" key={idx}>{err}</li>
                                    })}
                                </ul>}
                            </div>

                            {!props.hideSubmit &&
                                <div className="btn-box">
                                    <button className="btn btn-submit" type="Import" onClick={importGame}>Import Game</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
            {gameForm && <Create game={gameForm}></Create>}
        </React.Fragment>
    );
}
