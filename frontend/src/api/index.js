import request from './request';

// 认证相关
export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getCurrentUser: () => request.get('/auth/current'),
  logout: () => request.post('/auth/logout'),
};

// 员工相关
export const employeeApi = {
  getList: (params) => request.get('/employees', { params }),
  getById: (id) => request.get(`/employees/${id}`),
  create: (data) => request.post('/employees', data),
  update: (id, data) => request.put(`/employees/${id}`, data),
  delete: (id) => request.delete(`/employees/${id}`),
  updateStatus: (id, status) => request.patch(`/employees/${id}/status`, { status }),
};

// 任务相关
export const taskApi = {
  getList: (params) => request.get('/tasks', { params }),
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

// 虚拟办公室
export const officeApi = {
  getLayout: () => request.get('/office/layout'),
  getEmployeeStatusOverview: () => request.get('/office/employees/status'),
};

// 云端开发
export const devApi = {
  getProjectList: () => request.get('/dev/projects'),
  getProject: (id) => request.get(`/dev/projects/${id}`),
  createProject: (data) => request.post('/dev/projects', data),
  updateProject: (id, data) => request.put(`/dev/projects/${id}`, data),
  deleteProject: (id) => request.delete(`/dev/projects/${id}`),
  getFileTree: (projectId) => request.get(`/dev/projects/${projectId}/files`),
  getFile: (id) => request.get(`/dev/files/${id}`),
  createFile: (projectId, data) => request.post(`/dev/projects/${projectId}/files`, data),
  updateFile: (id, data) => request.put(`/dev/files/${id}`, data),
  deleteFile: (id) => request.delete(`/dev/files/${id}`),
  runCode: (fileId, language) => request.post('/dev/run', { fileId, language }),
};

// 部署运维
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

// 数据分析
export const analyticsApi = {
  getDashboard: () => request.get('/analytics/dashboard'),
  getEmployeeEfficiency: () => request.get('/analytics/employees'),
  getTaskTrend: (params) => request.get('/analytics/tasks/trend', { params }),
  getKpi: () => request.get('/analytics/kpi'),
};
