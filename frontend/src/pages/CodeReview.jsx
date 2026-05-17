import React, { useEffect, useMemo, useState } from 'react';
import {
  BugOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { codeReviewApi, devApi, modelConfigApi } from '../api';
import { Panel, StatusPill } from '../components/AppPrimitives';
import MarkdownMessage from '../components/MarkdownMessage';

const isDirectory = (file) => file?.directory || file?.isDirectory === 1;

const statusColor = (verdict) => {
  if (verdict === '通过') return 'green';
  if (verdict === '阻塞') return 'red';
  if (verdict === '未开始') return 'gray';
  return 'orange';
};

function flattenFiles(nodes, depth = 0) {
  let result = [];
  for (const node of nodes || []) {
    const inReviewDir = /(^|\/)review(\/|$)/.test(node.filePath || '');
    if (!inReviewDir) {
      result.push({ ...node, depth });
    }
    if (node.children?.length && !inReviewDir) {
      result = result.concat(flattenFiles(node.children, depth + 1));
    }
  }
  return result;
}

function ReviewReport({ report }) {
  const [expanded, setExpanded] = useState(false);
  if (!report) return null;

  return (
    <>
      <div className="border-b border-[#edf1f8] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold text-[#1d2740]">{report.title}</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">{report.reviewedAt || '-'} · {report.filePath || '未生成文件'}</div>
          </div>
          <StatusPill color={statusColor(report.verdict)}>{report.verdict}</StatusPill>
        </div>
        {report.reviewedFiles?.length ? (
          <div className="mt-4 rounded-[8px] bg-[#f8fafc] px-3 py-2">
            <div className="mb-1 text-[12px] font-medium text-[#1d2740]">已 Review 文件</div>
            <div className="flex flex-wrap gap-2">
              {report.reviewedFiles.map((file) => (
                <span key={file} className="max-w-full truncate rounded-[6px] border border-[#e5ebf5] bg-white px-2 py-1 text-[11px] text-[#5f6d83]">
                  {file}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="relative h-[520px] overflow-hidden bg-[#fbfcff] px-5 py-4">
        <div className="h-full overflow-hidden">
          <MarkdownMessage text={report.content || '当前项目还没有 Code Review 报告。'} staff={[]} highlightMentions={false} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#fbfcff] via-[#fbfcff]/90 to-transparent pb-4 pt-20">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="pointer-events-auto rounded-[8px] border border-[#2f6bff] bg-white px-4 py-2 text-[12px] font-medium text-[#2f6bff] hover:bg-[#2f6bff] hover:text-white"
          >
            查看全部
          </button>
        </div>
      </div>
      {expanded ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.28)] px-6" onClick={() => setExpanded(false)}>
          <div className="max-h-[84vh] w-full max-w-[960px] overflow-hidden rounded-[14px] bg-white shadow-[0_32px_80px_rgba(18,30,52,0.18)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
              <div className="min-w-0">
                <div className="truncate text-[16px] font-semibold text-[#1d2740]">{report.title}</div>
                <div className="mt-1 text-[12px] text-[#8d99ae]">{report.filePath}</div>
              </div>
              <button type="button" onClick={() => setExpanded(false)} className="text-[22px] text-[#97a3b8]">×</button>
            </div>
            <div className="max-h-[72vh] overflow-auto bg-[#f8fafc] px-5 py-4">
              <MarkdownMessage text={report.content || ''} staff={[]} highlightMentions={false} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function CodeReview() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReportPath, setSelectedReportPath] = useState('');
  const [models, setModels] = useState([]);
  const [modelConfigId, setModelConfigId] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const selectedReport = useMemo(
    () => reports.find((report) => report.filePath === selectedReportPath) || reports[0] || null,
    [reports, selectedReportPath],
  );

  const selectedFileSet = useMemo(() => new Set(selectedFiles), [selectedFiles]);

  const loadProject = async (project) => {
    setSelectedProject(project);
    setSelectedFiles([]);
    const [treeRes, reportsRes] = await Promise.all([
      devApi.getFileTree(project.id),
      codeReviewApi.getProjectReports(project.id),
    ]);
    const nextFiles = flattenFiles(treeRes.data || []);
    const nextReports = reportsRes.data?.reports || [];
    setFiles(nextFiles);
    setReports(nextReports);
    setSelectedReportPath(nextReports[0]?.filePath || '');
  };

  useEffect(() => {
    const init = async () => {
      const [projectsRes, modelsRes] = await Promise.all([
        devApi.getProjectList(),
        modelConfigApi.getList({ enabledOnly: true }),
      ]);
      const nextProjects = projectsRes.data || [];
      const nextModels = modelsRes.data || [];
      setProjects(nextProjects);
      setModels(nextModels);
      const defaultModel = nextModels.find((item) => item.isDefault === 1) || nextModels[0];
      setModelConfigId(defaultModel?.id ? String(defaultModel.id) : '');
      if (nextProjects[0]) {
        await loadProject(nextProjects[0]);
      }
    };
    init().catch(() => {});
  }, []);

  const toggleFile = (file) => {
    if (isDirectory(file)) return;
    setSelectedFiles((current) => (
      current.includes(file.filePath)
        ? current.filter((item) => item !== file.filePath)
        : [...current, file.filePath]
    ));
  };

  const startReview = async () => {
    if (!selectedProject || !selectedFiles.length || reviewing) return;
    setReviewing(true);
    try {
      const res = await codeReviewApi.reviewProjectFiles(selectedProject.id, {
        filePaths: selectedFiles,
        modelConfigId: modelConfigId ? Number(modelConfigId) : null,
      });
      const nextReport = res.data;
      const reportsRes = await codeReviewApi.getProjectReports(selectedProject.id);
      const nextReports = reportsRes.data?.reports || (nextReport ? [nextReport] : []);
      setReports(nextReports);
      setSelectedReportPath(nextReport?.filePath || nextReports[0]?.filePath || '');
    } catch (error) {
      console.error('Code review failed', error);
      alert('Code Review 失败：' + (error.message || '未知错误'));
    } finally {
      setReviewing(false);
    }
  };

  const cards = [
    { label: '项目', value: projects.length, icon: <CodeOutlined />, color: '#2f6bff' },
    { label: '可选文件', value: files.filter((file) => !isDirectory(file)).length, icon: <FileSearchOutlined />, color: '#8b5cf6' },
    { label: '已选文件', value: selectedFiles.length, icon: <CheckCircleOutlined />, color: '#2bb36b' },
    { label: '报告', value: reports.length, icon: <BugOutlined />, color: '#ff9b42' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Panel key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] text-[#8d99ae]">{card.label}</div>
                <div className="mt-2 text-[28px] font-semibold text-[#1d2740]">{card.value}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] text-[20px]" style={{ color: card.color, background: `${card.color}14` }}>
                {card.icon}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel className="overflow-hidden">
          <div className="border-b border-[#edf1f8] px-5 py-4">
            <div className="text-[18px] font-semibold text-[#1d2740]">Code Review</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">选择项目与代码文件</div>
          </div>

          <div className="space-y-4 px-5 py-4">
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[#5f6d83]">项目</span>
              <select
                value={selectedProject?.id || ''}
                onChange={(event) => {
                  const project = projects.find((item) => String(item.id) === event.target.value);
                  if (project) loadProject(project).catch(() => {});
                }}
                className="h-10 w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 text-[13px] text-[#1d2740] outline-none"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.projectName}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[#5f6d83]">模型</span>
              <select
                value={modelConfigId}
                onChange={(event) => setModelConfigId(event.target.value)}
                className="h-10 w-full rounded-[8px] border border-[#dfe7f5] bg-white px-3 text-[13px] text-[#1d2740] outline-none"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.configName} / {model.modelName}</option>
                ))}
              </select>
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#5f6d83]">代码文件</span>
                <button type="button" onClick={() => setSelectedFiles([])} className="text-[12px] text-[#8d99ae] hover:text-[#2f6bff]">清空</button>
              </div>
              <div className="max-h-[420px] space-y-1 overflow-auto rounded-[10px] border border-[#edf1f8] bg-[#fbfcff] p-2">
                {files.map((file, index) => (
                  <button
                    key={`${file.id}-${index}`}
                    type="button"
                    onClick={() => toggleFile(file)}
                    className={`flex w-full items-center gap-2 rounded-[8px] py-2 pr-2 text-left text-[13px] transition ${isDirectory(file) ? 'font-medium text-[#1d2740]' : selectedFileSet.has(file.filePath) ? 'bg-[#eef4ff] text-[#2f6bff]' : 'text-[#5f6d83] hover:bg-white'}`}
                    style={{ paddingLeft: `${8 + (file.depth || 0) * 16}px` }}
                  >
                    <span className="w-4 shrink-0 text-center">
                      {isDirectory(file) ? (file.children?.length ? <FolderOpenOutlined /> : <FolderOutlined />) : (
                        <input type="checkbox" readOnly checked={selectedFileSet.has(file.filePath)} />
                      )}
                    </span>
                    <span className="min-w-0 truncate">{file.fileName || file.name}</span>
                  </button>
                ))}
                {!files.length ? <div className="py-8 text-center text-[13px] text-[#8d99ae]">暂无代码文件</div> : null}
              </div>
            </div>

            <button
              type="button"
              onClick={startReview}
              disabled={!selectedFiles.length || !modelConfigId || reviewing}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#2f6bff] text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a0c0ff]"
            >
              <RobotOutlined spin={reviewing} />
              {reviewing ? 'AI Review 中...' : '开始 Review'}
            </button>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-[#edf1f8] px-5 py-4">
            <div>
              <div className="text-[18px] font-semibold text-[#1d2740]">Review 报告</div>
              <div className="mt-1 text-[12px] text-[#8d99ae]">读取当前项目下的报告</div>
            </div>
            <select
              value={selectedReportPath}
              onChange={(event) => setSelectedReportPath(event.target.value)}
              className="h-9 max-w-[360px] rounded-[8px] border border-[#dfe7f5] bg-white px-3 text-[12px] text-[#1d2740] outline-none"
            >
              {reports.map((report) => (
                <option key={report.filePath} value={report.filePath}>{report.title}</option>
              ))}
              {!reports.length ? <option value="">暂无报告</option> : null}
            </select>
          </div>
          <ReviewReport report={selectedReport || {
            title: '暂无 Review 报告',
            content: '当前项目下还没有报告。选择一个或多个代码文件后点击“开始 Review”，系统会调用所选模型生成 Code Review 报告。',
            verdict: '未开始',
            reviewedAt: '-',
            reviewedFiles: [],
          }} />
        </Panel>
      </div>
    </div>
  );
}
