import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import WorkoutCreate from './pages/WorkoutCreate';
import WorkoutSession from './pages/WorkoutSession';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Meals from './pages/Meals';
import MealCreate from './pages/MealCreate';
import Progress from './pages/Progress';
import Social from './pages/Social';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/workouts" element={
                <PrivateRoute>
                  <Workouts />
                </PrivateRoute>
              } />

              <Route path="/workouts/new" element={
                <PrivateRoute>
                  <WorkoutCreate />
                </PrivateRoute>
              } />

              <Route path="/workouts/session" element={
                <PrivateRoute>
                  <WorkoutSession />
                </PrivateRoute>
              } />

              <Route path="/workouts/session/:id" element={
                <PrivateRoute>
                  <WorkoutSession />
                </PrivateRoute>
              } />
              
              <Route path="/workouts/:id" element={
                <PrivateRoute>
                  <WorkoutDetail />
                </PrivateRoute>
              } />
              
              <Route path="/exercises" element={
                <PrivateRoute>
                  <Exercises />
                </PrivateRoute>
              } />

              <Route path="/exercises/:id" element={
                <PrivateRoute>
                  <ExerciseDetail />
                </PrivateRoute>
              } />
              
              <Route path="/meals" element={
                <PrivateRoute>
                  <Meals />
                </PrivateRoute>
              } />

              <Route path="/meals/create" element={
                <PrivateRoute>
                  <MealCreate />
                </PrivateRoute>
              } />
              
              <Route path="/progress" element={
                <PrivateRoute>
                  <Progress />
                </PrivateRoute>
              } />
              
              <Route path="/social" element={
                <PrivateRoute>
                  <Social />
                </PrivateRoute>
              } />
              
              <Route path="/goals" element={
                <PrivateRoute>
                  <Goals />
                </PrivateRoute>
              } />
              
              <Route path="/profile/:id?" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
