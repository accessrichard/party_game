import React from 'react';
import happy from '../../happy.svg';
import happy1 from '../../happy1.svg';
import happy2 from '../../happy2.svg';
import happy4 from '../../happy4.svg';
import sad from '../../sad.svg';
import sad1 from '../../sad1.svg';
import sad2 from '../../sad2.svg';
import sad3 from '../../sad3.svg';
import sad4 from '../../sad4.svg';
import sad5 from '../../sad5.svg';
import sad6 from '../../sad6.svg';

const happyFaces = [happy, happy1, happy2, happy4];
const sadFaces = [sad, sad1, sad2, sad3, sad4, sad5, sad6];

const randomFace = (isHappy) => {
    if (isHappy) {
        return happyFaces[Math.floor(Math.random() * happyFaces.length)];
    }

    return sadFaces[Math.floor(Math.random() * sadFaces.length)];
}

const Faces = (props) => {
    const { isHappy, imgClass } = props;
    return (
        <React.Fragment>
            <img src={randomFace(isHappy)} className={imgClass || "App-logo"} alt="logo" />
        </React.Fragment >
    );
}

export default Faces;
