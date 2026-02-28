import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { exerciseDbService } from '../services';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', muscleGroups: '', difficulty: '' });
  const [error, setError] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [filter]);

  const loadExercises = async () => {
    try {
      setError('');
      // ExerciseDB API supports general listing + search.
      // We keep the existing UI filters and translate them into a search string.
      const terms = [];
      if (filter.category) terms.push(filter.category);
      if (filter.difficulty) terms.push(filter.difficulty);
      if (filter.muscleGroups) terms.push(filter.muscleGroups);

      if (terms.length > 0) {
        const res = await exerciseDbService.searchExercises(terms.join(' '));
        const data = res.data;
        const list = data?.data || data?.exercises || data;
        setExercises(Array.isArray(list) ? list : []);
        setHasNextPage(false);
        setNextCursor('');
      } else {
        const res = await exerciseDbService.getExercises({ limit: 200 });
        const data = res.data;
        const list = data?.data || data?.exercises || data;
        setExercises(Array.isArray(list) ? list : []);
        setHasNextPage(!!data?.meta?.hasNextPage);
        setNextCursor(data?.meta?.nextCursor || '');
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
      setError(error?.response?.data?.message || 'Failed to load exercises from ExerciseDB.');
      setHasNextPage(false);
      setNextCursor('');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasNextPage || !nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const res = await exerciseDbService.getExercises({ limit: 200, after: nextCursor });
      const data = res.data;
      const list = data?.data || [];

      setExercises((prev) => {
        const seen = new Set(prev.map((x) => x.exerciseId || x.id || x._id));
        const merged = [...prev];
        for (const item of list) {
          const key = item.exerciseId || item.id || item._id;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        }
        return merged;
      });

      setHasNextPage(!!data?.meta?.hasNextPage);
      setNextCursor(data?.meta?.nextCursor || '');
    } catch (err) {
      console.error('Error loading more exercises:', err);
      setError(err?.response?.data?.message || 'Failed to load more exercises.');
    } finally {
      setLoadingMore(false);
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
      ) : error ? (
        <div className="card text-center">
          <p className="error">{error}</p>
          <p className="text-muted" style={{ marginTop: '8px' }}>
            If you are running locally, set RAPIDAPI_KEY in the server .env.
          </p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">No exercises found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {exercises.map((exercise) => (
              <Link
                key={exercise.exerciseId || exercise.id || exercise._id}
                to={`/exercises/${exercise.exerciseId || exercise.id || exercise._id}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h3>{exercise.name}</h3>
                <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                  <span className="workout-badge scheduled" style={{ marginRight: '5px' }}>
                    {Array.isArray(exercise.bodyParts) && exercise.bodyParts.length > 0
                      ? exercise.bodyParts[0]
                      : (exercise.bodyPart || exercise.category || 'exercise')}
                  </span>
                  <span className="workout-badge completed">
                    {exercise.exerciseType || exercise.difficulty_level || exercise.difficulty || 'N/A'}
                  </span>
                </div>
                
                {exercise.description && (
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>{exercise.description}</p>
                )}
                
                <div style={{ marginTop: '10px' }}>
                  <strong>Muscle Groups:</strong>
                  <p className="text-muted">
                    {(
                      (Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles.join(', ') : '') ||
                      exercise.target ||
                      exercise.muscle_group ||
                      (Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups.join(', ') : '')
                    ) || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <strong>Equipment:</strong>
                  <p className="text-muted">
                    {(Array.isArray(exercise.equipments) ? exercise.equipments.join(', ') : '') || exercise.equipment || 'None'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {hasNextPage && nextCursor && (
            <div className="flex-center mt-2">
              <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Exercises;
