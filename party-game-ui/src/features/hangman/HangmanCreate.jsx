import OneWordCreate from '../creative/OneWordCreate';

const defaultState = {
    name: "",
    words: [""],
    id: Date.now(),
    type: "hangman",
    errors: { words: [], name: "" }
}

export default function HangmanCreate({ game }) {
    return (
        <OneWordCreate game={game} defaultState={defaultState}/>
    );
}
