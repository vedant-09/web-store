import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ProductCarousel.css';

const ProductCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/categories') // 🔹 Removed withCredentials
      .then((response) => {
        // console.log('Categories fetched:', response.data); // ✅ Debugging log
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h4 className="text-center">Loading categories...</h4>;
  }

  return (
    <section className="new-arrival py-5">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
          <h4 className="text-uppercase">Categories</h4>
          <Link to="/CategoryProducts" className="btn-link">
            View All Categories
          </Link>
        </div>

        <div className="row">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="col-md-4 mb-4">
                <div className="card shadow-sm">
                  <img
                    src={category.image || '/Images/default-category.jpg'}
                    alt={category.name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title text-uppercase">{category.name}</h5>
                    <Link to={`/CategoryProducts/${category.id}`} className="btn btn-primary">
                      View Products
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No categories found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
