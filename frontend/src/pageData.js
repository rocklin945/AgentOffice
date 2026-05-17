const text = (value, fallback = '-') => (value === null || value === undefined || value === '' ? fallback : String(value));
const number = (value) => Number(value || 0);

export const formatTime = (value) => (value ? String(value).replace('T', ' ').slice(0, 16) : '-');
export const percent = (value) => `${number(value)}%`;

const permissionCatalog = [
  { code: 'task.view', name: '查看任务' },
  { code: 'task.execute', name: '执行任务' },
  { code: 'log.view', name: '查看日志' },
  { code: 'report.write', name: '输出报告' },
  { code: 'dev.code', name: '代码开发' },
  { code: 'code.review', name: 'Code Review' },
  { code: 'deploy.manage', name: '部署服务' },
  { code: 'task.assign', name: '任务拆解' },
  { code: 'product.plan', name: '产品规划' },
];

export function buildEmployeePageData(rawEmployees = []) {
  const employees = rawEmployees.map((employee) => {
    const enabled = new Map((employee.permissions || []).map((item) => [
      item.permissionCode || item.code,
      item.enabled === true || item.enabled === 1,
    ]));
    return {
      ...employee,
      id: employee.id,
      name: text(employee.name, ''),
      role: text(employee.role),
      status: text(employee.status, '空闲'),
      tasks: String(number(employee.taskCount)),
      efficiency: percent(employee.efficiency),
      employeeNo: `EMP${String(employee.id || 0).padStart(4, '0')}`,
      modelConfigId: employee.modelConfigId || '',
      modelConfigName: employee.modelConfigName || '',
      modelName: employee.modelName || '',
      joinedAt: formatTime(employee.createTime).split(' ')[0],
      duty: text(employee.position),
      skills: [text(employee.role), '协作', '自动化'],
      task: number(employee.taskCount) > 0 ? '处理当前分配任务' : '暂无进行中任务',
      progress: number(employee.efficiency),
      workingTime: `${number(employee.taskCount)}项任务`,
      commits: '真实代码产物见云端开发',
      testPass: 'Review 产物见工作产物',
      deployCount: '部署记录见运维部署',
      permissions: permissionCatalog.map((permission) => ({
        ...permission,
        enabled: enabled.get(permission.code) || false,
      })),
    };
  });
  const roleCards = [...new Map(rawEmployees.map((employee) => [
    text(employee.role),
    [text(employee.role), text(employee.position, 'AI 员工')],
  ])).values()];
  return { employees, roleCards };
}

export function taskRow(task) {
  return {
    ...task,
    id: task.id,
    name: text(task.taskName),
    description: text(task.description),
    level: text(task.priority, '中'),
    owner: text(task.executorName),
    role: text(task.taskType),
    status: text(task.status, '待分配'),
    progress: number(task.progress),
    createdAt: formatTime(task.createTime),
    executorId: task.executorId || '',
    taskType: task.taskType || 'custom',
  };
}

export function taskDetail(detail) {
  if (!detail) return null;
  const steps = detail.steps || [];
  return {
    executionSteps: steps.map((step, index) => ({
      step: step.stepOrder || index + 1,
      name: text(step.stepName),
      status: text(step.status, '待处理'),
      owner: text(detail.executor?.name),
      role: text(detail.taskType),
    })),
    executionLogs: (detail.logs || []).map((log) => `${text(log.time)} ${text(log.content, '')}`),
    results: [
      { label: '状态', value: text(detail.status) },
      { label: '步骤数', value: steps.length },
      { label: '执行人', value: text(detail.executor?.name) },
    ],
    files: [],
  };
}

export function buildDeployData(services = [], logText = '') {
  const serviceRows = services.map((service) => ({
    id: service.id,
    name: text(service.serviceName),
    status: text(service.status),
    image: text(service.image),
    version: text(service.version),
    time: service.runningTime ? `${service.runningTime}s` : '-',
    containerId: text(service.containerId),
    port: service.port ?? '-',
    cpu: percent(service.cpuUsage),
    memory: percent(service.memoryUsage),
    created: formatTime(service.createTime),
  }));
  return {
    services: serviceRows,
    containers: serviceRows.map((service) => ({
      id: `c${service.id}`,
      name: `${service.name}-container`,
      image: service.image,
      status: service.status,
      cpu: service.cpu,
      memory: service.memory,
    })),
    images: serviceRows.map((service) => ({
      name: service.image,
      tag: service.version,
      size: '-',
      created: service.created,
    })),
    logs: String(logText || '').split('\n').filter(Boolean).map((line) => ({
      time: line.slice(0, 19),
      level: 'info',
      message: line,
    })),
  };
}

export function buildAnalyticsData(metrics = {}, employees = [], tasks = []) {
  return {
    metrics,
    employeeEfficiency: employees.map((employee) => ({ label: text(employee.name), value: number(employee.efficiency) })),
    taskCounts: {
      running: tasks.filter((task) => text(task.status).includes('进行')).length,
      completed: tasks.filter((task) => text(task.status).includes('完成')).length,
      failed: tasks.filter((task) => text(task.status).includes('失败')).length,
      pending: tasks.filter((task) => text(task.status).includes('待')).length,
    },
  };
}

export function buildCodeReviewData(tasks = [], projectName = '-') {
  const reviewTasks = tasks.filter((task) => (
    task.taskType === 'review'
    || task.taskType === 'development'
    || text(task.taskName, '').toLowerCase().includes('review')
    || text(task.description, '').toLowerCase().includes('review')
    || text(task.taskName, '').includes('评审')
    || text(task.description, '').includes('评审')
    || text(task.taskName, '').includes('审查')
    || text(task.description, '').includes('审查')
    || text(task.taskName, '').includes('代码')
    || text(task.description, '').includes('代码')
  )).map(taskRow);
  return {
    projectName,
    summary: {
      total: reviewTasks.length,
      running: reviewTasks.filter((task) => task.status.includes('进行') || task.status.includes('评审') || task.status.includes('开发')).length,
      completed: reviewTasks.filter((task) => task.status.includes('完成')).length,
      failed: reviewTasks.filter((task) => task.status.includes('失败') || task.status.includes('阻塞')).length,
    },
    reviewTasks,
    runResult: { title: '等待 Code Review', logs: [] },
    debugLogs: reviewTasks.map((task) => `${task.createdAt} ${task.name} / ${task.status}`),
  };
}
