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
      <div className="page-header">
        <h1 className="page-title">Progress Tracking</h1>
        <p className="page-subtitle">Monitor your fitness journey</p>
      </div>

      <div className="card mb-2">
        <div className="form-group">
          <label>Time Period</label>
          <select 
            className="form-control"
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
            <h3>Body Fat Change</h3>
            <div className="value">
              {stats.bodyFatChange ? `${stats.bodyFatChange > 0 ? '+' : ''}${stats.bodyFatChange}` : 'N/A'}
            </div>
            <div className="label">%</div>
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
              <div key={entry._id} style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                <div>
                  <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    {entry.weight && <div><strong>Weight:</strong> {entry.weight} kg</div>}
                    {entry.bodyFatPercentage && <div><strong>Body Fat:</strong> {entry.bodyFatPercentage}%</div>}
                    {entry.mood && <div><strong>Mood:</strong> {entry.mood}</div>}
                    {entry.energyLevel && <div><strong>Energy:</strong> {entry.energyLevel}/10</div>}
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
