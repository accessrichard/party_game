import React, {useEffect, useState} from 'react';
import { happyFaces, sadFaces } from './faceList';

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
           {face && <img src={face} alt="emoji" className={imgClass || "app-logo"} />}
        </React.Fragment>
    );
}

export default Faces;
