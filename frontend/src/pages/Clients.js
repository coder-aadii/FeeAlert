import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]); // Current page clients
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false); // Loading state for PDF generation
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [updateLoading, setUpdateLoading] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(null);
  const recordsPerPage = 20;

  // Create axios instance with auth header - memoized to prevent recreations
  const getAuthAxios = useCallback(() => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: process.env.REACT_APP_BACKEND_URL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }, []);

  // Function to determine fee slot based on due date
  const getFeeSlot = useCallback((feeDueDate) => {
    if (!feeDueDate) return 'Not Set';
    try {
      const day = new Date(feeDueDate).getDate();
      
      if (day >= 1 && day <= 10) {
        return 'Slot 1 (Pay: 1st - 5th)';
      } else if (day >= 11 && day <= 20) {
        return 'Slot 2 (Pay: 15th - 20th)';
      } else {
        return 'Slot 3 (Pay: 25th - 30th)';
      }
    } catch (error) {
      console.error('Invalid date format:', feeDueDate);
      return 'Not Set';
    }
  }, []);

  // Function to format date
  const formatDate = useCallback((date) => {
    if (!date) return 'Not Set';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', date);
      return 'Not Set';
    }
  }, []);

  // Function to get status badge color
  const getStatusColor = useCallback((status) => {
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
  }, []);

  // Centralized error handler
  const handleApiError = useCallback((error, defaultMessage) => {
    console.error(`${defaultMessage}:`, error);
    
    if (error.response) {
      // Handle specific HTTP error codes
      if (error.response.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        // Redirect to login page could be added here
      } else {
        setError(`${defaultMessage}: ${error.response.data?.message || error.response.statusText}`);
      }
    } else if (error.request) {
      setError('Network error. Please check your connection.');
    } else {
      setError(defaultMessage);
    }
  }, []);

  // Function to fetch clients with pagination and search - memoized with useCallback
  const fetchClients = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `/api/clients?page=${page}&limit=${recordsPerPage}&search=${encodeURIComponent(search)}`
      );
      
      // Handle different API response formats
      if (response.data && response.data.clients) {
        // Normalize client IDs to always use 'id'
        const normalizedClients = response.data.clients.map(client => ({
          ...client,
          id: client.id || client._id
        }));
        
        setClients(normalizedClients);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.totalCount / recordsPerPage));
        setTotalCount(response.data.totalCount || response.data.clients.length);
      } else if (Array.isArray(response.data)) {
        // Normalize client IDs to always use 'id'
        const normalizedClients = response.data.map(client => ({
          ...client,
          id: client.id || client._id
        }));
        
        setClients(normalizedClients);
        setTotalPages(Math.ceil(response.data.length / recordsPerPage));
        setTotalCount(response.data.length);
      } else {
        setClients([]);
        setTotalPages(0);
        setTotalCount(0);
      }
    } catch (error) {
      handleApiError(error, 'Error fetching clients');
    } finally {
      setLoading(false);
    }
  }, [getAuthAxios, handleApiError, recordsPerPage]);

  // Function to handle search with debounce
  const handleSearch = useCallback((e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to debounce the search
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchClients(1, searchValue);
    }, 300);
    
    setSearchTimeout(timeoutId);
  }, [fetchClients, searchTimeout]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    fetchClients(newPage, searchTerm);
  }, [fetchClients, searchTerm]);

  // Calculate the starting serial number for the current page
  const getSerialNumber = useCallback((index) => {
    return (currentPage - 1) * recordsPerPage + index + 1;
  }, [currentPage, recordsPerPage]);

  // Function to toggle membership status (which controls reminders)
  const toggleMembershipStatus = useCallback(async (clientId, currentStatus) => {
    // Prevent duplicate requests for the same client
    if (updateLoading[clientId]) return;
    
    // Set loading state for this specific client
    setUpdateLoading(prev => ({ ...prev, [clientId]: true }));
    
    try {
      const authAxios = getAuthAxios();
      
      // Toggle between 'Active' and 'Inactive'
      const newStatus = currentStatus?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
      
      // Use the dedicated membership-status endpoint
      await authAxios.patch(
        `/api/clients/${clientId}/membership-status`,
        { status: newStatus }
      );
      
      // Update the client in local state
      setClients(prevClients => 
        prevClients.map(client => {
          if (client.id === clientId) {
            return { ...client, membershipStatus: newStatus };
          }
          return client;
        })
      );
      
    } catch (error) {
      handleApiError(error, 'Failed to update membership status');
    } finally {
      // Clear loading state for this specific client
      setUpdateLoading(prev => ({ ...prev, [clientId]: false }));
    }
  }, [getAuthAxios, handleApiError, updateLoading]);

  const downloadPDF = useCallback(async () => {
    setPdfLoading(true);
    
    try {
      const authAxios = getAuthAxios();
      
      // Fetch all clients for PDF (or filtered by search)
      const response = await authAxios.get(
        `/api/clients?limit=1000&search=${encodeURIComponent(searchTerm)}`
      );
      
      let clientsForPDF = [];
      if (response.data && response.data.clients) {
        clientsForPDF = response.data.clients;
      } else if (Array.isArray(response.data)) {
        clientsForPDF = response.data;
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
      handleApiError(error, 'Error generating PDF');
    } finally {
      setPdfLoading(false);
    }
  }, [formatDate, getFeeSlot, getAuthAxios, handleApiError, searchTerm]);

  // Initial data fetch - now with proper dependencies
  useEffect(() => {
    fetchClients(1, '');
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [fetchClients, searchTimeout]);

  // Memoize pagination buttons to prevent unnecessary re-renders
  const paginationButtons = useMemo(() => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
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
              disabled={loading}
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
              disabled={loading}
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
                    disabled={loading}
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
              disabled={loading}
              className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  }, [currentPage, handlePageChange, loading, totalPages]);

  // Memoize client rows to prevent unnecessary re-renders
  const clientRows = useMemo(() => {
    if (clients.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="no-clients-message">
            {searchTerm.trim() !== '' ? 'No clients match your search criteria' : 'No clients found'}
          </td>
        </tr>
      );
    }

    return clients.map((client, index) => (
      <tr key={client.id}>
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
                onChange={() => toggleMembershipStatus(client.id, client.membershipStatus)}
                disabled={updateLoading[client.id]}
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
    ));
  }, [clients, formatDate, getFeeSlot, getSerialNumber, getStatusColor, searchTerm, toggleMembershipStatus, updateLoading]);

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
        <p>Showing {clients.length} of {totalCount} clients{searchTerm ? ` matching "${searchTerm}"` : ''}</p>
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
            {clientRows}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {paginationButtons}
    </div>
  );
};

export default Clients;