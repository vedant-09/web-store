import React from 'react'
import './AboutUs.css'

export default function About() {
    const teamMembers = [
        {
          name: 'Siddhesh',
          role: 'TL',
          image: null,
          bio: 'Visionary leader with a passion for innovation.',
        },
        {
          name: 'Vedant',
          role: 'trainee',
          image: '/Images/pp.jpg',
          bio: 'Creative mind shaping our product aesthetics.',
        },
        // ... more team members
      ];
    
      const values = [
        'Customer Satisfaction',
        'Quality Products',
        'Ethical Practices',
        'Innovation',
      ];
    
      
      return (
        
        <>
        <div className="about-us-page">
          {/* Header Section */}
          <header className="about-header text-center py-5">
            <div className="container">
              <h1>About Our Story</h1>
              <p className="lead">
                We're dedicated to bringing you high-quality products and an exceptional shopping experience.
              </p>
            </div>
          </header>
    
          {/* Our Story Section */}
          <section className="py-5">
            <div className="container">
              <h2>Our Journey</h2>
              <p>
                Founded in 2025, we started with a simple idea: to [Your Mission].
                We've grown from a small startup to a thriving e-commerce platform, thanks to our loyal customers and dedicated team.
                
              </p>
            </div>
          </section>
    
          {/* Our Team Section */}
          <section className="bg-light py-5">
            <div className="container">
              <h2>Meet Our Team</h2>
              <div className="row">
                {teamMembers.map((member, index) => (
                  <div key={index} className="col-md-4 mb-4 text-center">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="rounded-circle team-member-image"
                    />
                    <h3>{member.name}</h3>
                    <p className="text-muted">{member.role}</p>
                    <p>{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
    
          {/* Our Values Section */}
          <section className="py-5">
            <div className="container">
              <h2>Our Core Values</h2>
              <ul className="list-unstyled">
                {values.map((value, index) => (
                  <li key={index} className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </section>
    
          {/* Our Commitment to Quality Section */}
          <section className="bg-light py-5">
            <div className="container">
              <h2>Our Commitment to Quality</h2>
              <p>
                We meticulously source our materials and rigorously test our products to ensure they meet the highest standards.
                
              </p>
            </div>
          </section>

          
        </div>
        </>
      );
}
