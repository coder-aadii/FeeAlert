import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Smart Fee Tracking",
      description: "Never miss a payment deadline with our intelligent tracking system",
      icon: "📊"
    },
    {
      title: "Automated Reminders",
      description: "Set up customized email and SMS reminders for upcoming fees",
      icon: "🔔"
    },
    {
      title: "Payment History",
      description: "Access complete payment history and analytics at your fingertips",
      icon: "📱"
    },
    {
      title: "Multi-channel Alerts",
      description: "Get notifications through email, SMS, or both - your choice!",
      icon: "✉️"
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section animate-fade-in">
        <h1>Welcome to FeeAlert</h1>
        <p className="hero-subtitle">
          Stay on top of your fee payments with smart reminders and tracking
        </p>
        <button className="cta-button" onClick={() => navigate('/send-reminder')}>
          Get Started Now
        </button>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="animate-fade-in">Why Choose FeeAlert?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bottom-cta animate-fade-in">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who never miss their fee payments</p>
        <button className="cta-button" onClick={() => navigate('/register')}>
          Start Your Free Trial
        </button>
      </section>
    </div>
  );
};

export default Home;
