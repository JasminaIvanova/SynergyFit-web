import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { exerciseDbService, exerciseService } from '../services';

const pickFirst = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
};

const extractMediaUrls = (external) => {
  if (!external || typeof external !== 'object') return [];

  const candidates = [];

  const push = (v) => {
    if (!v) return;
    if (Array.isArray(v)) {
      v.forEach((item) => push(item));
      return;
    }
    if (typeof v === 'string') {
      candidates.push(v);
      return;
    }
    if (typeof v === 'object') {
      if (typeof v.url === 'string') candidates.push(v.url);
      if (typeof v.src === 'string') candidates.push(v.src);
    }
  };

  push(external.gifUrl);
  push(external.gif_url);
  push(external.gif);
  push(external.imageUrl);
  push(external.image_url);
  push(external.images);
  push(external.imageUrls);
  push(external.image_urls);

  // Some APIs provide videos as URLs too; we will show them separately as links.
  push(external.thumbnailUrl);
  push(external.thumbnail_url);

  // De-dup
  return Array.from(new Set(candidates)).filter((u) => /^https?:\/\//i.test(u));
};

const extractVideoUrls = (external) => {
  if (!external || typeof external !== 'object') return [];

  const candidates = [];
  const push = (v) => {
    if (!v) return;
    if (Array.isArray(v)) {
      v.forEach((item) => push(item));
      return;
    }
    if (typeof v === 'string') {
      candidates.push(v);
      return;
    }
    if (typeof v === 'object') {
      if (typeof v.url === 'string') candidates.push(v.url);
      if (typeof v.videoUrl === 'string') candidates.push(v.videoUrl);
    }
  };

  push(external.videoUrl);
  push(external.video_url);
  push(external.videos);

  return Array.from(new Set(candidates)).filter((u) => /^https?:\/\//i.test(u));
};

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [external, setExternal] = useState(null);
  const [error, setError] = useState('');

  const mediaUrls = useMemo(() => extractMediaUrls(external), [external]);
  const videoUrls = useMemo(() => extractVideoUrls(external), [external]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');

      try {
        // If the ID is a UUID, try internal DB first; otherwise treat it as external ExerciseDB id.
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        if (isUuid) {
          const res = await exerciseService.getExerciseById(id);
          const ex = res.data?.exercise;
          setExercise(ex || null);

          const name = ex?.name;
          if (name) {
            try {
              const searchRes = await exerciseDbService.searchExercises(name);
              const list = searchRes.data;

              // API may return an array directly or wrap it.
              const first = pickFirst(list?.exercises || list?.data || list);
              setExternal(first || null);
            } catch (externalErr) {
              console.error('Error loading external exercise info:', externalErr);
              setExternal(null);
            }
          } else {
            setExternal(null);
          }
        } else {
          // External exercise: fetch directly by external id.
          const externalRes = await exerciseDbService.getExerciseByExternalId(id);
          const externalData = externalRes.data;
          setExternal(externalData || null);

          // Build a minimal local exercise object for rendering basics.
          setExercise({
            name: externalData?.name || 'Exercise',
            description: externalData?.description || '',
            category: externalData?.bodyPart || externalData?.category || '',
            muscle_group: externalData?.target || '',
            equipment: externalData?.equipment || '',
          });
        }
      } catch (err) {
        console.error('Error loading exercise detail:', err);
        setError(err?.response?.data?.message || 'Failed to load exercise.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <button className="btn btn-secondary mb-2" onClick={() => navigate('/exercises')}>
          ← Back to Exercises
        </button>
        <div className="card">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="page">
        <button className="btn btn-secondary mb-2" onClick={() => navigate('/exercises')}>
          ← Back to Exercises
        </button>
        <div className="card">
          <p>Exercise not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/exercises')}>
        ← Back to Exercises
      </button>

      <div className="card">
        <h1 className="page-title">{exercise.name}</h1>
        {exercise.description && <p className="text-muted">{exercise.description}</p>}

        <div className="grid grid-3 mt-2">
          <div>
            <strong>Category:</strong> {exercise.category || 'N/A'}
          </div>
          <div>
            <strong>Muscle group:</strong> {exercise.muscle_group || 'N/A'}
          </div>
          <div>
            <strong>Equipment:</strong> {exercise.equipment || 'None'}
          </div>
        </div>
      </div>

      {external && (
        <div className="card">
          <h2 className="mb-2">More info</h2>
          <div className="grid grid-3">
            <div>
              <strong>Body part:</strong> {external.bodyPart || external.bodypart || 'N/A'}
            </div>
            <div>
              <strong>Target:</strong> {external.target || external.muscle || 'N/A'}
            </div>
            <div>
              <strong>Equipment:</strong> {external.equipment || 'N/A'}
            </div>
          </div>

          {(external.exerciseType || external.exercisetype) && (
            <div className="mt-2">
              <strong>Type:</strong> {external.exerciseType || external.exercisetype}
            </div>
          )}
        </div>
      )}

      {(mediaUrls.length > 0 || videoUrls.length > 0) && (
        <div className="card">
          <h2 className="mb-2">Media</h2>

          {mediaUrls.length > 0 && (
            <div className="grid grid-3">
              {mediaUrls.slice(0, 9).map((url) => (
                <div key={url} className="card" style={{ marginBottom: 0 }}>
                  <img
                    src={url}
                    alt={exercise.name}
                    style={{ width: '100%', borderRadius: '8px', display: 'block' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {videoUrls.length > 0 && (
            <div className="mt-2">
              <strong>Videos:</strong>
              <div style={{ marginTop: '8px' }}>
                {videoUrls.slice(0, 5).map((url) => (
                  <div key={url} style={{ marginBottom: '6px' }}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!external && <p className="text-muted">External media unavailable.</p>}
        </div>
      )}

      {external?.instructions && Array.isArray(external.instructions) && external.instructions.length > 0 && (
        <div className="card">
          <h2 className="mb-2">Instructions</h2>
          <ol style={{ paddingLeft: '18px' }}>
            {external.instructions.slice(0, 12).map((step, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetail;
