import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../resouces/images/loginPanel_img.jpg';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username: formData.username,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.token);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="text-center text-lg-start">
      <div className="container py-4">
        <div className="card">
          <div className="row g-0 align-items-center">
            {/* Logo Section */}
            <div className="col-lg-4 d-none d-lg-flex">
              <img
                src={logo}
                alt="FeeAlert Logo"
                className="img-fluid rounded-start"
                style={{ objectFit: 'cover', height: '100%' }}
              />
            </div>
            {/* Form Section */}
            <div className="col-lg-8">
              <div className="card-body py-5 px-md-5">
                {/* Logo for mobile view */}
                <div className="text-center mb-4 d-lg-none">
                  <img
                    src={logo}
                    alt="FeeAlert Logo"
                    className="img-fluid mb-3"
                    style={{ maxHeight: '100px' }}
                  />
                </div>
                
                <h2 className="fw-bold mb-4">Sign In to FeeAlert</h2>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Username Input */}
                  <div className="form-outline mb-4">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                    />
                    <label className="form-label" htmlFor="username">Username</label>
                  </div>

                  {/* Password Input */}
                  <div className="form-outline mb-4">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <label className="form-label" htmlFor="password">Password</label>
                  </div>

                  {/* Remember me checkbox and Forgot Password Link */}
                  <div className="row mb-4">
                    <div className="col-6 d-flex justify-content-start">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="col-6 d-flex justify-content-end">
                      <Link to="/forgot-password" className="text-primary">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4 w-100"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
