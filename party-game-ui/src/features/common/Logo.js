import React from 'react';
import logo from '../../img/balloons-party-svgrepo-com.svg';

const Logo = (props) => {
    const { logoClass, titleClass, title, showSubtitle } = props;

    return (
        <React.Fragment>
            <img src={logo} className={logoClass} alt="logo" />
            <div>
                <div className={titleClass}>{title || "Buzz Games"}</div>
                {showSubtitle &&
                <div className="tiny-title right-align fade-in">By Buzztastic Games</div>
                }
            </div>
        </React.Fragment >
    );
}

export default Logo;
