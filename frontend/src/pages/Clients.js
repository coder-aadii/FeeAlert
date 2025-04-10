import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const recordsPerPage = 5;

  useEffect(() => {
    const fetchClients = async (page) => {
      setLoading(true);
      try {
        // Get the token from local storage
        const token = localStorage.getItem('token');

        // Configure Axios request with token
        const response = await axios.get(`http://localhost:5000/api/clients?page=${page}&limit=${recordsPerPage}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if response.data is an array or has pagination structure
        if (Array.isArray(response.data)) {
          setClients(response.data);
          setTotalPages(Math.ceil(response.data.length / recordsPerPage));
        } else if (response.data.clients && response.data.total) {
          setClients(response.data.clients);
          setTotalPages(Math.ceil(response.data.total / recordsPerPage));
        } else {
          setClients(response.data);
          // Estimate total pages if total count is not provided
          setTotalPages(Math.ceil(response.data.length / recordsPerPage));
        }
      } catch (error) {
        setError('Error fetching clients');
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="clients-container">
      <h1>Clients</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id || client._id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Clients;
