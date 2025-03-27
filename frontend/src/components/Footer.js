import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-primary text-light pt-5 pb-4">
            <div className="container">
                <div className="row">
                    {/* About Section */}
                    <div className="col-md-4">
                        <h5 className="text-uppercase">Wake Me Up</h5>
                        <p>
                            Wake Me Up is a platform offering notifications and reminders for various purposes. Stay connected and never miss an important update.
                        </p>
                    </div>

                    {/* Quick Links Section */}
                    <div className="col-md-4">
                        <h5 className="text-uppercase">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="#home" className="text-light">Home</a></li>
                            <li><a href="#about" className="text-light">About</a></li>
                            <li><a href="#services" className="text-light">Services</a></li>
                            <li><a href="#contact" className="text-light">Contact</a></li>
                        </ul>
                    </div>

                    {/* Social Links Section */}
                    <div className="col-md-4">
                        <h5 className="text-uppercase">Connect With Me</h5>
                        <ul className="list-unstyled d-flex">
                            <li className="me-3">
                                <a href="https://github.com/coder-aadii" target="_blank" rel="noopener noreferrer" className="text-light">
                                    <FaGithub size={24} />
                                </a>
                            </li>
                            <li className="me-3">
                                <a href="https://www.linkedin.com/in/aditya-aerpule-a22062309/" target="_blank" rel="noopener noreferrer" className="text-light">
                                    <FaLinkedin size={24} />
                                </a>
                            </li>
                            <li className="me-3">
                                <a href="mailto:adityaaerpule@gmail.com" className="text-light">
                                    <FaEnvelope size={24} />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Section */}
                <p className="mb-0">© 2025 Wake Me Up. All Rights Reserved.</p>
                <p>
                    Designed and Developed with
                    <img
                        src="https://res.cloudinary.com/deoegf9on/image/upload/v1743064818/icons8-heart_m26xfp.gif"
                        alt="Heart Icon"
                        style={{ width: "24px", margin: "0 5px" }}
                    />
                    by <strong>Code-Aadi</strong>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
