import React, { useState, useEffect } from 'react';
import { exerciseService } from '../services';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', muscleGroups: '', difficulty: '' });

  useEffect(() => {
    loadExercises();
  }, [filter]);

  const loadExercises = async () => {
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.difficulty) params.difficulty = filter.difficulty;
      if (filter.muscleGroups) params.muscleGroups = filter.muscleGroups;

      const res = await exerciseService.getExercises(params);
      setExercises(res.data.exercises || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Exercise Library</h1>
        <p className="page-subtitle">Browse and manage exercises</p>
      </div>

      <div className="card mb-2">
        <div className="grid grid-3">
          <div className="form-group">
            <label>Category</label>
            <select 
              className="form-control"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="balance">Balance</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select 
              className="form-control"
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Muscle Group</label>
            <select 
              className="form-control"
              value={filter.muscleGroups}
              onChange={(e) => setFilter({ ...filter, muscleGroups: e.target.value })}
            >
              <option value="">All Muscles</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="shoulders">Shoulders</option>
              <option value="arms">Arms</option>
              <option value="abs">Abs</option>
              <option value="legs">Legs</option>
              <option value="glutes">Glutes</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : exercises.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">No exercises found</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {exercises.map((exercise) => (
            <div key={exercise.id || exercise._id} className="card">
              <h3>{exercise.name}</h3>
              <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                <span className="workout-badge scheduled" style={{ marginRight: '5px' }}>
                  {exercise.category}
                </span>
                <span className="workout-badge completed">
                  {exercise.difficulty_level || exercise.difficulty}
                </span>
              </div>
              
              {exercise.description && (
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{exercise.description}</p>
              )}
              
              <div style={{ marginTop: '10px' }}>
                <strong>Muscle Groups:</strong>
                <p className="text-muted">
                  {(
                    exercise.muscle_group ||
                    (Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(', ') : '')
                  ) || 'N/A'}
                </p>
              </div>
              
              <div>
                <strong>Equipment:</strong>
                <p className="text-muted">{exercise.equipment || 'None'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exercises;
