import { MULTIPLE_CHOICE } from '../common/questionTypes';

export const answer = {
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: ""
}

export const questionErrors = {
    question: "",
    ...answer,
}

export const question = {
    ...questionErrors,
    type: MULTIPLE_CHOICE,
    correct: "1"
}

export const game = {
    name: "",
    questions: [question]
}

export const errors = {
    name: "",
    questions: [questionErrors]
}
