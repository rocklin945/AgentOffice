import React, { useEffect, useMemo, useState } from 'react';
import { BugOutlined, CheckCircleOutlined, ClockCircleOutlined, CodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { codeReviewApi, devApi, taskApi } from '../api';
import { Panel, ProgressTrack, StatusPill } from '../components/AppPrimitives';
import MarkdownMessage from '../components/MarkdownMessage';
import { buildCodeReviewData, taskDetail } from '../pageData';

const statusColor = (status) => {
  if (status === '已完成') return 'green';
  if (status === '已失败') return 'red';
  if (status === '进行中' || status === 'Review中' || status === '评审中' || status === '开发中') return 'blue';
  return 'gray';
};

function buildReviewFromReport(report, task) {
  if (!report || !report.found) {
    return {
      title: task ? `${task.name} Review 结果` : '暂无 Review 报告',
      verdict: '未开始',
      reviewedAt: '-',
      content: '尚未生成 Code Review 报告，可点击「重新Review」触发 ReviewBot。',
      filePath: '',
    };
  }
  return {
    title: report.title || 'Code Review 报告',
    verdict: report.verdict || '需修改',
    reviewedAt: report.reviewedAt || '-',
    content: report.content || '',
    filePath: report.filePath || '',
  };
}

function ReviewResultPanel({ result }) {
  const [showAll, setShowAll] = useState(false);
  const contentRef = React.useRef(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const check = () => {
      const overflow = el.scrollHeight > el.clientHeight + 2;
      setClamped(overflow);
    };

    check();
    const raf1 = requestAnimationFrame(check);
    const t1 = setTimeout(check, 200);
    const t2 = setTimeout(check, 500);
    const t3 = setTimeout(check, 1000);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => check());
      if (el.firstElementChild) {
        ro.observe(el.firstElementChild);
      }
    }

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro?.disconnect();
    };
  }, [result]);

  const isMarkdown = result.filePath ? /\.(md|markdown)$/i.test(result.filePath) : true;

  return (
    <>
      <div className="flex flex-col bg-white text-[13px] text-[#5f6d83]">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf1f8] px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium text-[#1d2740]">{result.title}</div>
            <div className="mt-1 text-[12px] text-[#8d99ae]">最后 Review：{result.reviewedAt || '-'}</div>
          </div>
          <StatusPill color={result.verdict === '通过' ? 'green' : result.verdict === '阻塞' ? 'red' : 'orange'}>
            {result.verdict}
          </StatusPill>
        </div>
        <div className="relative px-5 py-4">
          {result.filePath ? (
            <div className="mb-3 text-[11px] text-[#8d99ae]">报告文件：{result.filePath}</div>
          ) : null}
          <div ref={contentRef} className="overflow-hidden" style={{ height: 240 }}>
            {isMarkdown ? (
              <MarkdownMessage text={result.content} staff={[]} highlightMentions={false} />
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-[12px] leading-6 text-[#40516d]">{result.content}</pre>
            )}
          </div>
          {clamped && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-white via-white/90 to-transparent pb-3 pt-12">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="pointer-events-auto rounded-[8px] bg-[#2f6bff] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#1e5af5]"
              >
                查看全部
              </button>
            </div>
          )}
        </div>
      </div>
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,18,28,0.26)] px-6" onClick={() => setShowAll(false)}>
          <div className="max-h-[82vh] w-full max-w-[880px] overflow-hidden rounded-[14px] bg-white shadow-[0_32px_80px_rgba(18,30,52,0.18)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
              <div>
                <div className="text-[16px] font-semibold text-[#1d2740]">{result.title}</div>
                <div className="mt-1 text-[12px] text-[#8d99ae]">最后 Review：{result.reviewedAt || '-'} · {result.filePath || '数据库产物'}</div>
              </div>
              <button type="button" onClick={() => setShowAll(false)} className="text-[22px] text-[#97a3b8]">×</button>
            </div>
            <div className="max-h-[68vh] overflow-auto bg-[#f8fafc] px-5 py-4">
              {isMarkdown ? (
                <MarkdownMessage text={result.content} staff={[]} highlightMentions={false} />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-[12px] leading-6 text-[#40516d]">{result.content}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CodeReview() {
  const [data, setData] = useState({ summary: {}, reviewTasks: [], projectName: '-' });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [details, setDetails] = useState({});
  const [report, setReport] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const load = async (preferredTaskId) => {
    const [tasksRes, projectsRes] = await Promise.all([
      taskApi.getList(),
      devApi.getProjectList(),
    ]);
    const projects = projectsRes.data || [];
    const project = projects[0];
    const nextData = buildCodeReviewData(tasksRes.data || [], project?.projectName || 'workspace_artifacts/code');
    const nextSelected = nextData.reviewTasks.find((task) => task.id === preferredTaskId)
      || nextData.reviewTasks[0]
      || null;

    setData(nextData);
    setSelectedTaskId(nextSelected?.id || null);

    if (nextSelected) {
      const detailRes = await taskApi.getDetail(nextSelected.id);
      setDetails((current) => ({ ...current, [nextSelected.id]: taskDetail(detailRes.data) }));
    }
    const reportRes = await codeReviewApi.getLatest(nextSelected?.id);
    setReport(reportRes.data || null);
  };

  useEffect(() => {
    load().catch(() => {
      setData({ summary: {}, reviewTasks: [], projectName: '-' });
    });
  }, []);

  const selectedTask = useMemo(
    () => (data.reviewTasks || []).find((task) => task.id === selectedTaskId) || null,
    [data.reviewTasks, selectedTaskId],
  );

  const reviewResult = useMemo(
    () => buildReviewFromReport(report, selectedTask),
    [report, selectedTask],
  );

  const selectTask = async (task) => {
    setSelectedTaskId(task.id);
    if (!details[task.id]) {
      const detailRes = await taskApi.getDetail(task.id);
      setDetails((current) => ({ ...current, [task.id]: taskDetail(detailRes.data) }));
    }
    const reportRes = await codeReviewApi.getLatest(task.id);
    setReport(reportRes.data || null);
  };

  const rerunReview = async () => {
    if (!selectedTask || reviewing) return;
    setReviewing(true);
    try {
      const res = await codeReviewApi.rerun(selectedTask.id);
      setReport(res.data || null);
    } catch (e) {
      console.error('重新Review失败', e);
    } finally {
      setReviewing(false);
    }
  };

  const summary = data.summary || {};
  const cards = [
    { label: 'Review 任务', value: summary.total || 0, icon: <CodeOutlined />, color: '#2f6bff' },
    { label: '待审/进行中', value: summary.running || 0, icon: <ClockCircleOutlined />, color: '#ff9b42' },
    { label: '已通过', value: summary.completed || 0, icon: <CheckCircleOutlined />, color: '#2bb36b' },
    { label: '问题项', value: summary.failed || 0, icon: <BugOutlined />, color: '#ff5c5c' },
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

        <Panel>
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
            <ReviewResultPanel result={reviewResult} />
          ) : (
            <div className="flex min-h-[460px] items-center justify-center bg-[#f8fafc] text-[13px] text-[#8d99ae]">
              请选择左侧 Code Review 任务
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
