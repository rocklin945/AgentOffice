import request from './request';

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getCurrentUser: () => request.get('/auth/current'),
  logout: () => request.post('/auth/logout'),
};

export const employeeApi = {
  getList: (params) => request.get('/employees', { params }),
  getById: (id) => request.get(`/employees/${id}`),
  create: (data) => request.post('/employees', data),
  update: (id, data) => request.put(`/employees/${id}`, data),
  delete: (id) => request.delete(`/employees/${id}`),
  updateStatus: (id, status) => request.patch(`/employees/${id}/status`, { status }),
};

export const taskApi = {
  getList: (params) => request.get('/tasks', { params }),
  getTypes: () => request.get('/tasks/types'),
  getDetail: (id) => request.get(`/tasks/${id}`),
  create: (data) => request.post('/tasks', data),
  update: (id, data) => request.put(`/tasks/${id}`, data),
  delete: (id) => request.delete(`/tasks/${id}`),
  updateProgress: (id, progress) => request.patch(`/tasks/${id}/progress`, { progress }),
  updateStatus: (id, status) => request.patch(`/tasks/${id}/status`, { status }),
  updateStepStatus: (taskId, stepId, status) =>
    request.patch(`/tasks/${taskId}/steps/${stepId}`, { status }),
  assign: (id, executorId) => request.post(`/tasks/${id}/assign`, { executorId }),
};

export const officeApi = {
  getLayout: () => request.get('/office/layout'),
  getEmployeeStatusOverview: () => request.get('/office/employees/status'),
  getCollaboration: () => request.get('/office/collaboration'),
  getCollaborationSessions: () => request.get('/office/collaboration/sessions'),
  createCollaborationSession: () => request.post('/office/collaboration/sessions'),
  getCollaborationMessages: (sessionId) => request.get(`/office/collaboration/sessions/${sessionId}/messages`),
  deleteCollaborationSession: (sessionId) => request.delete(`/office/collaboration/sessions/${sessionId}`),
  sendCollaborationMessage: (data) => request.post('/office/collaboration/messages', data, { timeout: 120000 }),
  createDesk: () => request.post('/office/desks'),
  assignDesk: (deskId, employeeId) => request.patch(`/office/desks/${deskId}/employee`, { employeeId }),
};

export const notificationApi = {
  getList: (params) => request.get('/notifications', { params }),
  markRead: (id) => request.patch(`/notifications/${id}/read`),
  markAllRead: () => request.patch('/notifications/read-all'),
  delete: (id) => request.delete(`/notifications/${id}`),
};

export const devApi = {
  getProjectList: () => request.get('/dev/projects'),
  getProject: (id) => request.get(`/dev/projects/${id}`),
  createProject: (data) => request.post('/dev/projects', data),
  updateProject: (id, data) => request.put(`/dev/projects/${id}`, data),
  deleteProject: (id) => request.delete(`/dev/projects/${id}`),
  getFileTree: (projectId) => request.get(`/dev/projects/${projectId}/files`),
  getFile: (id) => request.get(`/dev/files/${id}`),
  createFile: (projectId, data) => request.post(`/dev/projects/${projectId}/files`, data),
  updateFileContent: (id, content) => request.put(`/dev/files/${id}/content`, { content }),
  deleteFile: (id) => request.delete(`/dev/files/${id}`),
  runCode: (fileId, language) => request.post('/dev/run', { fileId, language }),
};

export const deployApi = {
  getServiceList: (params) => request.get('/deploy/services', { params }),
  getService: (id) => request.get(`/deploy/services/${id}`),
  createService: (data) => request.post('/deploy/services', data),
  updateService: (id, data) => request.put(`/deploy/services/${id}`, data),
  deleteService: (id) => request.delete(`/deploy/services/${id}`),
  startService: (id) => request.post(`/deploy/services/${id}/start`),
  stopService: (id) => request.post(`/deploy/services/${id}/stop`),
  restartService: (id) => request.post(`/deploy/services/${id}/restart`),
  getServiceLogs: (id, lines) => request.get(`/deploy/services/${id}/logs`, { params: { lines } }),
};

export const modelConfigApi = {
  getList: (params) => request.get('/model-configs', { params }),
  getDefault: () => request.get('/model-configs/default'),
  create: (data) => request.post('/model-configs', data),
  update: (id, data) => request.put(`/model-configs/${id}`, data),
  setDefault: (id) => request.patch(`/model-configs/${id}/default`),
  delete: (id) => request.delete(`/model-configs/${id}`),
};

export const adminApi = {
  getUsers: () => request.get('/admin/users'),
  updateUser: (id, data) => request.put(`/admin/users/${id}`, data),
  deleteUser: (id) => request.delete(`/admin/users/${id}`),
  getSystemSettings: () => request.get('/admin/system-settings'),
  updateSystemSettings: (data) => request.put('/admin/system-settings', data),
};

export const codeReviewApi = {
  getLatest: (taskId) => request.get(`/office/code-reviews/latest${taskId ? `?taskId=${taskId}` : ''}`),
  rerun: (taskId) => request.post(`/office/code-reviews/${taskId}/rerun`),
};

export const analyticsApi = {
  getDashboard: () => request.get('/analytics/dashboard'),
  getEmployeeEfficiency: () => request.get('/analytics/employees'),
  getTaskTrend: (params) => request.get('/analytics/tasks/trend', { params }),
  getKpi: () => request.get('/analytics/kpi'),
};
