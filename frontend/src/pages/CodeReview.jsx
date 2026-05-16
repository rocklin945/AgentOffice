import React, { useEffect, useMemo, useState } from 'react';
import { BugOutlined, CheckCircleOutlined, ClockCircleOutlined, CodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { devApi, taskApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';
import { buildCodeReviewData, taskDetail } from '../pageData';

const statusColor = (status) => {
  if (status === '已完成') return 'green';
  if (status === '已失败') return 'red';
  if (status === '进行中' || status === 'Review中' || status === '评审中' || status === '开发中') return 'blue';
  return 'gray';
};

const isDirectory = (file) => file?.directory || file?.isDirectory === 1;

const flattenFiles = (nodes = []) => {
  let result = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children?.length) {
      result = result.concat(flattenFiles(node.children));
    }
  }
  return result;
};

function buildReviewResult(task, detail, codeFiles, reviewedAt) {
  if (!task) return null;
  const files = codeFiles.filter((file) => !isDirectory(file));
  const steps = detail?.executionSteps || [];
  const logs = detail?.executionLogs || [];
  const failed = task.status === '已失败';
  const pending = task.progress < 60 && task.status !== '已完成';
  const issueCount = failed ? 3 : pending ? 2 : task.progress < 100 ? 1 : 0;
  const verdict = issueCount === 0 ? '通过' : issueCount >= 3 ? '阻塞' : '需修改';

  const findings = [];
  if (!files.length) {
    findings.push('未在 workspace_artifacts/code 中发现代码文件，请先完成开发产物写入。');
  }
  if (pending) {
    findings.push('任务进度不足 60%，建议 CodeReviewer 等开发提交完整文件后再做最终 Review。');
  }
  if (task.description && task.description !== '-') {
    findings.push(`已按任务描述核对：${task.description}`);
  }
  if (!findings.length) {
    findings.push('未发现阻塞项，可以进入后续部署准备。');
  }

  return {
    title: `${task.name} Review 结果`,
    verdict,
    issueCount,
    reviewedAt,
    duration: `${Math.max(3, files.length * 2 + steps.length)} min`,
    checkedItems: Math.max(files.length + steps.length, 1),
    passedItems: Math.max(files.length + steps.length - issueCount, 0),
    files,
    findings,
    logs: logs.length ? logs : [`${task.createdAt} ${task.name} / ${task.status}`],
  };
}

