import React, { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted", formData);
    alert("Thank you for contacting us!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Contact Us</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="p-4 border rounded">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input type="text" name="subject" className="form-control" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea name="message" className="form-control" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;