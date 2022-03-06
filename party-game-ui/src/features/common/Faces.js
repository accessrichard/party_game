import React, {useEffect, useState} from 'react';

import happy from '../../img/happy.svg';
import happy1 from '../../img/happy1.svg';
import happy2 from '../../img/happy2.svg';
import happy4 from '../../img/happy4.svg';
import sad from '../../img/sad.svg';
import sad1 from '../../img/sad1.svg';
import sad2 from '../../img/sad2.svg';
import sad3 from '../../img/sad3.svg';
import sad4 from '../../img/sad4.svg';
import sad5 from '../../img/sad5.svg';
import sad6 from '../../img/sad6.svg';

const happyFaces = [happy, happy1, happy2, happy4];
const sadFaces = [sad, sad1, sad2, sad3, sad4, sad5, sad6];

const randomFace = (isHappy) => {   
    if (isHappy) {
        return happyFaces[Math.floor(Math.random() * happyFaces.length)];
    }

    return sadFaces[Math.floor(Math.random() * sadFaces.length)];
}

const Faces = (props) => {

    const { isHappy, imgClass} = props;
    const [face, setFace] = useState("");

    useEffect(() => {
        setFace(randomFace(isHappy));
        return () => "";
    }, [isHappy])

    return (
        <React.Fragment>
           {face && <img src={face} alt={isHappy ? "happy " : "sad " + "face"} className={imgClass || "app-logo"} alt="logo" />}
        </React.Fragment >
    );
}

export default Faces;
