import React, { useEffect, useMemo, useState } from 'react';
import {
  ApiOutlined,
  CloudServerOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  HeartOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { deployApi } from '../api';
import { Panel, StatusPill } from '../components/AppPrimitives';

const statusMap = {
  RUNNING: { label: '运行中', color: 'green' },
  EXITED: { label: '已停止', color: 'orange' },
  CREATED: { label: '已创建', color: 'blue' },
  PAUSED: { label: '已暂停', color: 'yellow' },
  RESTARTING: { label: '重启中', color: 'purple' },
  NOT_DEPLOYED: { label: '未部署', color: 'gray' },
};

const typeMap = {
  CUSTOM_DOCKERFILE: '自定义 Dockerfile',
  FULL_STACK_NODE: '完整前后端（Node）',
  FULL_STACK_JAVA: '完整前后端（Java）',
  NODE_FRONTEND: 'Node 前端构建',
  STATIC_FRONTEND: '静态前端',
  NODE_APP: 'Node 应用',
  STATIC_SITE: '静态站点',
  NODE_BACKEND: 'Node 后端',
  UNKNOWN: '未知项目',
};

function ProjectStatus({ status }) {
  const item = statusMap[status] || { label: status || '未知', color: 'gray' };
  return <StatusPill color={item.color}>{item.label}</StatusPill>;
}

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] text-[#8d99ae]">{label}</div>
      <div className="mt-1 truncate text-[13px] font-medium text-[#26324d]" title={value || '-'}>
        {value || '-'}
      </div>
    </div>
  );
}

