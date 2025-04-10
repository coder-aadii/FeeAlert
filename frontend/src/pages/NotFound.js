import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Image */}
        <div className="mb-8">
          <img
            src="https://img.icons8.com/?size=100&id=43396&format=png&color=000000"
            alt="404 Not Found"
            className="mx-auto h-48 w-48"
          />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-6">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Contact our support team at</p>
          <a
            href="mailto:support@example.com"
            className="text-blue-600 hover:text-blue-500"
          >
            support@example.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
