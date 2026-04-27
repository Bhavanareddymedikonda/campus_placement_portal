import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  updateProfile: (data) => API.put('/users/profile', data),
  toggleStatus: (id) => API.put(`/users/${id}/toggle-status`),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

// Jobs
export const jobAPI = {
  getAll: (params) => API.get('/jobs', { params }),
  getById: (id) => API.get(`/jobs/${id}`),
  create: (data) => API.post('/jobs', data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  delete: (id) => API.delete(`/jobs/${id}`),
  approve: (id, status) => API.put(`/jobs/${id}/approve`, { status }),
  getMyJobs: () => API.get('/jobs/my-jobs'),
};

// Applications
export const applicationAPI = {
  apply: (data) => API.post('/applications', data),
  getMyApplications: (params) => API.get('/applications/my-applications', { params }),
  getJobApplicants: (jobId, params) => API.get(`/applications/job/${jobId}`, { params }),
  getResume: (id) => API.get(`/applications/${id}/resume`),
  updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  addFeedback: (id, data) => API.post(`/applications/${id}/feedback`, data),
  getAll: (params) => API.get('/applications', { params }),
};

// Announcements
export const announcementAPI = {
  getAll: (params) => API.get('/announcements', { params }),
  create: (data) => API.post('/announcements', data),
  update: (id, data) => API.put(`/announcements/${id}`, data),
  delete: (id) => API.delete(`/announcements/${id}`),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getByStatus: () => API.get('/analytics/applications-by-status'),
  getCompanyStats: () => API.get('/analytics/company-stats'),
  getTrends: () => API.get('/analytics/trends'),
  getStudentStats: () => API.get('/analytics/student-stats'),
  getRecruiterStats: () => API.get('/analytics/recruiter-stats'),
};

// Matching
export const matchingAPI = {
  getRecommendations: () => API.get('/matching/recommendations'),
};

// Upload
export const uploadAPI = {
  resume: (formData) => API.post('/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default API;
