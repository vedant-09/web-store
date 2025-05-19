import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Image,
  Card,
} from "react-bootstrap";

const EditProduct = () => {
  const { id } = useParams();
  // eslint-disable-next-line
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    discount: "",
    description: "",
    attributes: "",
    image: "",
  });

  const [newImage, setNewImage] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/products/${id}`)
      .then((response) => {
        setProduct(response.data.product);
        setProductImages(response.data.images);
      })
      .catch((error) => console.error("Error fetching product:", error));
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleMultipleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/products-update/${id}`, product);
      alert("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!newImage) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("image", newImage);

    try {
      await axios.post(
        `http://localhost:5000/products/${id}/upload-image`,
        formData
      );
      alert("Main image updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating product image:", error);
    }
  };

  const handleMultipleImageUpload = async (e) => {
    e.preventDefault();
    if (newImages.length === 0) return alert("Please select images.");

    const formData = new FormData();
    newImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await axios.post(
        `http://localhost:5000/products/${id}/upload-multiple-images`,
        formData
      );
      alert("Additional images uploaded successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error uploading multiple images:", error);
    }
  };

  const [images, setImages] = useState([]);
  const [fileInputs, setFileInputs] = useState({}); // Track selected files for update

  useEffect(() => {
    fetchImages(); // eslint-disable-next-line
  }, [id]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/products/${id}/images`
      );
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleFileChange = (imageId, file) => {
    setFileInputs({ ...fileInputs, [imageId]: file });
  };

  const handleUpdateImage = async (imageId) => {
    if (!fileInputs[imageId]) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInputs[imageId]);

    try {
      const response = await axios.post(
        `http://localhost:5000/products/${id}/update-image/${imageId}`,
        formData
      );
      alert("Image updated successfully");
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, image_url: response.data.image_url }
            : img
        )
      );
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/products/${id}/delete-image/${imageId}`
      );
      alert("Image deleted successfully");
      setImages(images.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Edit Product</h2>
      <Form onSubmit={handleUpdate}>
        <Form.Group className="mb-3">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Discount</Form.Label>
          <Form.Control
            type="number"
            name="discount"
            value={product.discount}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={product.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Attributes (JSON Format)</Form.Label>
          <Form.Control
            type="text"
            name="attributes"
            value={product.attributes}
            onChange={handleChange}
            placeholder='{"color": "blue", "size": "large"}'
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Update Product
        </Button>
      </Form>

      {/* Update Main Product Image */}
      <h3 className="mt-4">Update Main Product Image</h3>
      {product.image && (
        <div className="mb-3">
          <Image
            src={`http://localhost:5000${product.image}`}
            alt="Product"
            fluid
            style={{ maxWidth: "200px" }}
          />
        </div>
      )}
      <Form onSubmit={handleImageUpload}>
        <Form.Group className="mb-3">
          <Form.Control type="file" onChange={handleImageChange} />
        </Form.Group>
        <Button variant="secondary" type="submit">
          Upload Image
        </Button>
      </Form>

      {/* Upload Multiple Product Images */}
      <h3 className="mt-4">Add Additional Product Images</h3>
      <Row>
        {productImages.map((img, index) => (
          <Col key={index} md={2}>
            <Image
              src={`http://localhost:5000${img.image_url}`}
              alt="Product"
              fluid
              style={{ maxWidth: "100px", height: "auto" }}
            />
          </Col>
        ))}
      </Row>
      <Form onSubmit={handleMultipleImageUpload} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Control
            type="file"
            multiple
            onChange={handleMultipleImageChange}
          />
        </Form.Group>
        <Button variant="secondary" type="submit">
          Upload Images
        </Button>
      </Form>

      <h3>Manage Additional Product Images</h3>
      <Row>
        {images.length > 0 ? (
          images.map((img) => (
            <Col key={img.id} md={3} className="mb-4">
              <Card className="p-2">
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000${img.image_url}`}
                  alt="Product"
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "5px" }}
                />
                <Card.Body>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="file"
                      onChange={(e) =>
                        handleFileChange(img.id, e.target.files[0])
                      }
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleUpdateImage(img.id)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No additional images available.</p>
        )}
      </Row>
    </Container>
  );
};

export default EditProduct;