function IconButton({ children, icon, variant = 'secondary', disabled, onClick }) {
  const palette = {
    primary: 'border-[#2f6bff] bg-[#2f6bff] text-white hover:bg-[#245deb]',
    success: 'border-[#26a269] bg-[#26a269] text-white hover:bg-[#208a59]',
    danger: 'border-[#ff5c5c] bg-[#ff5c5c] text-white hover:bg-[#ef4444]',
    secondary: 'border-[#dfe7f5] bg-white text-[#526078] hover:border-[#bfd0ee] hover:text-[#2f6bff]',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[8px] border px-3 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${palette[variant]}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default function Deploy() {
  const [dockerStatus, setDockerStatus] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [logs, setLogs] = useState('');
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [healthChecking, setHealthChecking] = useState(false);
  const [healthResult, setHealthResult] = useState(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.projectName === selectedName) || projects[0],
    [projects, selectedName],
  );

  const runningCount = projects.filter((project) => project.status === 'RUNNING').length;
  const deployedCount = projects.filter((project) => project.status !== 'NOT_DEPLOYED').length;
  const backendServiceUrl = selectedProject?.backendUrl || (
    selectedProject?.appType?.includes('BACKEND') ? selectedProject?.url : ''
  );
  const healthUrl = backendServiceUrl ? `${backendServiceUrl.replace(/\/+$/, '')}/api/health` : '';

  const refreshProjects = async (keepSelection = true) => {
    const [dockerRes, projectRes] = await Promise.all([
      deployApi.getDockerStatus(),
      deployApi.getProjects(),
    ]);
    const nextProjects = projectRes.data || [];
    setDockerStatus(dockerRes.data);
    setProjects(nextProjects);
    if (!keepSelection || !selectedName) {
      setSelectedName(nextProjects[0]?.projectName || '');
    }
  };

  const loadLogs = async (projectName = selectedProject?.projectName) => {
    if (!projectName) {
      setLogs('');
      return;
    }
    try {
      const res = await deployApi.getProjectLogs(projectName, 240);
      setLogs(res.data?.logs || '');
    } catch (err) {
      setLogs(err.message || '日志读取失败');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshProjects(false);
      } catch (err) {
        setError(err.message || '部署数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
    const timer = setInterval(async () => {
      if (!busyAction) {
        await refreshProjects(true).catch(() => {});
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedProject?.projectName) {
      setPort(selectedProject.port || '');
      setHealthResult(null);
      loadLogs(selectedProject.projectName);
    }
  }, [selectedProject?.projectName, selectedProject?.status]);

  const runAction = async (action, fn, options = {}) => {
    if (!selectedProject) return;
    setBusyAction(action);
    setError('');
    try {
      await fn();
      await refreshProjects(true);
      await loadLogs(selectedProject.projectName);
    } catch (err) {
      setError(err.message || '操作失败');
      await loadLogs(selectedProject.projectName);
    } finally {
      setBusyAction('');
      if (options.clearPort) {
        setPort('');
      }
    }
  };

  const deploySelected = () => {
    const nextPort = Number(port);
    runAction('deploy', () =>
      deployApi.deployProject(selectedProject.projectName, {
        port: nextPort > 0 ? nextPort : null,
        internalPort: selectedProject.internalPort || null,
        forceRebuild: true,
      }),
    );
  };

  const checkBackendHealth = async () => {
    if (!healthUrl) return;
    setHealthChecking(true);
    setHealthResult(null);
    try {
      const res = await deployApi.checkHealthUrl(healthUrl);
      setHealthResult(res.data);
    } catch (err) {
      setHealthResult({
        healthy: false,
        statusCode: 0,
        message: err.message || '健康检查失败',
      });
    } finally {
      setHealthChecking(false);
    }
  };

  const actionDisabled = !selectedProject || !!busyAction || dockerStatus?.available === false;
  const healthDisabled = actionDisabled || healthChecking || selectedProject?.status !== 'RUNNING' || !backendServiceUrl;

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#eaf1ff] text-[20px] text-[#2f6bff]">
                <DeploymentUnitOutlined />
              </span>
              <div>
                <h1 className="m-0 text-[20px] font-semibold text-[#1d2740]">Docker 运维部署</h1>
                <p className="mt-1 text-[13px] text-[#718098]">
                  通过扫描工作产物项目，构建镜像并运行容器
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="min-w-[96px] rounded-[8px] border border-[#edf1f8] px-4 py-3">
              <div className="text-[18px] font-semibold text-[#1d2740]">{projects.length}</div>
              <div className="text-[12px] text-[#8d99ae]">项目</div>
            </div>
            <div className="min-w-[96px] rounded-[8px] border border-[#edf1f8] px-4 py-3">
              <div className="text-[18px] font-semibold text-[#26a269]">{runningCount}</div>
              <div className="text-[12px] text-[#8d99ae]">运行中</div>
            </div>
            <div className="min-w-[96px] rounded-[8px] border border-[#edf1f8] px-4 py-3">
              <div className="text-[18px] font-semibold text-[#2f6bff]">{deployedCount}</div>
              <div className="text-[12px] text-[#8d99ae]">已部署</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#edf1f8] pt-4">
          <StatusPill color={dockerStatus?.available ? 'green' : 'red'}>
            Docker {dockerStatus?.available ? `可用 ${dockerStatus?.version || ''}` : '不可用'}
          </StatusPill>
          {dockerStatus?.message ? (
            <span className="text-[12px] text-[#8d99ae]">{dockerStatus.message}</span>
          ) : null}
          <button
            type="button"
            onClick={() => refreshProjects(true)}
            className="ml-auto inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#dfe7f5] px-3 text-[12px] text-[#526078] hover:border-[#bfd0ee] hover:text-[#2f6bff]"
          >
            <ReloadOutlined />
            刷新
          </button>
        </div>
      </Panel>

      {error ? (
        <div className="rounded-[8px] border border-[#ffd2d2] bg-[#fff3f3] px-4 py-3 text-[13px] text-[#c24141]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-[#edf1f8] px-5 py-4 text-[14px] font-semibold text-[#1d2740]">
            扫描出的项目
          </div>
          <div className="max-h-[620px] overflow-auto p-3">
            {loading ? (
              <div className="px-3 py-10 text-center text-[13px] text-[#8d99ae]">加载中...</div>
            ) : null}
            {!loading && projects.length === 0 ? (
              <div className="px-3 py-10 text-center text-[13px] text-[#8d99ae]">未发现项目</div>
            ) : null}
            {projects.map((project) => (
              <button
                key={project.projectName}
                type="button"
                onClick={() => setSelectedName(project.projectName)}
                className={`mb-3 block w-full rounded-[8px] border p-4 text-left transition ${
                  selectedProject?.projectName === project.projectName
                    ? 'border-[#2f6bff] bg-[#f6f9ff]'
                    : 'border-[#edf1f8] bg-white hover:border-[#cbd9f2]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-[#1d2740]">
                      {project.displayName}
                    </div>
                    <div className="mt-1 truncate text-[12px] text-[#8d99ae]">{project.projectName}</div>
                  </div>
                  <ProjectStatus status={project.status} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-[12px] text-[#6f7c92]">
                  <CloudServerOutlined />
                  <span>{typeMap[project.appType] || project.appType}</span>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            {selectedProject ? (
              <>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="m-0 text-[18px] font-semibold text-[#1d2740]">
                        {selectedProject.displayName}
                      </h2>
                      <ProjectStatus status={selectedProject.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[#718098]">
                      <span>{typeMap[selectedProject.appType] || selectedProject.appType}</span>
                      <span className="text-[#c3ccdb]">/</span>
                      <span>{selectedProject.containerName}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <IconButton
                      variant="primary"
                      icon={<DeploymentUnitOutlined />}
                      disabled={actionDisabled || !selectedProject.deployable}
                      onClick={deploySelected}
                    >
                      {busyAction === 'deploy' ? '部署中' : '构建部署'}
                    </IconButton>
                    <IconButton
                      variant="success"
                      icon={<PlayCircleOutlined />}
                      disabled={actionDisabled || selectedProject.status === 'RUNNING'}
                      onClick={() => runAction('start', () => deployApi.startProject(selectedProject.projectName))}
                    >
                      启动
                    </IconButton>
                    <IconButton
                      variant="secondary"
                      icon={<ReloadOutlined />}
                      disabled={actionDisabled || selectedProject.status === 'NOT_DEPLOYED'}
                      onClick={() => runAction('restart', () => deployApi.restartProject(selectedProject.projectName))}
                    >
                      重启
                    </IconButton>
                    <IconButton
                      variant="danger"
                      icon={<StopOutlined />}
                      disabled={actionDisabled || selectedProject.status !== 'RUNNING'}
                      onClick={() => runAction('stop', () => deployApi.stopProject(selectedProject.projectName))}
                    >
                      停止
                    </IconButton>
                    <IconButton
                      icon={<DeleteOutlined />}
                      disabled={actionDisabled || selectedProject.status === 'NOT_DEPLOYED'}
                      onClick={() => runAction('remove', () => deployApi.removeProjectContainer(selectedProject.projectName), { clearPort: true })}
                    >
                      删除容器
                    </IconButton>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="镜像" value={selectedProject.imageName} />
                  <Field label="容器" value={selectedProject.containerName} />
                  <Field label="容器 ID" value={selectedProject.containerId} />
                  <Field label="应用类型" value={typeMap[selectedProject.appType] || selectedProject.appType} />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
                  <div className="grid gap-3 lg:grid-rows-[auto_1fr]">
                    <label className="block">
                      <span className="text-[12px] text-[#8d99ae]">宿主机端口</span>
                      <input
                        value={port}
                        onChange={(event) => setPort(event.target.value.replace(/[^\d]/g, ''))}
                        placeholder="自动分配"
                        className="mt-1 h-10 w-full rounded-[8px] border border-[#dfe7f5] px-3 text-[13px] outline-none transition focus:border-[#2f6bff]"
                      />
                    </label>
                    <div className="flex min-h-[94px] flex-col justify-center rounded-[8px] border border-[#edf1f8] px-4 py-3">
                      <div className="flex items-center gap-2 text-[12px] text-[#8d99ae]">
                        <ApiOutlined />
                        后端服务
                      </div>
                      {backendServiceUrl ? (
                        <a
                          href={backendServiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-[14px] font-semibold text-[#2f6bff]"
                          title={backendServiceUrl}
                        >
                          {backendServiceUrl}
                        </a>
                      ) : (
                        <div className="mt-1 text-[14px] font-semibold text-[#8d99ae]">无独立后端或未部署</div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[8px] border border-[#edf1f8] px-4 py-3">
                      <div className="flex items-center gap-2 text-[12px] text-[#8d99ae]">
                        <ApiOutlined />
                        容器端口
                      </div>
                      <div className="mt-1 text-[15px] font-semibold text-[#1d2740]">
                        {selectedProject.internalPort || 80}
                      </div>
                    </div>
                    <div className="rounded-[8px] border border-[#edf1f8] px-4 py-3">
                      <div className="flex items-center gap-2 text-[12px] text-[#8d99ae]">
                        <LinkOutlined />
                        访问地址
                      </div>
                      {selectedProject.url ? (
                        <a
                          href={selectedProject.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-[15px] font-semibold text-[#2f6bff]"
                        >
                          {selectedProject.url}
                        </a>
                      ) : (
                        <div className="mt-1 text-[15px] font-semibold text-[#8d99ae]">部署后生成</div>
                      )}
                    </div>
                    <div className="rounded-[8px] border border-[#edf1f8] px-4 py-3 sm:col-span-2">
                      <div className="flex flex-col gap-2 border-b border-[#edf1f8] pb-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex shrink-0 items-center gap-2 text-[12px] text-[#8d99ae]">
                            <HeartOutlined />
                            健康检查
                          </div>
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="shrink-0 text-[12px] text-[#8d99ae]">检查接口</span>
                            {healthUrl ? (
                              <a
                                href={healthUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="min-w-0 truncate text-[13px] font-semibold text-[#2f6bff]"
                                title={healthUrl}
                              >
                                {healthUrl}
                              </a>
                            ) : (
                              <span className="min-w-0 truncate text-[13px] font-semibold text-[#8d99ae]">
                                后端服务部署后生成
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={healthDisabled}
                          onClick={checkBackendHealth}
                          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-[8px] border border-[#dfe7f5] px-3 text-[12px] font-medium text-[#526078] transition hover:border-[#bfd0ee] hover:text-[#2f6bff] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <ReloadOutlined />
                          {healthChecking ? '检查中' : '检查'}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[12px] text-[#8d99ae]">健康状态</span>
                        {healthResult ? (
                          <StatusPill color={healthResult.healthy ? 'green' : 'red'}>
                            {healthResult.healthy ? '健康' : '异常'}
                          </StatusPill>
                        ) : (
                          <StatusPill color={selectedProject.status === 'RUNNING' && healthUrl ? 'yellow' : 'gray'}>
                            {selectedProject.status === 'RUNNING' && healthUrl ? '等待检查' : '未启用'}
                          </StatusPill>
                        )}
                        {healthResult?.statusCode ? (
                          <span className="text-[12px] font-semibold text-[#526078]">
                            HTTP {healthResult.statusCode}
                          </span>
                        ) : null}
                        <div className={`min-w-0 flex-1 truncate text-[12px] ${
                          healthResult
                            ? (healthResult.healthy ? 'text-[#207a4b]' : 'text-[#c24141]')
                            : 'text-[#718098]'
                        }`}
                        title={healthResult?.message || ''}
                        >
                          {healthResult?.message || '点击检查按钮后获取当前后端健康状态'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!selectedProject.deployable ? (
                  <div className="mt-4 rounded-[8px] border border-[#ffe1bd] bg-[#fff8ef] px-4 py-3 text-[13px] text-[#9a5b12]">
                    {selectedProject.message}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="py-20 text-center text-[13px] text-[#8d99ae]">请选择一个项目</div>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#1d2740]">
                <FileTextOutlined />
                部署日志
              </div>
              <button
                type="button"
                onClick={() => loadLogs()}
                disabled={!selectedProject}
                className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#dfe7f5] px-3 text-[12px] text-[#526078] disabled:opacity-45"
              >
                <ReloadOutlined />
                刷新日志
              </button>
            </div>
            <pre className="m-0 max-h-[360px] overflow-auto bg-[#172033] px-5 py-4 font-mono text-[12px] leading-6 text-[#cbd6ea]">
              {logs || '暂无日志'}
            </pre>
          </Panel>
        </div>
      </div>
    </div>
  );
}
