import React, { useEffect, useState } from 'react';
import { devApi } from '../api';
import { Panel } from '../components/AppPrimitives';

export default function Dev() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    devApi.getProjectList().then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (list.length > 0) {
        selectProject(list[0]);
      }
    }).catch(() => {});
  }, []);

  const selectProject = (project) => {
    setSelectedProject(project);
    setSelectedFile(null);
    setFileContent('');
    devApi.getFileTree(project.id).then((res) => {
      setFiles(flattenFiles(res.data || []));
    }).catch(() => {});
  };

  const flattenFiles = (nodes) => {
    let result = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) {
        result = result.concat(flattenFiles(node.children));
      }
    }
    return result;
  };

  const selectFile = (file) => {
    if (file.directory) return;
    setSelectedFile(file);
    devApi.getFile(file.id).then((res) => {
      setFileContent(res.data?.content || '');
    }).catch(() => {});
  };

  const saveFile = async () => {
    if (!selectedFile || saving) return;
    setSaving(true);
    try {
      await devApi.updateFileContent(selectedFile.id, fileContent);
      // 保存成功后重新读取文件确保一致性
      const res = await devApi.getFile(selectedFile.id);
      if (res.data?.content !== undefined) {
        setFileContent(res.data.content);
      }
      setSelectedFile((prev) => ({ ...prev, saved: true }));
      setTimeout(() => setSelectedFile((prev) => prev ? { ...prev, saved: false } : null), 1500);
    } catch (err) {
      console.error('保存失败', err);
      alert('保存失败: ' + (err.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
        <div>
          <div className="text-[18px] font-semibold text-[#1d2740]">云端开发环境</div>
          <div className="mt-1 text-[12px] text-[#98a3b7]">项目：{selectedProject?.projectName || '-'} / 文件：{selectedFile?.fileName || '-'}</div>
        </div>
        <button
          type="button"
          onClick={saveFile}
          disabled={!selectedFile || saving}
          className="rounded-[8px] bg-[#2f6bff] px-5 py-2 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a0c0ff]"
        >
          {saving ? '保存中...' : selectedFile?.saved ? '已保存' : '保存'}
        </button>
      </div>
      <div className="grid h-[calc(100vh-220px)] grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-r border-[#edf1f8] bg-[#fbfcff] px-4 py-5">
          <div className="mb-4 font-medium text-[#1d2740]">项目列表</div>
          <div className="mb-4 space-y-1">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => selectProject(p)}
                className={`cursor-pointer rounded-[8px] px-3 py-2 text-[13px] ${selectedProject?.id === p.id ? 'bg-[#2f6bff] text-white' : 'hover:bg-[#eef4ff]'}`}
              >
                {p.projectName}
              </div>
            ))}
          </div>
          <div className="mb-3 font-medium text-[#1d2740]">文件资源管理器</div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={`${file.id}-${index}`}
                onClick={() => selectFile(file)}
                className={`cursor-pointer rounded-[8px] px-3 py-2 text-[13px] ${file.directory ? 'font-medium text-[#1d2740]' : ''} ${selectedFile?.id === file.id ? 'bg-[#eef4ff] text-[#2f6bff]' : 'hover:bg-[#f0f4ff]'}`}
              >
                {file.fileName || file.name}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="flex-1 overflow-auto bg-[#081426] px-5 py-5">
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="min-h-full w-full resize-none bg-transparent font-mono text-[13px] leading-7 text-[#c7dcff] outline-none"
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-[#081426] text-[14px] text-[#57739a]">
              点击左侧文件查看内容
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
