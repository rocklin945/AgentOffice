// 格式化日期
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 获取状态颜色
export function getStatusColor(status) {
  const colorMap = {
    '工作中': '#2F6BFF',
    '思考中': '#8B5CF6',
    '编译中': '#F59E0B',
    '部署中': '#EAB308',
    '完成': '#22C55E',
    '在线': '#22C55E',
    '空闲': '#9CA3AF',
    '异常': '#EF4444',
    '运行中': '#22C55E',
    '已停止': '#9CA3AF',
    '进行中': '#2F6BFF',
    '已完成': '#22C55E',
    '已失败': '#EF4444',
    '待分配': '#9CA3AF',
  };
  return colorMap[status] || '#9CA3AF';
}

// 获取状态背景色
export function getStatusBgColor(status) {
  const colorMap = {
    '工作中': '#2F6BFF15',
    '思考中': '#8B5CF615',
    '编译中': '#F59E0B15',
    '部署中': '#EAB30815',
    '完成': '#22C55E15',
    '在线': '#22C55E15',
    '空闲': '#9CA3AF15',
    '异常': '#EF444415',
    '运行中': '#22C55E15',
    '已停止': '#9CA3AF15',
    '进行中': '#2F6BFF15',
    '已完成': '#22C55E15',
    '已失败': '#EF444415',
    '待分配': '#9CA3AF15',
  };
  return colorMap[status] || '#9CA3AF15';
}

// 获取优先级颜色
export function getPriorityColor(priority) {
  const colorMap = {
    '高': '#EF4444',
    '中': '#F59E0B',
    '低': '#22C55E',
  };
  return colorMap[priority] || '#9CA3AF';
}
