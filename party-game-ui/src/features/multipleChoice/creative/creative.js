import { getErrors, validate } from '../../common/validator';
import { TRUE_FALSE } from '../../common/questionTypes';
import { errors } from './game';
import { questionValidators } from './gameValidator';

/**
 * Reformats a server side game to the form format.
 * 
 * e.g. 
 * answers: [array] 
 *  ->
 * answers: {answer1: value, answer2: value, answer3: value, answer4: value}
 */
export function gameToForm(game) {
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

/**
 * Identifies the correct answer in the form:
 * e.g. answer1, answer2, answer3, answer4 
 * if answer3 is correct, will return 3
 */
export function toCorrectAnswer(question) {
    return question.answers.indexOf(question.correct) + 1;
}

export function updateQuestion(newQuestion, field, defaultVal, index) {
    if (typeof newQuestion[index] === 'undefined') {
        newQuestion[index] = { ...defaultVal };
    }

    newQuestion[index] = { ...newQuestion[index], ...field };
}

export function mapToTrueFalseQuestion(question) {
    question.answers = ["True", "False"];
    question.correct = (question.correct.toString() === "1" && "True") || "False";
}

/**
 * Converts the answer array in to answer form fields:
 * answer1, answer2, answer3, answer4.
 */
export function toAnswerFields(answers) {
    let newAnswers = {};
    answers.forEach((ans, index) => {
        newAnswers["answer" + (index + 1)] = ans;
    });

    return newAnswers;
}

/**
 * Converts an answers fields to an array:
 * answer1,answer2,answer3,answerX -> answers: []
 */
export function mapToMultipleChoiceQuestion(question) {
    question.correct = question["answer" + question.correct] || question.answer1;
    question.answers = Object.entries(question)
        .filter(([key, value]) => value !== ""
            && key.startsWith("answer"))
        .map(val => val[1]);
}

/**
 * Converts the form to a server side game format.
 * Mainly converts form fields: answer1,answer2,answer3,answer4 
 * into an answers array: answers: []
 */
export function toServerSideGame(form) {
    const exportForm = JSON.parse(JSON.stringify(form));
    delete exportForm.errors;

    exportForm.questions.forEach((q) => {
        if (q.type === TRUE_FALSE) {
            mapToTrueFalseQuestion(q);
        } else {
            mapToMultipleChoiceQuestion(q);
        }

        Object.keys(q).filter((key) => key.startsWith("answer") && key !== "answers")
            .forEach((key) => {
                delete q[key];
            });
    });
        
    return exportForm;
}

export function mergeErrors(gameErrors, questionErrors) {
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

export function validateQuestions(gameObj) {
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

/**
 * Removes any additional json elements not
 * supposed to be on the game object.
 */
export function removeUnwantedJson(gameObj) {
    let cleanGame = {};
    cleanGame.type = gameObj.type;
    cleanGame.id = gameObj.id;
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
