import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="logo-section">
                    <div className="logo">📋</div>
                    <h1 className="app-name">Neurogine</h1>
                    <p className="tagline">Real-time Kanban Board</p>
                </div>

                <div className="welcome-buttons">
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate('/signup')}
                    >
                        Create Account
                    </button>
                </div>

                <p className="welcome-footer">
                    Collaborate in real-time with your team
                </p>
            </div>
        </div>
    );
}

export default WelcomePage;

