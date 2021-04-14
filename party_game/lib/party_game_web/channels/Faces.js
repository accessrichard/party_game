import React from 'react';
import happy from '../../happy.svg';
import happy1 from '../../happy1.svg';
import happy2 from '../../happy2.svg';
import sad from '../../sad.svg';
import sad1 from '../../sad1.svg';

const happyFaces = [happy, happy1, happy2];
const sadFaces = [happy, happy1, happy2];

const randomFace = (isHappy) => {
    if (isHappy) {
        return happyFaces[Math.floor(Math.random() * happyFaces.length)];
    }

    return sadFaces[Math.floor(Math.random() * sadFaces.length)];
}

const Faces = (props) => {
    const { isHappy } = props;
    return (
        <React.Fragment>
            <img src={randomFace(isHappy)} className="App-logo" alt="logo" />
        </React.Fragment >
    );
}

export default Faces;
