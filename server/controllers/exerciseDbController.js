const axios = require('axios');

const BASE_URL = 'https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1';
const HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';

const getRapidHeaders = () => {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    const error = new Error('RapidAPI key is not configured (RAPIDAPI_KEY)');
    error.statusCode = 500;
    throw error;
  }

  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': process.env.RAPIDAPI_EXERCISEDB_HOST || HOST,
  };
};

const noStore = (res) => {
  res.set('Cache-Control', 'no-store');
};

const forwardGet = async (res, path, params = {}) => {
  const { data } = await axios.get(`${BASE_URL}${path}`, {
    headers: getRapidHeaders(),
    params,
    timeout: 15000,
  });

  noStore(res);
  return data;
};

exports.liveness = async (req, res) => {
  try {
    const data = await forwardGet(res, '/liveness');
    res.json(data);
  } catch (error) {
    console.error('ExerciseDB liveness error:', error?.message || error);
    res.status(error?.response?.status || error.statusCode || 500).json({
      message: error?.response?.data?.message || error?.message || 'ExerciseDB proxy error',
    });
  }
};

exports.getBodyparts = async (req, res) => {
  try {
    const data = await forwardGet(res, '/bodyparts');
    res.json(data);
  } catch (error) {
    console.error('ExerciseDB bodyparts error:', error?.message || error);
    res.status(error?.response?.status || error.statusCode || 500).json({
      message: error?.response?.data?.message || error?.message || 'ExerciseDB proxy error',
    });
  }
};

exports.getExercises = async (req, res) => {
  try {
    // Pass through query params (e.g. limit, cursor/after, etc.)
    const params = { ...req.query };

    const data = await forwardGet(res, '/exercises', params);
    res.json(data);
  } catch (error) {
    console.error('ExerciseDB get exercises error:', error?.message || error);
    res.status(error?.response?.status || error.statusCode || 500).json({
      message: error?.response?.data?.message || error?.message || 'ExerciseDB proxy error',
    });
  }
};

exports.searchExercises = async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) {
      return res.status(400).json({ message: 'Missing required query param: search' });
    }

    const data = await forwardGet(res, '/exercises/search', { search });
    res.json(data);
  } catch (error) {
    console.error('ExerciseDB search exercises error:', error?.message || error);
    res.status(error?.response?.status || error.statusCode || 500).json({
      message: error?.response?.data?.message || error?.message || 'ExerciseDB proxy error',
    });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const data = await forwardGet(res, `/exercises/${encodeURIComponent(exerciseId)}`);
    res.json(data);
  } catch (error) {
    console.error('ExerciseDB get exercise by id error:', error?.message || error);
    res.status(error?.response?.status || error.statusCode || 500).json({
      message: error?.response?.data?.message || error?.message || 'ExerciseDB proxy error',
    });
  }
};
