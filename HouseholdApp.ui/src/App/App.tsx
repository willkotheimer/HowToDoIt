import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from '../helpers/Routes';
import Nav from '../Components/Nav';
import './App.scss';
import { AuthProvider } from '../context/AuthContext';
import Footer from '../Components/Footer';

function App() {
  return (
    <AuthProvider>
      <div className='App'>
        <Router>
          <Nav />
          <main className="main-content">
            <Routes />
          </main>
          <Footer />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
