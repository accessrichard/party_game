import React from 'react';
import logo from '../../img/balloons-party-svgrepo-com.svg';

const Logo = (props) => {
    const { logoClass, titleClass, title } = props;

    return (
        <React.Fragment>
            <img src={logo} className={logoClass} alt="logo" />
             <div className={titleClass}>{title || "Buzz Games"}</div>
        </React.Fragment >
    );
}

export default Logo;
