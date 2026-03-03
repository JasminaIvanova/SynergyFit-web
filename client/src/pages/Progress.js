import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { progressService } from '../services';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Progress = () => {
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [form, setForm] = useState({
    weight: '',
    mood: '',
    energyLevel: '',
    sleepHours: '',
    notes: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: ''
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    loadProgress();
    loadStats();
  }, [period]);

  const loadProgress = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const res = await progressService.getProgress({
        startDate: startDate.toISOString(),
        limit: 100,
      });
      setProgress(res.data.progress || []);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await progressService.getStats(period);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      date: new Date().toISOString(),
      weight: form.weight ? parseFloat(form.weight) : undefined,
      mood: form.mood || undefined,
      energy_level: form.energyLevel ? parseInt(form.energyLevel) : undefined,
      sleep_hours: form.sleepHours ? parseFloat(form.sleepHours) : undefined,
      notes: form.notes || undefined,
    };

    // Add measurements with correct field names
    if (form.measurements.chest) data.chest_measurement = parseFloat(form.measurements.chest);
    if (form.measurements.waist) data.waist_measurement = parseFloat(form.measurements.waist);
    if (form.measurements.hips) data.hips_measurement = parseFloat(form.measurements.hips);
    if (form.measurements.arms) data.arms_measurement = parseFloat(form.measurements.arms);
    if (form.measurements.thighs) data.thighs_measurement = parseFloat(form.measurements.thighs);

    // Remove undefined values
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    try {
      await progressService.createProgress(data);
      showNotification('Progress entry added successfully!', 'success');
      setShowForm(false);
      setForm({
        weight: '',
        mood: '',
        energyLevel: '',
        sleepHours: '',
        notes: '',
        measurements: {
          chest: '',
          waist: '',
          hips: '',
          arms: '',
          thighs: ''
        }
      });
      loadProgress();
      loadStats();
    } catch (error) {
      console.error('Error creating progress:', error);
      showNotification('Error adding progress entry', 'error');
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleMeasurementChange = (field) => (e) => {
    setForm(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: e.target.value
      }
    }));
  };

  const chartData = {
    labels: stats?.chartData?.map(d => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Weight (kg)',
        data: stats?.chartData?.map(d => d.weight) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress',
      },
    },
  };

  return (
    <div className="page">
      {/* Toast Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: notification.type === 'success' ? 'rgba(0, 229, 255, 0.95)' : 'rgba(255, 75, 75, 0.95)',
          color: notification.type === 'success' ? '#121212' : '#fff',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          fontWeight: '600',
          fontSize: '1rem',
          minWidth: '250px'
        }}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: '8px' }}>Progress Tracking</h1>
          <p className="page-subtitle">Monitor your fitness journey</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ 
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            minWidth: '140px'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-2">
          <h2 className="mb-2" style={{ fontSize: '1.3rem' }}>Log Your Progress</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={form.weight}
                  onChange={handleChange('weight')}
                  placeholder="e.g. 75.5"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Energy Level (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-control"
                  value={form.energyLevel}
                  onChange={handleChange('energyLevel')}
                  placeholder="1-10"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  className="form-control"
                  value={form.sleepHours}
                  onChange={handleChange('sleepHours')}
                  placeholder="e.g. 7.5"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Mood</label>
                <select 
                  className="form-control"
                  value={form.mood}
                  onChange={handleChange('mood')}
                >
                  <option value="">Select mood</option>
                  <option value="Great">Great</option>
                  <option value="Good">Good</option>
                  <option value="Okay">Okay</option>
                  <option value="Tired">Tired</option>
                  <option value="Stressed">Stressed</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--primary-color)' }}>Measurements (cm) - Optional</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.9rem' }}>Chest</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.measurements.chest}
                    onChange={handleMeasurementChange('chest')}
                    placeholder="cm"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.9rem' }}>Waist</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.measurements.waist}
                    onChange={handleMeasurementChange('waist')}
                    placeholder="cm"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.9rem' }}>Hips</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.measurements.hips}
                    onChange={handleMeasurementChange('hips')}
                    placeholder="cm"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.9rem' }}>Arms</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.measurements.arms}
                    onChange={handleMeasurementChange('arms')}
                    placeholder="cm"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.9rem' }}>Thighs</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.measurements.thighs}
                    onChange={handleMeasurementChange('thighs')}
                    placeholder="cm"
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={form.notes}
                onChange={handleChange('notes')}
                placeholder="How are you feeling? Any observations?"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-2" style={{ padding: '12px 16px' }}>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label style={{ marginBottom: '6px', fontSize: '0.85rem' }}>Time Period</label>
          <select 
            className="form-control"
            style={{ padding: '8px 12px' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Weight Change</h3>
            <div className="value">
              {stats.weightChange ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}` : 'N/A'}
            </div>
            <div className="label">kg</div>
          </div>
          <div className="stat-card">
            <h3>Total Entries</h3>
            <div className="value">{stats.totalEntries || 0}</div>
            <div className="label">logged</div>
          </div>
          <div className="stat-card">
            <h3>Average Weight</h3>
            <div className="value">{stats.averageWeight?.toFixed(1) || 'N/A'}</div>
            <div className="label">kg</div>
          </div>
        </div>
      )}

      {stats?.chartData && stats.chartData.length > 0 && (
        <div className="card mb-2">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {stats?.measurements && (
        <div className="card mb-2">
          <h2 className="mb-2">Measurement Changes</h2>
          <div className="grid grid-3">
            {stats.measurements.chest && (
              <div>
                <strong>Chest:</strong> {stats.measurements.chest > 0 ? '+' : ''}{stats.measurements.chest} cm
              </div>
            )}
            {stats.measurements.waist && (
              <div>
                <strong>Waist:</strong> {stats.measurements.waist > 0 ? '+' : ''}{stats.measurements.waist} cm
              </div>
            )}
            {stats.measurements.hips && (
              <div>
                <strong>Hips:</strong> {stats.measurements.hips > 0 ? '+' : ''}{stats.measurements.hips} cm
              </div>
            )}
            {stats.measurements.arms && (
              <div>
                <strong>Arms:</strong> {stats.measurements.arms > 0 ? '+' : ''}{stats.measurements.arms} cm
              </div>
            )}
            {stats.measurements.thighs && (
              <div>
                <strong>Thighs:</strong> {stats.measurements.thighs > 0 ? '+' : ''}{stats.measurements.thighs} cm
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="mb-2">Progress Entries</h2>
        
        {loading ? (
          <div className="spinner"></div>
        ) : progress.length === 0 ? (
          <p className="text-muted text-center">No progress entries yet. Start tracking today!</p>
        ) : (
          <div>
            {progress.map((entry) => (
              <div key={entry.id} style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                <div>
                  <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    {entry.weight && <div><strong>Weight:</strong> {entry.weight} kg</div>}
                    {entry.mood && <div><strong>Mood:</strong> {entry.mood}</div>}
                    {entry.energy_level && <div><strong>Energy:</strong> {entry.energy_level}/10</div>}
                    {entry.sleep_hours && <div><strong>Sleep:</strong> {entry.sleep_hours}h</div>}
                    {entry.chest_measurement && <div><strong>Chest:</strong> {entry.chest_measurement} cm</div>}
                    {entry.waist_measurement && <div><strong>Waist:</strong> {entry.waist_measurement} cm</div>}
                    {entry.hips_measurement && <div><strong>Hips:</strong> {entry.hips_measurement} cm</div>}
                    {entry.arms_measurement && <div><strong>Arms:</strong> {entry.arms_measurement} cm</div>}
                    {entry.thighs_measurement && <div><strong>Thighs:</strong> {entry.thighs_measurement} cm</div>}
                  </div>
                  {entry.notes && <p className="text-muted mt-1"><em>{entry.notes}</em></p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
