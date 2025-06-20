import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Per instructions, assume process.env.API_KEY is pre-configured.
// No local dummy key assignment needed here if following strict instructions.
// The app and services will handle its potential absence if necessary.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
