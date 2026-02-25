import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Welcome to SynergyFit</h1>
          <p>Your complete fitness tracking and social platform</p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features" style={{ padding: '60px 20px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>
            Everything You Need to Reach Your Goals
          </h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <h3 style={{ color: '#4c6ef5', marginBottom: '15px' }}>🏋️ Workout Tracking</h3>
              <p>Create custom workout routines, track your progress, and access a comprehensive exercise library</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: '#4c6ef5', marginBottom: '15px' }}>🥗 Nutrition Management</h3>
              <p>Log your meals, track calories and macros, and stay on top of your nutrition goals</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: '#4c6ef5', marginBottom: '15px' }}>📊 Progress Monitoring</h3>
              <p>Track weight, measurements, and body composition with detailed charts and statistics</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: '#4c6ef5', marginBottom: '15px' }}>🎯 Goal Setting</h3>
              <p>Set personalized fitness goals and track milestones to stay motivated</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: '#4c6ef5', marginBottom: '15px' }}>👥 Social Community</h3>
              <p>Connect with friends, share achievements, and get inspired by others</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: '#4c6ef5', marginBottom: '15px' }}>📈 Analytics</h3>
              <p>View detailed statistics and insights about your fitness journey</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
