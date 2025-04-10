import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email
      });
      
      setMessage('Password reset instructions have been sent to your email.');
      // Clear the email field after successful submission
      setEmail('');
      
      // Automatically redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="text-center text-lg-start">
      <div className="container py-4">
        <div className="card">
          <div className="row g-0 align-items-center">
            <div className="col-lg-8 mx-auto">
              <div className="card-body py-5 px-md-5">
                <h2 className="fw-bold mb-4">Forgot Password</h2>
                <p className="mb-4">Enter your email address and we'll send you instructions to reset your password.</p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="alert alert-success" role="alert">
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-outline mb-4">
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                    <label className="form-label" htmlFor="email">Email address</label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Reset Password'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => navigate('/login')}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
