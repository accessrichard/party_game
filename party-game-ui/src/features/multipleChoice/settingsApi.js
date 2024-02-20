export function toServerSettings(state) {
    return {
        question_time: state.questionTime,
        next_question_time: state.nextQuestionTime,
        wrong_answer_timeout: state.wrongAnswerTimeout,
        rounds: state.rounds,
        prompt_game_start: state.isNewGamePrompt
    };
}

export function toClientSettings(state) {
    return {
        questionTime: state.question_time,
        nextQuestionTime: state.next_question_time,
        wrongAnswerTimeout: state.wrong_answer_timeout,
        rounds: state.rounds,
        isNewGamePrompt: state.prompt_game_start
    };
}