import React from 'react';

export default function Popup(props) {
    const { 
        title,
        content,
    } = props;

    return (
        <>
            <div className="overlay overlay-visible">
                <div className="popup">
                    <h2>{title}</h2>
                    <div className="content">
                        {content}
                    </div>
                </div>
            </div>
        </>
    );
}
