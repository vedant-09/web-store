import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown, Table,  Pagination, Form,Button } from "react-bootstrap";
import { FaEllipsisV } from "react-icons/fa";
import {  Link} from "react-router-dom";

const AdminProducts = () => {
 
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editStockId, setEditStockId] = useState(null);
  const [updatedStock, setUpdatedStock] = useState({});
  const itemsPerPage = 6;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/admin-product", { withCredentials: true })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on:`, selectedProducts);
    // Implement enable, disable, delete logic here
  };

  const handleStockChange = (id, value) => {
    setUpdatedStock((prev) => ({ ...prev, [id]: value }));
  };

  const updateStock = (id) => {
    axios
      .put(`http://localhost:5000/api/products/${id}/update-stock`, {
        stock: updatedStock[id],
      })
      .then(() => {
        fetchProducts();
        setEditStockId(null);
      })
      .catch((error) => console.error("Error updating stock:", error));
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
    <div className="container mt-4">
      <h2 className="mb-4">Products</h2>
      <div className="d-flex justify-content-between mb-3">
     
        <Link type="button" className="btn btn-secondary " variant="outline-dark" to="/admin/dashboard/insert">+ Add Product</Link>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
            <Dropdown>
          <Dropdown.Toggle variant="primary">Select</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleBulkAction("Disable")}>Disable</Dropdown.Item>
            <Dropdown.Item onClick={() => handleBulkAction("Enable")}>Enable</Dropdown.Item>
            <Dropdown.Item onClick={() => handleBulkAction("Delete")} className="text-danger">Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
            </th>
            <th>Sn</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Sold</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product, index) => (
            <tr key={product.id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                />
              </td>
              <td>{index + 1}</td>
              <td><span><img src={product.image} alt="img" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} /></span>{product.name}</td>
              <td>{product.category_name}</td>
              <td>{product.stock}</td>
              <td>{product.sold}</td>
              <td>${product.price}</td>
              <td>Published</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="light" size="sm">
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={`/admin/dashboard/edit/${product.id}`}>Edit Product</Dropdown.Item>
                    <Dropdown.Item className="text-danger">Delete Product</Dropdown.Item>
                    <Dropdown.Item onClick={() => setEditStockId(product.id)}>Update stock</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {editStockId === product.id && (
                    <div className="mt-2">
                      <Form.Control
                        type="number"
                        value={updatedStock[product.id] || product.stock}
                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                      />
                      <Button className="mt-2" variant="primary" onClick={() => updateStock(product.id)}>
                        Save
                      </Button>
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="d-flex justify-content-center">
        <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} />
        {[...Array(Math.ceil(products.length / itemsPerPage))].map((_, i) => (
          <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(products.length / itemsPerPage)))} />
      </Pagination>
    </div>
   
     </>
  );
};

export default AdminProducts;
