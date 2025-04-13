import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Clients.css';

const Clients = () => {
  const [allClients, setAllClients] = useState([]); // Store all clients for PDF
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false); // Loading state for PDF generation
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const recordsPerPage = 10;

  // Function to determine fee slot based on due date
  const getFeeSlot = (feeDueDate) => {
    if (!feeDueDate) return 'Not Set';
    const day = new Date(feeDueDate).getDate();
    
    if (day >= 1 && day <= 10) {
      return 'Slot 1 (Pay: 1st - 5th)';
    } else if (day >= 11 && day <= 20) {
      return 'Slot 2 (Pay: 15th - 20th)';
    } else {
      return 'Slot 3 (Pay: 25th - 30th)';
    }
  };

  // Function to format date
  const formatDate = (date) => {
    if (!date) return 'Not Set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'suspended':
        return 'suspended';
      default:
        return 'inactive';
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    if (searchValue.trim() === '') {
      setFilteredClients(allClients);
    } else {
      const filtered = allClients.filter(client => 
        client.name?.toLowerCase().includes(searchValue) ||
        client.email?.toLowerCase().includes(searchValue) ||
        client.phone?.toLowerCase().includes(searchValue)
      );
      setFilteredClients(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  };

  const fetchClients = React.useCallback(async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients?page=${page}&limit=${recordsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle paginated response from backend
      if (response.data && response.data.clients) {
        setAllClients(response.data.clients); // Store for PDF generation
        setFilteredClients(response.data.clients);
        // Calculate total pages based on total count from backend
        const totalCount = response.data.total || 0;
        setTotalPages(Math.ceil(totalCount / recordsPerPage));
      } 
      // Handle array response (fallback)
      else if (Array.isArray(response.data)) {
        const totalCount = response.data.length;
        setAllClients(response.data); // Store all clients for PDF generation
        setFilteredClients(response.data);
        setTotalPages(Math.ceil(totalCount / recordsPerPage));
      } 
      else {
        console.error('Invalid response format:', response.data);
        setAllClients([]);
        setFilteredClients([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Error fetching clients');
      setAllClients([]);
      setFilteredClients([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [recordsPerPage]);

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage, fetchClients]);

  // Get paginated data from filtered clients
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calculate the starting serial number for the current page
  const getSerialNumber = (index) => {
    return (currentPage - 1) * recordsPerPage + index + 1;
  };

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Clients List', 14, 15);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      // Prepare data for the table - use filteredClients to include only filtered clients in PDF
      const tableData = filteredClients.map((client, index) => [
        index + 1, // Simple sequential numbering for PDF
        client.name || 'N/A',
        client.email || 'N/A',
        client.phone || 'N/A',
        formatDate(client.feeDueDate),
        getFeeSlot(client.feeDueDate),
        client.membershipStatus || 'Inactive'
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        startY: 25,
        head: [['S.No', 'Name', 'Email', 'Phone', 'Due Date', 'Fee Slot', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: 255,
          fontSize: 12,
          halign: 'center'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Save the PDF
      doc.save('clients-list.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="clients-container">
      <div className="header-section">
        <h1>Clients</h1>
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          onClick={downloadPDF}
          className="download-pdf-button"
          disabled={pdfLoading}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      {loading && <p className="loading-message">Loading clients...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Due Date</th>
              <th>Fee Slot</th>
              <th>Membership Status</th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedData().map((client, index) => (
              <tr key={client.id || client._id}>
                <td>{getSerialNumber(index)}</td>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{formatDate(client.feeDueDate)}</td>
                <td>{getFeeSlot(client.feeDueDate)}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(client.membershipStatus)}`}>
                    {client.membershipStatus || 'Inactive'}
                  </span>
                </td>
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
