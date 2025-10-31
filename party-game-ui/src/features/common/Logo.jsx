import logo from '../../img/balloons-party-svgrepo-com.svg';

const Logo = (props) => {
    const { logoClass, titleClass, title, showSubtitle, showTitle = true } = props;

    return (
        <>
            <img src={logo} className={logoClass} alt="logo" />
            <div>
                {showTitle &&
                    <div className={titleClass}>{title || "Buzz Games"}</div>
                }
                {showSubtitle &&
                    <div className="half-size-title text-align-right fade-in">By Buzztastic Games</div>
                }
            </div>
        </>
    );
}

export default Logo;
