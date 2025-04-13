import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const History = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    searchQuery: '',
    status: 'all'
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/history', {
        params: {
          type: filters.type,
          startDate: filters.startDate,
          endDate: filters.endDate,
          search: filters.searchQuery,
          status: filters.status,
          page: currentPage
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setHistory(response.data.items);
      setTotalPages(Math.ceil(response.data.total / response.data.perPage));
    } catch (error) {
      toast.error('Failed to fetch history');
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      startDate: '',
      endDate: '',
      searchQuery: '',
      status: 'all'
    });
    setCurrentPage(1);
  };

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Payment & Reminder History', 14, 15);
      
      // Add filters info
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 22);
      if (filters.startDate || filters.endDate) {
        doc.text(`Period: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`, 14, 27);
      }

      // Prepare table data
      const tableData = history.map(item => [
        format(new Date(item.createdAt), 'PP'),
        item.type.charAt(0).toUpperCase() + item.type.slice(1),
        item.title || (item.type === 'payment' ? `Payment - $${item.amount}` : 'N/A'),
        item.status || 'N/A',
        item.description || 'N/A',
        item.clientDetails?.name || 'N/A',
        item.type === 'reminder' ? (item.reminderType || 'N/A') : '-'
      ]);

      // Add table
      autoTable(doc, {
        startY: 35,
        head: [['Date', 'Type', 'Title', 'Status', 'Description', 'Client', 'Reminder Type']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: 255,
          fontSize: 12
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          5: { cellWidth: 30 }, // Client column
          6: { cellWidth: 30 }  // Reminder Type column
        }
      });

      doc.save(`history-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHistoryItem = (item) => {
    const isPayment = item.type === 'payment';
    
    return (
      <div key={item._id || item.id} className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {isPayment ? `Payment - $${item.amount}` : item.title}
            </h3>
            <p className="text-gray-600">
              {format(new Date(item.createdAt), 'PPP')}
            </p>
            <p className="text-gray-700 mt-2">{item.description}</p>
            
            {item.clientDetails && (
              <div className="mt-3 p-2 bg-gray-50 rounded">
                <p className="text-sm"><strong>Client:</strong> {item.clientDetails.name}</p>
                {item.type === 'reminder' && item.reminderType && (
                  <p className="text-sm"><strong>Sent via:</strong> {item.reminderType}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              isPayment 
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {item.type}
            </span>
            {item.status && (
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment & Reminder History</h1>
        <button
          onClick={downloadPDF}
          disabled={pdfLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Types</option>
              <option value="payment">Payments</option>
              <option value="reminder">Reminders</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Search</label>
            <div className="flex">
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Search in history..."
                className="w-full p-2 border rounded-l"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>
          <div className="md:col-span-5 flex justify-end mt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-lg">No history items found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div>
          {history.map(renderHistoryItem)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-blue-50 text-blue-600 border border-blue-200 disabled:opacity-50 hover:bg-blue-100"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white rounded shadow text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-blue-50 text-blue-600 border border-blue-200 disabled:opacity-50 hover:bg-blue-100"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default History;
