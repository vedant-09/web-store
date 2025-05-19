import React, { Component } from 'react'
import Carousel from './Carousel'
import ProductCarousel from './ProductCarousel'
import BestSelling from './BestSelling'




export default class Main extends Component {
  render() {
  

    return (
      <>
      <section id="slider" className='py-4'>
          <Carousel></Carousel>
        </section>
      <div className="container ">
        

        <section className="py-5 bg-dark-subtle">
          <div className="container">
            <div className="row">
              <div className="col-md-3 text-center">
                <i className="bi bi-calendar2-check" style={{ fontSize: "30px" }}></i>
                <h4 className="element-title text-capitalize my-3">Wishlist</h4>

              </div>
              <div className="col-md-3 text-center">
                <i className="bi bi-bag-check" style={{ fontSize: "30px" }}></i>
                <h4 className="element-title text-capitalize my-3">Pick up in store</h4>
              </div>
              <div className="col-md-3 text-center">
                <i className="bi bi-box-seam" style={{ fontSize: "30px" }}></i>
                <h4 className="element-title text-capitalize my-3">Special packaging</h4>
              </div>
              <div className="col-md-3 text-center">
                <i className="bi bi-arrow-repeat" style={{ fontSize: "30px" }}></i>
                <h4 className="element-title text-capitalize my-3">free global returns</h4>
              </div>
            </div>
          </div>
        </section>
       
        <ProductCarousel/>
        
        <BestSelling></BestSelling>
        
        
      </div>


      </>
    )
  }
}
