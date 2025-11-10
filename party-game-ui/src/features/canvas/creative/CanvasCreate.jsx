import OneWordCreate from '../../creative/OneWordCreate';

const defaultState = {
    name: "",
    words: [""],
    id: Date.now(),
    type: "canvas",
    errors: { words: [], name: "" }
}

export default function CanvasCreate({ game, defaults }) {
    return (
        <OneWordCreate game={game} defaultState={{...defaultState, ...defaults}}/>
    );
}
