import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease;
  }
  
  /* Ensure form elements have proper contrast */
  input, select, textarea, button {
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.inputText};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  /* Apply theme colors to various components */
  a {
    color: ${({ theme }) => theme.colors.link};
  }
  
  table {
    color: ${({ theme }) => theme.colors.text};
  }
  
  .card, .panel, .container, .form-container {
    background-color: ${({ theme }) => theme.colors.cardBackground};
    color: ${({ theme }) => theme.colors.text};
  }
  
  /* Ensure headings and text elements have proper contrast */
  h1, h2, h3, h4, h5, h6, p, span, label {
    color: ${({ theme }) => theme.colors.text};
  }
  
  /* Ensure buttons have proper styling */
  .btn {
    background-color: ${({ theme }) => theme.colors.buttonBackground};
    color: ${({ theme }) => theme.colors.buttonText};
    &:hover {
      background-color: ${({ theme }) => theme.colors.buttonHoverBackground};
    }
  }

  /* Navbar specific styles */
  .navbar {
    background-color: ${({ theme }) => theme.colors.navBackground};
    color: ${({ theme }) => theme.colors.navText};
  }

  .navbar-link {
    color: ${({ theme }) => theme.colors.navText} !important;
    &:hover {
      color: ${({ theme }) => theme.colors.navLinkHover} !important;
    }
  }

  /* Table specific styles */
  .table {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.cardBackground};
  }

  .table thead th {
    background-color: ${({ theme }) => theme.colors.tableHeaderBackground};
    color: ${({ theme }) => theme.colors.tableHeaderText};
  }
`;

const lightTheme = {
  colors: {
    background: '#f5f5f5',
    text: '#333',
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    border: '#dee2e6',
    link: '#007bff',
    cardBackground: '#ffffff',
    inputBackground: '#ffffff',
    inputText: '#333',
    buttonBackground: '#007bff',
    buttonText: '#ffffff',
    buttonHoverBackground: '#0056b3',
    navBackground: '#ffffff',
    navText: '#333',
    navLinkHover: '#007bff',
    tableHeaderBackground: '#f8f9fa',
    tableHeaderText: '#333',
  },
};

const darkTheme = {
  colors: {
    background: '#1a1a1a',           // Darker background
    text: '#ffffff',                 // White text
    primary: '#3391ff',             // Brighter blue
    secondary: '#adb5bd',
    success: '#2dd4bf',             // Brighter success
    danger: '#ef4444',              // Brighter danger
    warning: '#fbbf24',             // Brighter warning
    info: '#22d3ee',                // Brighter info
    border: '#4b5563',              // Lighter border
    link: '#60a5fa',                // Brighter link
    cardBackground: '#2d2d2d',       // Lighter card background
    inputBackground: '#3d3d3d',      // Lighter input background
    inputText: '#ffffff',            // White input text
    buttonBackground: '#3391ff',     // Brighter button
    buttonText: '#ffffff',           // White button text
    buttonHoverBackground: '#1a75ff', // Brighter hover
    navBackground: '#2d2d2d',        // Navbar background
    navText: '#ffffff',              // Navbar text
    navLinkHover: '#60a5fa',         // Navbar link hover
    tableHeaderBackground: '#374151', // Table header background
    tableHeaderText: '#ffffff',       // Table header text
  },
};

const theme = {
  light: lightTheme,
  dark: darkTheme,
};

export { lightTheme, darkTheme, GlobalStyles };
export default theme;
