import React from 'react';

const ImagePreloader = (props) => {

    const { images } = props;

    return (
        <React.Fragment>
            <div className='hidden'>
                {images.map((image) => {
                    return <img src={image} alt="preload" />
                })}
            </div>
        </React.Fragment>
    );
}

export default ImagePreloader;
