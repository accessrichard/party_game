import { QUESTION_TYPES, TRUE_FALSE } from '../../common/questionTypes';
import { nameValidator } from '../../common/importValidator';

export function gameValidators(gameObj) {
    return [       
        {
            validators: ['required', 'array', 'minLength'],
            field: "questions",
            value: gameObj.questions,
            name: "Questions",
            minLength: 1
        }
    ].concat(nameValidator(gameObj));
}

export function questionValidator(question) {
    return [
        {
            validators: ['required', 'minLength'],
            field: "question",
            value: question.question,
            name: "Question",
            minLength: 1
        },
    ];
}

export function questionValidators(question) {
    return [
        {
            validators: ['required', 'values'],
            field: "type",
            value: question.type,
            name: "Type",
            values: QUESTION_TYPES
        },
        {
            validators: ['required', 'values'],
            field: "correct",
            value: question.correct,
            name: "Correct",
            values: question.answers           
        },
        {
            validators: ['required', 'array', 'minLength', 'maxLength'],
            field: "answers",
            value: question.answers,
            name: "Answer",
            minLength: 1,
            maxLength: 4
        },
    ].concat(questionValidator(question));
}

export function answerValidator(question) {
    const num = question.type === TRUE_FALSE ? 2 : 4;
    return [...Array(num).keys()].map((index) => {
        return {
            validators: ['required'],
            field: "answer" + (index + 1),
            value: question.answers["answer" + (index + 1)],
            name: "Answer " + (index + 1)            
        }
    });
}
