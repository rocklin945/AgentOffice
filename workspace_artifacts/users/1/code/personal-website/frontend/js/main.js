// API 配置
// 在生产环境(Docker)中,Nginx 会代理 /api 到后端
// 在本地开发时,也使用 /api(因为前端通过 Nginx 访问)
const API_BASE_URL = '/api';

// 主题切换
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

// 移动端菜单
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // 点击菜单项后关闭菜单
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// 数字滚动动画
function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// 观察器：当元素进入视口时触发动画
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        if (counter.textContent === '0') {
          animateCounter(counter);
        }
      });
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
  observer.observe(statsSection);
}

// API 调用：获取健康状态
async function fetchHealthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    console.log('Backend Health:', data);
    displayHealthStatus(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    displayHealthStatus(null);
    return null;
  }
}

// 显示健康状态
function displayHealthStatus(data) {
  const statusIndicator = document.getElementById('backendStatus');
  if (!statusIndicator) return;

  if (data && data.status === 'UP') {
    statusIndicator.innerHTML = `
      <span class="status-dot status-online"></span>
      <span class="status-text">后端服务: 在线 (运行时间: ${data.uptime})</span>
    `;
  } else {
    statusIndicator.innerHTML = `
      <span class="status-dot status-offline"></span>
      <span class="status-text">后端服务: 离线</span>
    `;
  }
}

// 联系表单提交
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject')?.value.trim() || '',
      message: document.getElementById('message').value.trim()
    };

    if (!formData.name || !formData.email || !formData.message) {
      showNotification('请填写姓名、邮箱和留言内容。', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showNotification('请输入正确的邮箱地址。', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showNotification('消息发送成功！我会尽快回复您。', 'success');
        contactForm.reset();
      } else {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('消息发送失败，请稍后重试。', 'error');
    }
  });
}

// 通知提示
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // 检查后端健康状态
  fetchHealthStatus();
  
  // 每30秒检查一次后端状态
  setInterval(fetchHealthStatus, 30000);
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
