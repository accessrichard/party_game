const Rounds = (props) => {
    const { rounds } = props;

    return (
        <>
            <h3>Rounds</h3>
            <ul className="ul-nostyle text-align-left">
                {rounds.map((round, key) =>
                    <li key={key} className="pd-5">
                        <div>Round Winner: {round && round.winner}</div>
                        <div>Question: {round && round.question.question}</div>
                        <div>Answer: {round && round.answer}</div>
                    </li>
                )}
            </ul>
        </>
    );
}

export default Rounds;