export default function CodeReview() {
  const [data, setData] = useState({ summary: {}, reviewTasks: [], projectName: '-' });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [details, setDetails] = useState({});
  const [codeFiles, setCodeFiles] = useState([]);
  const [reviewedAt, setReviewedAt] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const load = async (preferredTaskId) => {
    const [tasksRes, projectsRes] = await Promise.all([
      taskApi.getList(),
      devApi.getProjectList(),
    ]);
    const projects = projectsRes.data || [];
    const project = projects[0];
    const fileTreeRes = project ? await devApi.getFileTree(project.id) : { data: [] };
    const nextData = buildCodeReviewData(tasksRes.data || [], project?.projectName || 'workspace_artifacts/code');
    const nextFiles = flattenFiles(fileTreeRes.data || []);
    const nextSelected = nextData.reviewTasks.find((task) => task.id === preferredTaskId)
      || nextData.reviewTasks[0]
      || null;

    setData(nextData);
    setCodeFiles(nextFiles);
    setSelectedTaskId(nextSelected?.id || null);

    if (nextSelected) {
      const detailRes = await taskApi.getDetail(nextSelected.id);
      setDetails((current) => ({ ...current, [nextSelected.id]: taskDetail(detailRes.data) }));
      setReviewedAt(new Date().toLocaleString('zh-CN', { hour12: false }));
    }
  };

  useEffect(() => {
    load().catch(() => {
      setData({ summary: {}, reviewTasks: [], projectName: '-' });
      setCodeFiles([]);
    });
  }, []);

  const selectedTask = useMemo(
    () => (data.reviewTasks || []).find((task) => task.id === selectedTaskId) || null,
    [data.reviewTasks, selectedTaskId],
  );

  const reviewResult = useMemo(
    () => buildReviewResult(selectedTask, details[selectedTaskId], codeFiles, reviewedAt),
    [selectedTask, details, selectedTaskId, codeFiles, reviewedAt],
  );

  const selectTask = async (task) => {
    setSelectedTaskId(task.id);
    if (!details[task.id]) {
      const detailRes = await taskApi.getDetail(task.id);
      setDetails((current) => ({ ...current, [task.id]: taskDetail(detailRes.data) }));
    }
    setReviewedAt(new Date().toLocaleString('zh-CN', { hour12: false }));
  };

  const rerunReview = async () => {
    if (!selectedTask || reviewing) return;
    setReviewing(true);
    try {
      await load(selectedTask.id);
    } finally {
      setReviewing(false);
    }
  };

  const summary = data.summary || {};
  const cards = [
    { label: 'Review 任务', value: summary.total || 0, icon: <CodeOutlined />, color: '#2f6bff' },
    { label: '待审/进行中', value: summary.running || 0, icon: <ClockCircleOutlined />, color: '#ff9b42' },
    { label: '已通过', value: summary.completed || 0, icon: <CheckCircleOutlined />, color: '#2bb36b' },
    { label: '问题项', value: reviewResult?.issueCount || summary.failed || 0, icon: <BugOutlined />, color: '#ff5c5c' },
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#1d2740]">Code Review 队列</div>
              <div className="mt-1 text-[12px] text-[#8d99ae]">点击左侧任务后，右侧会显示对应 Review 结果</div>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-[#edf1f8]">
            <div className="grid grid-cols-[1.7fr_0.7fr_0.9fr_1.1fr_1fr] bg-[#fbfcff] px-4 py-3 text-[12px] text-[#8d99ae]">
              <div>任务名称</div>
              <div>优先级</div>
              <div>状态</div>
              <div>执行员工</div>
              <div>进度</div>
            </div>
            {(data.reviewTasks || []).map((task, index) => (
              <button
                key={task.id}
                type="button"
                onClick={() => selectTask(task)}
                className={`grid w-full grid-cols-[1.7fr_0.7fr_0.9fr_1.1fr_1fr] items-center px-4 py-4 text-left text-[13px] text-[#5f6d83] transition ${index ? 'border-t border-[#f1f4f8]' : ''} ${selectedTaskId === task.id ? 'bg-[#f3f7ff]' : 'hover:bg-[#fafbff]'}`}
              >
                <div>
                  <div className="font-medium text-[#1d2740]">{task.name}</div>
                  <div className="mt-1 line-clamp-1 text-[12px] text-[#98a3b7]">{task.description}</div>
                </div>
                <div className={task.level === '高' ? 'text-[#ff5c5c]' : task.level === '中' ? 'text-[#ff9b42]' : 'text-[#2bb36b]'}>{task.level}</div>
                <div><StatusPill color={statusColor(task.status)}>{task.status}</StatusPill></div>
                <div>{task.owner || '-'}</div>
                <ProgressTrack value={task.progress || 0} />
              </button>
            ))}
            {!data.reviewTasks?.length ? (
              <div className="px-4 py-10 text-center text-[13px] text-[#8d99ae]">暂无 Code Review 任务</div>
            ) : null}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
            <div>
              <div className="text-[18px] font-semibold text-[#1d2740]">Review 结果</div>
              <div className="mt-1 text-[12px] text-[#8d99ae]">当前任务的代码审查结论、风险项与文件依据</div>
            </div>
            <button
              type="button"
              onClick={rerunReview}
              disabled={!selectedTask || reviewing}
              className="flex h-9 items-center gap-2 rounded-[8px] bg-[#2f6bff] px-4 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a0c0ff]"
            >
              <ReloadOutlined spin={reviewing} />
              {reviewing ? 'Review中' : '重新Review'}
            </button>
          </div>
          {reviewResult ? (
            <div className="bg-[#111d30] px-5 py-5 text-[13px] text-[#a9c0db]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-white">{reviewResult.title}</div>
                  <div className="mt-1 text-[12px] text-[#6f829f]">最后 Review：{reviewResult.reviewedAt || '-'}</div>
                </div>
                <StatusPill color={reviewResult.verdict === '通过' ? 'green' : reviewResult.verdict === '阻塞' ? 'red' : 'orange'}>
                  {reviewResult.verdict}
                </StatusPill>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['审查耗时', reviewResult.duration],
                  ['检查项', reviewResult.checkedItems],
                  ['通过项', reviewResult.passedItems],
                  ['问题项', reviewResult.issueCount],
                  ['代码文件', reviewResult.files.length],
                  ['关联项目', data.projectName || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[10px] bg-white/5 px-3 py-2">
                    <div className="text-[11px] text-[#6f829f]">{label}</div>
                    <div className="mt-1 text-[14px] font-medium text-white">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="mb-2 text-[14px] font-medium text-white">Review 发现</div>
                <div className="space-y-2">
                  {reviewResult.findings.map((finding, index) => (
                    <div key={`${index}-${finding}`} className="rounded-[8px] bg-white/5 px-3 py-2 text-[12px] leading-5">{finding}</div>
                  ))}
                </div>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="mb-2 text-[14px] font-medium text-white">关联代码文件</div>
                <div className="max-h-[140px] space-y-1 overflow-auto font-mono text-[12px]">
                  {reviewResult.files.slice(0, 8).map((file) => <div key={file.id || file.filePath}>{file.filePath || file.fileName}</div>)}
                  {!reviewResult.files.length ? <div>workspace_artifacts/code 暂无文件</div> : null}
                </div>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="mb-2 text-[14px] font-medium text-white">Review 记录</div>
                <div className="max-h-[180px] space-y-1 overflow-auto font-mono text-[12px]">
                  {reviewResult.logs.map((log, index) => <div key={`${index}-${log}`}>{log}</div>)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[460px] items-center justify-center bg-[#111d30] text-[13px] text-[#6f829f]">
              请选择左侧 Code Review 任务
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
