import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const History = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/history', {
        params: {
          type: filters.type,
          startDate: filters.startDate,
          endDate: filters.endDate,
          search: filters.searchQuery,
          page: currentPage
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

  const exportHistory = async () => {
    try {
      const response = await axios.get('/api/history/export', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `history-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to export history');
      console.error('Error exporting history:', error);
    }
  };

  const renderHistoryItem = (item) => {
    const isPayment = item.type === 'payment';

    return (
      <div key={item.id} className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {isPayment ? `Payment - $${item.amount}` : item.title}
            </h3>
            <p className="text-gray-600">
              {format(new Date(item.createdAt), 'PPP')}
            </p>
            <p className="text-gray-700 mt-2">{item.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isPayment 
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {item.type}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment & Reminder History</h1>
        <button
          onClick={exportHistory}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="all">All</option>
              <option value="payment">Payments</option>
              <option value="reminder">Reminders</option>
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
                placeholder="Search..."
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
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50"
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
