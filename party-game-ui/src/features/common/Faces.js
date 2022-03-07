import React, { useEffect, useState } from 'react';

import sprite from '../../img/face_sprite.svg';

const HAPPY_FACE_SVG_COUNT = 3;
const SAD_FACE_SVG_COUNT = 6;

const randomFace = (isHappy) => {
    if (isHappy) {
        const rand = Math.floor(Math.random() * HAPPY_FACE_SVG_COUNT) + 1;
        return "happy" + rand;
    }

    const rand = Math.floor(Math.random() * SAD_FACE_SVG_COUNT) + 1;
    return "sad" + rand;
}

const Faces = (props) => {

    const { isHappy, className } = props;
    const [face, setFace] = useState("");

    useEffect(() => {
        setFace(randomFace(isHappy));
        return () => "";
    }, [isHappy])

    return (
        <React.Fragment>
           
            {face && <svg className={className || "app-logo"}>
                <use
                    href={sprite + "#" + face}>
                </use>
            </svg>}

        </React.Fragment>
    );
}

export default Faces;
