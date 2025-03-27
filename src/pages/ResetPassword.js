import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password
      });
      
      setMessage('Password has been reset successfully');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
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
                <h2 className="fw-bold mb-4">Reset Password</h2>
                <p className="mb-4">Please enter your new password.</p>

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
                      type="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength="6"
                    />
                    <label className="form-label" htmlFor="password">New Password</label>
                  </div>

                  <div className="form-outline mb-4">
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength="6"
                    />
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4 w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;