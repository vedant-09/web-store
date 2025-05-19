import React from 'react';
import './carousel.css';


const Carousel = () => {
    return (
        <div className='container'>
            <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner ">
                    <div className="carousel-item active" data-bs-interval="10000">
                        <img src="/Images/slider_img1.jpg" className=" w-100 img-fulid" alt="..." />
                    </div>
                    <div className="carousel-item" data-bs-interval="2000">
                        <img src="/Images/slider_img5.jpg" className=" w-100 img-fulid" alt="..." />
                    </div>
                    <div className="carousel-item">
                        <img src="/Images/slider_img2.jpg" className=" w-100 img-fulid" alt="..." />
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

        </div>
    );
};

export default Carousel;