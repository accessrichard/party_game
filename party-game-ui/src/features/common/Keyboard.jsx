const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function Keyboard(props) {
    const { onClick } = props;

    function handleClick(e, letter) {
        e.stopPropagation();
        onClick && onClick(e, letter);
    }

    function letters() {
        const letters = alphabet.map((letter, key) =>
            <li key={key} className="keyboard_key" onClick={(e) => handleClick(e, letter)}>{letter}</li>);
        return <ul className="ul-nostyle">{letters}</ul>;
    }

    return (
        <>
            {letters()}
        </>
    );
}
