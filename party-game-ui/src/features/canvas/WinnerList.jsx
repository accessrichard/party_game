const WinnerList = ({winners = []}) => {
    return (
        <ul className="ul-nostyle list-inline smallest-font">
            {winners.map((val, key) =>
                <li key={key}>
                    {val.name} - {val.wins}
                </li>
            )}
        </ul>
    );
}

export default WinnerList;
