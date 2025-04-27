import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]); // Current page clients
  const [allClients, setAllClients] = useState([]); // All clients for search filtering
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false); // Loading state for PDF generation
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false); // Loading state for status updates
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

  // Function to fetch all clients (for search and filtering)
  const fetchAllClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/clients`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.clients) {
        setAllClients(response.data.clients);
      } else if (Array.isArray(response.data)) {
        setAllClients(response.data);
      } else {
        setAllClients([]);
      }
    } catch (error) {
      console.error('Error fetching all clients:', error);
      setAllClients([]);
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page when search term changes
    
    if (searchValue.trim() === '') {
      // If search is empty, show all clients
      applyPagination(allClients, 1);
    } else {
      // Filter clients based on search term
      const filtered = allClients.filter(client => 
        (client.name && client.name.toLowerCase().includes(searchValue)) ||
        (client.email && client.email.toLowerCase().includes(searchValue)) ||
        (client.phone && client.phone.toLowerCase().includes(searchValue))
      );
      applyPagination(filtered, 1);
    }
  };

  // Apply pagination to the filtered clients
  const applyPagination = (clientsArray, page) => {
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedClients = clientsArray.slice(startIndex, endIndex);
    
    setClients(paginatedClients);
    setTotalPages(Math.ceil(clientsArray.length / recordsPerPage));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    // Apply pagination based on current search term
    if (searchTerm.trim() === '') {
      applyPagination(allClients, newPage);
    } else {
      const filtered = allClients.filter(client => 
        (client.name && client.name.toLowerCase().includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm))
      );
      applyPagination(filtered, newPage);
    }
  };

  // Calculate the starting serial number for the current page
  const getSerialNumber = (index) => {
    return (currentPage - 1) * recordsPerPage + index + 1;
  };

  // Function to toggle membership status (which controls reminders)
  const toggleMembershipStatus = async (clientId, currentStatus) => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('token');
      
      // Toggle between 'Active' and 'Inactive'
      const newStatus = currentStatus?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
      
      // Use the dedicated membership-status endpoint
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/api/clients/${clientId}/membership-status`,
        { status: newStatus }, // Note: The endpoint expects 'status' in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the client in both local states
      const updatedClients = clients.map(client => {
        if ((client.id || client._id) === clientId) {
          return { ...client, membershipStatus: newStatus };
        }
        return client;
      });
      
      const updatedAllClients = allClients.map(client => {
        if ((client.id || client._id) === clientId) {
          return { ...client, membershipStatus: newStatus };
        }
        return client;
      });
      
      setClients(updatedClients);
      setAllClients(updatedAllClients);
      
    } catch (error) {
      console.error('Error updating membership status:', error);
      alert('Failed to update membership status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      
      // Filter clients based on current search term
      let clientsForPDF = allClients;
      if (searchTerm.trim() !== '') {
        clientsForPDF = allClients.filter(client => 
          (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Clients List', 14, 15);
      
      // Add timestamp and count
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Total Clients: ${clientsForPDF.length}`, 14, 27);
      
      if (searchTerm.trim() !== '') {
        doc.text(`Search Term: "${searchTerm}"`, 14, 32);
      }

      // Prepare data for the table
      const tableData = clientsForPDF.map((client, index) => [
        index + 1, // Simple sequential numbering for PDF
        client.name || 'N/A',
        client.email || 'N/A',
        client.phone || 'N/A',
        formatDate(client.feeDueDate),
        getFeeSlot(client.feeDueDate),
        client.membershipStatus || 'Inactive',
        client.membershipStatus?.toLowerCase() === 'active' ? 'Yes' : 'No'
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        startY: searchTerm.trim() !== '' ? 37 : 32,
        head: [['S.No', 'Name', 'Email', 'Phone', 'Due Date', 'Fee Slot', 'Status', 'Receives Reminders']],
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

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        await fetchAllClients();
        
        // After fetching all clients, apply initial pagination
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/clients`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        let clientsData = [];
        if (response.data && response.data.clients) {
          clientsData = response.data.clients;
        } else if (Array.isArray(response.data)) {
          clientsData = response.data;
        }
        
        applyPagination(clientsData, 1);
        setAllClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Error fetching clients. Please try again.');
        setClients([]);
        setAllClients([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      
      <div className="clients-info">
        {searchTerm.trim() !== '' ? (
          <p>Found {allClients.filter(client => 
            (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
          ).length} clients matching "{searchTerm}"</p>
        ) : (
          <p>Showing {clients.length} of {allClients.length} clients</p>
        )}
      </div>
      
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
              <th>Receives Reminders</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client, index) => (
                <tr key={client.id || client._id}>
                  <td>{getSerialNumber(index)}</td>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{formatDate(client.feeDueDate)}</td>
                  <td>{getFeeSlot(client.feeDueDate)}</td>
                  <td>
                    <div className="status-toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={client.membershipStatus?.toLowerCase() === 'active'}
                          onChange={() => toggleMembershipStatus(client.id || client._id, client.membershipStatus)}
                          disabled={updateLoading}
                        />
                        <span className="slider round"></span>
                      </label>
                      <span className={`status-badge ${getStatusColor(client.membershipStatus)}`}>
                        {client.membershipStatus || 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`reminder-indicator ${client.membershipStatus?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {client.membershipStatus?.toLowerCase() === 'active' ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-clients-message">
                  {searchTerm.trim() !== '' ? 'No clients match your search criteria' : 'No clients found'}
                </td>
              </tr>
            )}
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
          
          {/* Show limited page buttons with ellipsis for many pages */}
          {totalPages <= 7 ? (
            // If 7 or fewer pages, show all page buttons
            [...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))
          ) : (
            // If more than 7 pages, show current page, first, last, and nearby pages
            <>
              {/* First page */}
              <button
                onClick={() => handlePageChange(1)}
                className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
              >
                1
              </button>
              
              {/* Ellipsis or second page */}
              {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
              
              {/* Pages around current page */}
              {[...Array(5)].map((_, index) => {
                const pageNum = Math.max(2, currentPage - 2) + index;
                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              {/* Ellipsis or second-to-last page */}
              {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
              
              {/* Last page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
              >
                {totalPages}
              </button>
            </>
          )}
          
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
