/* ========================================================================
   我的专属工作台  —  纯前端 / 本地存储 / 米色 iOS 风格
   所有数据保存在浏览器 localStorage，不上传任何服务器。
   ======================================================================== */
(function () {
  'use strict';

  const STORE_KEY = 'myWorkbench.v1';
  const todayStr = () => new Date().toISOString().slice(0, 10);

  /* ---------- 存储层 ---------- */
  let DB = load();
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return { checkin: {}, modules: {}, quotes: {} };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) { alert('保存失败：' + e.message); }
  }
  const M = (id, def) => {
    if (!DB.modules[id]) DB.modules[id] = def || {};
    else if (def) for (const k in def) if (!(k in DB.modules[id])) DB.modules[id][k] = def[k]; // 仅补齐缺失字段，不覆盖已有数据
    return DB.modules[id];
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- 每日激励语（每天自动更新） ---------- */
  const QUOTES = [
    { zh: '今天也要元气满满地爱自己呀！', en: 'Shine bright and be kind to yourself today.' },
    { zh: '小小的坚持，会变成大大的奇迹。', en: 'Small consistency becomes a big miracle.' },
    { zh: '你比昨天的自己更棒一点点。', en: 'You are a little better than yesterday.' },
    { zh: '把日子过成喜欢的样子。', en: 'Shape your days into the life you love.' },
    { zh: '慢慢来，比较快。', en: 'Slow down — that is actually faster.' },
    { zh: '认真生活的人，会被生活温柔以待。', en: 'Those who live with care are treated gently.' },
    { zh: '今天的努力，是明天的礼物。', en: 'Today’s effort is tomorrow’s gift.' },
    { zh: '保持热爱，奔赴山海。', en: 'Keep the passion, and head for the mountains and seas.' },
    { zh: '你值得世间所有的美好。', en: 'You deserve all the beauty in the world.' },
    { zh: '把平凡的一天，过得闪闪发光。', en: 'Make an ordinary day sparkle.' },
    { zh: '呼吸放慢，烦恼就小了。', en: 'Slow your breath and worries shrink.' },
    { zh: '每一步都算数。', en: 'Every single step counts.' },
    { zh: '温柔且有力量，是最好模样。', en: 'Gentle yet strong is the best version of you.' },
    { zh: '今天也要好好吃饭、好好睡觉。', en: 'Eat well and sleep well today.' },
    { zh: '开心不是目标，是生活方式。', en: 'Happiness is not a goal but a way of living.' },
    { zh: '你正在成为想要成为的人。', en: 'You are becoming who you want to be.' },
    { zh: '世界很忙，记得留点给自己。', en: 'The world is busy — save some time for yourself.' },
    { zh: '种一棵树最好的时间是现在。', en: 'The best time to plant a tree is now.' },
    { zh: '不慌不忙，自有光芒。', en: 'Take your time — your light is yours.' },
    { zh: '生活明朗，万物可爱。', en: 'Life is bright and everything is lovely.' }
  ];
  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }
  function getTodayQuote() {
    const t = todayStr();
    if (!DB.quotes.date || DB.quotes.date !== t) {
      DB.quotes = { date: t, base: dayOfYear(new Date()) % QUOTES.length, offset: 0 };
      save();
    }
    const idx = (DB.quotes.base + (DB.quotes.offset || 0)) % QUOTES.length;
    return QUOTES[idx];
  }

  /* ---------- 导航与模块配置 ---------- */
  const SECTIONS = [
    {
      id: 'piggy', icon: '🐷', name: '猪猪之家', color: '#E9B7A0',
      modules: [
        { id: 'pig_secure', name: '加密内容', icon: '🔐', type: 'secureNote' },
        { id: 'pig_size', name: '尺寸数据', icon: '📏', type: 'list', tag: '累积',
          fields: [
            { key: 'item', label: '项目', placeholder: '如：腰围 / 臂长' },
            { key: 'value', label: '数值', placeholder: '如：68 cm' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 'pig_storage', name: '收纳记录', icon: '🧺', type: 'storage', tag: '可搜索位置',
          fields: [
            { key: 'name', label: '物品名称', placeholder: '如：充电宝' },
            { key: 'loc', label: '存放位置', placeholder: '如：客厅左边抽屉第二层' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 'pig_clean', name: '卫生清洁', icon: '🧽', type: 'checklist', tag: '每日重置',
          defaults: ['扫地', '拖地', '擦拭桌面', '清洗洗漱台', '整理床铺', '倒垃圾', '洗衣服'] }
      ]
    },
    {
      id: 'health', icon: '💪', name: '健康生活', color: '#A9C0A0',
      modules: [
        { id: 'h_weight', name: '每日体重', icon: '⚖️', type: 'weight', tag: '每日一条' },
        { id: 'h_exercise', name: '运动打卡', icon: '🏃', type: 'checklist', tag: '每日重置',
          defaults: ['跑步 / 快走', '拉伸', '核心训练', '喝水 8 杯', '早睡'] },
        { id: 'h_diet', name: '饮食记录', icon: '🥗', type: 'list', tag: '累积',
          fields: [
            { key: 'meal', label: '餐次', placeholder: '早 / 午 / 晚 / 加餐' },
            { key: 'food', label: '吃了什么', placeholder: '如：番茄鸡蛋面' },
            { key: 'kcal', label: '热量(kcal)', placeholder: '可选' }
          ] },
        { id: 'h_learn', name: '值得学习', icon: '💡', type: 'note', tag: '累积' }
      ]
    },
    {
      id: 'craft', icon: '🎨', name: '手作专区', color: '#E7B7C9', type: 'craft'
    },
    {
      id: 'du', icon: '🍊', name: '小嘟频道', color: '#E6C277',
      modules: [
        { id: 'd_grow', name: '成长记录', icon: '🌱', type: 'list', tag: '累积',
          fields: [
            { key: 'date', label: '日期', type: 'date' },
            { key: 'event', label: '成长事项', placeholder: '如：会叫妈妈了' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 'd_eat', name: '吃饭饱饱', icon: '🍚', type: 'list', tag: '累积',
          fields: [
            { key: 'meal', label: '餐次', placeholder: '早 / 午 / 晚' },
            { key: 'food', label: '吃了什么', placeholder: '如：米粉 + 南瓜泥' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 'd_read', name: '阅读记录', icon: '📚', type: 'list', tag: '累积',
          fields: [
            { key: 'book', label: '书名', placeholder: '如：猜猜我有多爱你' },
            { key: 'author', label: '作者', placeholder: '可选' },
            { key: 'note', label: '感想 / 进度', placeholder: '可选' }
          ] },
        { id: 'd_sport', name: '运动记录', icon: '⚽', type: 'list', tag: '累积',
          fields: [
            { key: 'sport', label: '运动', placeholder: '如：游泳' },
            { key: 'duration', label: '时长', placeholder: '如：30 分钟' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 'd_plan', name: '学习计划', icon: '🎯', type: 'list', tag: '累积',
          fields: [
            { key: 'plan', label: '计划内容', placeholder: '如：认识 10 个汉字' },
            { key: 'due', label: '目标日期', type: 'date' },
            { key: 'status', label: '状态', type: 'select', options: ['进行中', '已完成', '搁置'] }
          ] },
        { id: 'd_points', name: '积分累计', icon: '⭐', type: 'points', tag: '累积', unit: '分' }
      ]
    },
    {
      id: 'account', icon: '💰', name: '当个会计', color: '#E6C277',
      modules: [
        { id: 'a_favor', name: '人情往来', icon: '🤝', type: 'list', tag: '累积',
          fields: [
            { key: 'who', label: '人物', placeholder: '如：表姐' },
            { key: 'event', label: '事项', placeholder: '如：生日红包' },
            { key: 'amount', label: '金额', placeholder: '数字' },
            { key: 'dir', label: '方向', type: 'select', options: ['借出', '借入', '送礼', '收礼'] }
          ] },
        { id: 'a_expense', name: '开支记录', icon: '🧾', type: 'list', tag: '累积',
          showTotal: true, amountKey: 'amount',
          fields: [
            { key: 'cat', label: '类别', placeholder: '如：餐饮 / 交通' },
            { key: 'amount', label: '金额', type: 'number', placeholder: '数字' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 'a_save', name: '存钱罐罐', icon: '🐷', type: 'points', tag: '累积', unit: '元', money: true }
      ]
    },
    {
      id: 'study', icon: '📖', name: '学习至上', color: '#A9C4DD',
      modules: [
        { id: 's_parent', name: '育儿学习', icon: '👶', type: 'note', tag: '累积' },
        { id: 's_books', name: '每月书籍', icon: '📕', type: 'list', tag: '累积',
          fields: [
            { key: 'month', label: '月份', placeholder: '如：2026-07' },
            { key: 'book', label: '书名', placeholder: '如：被讨厌的勇气' },
            { key: 'author', label: '作者', placeholder: '可选' }
          ] },
        { id: 's_podcast', name: '每月播客', icon: '🎧', type: 'list', tag: '累积',
          fields: [
            { key: 'month', label: '月份', placeholder: '如：2026-07' },
            { key: 'name', label: '播客名', placeholder: '如：得意忘形' },
            { key: 'note', label: '感想', placeholder: '可选' }
          ] },
        { id: 's_learn', name: '值得学习', icon: '💡', type: 'note', tag: '累积' }
      ]
    },
    {
      id: 'time', icon: '🕒', name: '时间记录', color: '#C9B6DD',
      modules: [
        { id: 't_birthday', name: '生日时间', icon: '🎂', type: 'dates', tag: '倒计时', annual: true,
          fields: [
            { key: 'name', label: '姓名', placeholder: '如：妈妈' },
            { key: 'date', label: '生日', type: 'date' }
          ] },
        { id: 't_pray', name: '祈福时间', icon: '🙏', type: 'dates', tag: '倒计时', annual: false,
          fields: [
            { key: 'name', label: '祈福内容', placeholder: '如：家人平安' },
            { key: 'date', label: '祈福 / 还愿日期', type: 'date' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] },
        { id: 't_important', name: '重要日子', icon: '💖', type: 'dates', tag: '倒计时', annual: false,
          fields: [
            { key: 'name', label: '事项', placeholder: '如：结婚纪念日' },
            { key: 'date', label: '日期', type: 'date' },
            { key: 'annual', label: '每年重复', type: 'checkbox' },
            { key: 'note', label: '备注', placeholder: '可选' }
          ] }
      ]
    },
    {
      id: 'recent', icon: '❗️', name: '近期重要', color: '#F2C6C2', modules: [],
      type: 'recent'
    }
  ];

  const MOD_MAP = {};
  SECTIONS.forEach(s => (s.modules || []).forEach(m => { m.section = s.id; MOD_MAP[m.id] = m; }));

  /* ---------- 全局状态：当前视图 ---------- */
  let current = 'home';

  /* ---------- 工具 ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtDate = d => { const x = new Date(d); return isNaN(x) ? '' : `${x.getMonth() + 1}月${x.getDate()}日`; };

  function daysUntil(dateStr, annual) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let target = new Date(dateStr + 'T00:00:00');
    if (isNaN(target)) return null;
    if (annual) {
      target = new Date(today.getFullYear(), target.getMonth(), target.getDate());
      if (target < today) target = new Date(today.getFullYear() + 1, target.getMonth(), target.getDate());
    }
    return Math.round((target - today) / 86400000);
  }

  /* ===================================================================
     渲染：导航
     =================================================================== */
  function renderNav() {
    const nav = $('#nav');
    nav.innerHTML = SECTIONS.map(s => {
      const badge = s.type === 'recent' ? recentCount() : '';
      return `<div class="nav-item ${current === s.id ? 'active' : ''}" data-id="${s.id}">
        <div class="nav-ico">${s.icon}</div>
        <div class="nav-label">${s.name}</div>
        ${badge ? `<span class="nav-badge">${badge}</span>` : ''}
      </div>`;
    }).join('');
    nav.querySelectorAll('.nav-item').forEach(el => {
      el.onclick = () => { openSection(el.dataset.id); closeDrawer(); };
    });
  }
  // 抽屉控制（手机端）
  function openDrawer() { document.body.classList.add('drawer-open'); $('#sidebar').classList.add('open'); }
  function closeDrawer() { $('#sidebar').classList.remove('open'); document.body.classList.remove('drawer-open'); }

  function openSection(id) {
    current = id;
    clearInterval(clockTimer); // 离开桌面时停止时钟定时器
    renderNav();
    if (id === 'home') { renderHome(); $('#topTitle').textContent = '桌面'; $('#topSub').textContent = '我的专属小天地'; }
    else {
      const s = SECTIONS.find(x => x.id === id);
      $('#topTitle').textContent = s.name;
      $('#topSub').textContent = s.type === 'craft' ? '食品DIY · 手工DIY · 智能解析' : s.modules.map(m => m.name).join(' · ');
      renderSection(s);
    }
  }

  /* ===================================================================
     渲染：桌面首页
     =================================================================== */
  function renderHome() {
    const content = $('#content');
    const q = getTodayQuote();
    content.innerHTML = `
      <div class="home-grid">
        <div class="home-card clock-card">
          <div class="clock-time" id="clk">--:--:--</div>
          <div class="clock-date" id="clkDate"></div>
          <div class="clock-week" id="clkWeek"></div>
          <div class="checkin-area">
            <button class="checkin-btn ${DB.checkin.lastDate === todayStr() ? 'done' : ''}" id="checkinBtn">
              ${DB.checkin.lastDate === todayStr() ? '✅ 今日已打卡' : '☀️ 今日打卡'}
            </button>
            <div class="streak">已连续打卡 <b>${DB.checkin.streak || 0}</b> 天</div>
          </div>
        </div>
        <div class="home-card quote-card">
          <div class="quote-tag">🌈 今日激励 · DAILY MOTIVATION</div>
          <div class="quote-zh">${esc(q.zh)}</div>
          <div class="quote-en">${esc(q.en)}</div>
          <button class="quote-change" id="quoteChange">换一句 ↻</button>
        </div>
      </div>
      <div class="home-stats" id="homeStats"></div>
      <div class="widget-grid" id="widgetGrid"></div>
      <div class="upcoming">
        <h3>📌 近期重要 · 即将到来</h3>
        <div id="upcomingList"></div>
      </div>`;

    startClock();
    $('#checkinBtn').onclick = doCheckin;
    $('#quoteChange').onclick = () => { DB.quotes.offset = ((DB.quotes.offset || 0) + 1) % QUOTES.length; save(); renderHome(); };
    renderHomeStats();
    renderWidgets();
    renderUpcoming();
  }

  let clockTimer = null;
  function startClock() {
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const tick = () => {
      const c = $('#clk'); if (!c) return; // 已离开桌面则停止
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      c.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      $('#clkDate').textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      $('#clkWeek').textContent = week[d.getDay()];
    };
    tick(); clearInterval(clockTimer); clockTimer = setInterval(tick, 1000);
  }

  function doCheckin() {
    const t = todayStr();
    if (DB.checkin.lastDate === t) return;
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    DB.checkin.streak = (DB.checkin.lastDate === y) ? (DB.checkin.streak || 0) + 1 : 1;
    DB.checkin.lastDate = t;
    save(); renderHome();
  }

  function renderHomeStats() {
    const mod = id => M(id);
    const stats = [
      { ico: '⚖️', num: (mod('h_weight').records || []).slice(-1)[0]?.value || '—', label: '最新体重' },
      { ico: '⭐', num: mod('d_points').total || 0, label: '小嘟积分' },
      { ico: '🐷', num: '¥' + (mod('a_save').total || 0), label: '存钱罐' },
      { ico: '📚', num: (mod('d_read').items || []).length, label: '阅读本数' }
    ];
    $('#homeStats').innerHTML = stats.map(s => `
      <div class="stat"><div class="stat-ico">${s.ico}</div>
      <div class="stat-num">${esc(s.num)}</div><div class="stat-label">${s.label}</div></div>`).join('');
  }

  function collectUpcoming() {
    const out = [];
    ['t_birthday', 't_pray', 't_important'].forEach(id => {
      const m = M(id); (m.items || []).forEach(it => {
        const d = daysUntil(it.date, !!it.annual || id === 't_birthday');
        if (d != null) out.push({ name: it.name, days: d, icon: MOD_MAP[id].icon, type: MOD_MAP[id].name });
      });
    });
    return out.sort((a, b) => a.days - b.days).slice(0, 6);
  }
  function renderUpcoming() {
    const list = collectUpcoming();
    const el = $('#upcomingList');
    if (!list.length) { el.innerHTML = `<div class="empty">还没有记录重要日子，去「时间记录」添加吧～</div>`; return; }
    el.innerHTML = list.map(u => {
      const txt = u.days === 0 ? '就是今天 🎉' : u.days > 0 ? `还有 ${u.days} 天` : `已过 ${Math.abs(u.days)} 天`;
      return `<div class="upcoming-item"><span class="ui-ico">${u.icon}</span>
        <span class="ui-name">${esc(u.name)} <small style="color:var(--ink-soft)">· ${u.type}</small></span>
        <span class="ui-days">${txt}</span></div>`;
    }).join('');
  }
  function recentCount() { return collectUpcoming().length; }

  /* ===================================================================
     桌面小组件
     =================================================================== */
  function getMood() { const t = todayStr(); if (!DB.mood || DB.mood.date !== t) DB.mood = { date: t, emoji: '' }; return DB.mood; }
  function getWater() { const t = todayStr(); if (!DB.water || DB.water.date !== t) DB.water = { date: t, count: 0 }; return DB.water; }

  function renderWidgets() {
    const grid = $('#widgetGrid');
    if (!grid) return;
    grid.innerHTML = moodCard() + waterCard() + quickCard() + checkCard() + calCard();
    bindMood(grid); bindWater(grid); bindQuick(grid);
  }

  /* —— 今日心情 —— */
  const MOODS = [['😞', '沮丧'], ['😕', '一般'], ['😐', '平淡'], ['🙂', '不错'], ['😄', '超棒']];
  function moodCard() {
    const mood = getMood();
    const label = mood.emoji ? MOODS.find(x => x[0] === mood.emoji)[1] : '';
    return `<div class="widget">
      <div class="w-head">🌤 今日心情</div>
      <div class="mood-row">${MOODS.map(([e, n]) => `<button class="mood-btn ${mood.emoji === e ? 'on' : ''}" data-m="${e}" title="${n}">${e}</button>`).join('')}</div>
      <div class="w-sub">${mood.emoji ? '今天的心情：' + mood.emoji + ' ' + label : '点一下，记录今天的心情～'}</div>
    </div>`;
  }
  function bindMood(grid) {
    grid.querySelectorAll('.mood-btn').forEach(b => b.onclick = () => { getMood().emoji = b.dataset.m; save(); renderWidgets(); });
  }

  /* —— 喝水打卡 —— */
  const WATER_GOAL = 8;
  function waterCard() {
    const w = getWater(); const pct = Math.min(100, Math.round(w.count / WATER_GOAL * 100));
    return `<div class="widget">
      <div class="w-head">💧 喝水打卡</div>
      <div class="water-num"><b>${w.count}</b> / ${WATER_GOAL} 杯</div>
      <div class="water-bar"><div class="water-fill" style="width:${pct}%"></div></div>
      <div class="water-btns">
        <button class="btn ghost sm" id="wMi">－</button>
        <button class="btn sm" id="wPl">＋ 一杯</button>
      </div>
    </div>`;
  }
  function bindWater(grid) {
    grid.querySelector('#wPl').onclick = () => { const w = getWater(); w.count = Math.min(WATER_GOAL * 2, w.count + 1); save(); renderWidgets(); };
    grid.querySelector('#wMi').onclick = () => { const w = getWater(); w.count = Math.max(0, w.count - 1); save(); renderWidgets(); };
  }

  /* —— 快捷操作 —— */
  function quickCard() {
    const acts = [
      ['⚖️', '记体重', 'health', 'h_weight'],
      ['🧾', '记开支', 'account', 'a_expense'],
      ['🧺', '加收纳', 'piggy', 'pig_storage'],
      ['🥗', '记饮食', 'health', 'h_diet'],
      ['🎂', '加生日', 'time', 't_birthday'],
      ['⭐', '攒积分', 'du', 'd_points']
    ];
    return `<div class="widget">
      <div class="w-head">⚡ 快捷操作</div>
      <div class="quick-grid">${acts.map(a => `<button class="quick-btn" data-s="${a[2]}" data-m="${a[3]}">${a[0]} ${a[1]}</button>`).join('')}</div>
    </div>`;
  }
  function bindQuick(grid) {
    grid.querySelectorAll('.quick-btn').forEach(b => b.onclick = () => quickGo(b.dataset.s, b.dataset.m));
  }
  function quickGo(sectionId, modId) {
    openSection(sectionId);
    setTimeout(() => {
      const m = MOD_MAP[modId]; if (!m) return;
      const card = [...document.querySelectorAll('.module')].find(c => c.querySelector('h2') && c.querySelector('h2').textContent === m.name);
      if (!card) return;
      const add = card.querySelector('#addBtn');
      if (add) add.click();
      else { const inp = card.querySelector('#wVal'); if (inp) { inp.scrollIntoView(); inp.focus(); } }
    }, 60);
  }

  /* —— 今日打卡总览 —— */
  function checkCard() {
    const checks = [];
    SECTIONS.forEach(s => (s.modules || []).forEach(m => {
      if (m.type !== 'checklist') return;
      const d = M(m.id); const t = todayStr();
      if (d.date !== t) { d.date = t; d.checks = {}; }
      const total = (m.defaults || []).length;
      const done = (m.defaults || []).filter(l => d.checks[l]).length;
      checks.push({ name: m.name, icon: m.icon, done, total, pct: total ? Math.round(done / total * 100) : 0 });
    }));
    return `<div class="widget wide">
      <div class="w-head">✅ 今日打卡总览</div>
      <div class="check-overview">${checks.map(c => `
        <div class="co-row">
          <span class="co-ico">${c.icon}</span>
          <span class="co-name">${c.name}</span>
          <span class="co-bar"><span class="co-fill" style="width:${c.pct}%"></span></span>
          <span class="co-num">${c.done}/${c.total}</span>
        </div>`).join('')}</div>
    </div>`;
  }

  /* —— 迷你月历 —— */
  function eventDaysOfMonth(y, mo) {
    const set = new Set();
    ['t_birthday', 't_pray', 't_important'].forEach(id => {
      (M(id).items || []).forEach(it => {
        if (!it.date) return;
        const dt = new Date(it.date + 'T00:00:00'); if (isNaN(dt)) return;
        const isAnnual = id === 't_birthday' || !!it.annual;
        if (isAnnual) { if (dt.getMonth() === mo) set.add(dt.getDate()); }
        else if (dt.getFullYear() === y && dt.getMonth() === mo) set.add(dt.getDate());
      });
    });
    return set;
  }
  function calCard() {
    const now = new Date(); const y = now.getFullYear(), mo = now.getMonth();
    const first = new Date(y, mo, 1).getDay(); const days = new Date(y, mo + 1, 0).getDate();
    const ev = eventDaysOfMonth(y, mo);
    const wk = ['日', '一', '二', '三', '四', '五', '六'];
    let cells = '';
    for (let i = 0; i < first; i++) cells += `<span class="cal-cell empty"></span>`;
    for (let d = 1; d <= days; d++) {
      const isT = d === now.getDate(); const has = ev.has(d);
      cells += `<span class="cal-cell ${isT ? 'today' : ''} ${has ? 'ev' : ''}">${d}${has ? '<i class="dot"></i>' : ''}</span>`;
    }
    return `<div class="widget">
      <div class="w-head">📅 ${y}年${mo + 1}月</div>
      <div class="cal">
        <div class="cal-wk">${wk.map(w => `<span>${w}</span>`).join('')}</div>
        <div class="cal-grid">${cells}</div>
      </div>
    </div>`;
  }

  /* ===================================================================
     渲染：某个分区（含多个模块卡片）
     =================================================================== */
  function renderSection(s) {
    const content = $('#content');
    if (s.type === 'recent') { renderRecent(); return; }
    if (s.type === 'craft') { renderCraftSection(s); return; }
    content.innerHTML = `<div class="module-grid" id="modGrid"></div>`;
    const grid = $('#modGrid');
    s.modules.forEach(m => {
      const card = document.createElement('div');
      card.className = 'module';
      card.innerHTML = `<div class="module-head"><span class="m-ico">${m.icon}</span>
        <h2>${m.name}</h2>${m.tag ? `<span class="m-tag">${m.tag}</span>` : ''}</div>
        <div class="mod-body"></div>`;
      grid.appendChild(card);
      renderModule(m, card.querySelector('.mod-body'));
    });
  }

  /* ===================================================================
     通用：列表型模块（含收纳搜索、合计）
     =================================================================== */
  function renderModule(m, body) {
    switch (m.type) {
      case 'note': return renderNote(m, body);
      case 'secureNote': return renderSecure(m, body);
      case 'list': return renderList(m, body);
      case 'storage': return renderStorage(m, body);
      case 'checklist': return renderChecklist(m, body);
      case 'weight': return renderWeight(m, body);
      case 'points': return renderPoints(m, body);
      case 'dates': return renderDates(m, body);
    }
  }

  /* ---- 文本笔记 ---- */
  function renderNote(m, body) {
    const d = M(m.id, { text: '' });
    body.innerHTML = `<textarea class="note-area" style="width:100%;min-height:150px;border:1px solid var(--line);background:var(--card-soft);border-radius:12px;padding:12px;font-size:14px;outline:none;resize:vertical">${esc(d.text)}</textarea>`;
    const ta = body.querySelector('textarea');
    ta.oninput = () => { d.text = ta.value; save(); };
  }

  /* ---- 加密内容 ---- */
  function renderSecure(m, body) {
    const d = M(m.id, { text: '', locked: true, hint: '' });
    if (d.locked) {
      body.innerHTML = `<div class="secure-lock">
        <div style="font-size:34px">🔒</div>
        <p style="color:var(--ink-soft);font-size:13px;margin:6px 0 4px">输入密码查看 / 编辑加密内容</p>
        <input type="password" id="secPass" placeholder="密码（首次使用即设定）"/>
        <button class="btn" id="secGo" style="width:100%">🔓 进入</button>
        ${d.hint ? `<p style="font-size:11px;color:var(--ink-soft);margin-top:8px">提示：${esc(d.hint)}</p>` : ''}
      </div>`;
      $('#secGo').onclick = () => {
        const p = $('#secPass').value;
        if (!p) return alert('请输入密码');
        if (d.pass && d.pass !== p) return alert('密码错误 💢');
        if (!d.pass) { d.pass = p; d.hint = ''; save(); }
        d.locked = false; save(); renderSecure(m, body);
      };
      return;
    }
    body.innerHTML = `<div class="secure-body">
      <textarea placeholder="这里的内容只有你知道密码才能看～">${esc(d.text)}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end">
        <button class="btn ghost sm" id="secLock">🔒 锁定</button>
        <button class="btn sm" id="secSave">💾 保存</button>
      </div></div>`;
    const ta = body.querySelector('textarea');
    $('#secSave').onclick = () => { d.text = ta.value; save(); alert('已保存 🔐'); };
    $('#secLock').onclick = () => { d.text = ta.value; d.locked = true; save(); renderSecure(m, body); };
  }

  /* ---- 通用列表 ---- */
  function renderList(m, body) {
    const d = M(m.id, { items: [] });
    body.innerHTML = `
      <button class="btn" id="addBtn" style="align-self:flex-start;margin-bottom:10px">＋ 添加</button>
      ${m.showTotal ? `<div class="weight-stat" style="margin-bottom:8px">合计：<b>¥${(d.items||[]).reduce((s,i)=>s+(parseFloat(i[m.amountKey]||0)||0),0).toFixed(2)}</b></div>` : ''}
      <div class="list" id="listEl"></div>`;
    body.querySelector('#addBtn').onclick = () => openForm(m, null, body);
    paintList(m, body);
  }
  function paintList(m, body) {
    const d = M(m.id); const el = body.querySelector('#listEl');
    const items = d.items || [];
    if (!items.length) { el.innerHTML = `<div class="empty">还没有记录，点「添加」开始吧 ✍️</div>`; return; }
    el.innerHTML = items.slice().reverse().map(it => {
      const title = it[m.fields[0].key];
      const sub = m.fields.slice(1).map(f => it[f.key] ? `${f.label}：${esc(it[f.key])}` : '').filter(Boolean).join(' ｜ ');
      return `<div class="row">
        <div class="row-main"><div class="row-title">${esc(title)}</div>${sub ? `<div class="row-sub">${sub}</div>` : ''}</div>
        <button class="row-edit" data-edit="${it.id}">✏️</button>
        <button class="row-del" data-del="${it.id}">🗑</button></div>`;
    }).join('');
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      d.items = d.items.filter(x => x.id !== b.dataset.del); save(); paintList(m, body);
      if (m.showTotal) renderList(m, body);
    });
    el.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
      const it = d.items.find(x => x.id === b.dataset.edit); openForm(m, it, body);
    });
  }

  /* ---- 收纳记录（独立搜索框，直接显示位置） ---- */
  function renderStorage(m, body) {
    const d = M(m.id, { items: [] });
    body.innerHTML = `
      <div class="search-box">
        <input type="text" id="stoSearch" placeholder="🔍 搜物品，直接显示它放在哪…"/>
      </div>
      <div id="stoResult"></div>
      <button class="btn" id="addBtn" style="align-self:flex-start;margin:6px 0 10px">＋ 添加收纳</button>
      <div class="list" id="listEl"></div>`;
    body.querySelector('#addBtn').onclick = () => openForm(m, null, body);
    const search = body.querySelector('#stoSearch');
    search.oninput = () => {
      const kw = search.value.trim();
      const box = body.querySelector('#stoResult');
      if (!kw) { box.innerHTML = ''; return; }
      const hit = (d.items || []).filter(i => (i.name || '').toLowerCase().includes(kw.toLowerCase()));
      if (!hit.length) { box.innerHTML = `<div class="search-result none">😶 没找到「${esc(kw)}」的存放位置，去添加一条吧</div>`; return; }
      box.innerHTML = hit.map(i => `<div class="search-result">📦 <b>${esc(i.name)}</b> 放在：<b>${esc(i.loc || '未填写位置')}</b>${i.note ? ` ｜ ${esc(i.note)}` : ''}</div>`).join('');
    };
    paintList(m, body);
  }

  /* ---- 表单弹窗（新增/编辑） ---- */
  function openForm(m, item, body) {
    const isEdit = !!item;
    let html = `<h3>${isEdit ? '✏️ 编辑' : '＋ 新增'} · ${m.name}</h3>`;
    m.fields.forEach(f => {
      const val = item ? (item[f.key] ?? '') : '';
      html += `<div class="field"><label>${f.label}${f.type === 'checkbox' ? '' : ''}</label>`;
      if (f.type === 'select') {
        html += `<select data-k="${f.key}">${f.options.map(o => `<option ${val === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
      } else if (f.type === 'textarea') {
        html += `<textarea data-k="${f.key}" rows="3" placeholder="${f.placeholder || ''}">${esc(val)}</textarea>`;
      } else if (f.type === 'checkbox') {
        html += `<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-k="${f.key}" ${val ? 'checked' : ''}/> 是</label>`;
      } else {
        html += `<input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" data-k="${f.key}" value="${esc(val)}" placeholder="${f.placeholder || ''}"/>`;
      }
      html += `</div>`;
    });
    html += `<div class="modal-actions"><button class="btn ghost" id="cancel">取消</button><button class="btn" id="ok">${isEdit ? '保存' : '添加'}</button></div>`;
    showModal(html);
    $('#cancel').onclick = closeModal;
    $('#ok').onclick = () => {
      const data = { id: item ? item.id : uid() };
      m.fields.forEach(f => {
        const el = $(`[data-k="${f.key}"]`);
        let v = el.type === 'checkbox' ? el.checked : el.value;
        data[f.key] = v;
      });
      const d = M(m.id, { items: [] });
      if (isEdit) d.items = d.items.map(x => x.id === item.id ? data : x);
      else d.items.push(data);
      save(); closeModal();
      if (m.type === 'storage' && body) renderStorage(m, body);
      else if (m.type === 'dates' && body) paintDates(m, body);
      else if (body) { renderList(m, body); }
    };
  }

  /* ---- 每日打卡清单 ---- */
  function renderChecklist(m, body) {
    const t = todayStr();
    const d = M(m.id, { date: t, checks: {} });
    if (d.date !== t) { d.date = t; d.checks = {}; save(); } // 每日重置
    const labels = m.defaults || [];
    const done = labels.filter(l => d.checks[l]).length;
    body.innerHTML = `
      <div class="weight-stat" style="margin-bottom:10px">今日完成 <b>${done}/${labels.length}</b></div>
      <div class="check-grid" id="cg"></div>`;
    const cg = body.querySelector('#cg');
    cg.innerHTML = labels.map(l => `<div class="check-item ${d.checks[l] ? 'on' : ''}" data-l="${esc(l)}">
        <div class="box">${d.checks[l] ? '✓' : ''}</div><span class="ci-text">${esc(l)}</span></div>`).join('');
    cg.querySelectorAll('.check-item').forEach(el => el.onclick = () => {
      const l = el.dataset.l; d.checks[l] = !d.checks[l]; save(); renderChecklist(m, body);
    });
  }

  /* ---- 每日体重（含图表） ---- */
  function renderWeight(m, body) {
    const d = M(m.id, { records: [] });
    body.innerHTML = `
      <div class="weight-inputs">
        <input type="number" step="0.1" id="wVal" placeholder="今日体重 kg"/>
        <button class="btn" id="wAdd">记录</button>
      </div>
      <div class="weight-stat" id="wStat"></div>
      <div class="chart" id="wChart"></div>`;
    body.querySelector('#wAdd').onclick = () => {
      const v = parseFloat(body.querySelector('#wVal').value);
      if (!v) return alert('请输入体重');
      const t = todayStr();
      d.records = d.records.filter(r => r.date !== t); // 每日一条
      d.records.push({ date: t, value: v }); save(); renderWeight(m, body);
    };
    const recs = d.records.slice().sort((a, b) => a.date < b.date ? -1 : 1);
    const last = recs.slice(-1)[0];
    const first = recs[0];
    let stat = `最新：<b>${last ? last.value + ' kg' : '—'}</b>`;
    if (last && first && recs.length > 1) stat += ` ｜ 记录 ${recs.length} 天 ｜ 变化：<b>${(last.value - first.value).toFixed(1)} kg</b>`;
    body.querySelector('#wStat').innerHTML = stat;
    drawChart(recs);
  }
  function drawChart(recs) {
    const el = $('#wChart'); if (!el) return;
    const data = recs.slice(-14);
    if (data.length < 2) { el.innerHTML = `<div class="empty">记录 2 天以上即可看到趋势曲线 📈</div>`; return; }
    const W = 300, H = 150, pad = 24;
    const vals = data.map(d => d.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = (max - min) || 1;
    const x = i => pad + i * (W - pad * 2) / (data.length - 1);
    const y = v => H - pad - (v - min) / range * (H - pad * 2);
    const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <polyline fill="none" stroke="#D89A7E" stroke-width="2.5" points="${pts}"/>
      ${data.map((d, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(d.value).toFixed(1)}" r="3" fill="#E9B7A0"/>`).join('')}
    </svg>`;
  }

  /* ---- 积分 / 存钱 ---- */
  function renderPoints(m, body) {
    const d = M(m.id, { total: 0, logs: [] });
    const unit = m.money ? '元' : (m.unit || '');
    body.innerHTML = `
      <div class="points-big">${m.money ? '¥' : ''}${d.total}<span style="font-size:18px;color:var(--ink-soft)"> ${unit}</span></div>
      <div class="points-actions">
        <button class="btn sage sm" id="plus">＋ 增加</button>
        <button class="btn ghost sm" id="minus">－ 减少</button>
      </div>
      <div class="list" id="pLog" style="margin-top:12px"></div>`;
    const paint = () => {
      body.querySelector('.points-big').innerHTML = `${m.money ? '¥' : ''}${d.total}<span style="font-size:18px;color:var(--ink-soft)"> ${unit}</span>`;
      const log = (d.logs || []).slice().reverse();
      body.querySelector('#pLog').innerHTML = log.length
        ? log.map(l => `<div class="row"><div class="row-main"><div class="row-title" style="color:${l.delta >= 0 ? '#7aa06f' : '#D9694E'}">${l.delta >= 0 ? '＋' : ''}${l.delta} ${unit} ${esc(l.note || '')}</div><div class="row-sub">${l.date}</div></div></div>`).join('')
        : `<div class="empty">暂无变动记录</div>`;
    };
    body.querySelector('#plus').onclick = () => changePoints(d, m, 1, paint, unit);
    body.querySelector('#minus').onclick = () => changePoints(d, m, -1, paint, unit);
    paint();
  }
  function changePoints(d, m, sign, paint, unit) {
    showModal(`<h3>${sign > 0 ? '＋ 增加' : '－ 减少'} ${m.name}</h3>
      <div class="field"><label>数量（${unit}）</label><input type="number" id="amt" placeholder="0"/></div>
      <div class="field"><label>备注</label><input type="text" id="note" placeholder="可选"/></div>
      <div class="modal-actions"><button class="btn ghost" id="c">取消</button><button class="btn" id="o">确定</button></div>`);
    $('#c').onclick = closeModal;
    $('#o').onclick = () => {
      const amt = parseFloat($('#amt').value); if (!amt) return alert('请输入数量');
      const delta = Math.abs(amt) * sign;
      d.total = Math.max(0, (d.total || 0) + delta);
      d.logs = d.logs || []; d.logs.push({ delta, note: $('#note').value, date: todayStr() });
      save(); closeModal(); paint();
    };
  }

  /* ---- 日期倒计时模块 ---- */
  function renderDates(m, body) {
    const d = M(m.id, { items: [] });
    body.innerHTML = `
      <button class="btn" id="addBtn" style="align-self:flex-start;margin-bottom:10px">＋ 添加</button>
      <div class="date-grid list" id="listEl"></div>`;
    body.querySelector('#addBtn').onclick = () => openForm(m, null, body);
    paintDates(m, body);
  }
  function paintDates(m, body) {
    const d = M(m.id); const el = body.querySelector('#listEl');
    const items = (d.items || []).map(it => ({ ...it, _days: daysUntil(it.date, m.annual || it.annual) }));
    items.sort((a, b) => (a._days ?? 1e9) - (b._days ?? 1e9));
    if (!items.length) { el.innerHTML = `<div class="empty">还没有记录，点「添加」吧 🗓</div>`; return; }
    el.innerHTML = items.map(it => {
      const dd = it._days;
      const txt = dd === 0 ? '就是今天 🎉' : dd > 0 ? `还有 <b>${dd}</b> 天` : `已过 <b>${Math.abs(dd)}</b> 天`;
      const sub = `${fmtDate(it.date)}${m.annual || it.annual ? '（每年）' : ''}${it.note ? ' ｜ ' + esc(it.note) : ''}`;
      return `<div class="row"><div class="row-main"><div class="row-title">${esc(it.name)}</div>
        <div class="row-sub">${sub}</div></div>
        <span class="ui-days" style="color:var(--peach-deep);font-weight:700;font-size:13px;white-space:nowrap">${txt}</span>
        <button class="row-edit" data-edit="${it.id}">✏️</button>
        <button class="row-del" data-del="${it.id}">🗑</button></div>`;
    }).join('');
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { d.items = d.items.filter(x => x.id !== b.dataset.del); save(); paintDates(m, body); if (m.id.startsWith('t_')) renderNav(); });
    el.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => { const it = d.items.find(x => x.id === b.dataset.edit); openForm(m, it, body); });
  }

  /* ---- 近期重要聚合页 ---- */
  function renderRecent() {
    const content = $('#content');
    const all = [];
    ['t_birthday', 't_pray', 't_important'].forEach(id => {
      const m = MOD_MAP[id]; (M(id).items || []).forEach(it => {
        const dd = daysUntil(it.date, m.annual || it.annual);
        if (dd != null) all.push({ name: it.name, days: dd, icon: m.icon, type: m.name, note: it.note, date: it.date });
      });
    });
    all.sort((a, b) => a.days - b.days);
    const soon = all.filter(x => x.days >= 0).slice(0, 8);
    const past = all.filter(x => x.days < 0).slice(0, 5);
    const card = (x) => {
      const txt = x.days === 0 ? '🎉 就是今天' : x.days > 0 ? `还有 <b>${x.days}</b> 天` : `已过 <b>${Math.abs(x.days)}</b> 天`;
      return `<div class="upcoming-item"><span class="ui-ico">${x.icon}</span>
        <span class="ui-name">${esc(x.name)} <small style="color:var(--ink-soft)">· ${x.type} · ${fmtDate(x.date)}</small></span>
        <span class="ui-days">${txt}</span></div>`;
    };
    content.innerHTML = `
      <div class="upcoming" style="margin-top:8px">
        <h3>🔜 即将到来（${soon.length}）</h3>
        ${soon.length ? soon.map(card).join('') : '<div class="empty">暂无即将到来的日子</div>'}
      </div>
      <div class="upcoming" style="margin-top:20px">
        <h3>💭 刚刚过去（${past.length}）</h3>
        ${past.length ? past.map(card).join('') : '<div class="empty">暂无</div>'}
      </div>`;
  }

  /* ===================================================================
     手作专区（食品DIY / 手工DIY + 智能解析框）
     =================================================================== */
  let craftState = { cat: null };
  function getCraft() {
    if (!DB.craft) DB.craft = { food: { items: [] }, hand: { items: [] } };
    if (!DB.craft.food) DB.craft.food = { items: [] };
    if (!DB.craft.hand) DB.craft.hand = { items: [] };
    return DB.craft;
  }
  function catArr(cat) { const c = getCraft(); return cat === 'food' ? c.food : c.hand; }

  function renderCraftSection() {
    const content = $('#content');
    craftState.cat = null;
    content.innerHTML = `
      <div id="craftArea"></div>
      <div class="craft-parse">
        <div class="w-head">🤖 智能解析 · 笔记一键拆解</div>
        <p class="craft-tip">把笔记<b>正文</b>（或链接）粘贴到下面的框里，松开手就会<b>实时识别</b>出分类、材料与步骤；确认后点「粘贴并解析」即可一键填入对应分区。小红书请在 App 内「复制正文」再粘贴过来 🧁🧶</p>
        <textarea id="parseInput" class="note-area" placeholder="粘贴笔记正文到这里，例如：戚风蛋糕做法 + 材料清单 + 步骤…"></textarea>
        <div class="parse-live" id="parseLive" hidden></div>
        <div class="parse-msg" id="parseMsg"></div>
        <div class="parse-btns">
          <button class="btn" id="parseBtn">📋 粘贴并解析</button>
          <button class="btn ghost" id="parseClear">清空</button>
        </div>
      </div>`;
    paintCraftArea();
    $('#parseBtn').onclick = onParseClick;
    $('#parseClear').onclick = () => { const ta = $('#parseInput'); if (ta) ta.value = ''; setParseMsg(''); parseCatOverride = null; const lv = $('#parseLive'); if (lv) lv.hidden = true; };
    const pi = $('#parseInput');
    if (pi) {
      pi.addEventListener('input', () => {
        const v = pi.value.trim();
        if (/xiaohongshu|xhslink/i.test(v)) {
          setParseMsg('🔗 检测到小红书链接：小红书不允许程序自动读取笔记正文（平台限制）。请在小红书 App 打开该笔记 → 右上角「…」→「复制」（选复制<b>正文</b>，不是「复制链接」）→ 回到这里把正文粘贴进来 → 点「粘贴并解析」即可自动拆材料与步骤 ✨');
          const lv = $('#parseLive'); if (lv) lv.hidden = true;
        } else if (!v) {
          setParseMsg(''); parseCatOverride = null; const lv = $('#parseLive'); if (lv) lv.hidden = true;
        } else { setParseMsg(''); parseCatOverride = null; liveParse(); }
      });
      pi.addEventListener('paste', () => setTimeout(liveParse, 60));
    }
  }

  function setParseMsg(html) { const el = $('#parseMsg'); if (el) el.innerHTML = html; }

  function paintCraftArea() {
    const area = $('#craftArea'); if (!area) return;
    const c = getCraft();
    if (!craftState.cat) {
      area.innerHTML = `
        <div class="craft-cats">
          ${craftCatCard('food', '🧁', '食品DIY', '蛋糕 / 面包 / 甜点配方', c.food.items.length)}
          ${craftCatCard('hand', '🧶', '手工DIY', '黏土 / 编织 / 手工教程', c.hand.items.length)}
        </div>`;
      area.querySelectorAll('[data-cat]').forEach(el => el.onclick = () => setCraftCat(el.dataset.cat));
      return;
    }
    const cat = craftState.cat, isFood = cat === 'food', arr = catArr(cat).items;
    area.innerHTML = `
      <div class="craft-head">
        <button class="btn ghost sm" id="craftBack">← 返回</button>
        <div class="craft-head-title">${isFood ? '🧁 食品DIY' : '🧶 手工DIY'}</div>
        <button class="btn sm" id="craftAdd">＋ 新增${isFood ? '食品' : '手工'}名称</button>
      </div>
      <div class="list" id="craftList"></div>`;
    $('#craftBack').onclick = () => setCraftCat(null);
    $('#craftAdd').onclick = () => openCraftEditor(cat, null);
    const el = area.querySelector('#craftList');
    if (!arr.length) { el.innerHTML = `<div class="empty">还没有记录，点右上角「＋ 新增${isFood ? '食品' : '手工'}名称」开始吧～</div>`; return; }
    el.innerHTML = arr.slice().reverse().map(it => `
      <div class="row craft-row" data-id="${it.id}">
        <div class="row-main"><div class="row-title">${esc(it.name)}</div>
          <div class="row-sub">📦 材料 ${it.materials ? it.materials.length : 0} 项 ｜ 📝 步骤 ${it.steps ? it.steps.length : 0} 项${it.yield ? ' ｜ 🍽 ' + esc(it.yield) : ''}</div></div>
        <button class="row-edit" data-edit="${it.id}">✏️</button>
        <button class="row-del" data-del="${it.id}">🗑</button>
      </div>`).join('');
    el.querySelectorAll('.craft-row').forEach(r => r.onclick = e => {
      if (e.target.closest('.row-edit,.row-del')) return;
      const it = arr.find(x => x.id === r.dataset.id); openCraftEditor(cat, it);
    });
    el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      const a = catArr(cat); a.items = a.items.filter(x => x.id !== b.dataset.del); save(); paintCraftArea();
    });
    el.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
      const it = arr.find(x => x.id === b.dataset.edit); openCraftEditor(cat, it);
    });
  }
  function craftCatCard(cat, ico, name, desc, n) {
    return `<div class="craft-cat" data-cat="${cat}">
      <div class="cc-ico">${ico}</div>
      <div class="cc-body"><div class="cc-name">${name}</div><div class="cc-desc">${desc}</div></div>
      <div class="cc-count">${n} 个</div></div>`;
  }
  function setCraftCat(cat) { craftState.cat = cat; paintCraftArea(); }

  /* ---- 编辑器（新增 / 编辑 / 解析后编辑 共用） ---- */
  function setupCraftLists(initialMat, initialStep) {
    let mat = (initialMat || []).map(m => ({ name: m.name || '', amount: m.amount || '' }));
    let step = (initialStep || []).map(s => ({ text: typeof s === 'string' ? s : (s.text || s.name || '') }));
    const paintMat = () => {
      const box = $('#eMat'); if (!box) return;
      box.innerHTML = mat.map((m, i) => `<div class="kv-row"><input class="kv-k" data-i="${i}" data-f="name" placeholder="材料名" value="${esc(m.name)}"/><input class="kv-v" data-i="${i}" data-f="amount" placeholder="克重/数量" value="${esc(m.amount)}"/><button type="button" class="kv-del" data-i="${i}">✕</button></div>`).join('');
      box.querySelectorAll('input').forEach(el => el.oninput = () => { mat[+el.dataset.i][el.dataset.f] = el.value; });
      box.querySelectorAll('.kv-del').forEach(b => b.onclick = () => { mat = mat.filter((_, i) => i != +b.dataset.i); paintMat(); });
    };
    const paintStep = () => {
      const box = $('#eStep'); if (!box) return;
      box.innerHTML = step.map((s, i) => `<div class="kv-row"><input class="kv-k wide" data-i="${i}" data-f="text" placeholder="步骤 ${i + 1}" value="${esc(s.text)}"/><button type="button" class="kv-del" data-i="${i}">✕</button></div>`).join('');
      box.querySelectorAll('input').forEach(el => el.oninput = () => { step[+el.dataset.i].text = el.value; });
      box.querySelectorAll('.kv-del').forEach(b => b.onclick = () => { step = step.filter((_, i) => i != +b.dataset.i); paintStep(); });
    };
    paintMat(); paintStep();
    return {
      getMat: () => mat.filter(m => m.name || m.amount).map(m => ({ name: m.name.trim(), amount: m.amount.trim() })),
      getStep: () => step.map(s => s.text.trim()).filter(Boolean),
      addMat: () => { mat.push({ name: '', amount: '' }); paintMat(); },
      addStep: () => { step.push({ text: '' }); paintStep(); }
    };
  }

  function openCraftEditor(cat, item) {
    item = item || {};
    const isEdit = !!item.id;
    const L = setupCraftLists(item.materials, item.steps);
    let curCat = cat;
    showModal(`<h3>${isEdit ? '✏️ 编辑' : '＋ 新增'} · ${cat === 'food' ? '食品DIY' : '手工DIY'}</h3>
      <div class="field"><label>名称</label><input type="text" id="eName" value="${esc(item.name || '')}" placeholder="如：原味戚风蛋糕"/></div>
      <div class="field"><label>分类</label><div class="seg">
        <button type="button" class="seg-btn ${cat === 'food' ? 'on' : ''}" data-cat="food">🧁 食品DIY</button>
        <button type="button" class="seg-btn ${cat === 'hand' ? 'on' : ''}" data-cat="hand">🧶 手工DIY</button></div></div>
      <div class="field"><label>份量 / 产量（可选）</label><input type="text" id="eYield" value="${esc(item.yield || '')}" placeholder="如：可做12个 / 6寸 / 2人份"/></div>
      <div class="field"><label>所需材料 / 克重</label><div id="eMat"></div><button type="button" class="btn ghost sm" id="eMatAdd">＋ 添加材料</button></div>
      <div class="field"><label>制作步骤</label><div id="eStep"></div><button type="button" class="btn ghost sm" id="eStepAdd">＋ 添加步骤</button></div>
      <div class="modal-actions"><button class="btn ghost" id="eCancel">取消</button><button class="btn" id="eOk">${isEdit ? '保存' : '添加'}</button></div>`);
    $('#eMatAdd').onclick = L.addMat; $('#eStepAdd').onclick = L.addStep;
    document.querySelectorAll('.seg-btn').forEach(b => b.onclick = () => { curCat = b.dataset.cat; document.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('on', x.dataset.cat === curCat)); });
    $('#eCancel').onclick = closeModal;
    $('#eOk').onclick = () => {
      const name = $('#eName').value.trim() || '未命名';
      const c = getCraft(); const arr = curCat === 'food' ? c.food : c.hand;
      const data = { name, materials: L.getMat(), steps: L.getStep(), yield: $('#eYield').value.trim() };
      if (isEdit) { const it = arr.items.find(x => x.id === item.id); if (it) Object.assign(it, data); }
      else arr.items.unshift({ id: uid(), ...data });
      save(); closeModal(); craftState.cat = curCat; paintCraftArea();
    };
  }

  /* ---- 智能解析 ---- */
  async function onParseClick() {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch (e) { }
    if (!text || !text.trim()) text = $('#parseInput').value.trim();
    if (!text || !text.trim()) { setParseMsg('未能读取到内容，请先把笔记正文复制好，或手动粘贴到上方框里再点「粘贴并解析」～'); return; }
    $('#parseInput').value = text;
    if (isURL(text)) {
      setParseMsg('检测到链接，正在尝试抓取正文…');
      const fetched = await tryFetch(text);
      if (!fetched) {
        if (/xiaohongshu|xhslink/i.test(text)) {
          setParseMsg('⚠️ 小红书链接无法直接抓取（平台限制了浏览器/服务器读取笔记正文）。请把笔记<b>正文文字</b>复制下来：小红书 App 打开笔记 → 右上角「…」→「复制」（正文，不是复制链接）→ 粘贴到上方框 → 再点「粘贴并解析」✨');
        } else {
          setParseMsg('⚠️ 该链接无法直接抓取正文，请把网页/笔记的<b>正文文字</b>复制粘贴到上方框，再点「粘贴并解析」～');
        }
        return;
      }
      text = fetched; $('#parseInput').value = text;
    }
    const data = parseContent(text);
    if (parseCatOverride) data.cat = parseCatOverride;
    setParseMsg('');
    showParseResult(data);
  }
  function isURL(s) { return /^(https?:\/\/)/i.test(s.trim()) || /xhslink\.com/i.test(s); }
  async function tryFetch(url) {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { signal: ctrl.signal, mode: 'cors' });
      clearTimeout(t);
      if (!res.ok) return null;
      let txt = await res.text();
      if (/<html|<!doctype/i.test(txt)) txt = txt.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '\n');
      // 若仍是原始标签或内容过短（多为 JS 渲染页 / 登录墙），视作无法使用
      if (txt.includes('<') || txt.replace(/\s/g, '').length < 40) return null;
      return txt.slice(0, 20000);
    } catch (e) { return null; }
  }

  /* ---- 解析核心：分类 / 名字 / 材料 / 步骤 ---- */
  const RE_AMT = /(\d+(?:\.\d+)?)\s*(?:克|g|G|千克|kg|KG|公斤|毫升|ml|ML|个|颗|根|片|勺|茶匙|汤匙|把|份|%|滴|张|条|块|枚|瓣|粒|杯|包|袋|簇|撮|支|管|瓶|盒|听|只|尾)/;
  const RE_SOFT = /(适量|少许|一丢丢|若干|一些|一点|一点点|适量即可|半量|一倍|两倍|若干克|几滴|少量|大量|一勺|一撮|半勺)/;
  const RE_RATIO = /\d+(?:\.\d+)?\s*:\s*\d+(?:\.\d+)?/;
  const isAmt = s => RE_AMT.test(s) || RE_SOFT.test(s) || RE_RATIO.test(s);
  const STEP_VERB = /^[搅拌混合倒入烤放加切揉蒸煮炒炸煎焖炖熬打发筛过冷藏冷冻发酵称重涂抹装饰组装擀包裱花卷折穿串编缠贴粘剪涂画刷蒸烘焙]|^将|^把|^待|^然后|^接着|^最后|^先|^再|^取|^用/;
  const MAT_HEADER = /^(材料|食材|用料|配料|准备|清单|工具|需要|备料)/;
  const STEP_HEADER = /^(步骤|做法|制作|流程|过程|操作|方法|教程)/;

  function cleanName(s) {
    return s.replace(/[#@]/g, '')
      .replace(/[🍰🧁🎂🍪🥖🍞🥐🧇🍩🥧🥯🍮🍡🍧🥣🥄🧂✨💕❤️🔥🌟⭐✅📌👉👇💡🍃🌸💗🥰😋🎀🪡🧵✂️🖍️🎨🪀🧸🫧]/g, '')
      .replace(/(的做法|配方|教程|笔记|步骤|来啦|食谱|合集|大全)\s*$/, '')
      .replace(/[｜|·•\-—~].*$/, '')
      .replace(/^[的了这那该你它我他她们咱们]+/, '').trim();
  }
  function normTitle(ln) {
    return ln.replace(/^(?:超简单|零失败|私藏|新手|保姆级|治愈|周末|今日|今天|手作|自制|懒人|极简|必看|收藏|超好吃|巨好吃|绝绝子|建议|在家|教你|最近|超爱|爱了|入手|安利|分享|复刻|打卡|挑战|这一款|这款|一款|记录|测评|试试|跟我|终于|第一次|[！!。\s])+/, '')
      .replace(/[🍰🧁🎂🍪🥖🍞🥐🧇🍩🥧🥯🍮🍡🍧🥣🥄🧂✨💕❤️🔥🌟⭐✅📌👉👇💡🍃🌸💗🥰😋🎀🪡🧵✂️🖍️🎨🪀🧸🫧]/g, '').trim();
  }
  function detectName(lines, t) {
    let m = t.match(/[《【\["“]([^》\]】"”]{1,30})[》\]】"”]/);
    if (m && m[1].trim()) return cleanName(m[1].trim());
    const suf = /(.+?)(?:的做法|配方|教程|笔记|步骤|来啦)\s*$/;
    for (const ln of lines) { const mm = ln.match(suf); if (mm && mm[1].trim().length <= 20) return cleanName(mm[1].trim()); }
    const teach = /(?:教你做|手把手教|一起做|做一做|尝试做)(.+?)(?:[！!。\n]|$)/;
    for (const ln of lines) { const mm = ln.match(teach); if (mm && mm[1].trim().length <= 20) return cleanName(mm[1].trim()); }
    const kw = ['蛋糕', '面包', '饼干', '甜品', '甜点', '慕斯', '戚风', '可颂', '布丁', '蛋挞', '雪媚娘', '马卡龙', '披萨', '馒头', '包子', '汤圆', '吐司', '泡芙', '芝士', '曲奇', '黏土', '折纸', '编织', '钩针', '刺绣', '串珠', '滴胶', '羊毛毡', '衍纸', '油画', '史莱姆', '流体熊', '扭棒'];
    for (const ln of lines) { const n = normTitle(ln); if (n.length >= 2 && n.length <= 18 && !/[。！？!?；;：:]/.test(n) && /^[一-龥]/.test(n) && kw.some(k => n.includes(k))) return cleanName(n); }
    let first = ''; for (const ln of lines) { if (!MAT_HEADER.test(ln) && !STEP_HEADER.test(ln)) { first = normTitle(ln); break; } }
    first = first.split(/[｜|·•\-—~]/)[0].trim();
    if (first.length > 20) first = first.slice(0, 20);
    return cleanName(first) || '未命名作品';
  }
  function splitMat(line) {
    const frags = line.split(/[，,、；;]/).map(s => s.trim()).filter(Boolean);
    const out = [];
    for (let fr of frags) {
      fr = fr.replace(/^[\s\-\*•·▪️◾◽●○◆★✓✔️⭐🔸🔹➤►]+/, '').replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '');
      fr = fr.replace(/^\s*(?:\d+|[一二三四五六七八九十百零]+)[.、)）:：]\s*/, ''); // 去掉材料前的序号 1. 2、
      fr = fr.replace(/[（(][^）)]*?[）)]/g, mm => isAmt(mm) ? '' : mm); // 去掉括号内的用量
      if (!fr) continue;
      const r = fr.match(RE_RATIO), a = fr.match(RE_AMT), s = fr.match(RE_SOFT);
      let amount = r ? r[0] : (a ? a[0] : (s ? s[0] : ''));
      let name = fr.replace(RE_RATIO, '').replace(RE_AMT, '').replace(RE_SOFT, '').replace(/[：:]/g, '').trim();
      name = name.replace(/^(倒入|加入|放入|加|放|取|准备|用|把|将|适量|少许|一些)/, '')
        .replace(/[（）()]/g, '').replace(/[的]+$/, '').replace(/[🍰🧁🎂✨💕]/g, '').trim();
      // 去掉名字里孤立的“约/大概/大约/差不多”（开头或结尾），并入用量前缀
      const pre = name.match(/^(约|大概|大约|差不多|约莫)\s*/) || name.match(/\s*(约|大概|大约|差不多|约莫)$/);
      if (pre) { name = name.replace(pre[0], '').trim(); if (amount && !/^(约|大概|大约|差不多)/.test(amount)) amount = pre[0].replace(/\s/g, '') + amount; }
      if (!name) name = fr.replace(RE_RATIO, '').replace(RE_AMT, '').replace(RE_SOFT, '').trim() || fr;
      if (name) out.push({ name, amount });
    }
    return out;
  }
  function isStepLine(l) {
    if (/^\s*\(?(?:\d+|[一二三四五六七八九十百零]+)\)?[.、)）:：]/.test(l)) return true;
    if (/第[一二三四五六七八九十百零\d]+步/.test(l)) return true;
    if (STEP_VERB.test(l) && l.length >= 6) return true;
    return false;
  }
  function parseContent(text) {
    const norm = s => s.replace(/\s*#\S+/g, ' ')
      .replace(/[🍰🧁🎂🍪🥖🍞🥐🧇🍩🥧🥯🍮🍡🍧🥣🥄🧂✨💕❤️🔥🌟⭐✅📌👉👇💡🍃🌸💗🥰😋🎀🪡🧵✂️🖍️🎨🪀🧸🫧]/g, ' ')
      .replace(/[ \t]+/g, ' ').trim();
    const t = norm(text);
    const lines = t.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const foodKw = { '蛋糕': 2, '面包': 2, '饼干': 2, '甜点': 2, '甜品': 2, '烘焙': 3, '食谱': 2, '配方': 2, '面团': 3, '奶油': 3, '糖粉': 2, '低筋': 3, '高筋': 3, '鸡蛋': 2, '牛奶': 2, '烤箱': 3, '打发': 3, '裱花': 2, '慕斯': 2, '芝士': 2, '戚风': 3, '可颂': 2, '布丁': 2, '蛋挞': 2, '面粉': 3, '黄油': 3, '砂糖': 2, '糖': 1, '酵母': 2, '泡打粉': 2, '巧克力': 2, '草莓': 1, '芒果': 1, '抹茶': 1, '吐司': 2, '披萨': 2, '馒头': 2, '包子': 2, '汤圆': 2, '雪媚娘': 2, '马卡龙': 2, '曲奇': 2, '椰蓉': 1, '芋泥': 1, '红豆': 1, '淡奶油': 3, '舒芙蕾': 2, '可丽露': 2, '贝果': 2, '麻薯': 2, '铜锣烧': 2, '班戟': 2, '千层': 2, '蛋黄酥': 2, '凤梨酥': 2, '司康': 2, '华夫': 2, '可丽饼': 2, '可可': 1, '咖啡': 1, '香草': 1, '柠檬': 1, '蓝莓': 1, '树莓': 1, '奶酪': 2, '炼乳': 1, '焦糖': 1, '杏仁': 1, '核桃': 1, '燕麦': 1, '糯米': 1, '绿豆': 1, '桂花': 1, '柚子': 1, '栗子': 1, '紫薯': 1, '南瓜': 1, '苹果': 1, '香蕉': 1, '酸奶': 1, '荔枝': 1, '龙眼': 1 };
    const handKw = { '黏土': 3, '超轻黏土': 3, '折纸': 3, '编织': 3, '钩针': 3, '刺绣': 3, '手工': 2, '拼豆': 3, '滴胶': 3, '串珠': 3, '木工': 3, 'diy': 2, '羊毛毡': 3, '不织布': 3, '衍纸': 3, '史莱姆': 2, '流体熊': 3, '数字油画': 3, '扭棒': 3, '热熔胶': 2, '胶水': 1, '剪刀': 1, '毛线': 3, '棉绳': 2, '麻绳': 2, '丝带': 2, '珠': 2, '纸板': 1, '铁丝': 2, '丙烯': 2, '颜料': 1, '画布': 2, '缠绕': 2, '粘贴': 1, '缝': 1, '折': 1, '穿': 1, '串': 1, '编': 2, '戳戳绣': 3, '戳毛球': 3, '钩织': 3, '热缩片': 3, '软陶': 3, '纸艺': 3, '拼贴': 2, '立体书': 2, '羊毛': 2, '毡': 2, '戳绣': 3, '拼布': 3, '布艺': 3, '丝网花': 3, '永生花': 2, '干花': 2, '押花': 2, '微景观': 3, '苔藓': 2, '香薰': 2, '蜡烛': 2, '手工皂': 3, '皮具': 3, '中国结': 3, '绳编': 3, '钩花': 3, '棒针': 3, '蕾丝': 2, '轻黏土': 3, '木雕': 2, '篆刻': 2, '拓印': 2, '版画': 2, '沙画': 2, '流体画': 3, '石英砂': 2, '肌理画': 3 };
    let f = 0, h = 0; const low = t.toLowerCase();
    for (const k in foodKw) if (low.includes(k.toLowerCase())) f += foodKw[k];
    for (const k in handKw) if (low.includes(k.toLowerCase())) h += handKw[k];
    const cat = f === h ? 'food' : (f > h ? 'food' : 'hand');

    // 份量 / 产量识别：可做12个、6寸、2人份 等
    let yieldText = '';
    const ym = t.match(/(?:可做|约做|成品|产量|份量|分量|做出|做出来)\D{0,6}?(\d+|[一二三四五六七八九十]+)\s*(个|块|片|条|只|枚|根|人份|寸|英寸|厘米|cm|公分|杯)?/)
            || t.match(/(\d+|[一二三四五六七八九十]+)\s*(人份|寸|英寸|厘米|cm|公分)/);
    if (ym) {
      let num = ym[1];
      const cn = { '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
      if (cn[num] !== undefined) num = cn[num];
      yieldText = num + (ym[2] || '');
    }

    const name = detectName(lines, t);
    let mode = 'auto';
    let titleChecked = false;
    const materials = [], steps = [], seen = new Set();

    const cleanLine = l => l.replace(/^[\s\-\*•·▪️◾◽●○◆★✓✔️⭐🔸🔹➤►]+/, '').replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '');
    const pushMat = l => splitMat(l).forEach(x => { if (!x.name || seen.has(x.name)) return; seen.add(x.name); materials.push(x); });
    const pushStep = s => {
      if (!s || steps.includes(s)) return;
      // 拆分同一行内的多条编号步骤：1.x 2.y 3.z（编号后可有/无空格）
      const parts = s.split(/\s*\d+[.、)）]\s*/).map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) parts.forEach(p => { if (p && !steps.includes(p)) steps.push(p); });
      else steps.push(s);
    };
    const isYieldLine = l => /\d/.test(l) && /(可做|约做|成品|产量|份量|分量|做出来|厘米|寸|人份)/.test(l);
    const processLine = (rawLine) => {
      let l = cleanLine(rawLine);
      if (!l) return;
      if (isYieldLine(l)) return; // 产量/份量说明句，不计入步骤
      if (!titleChecked) {
        titleChecked = true;
        if (!isAmt(l) && name && normTitle(l).includes(name)) return; // 首行即标题，跳过
      }
      const hasAmt = isAmt(l);
      let isMat = false, isStep = false;
      if (mode === 'mat') isMat = true;
      else if (mode === 'step') isStep = true;
      else if (hasAmt) isMat = true;
      else if (isStepLine(l)) isStep = true;
      else if (l.length <= 14 && /[一-龥]/.test(l) && !/[。！？!?；;：:]/.test(l)) isMat = true;
      if (isMat) pushMat(l);
      else if (isStep) {
        const s = l.replace(/^\s*\(?(?:\d+|[一二三四五六七八九十百零]+)\)?[.、)）:：]\s*/, '')
          .replace(/第[一二三四五六七八九十百零\d]+步[：:]?/, '')
          .replace(/^(步骤|做法|制作|流程|过程)[：:]?/, '')
          .replace(/^(然后|接着|最后|先|再|随后|之后)[，,：:]/, '').trim();
        pushStep(s);
      }
    };

    const stripHead = (s, re) => { let r = s; while (re.test(r)) r = r.replace(re, ''); return r.trim(); };
    const MAT_RE = /^(?:材料|食材|用料|配料|准备|清单|工具|需要|备料)[:：]?\s*/;
    const STEP_RE = /^(?:步骤|做法|制作|流程|过程|操作|方法|教程)[:：]?\s*/;
    for (const raw of lines) {
      if (MAT_HEADER.test(raw)) { mode = 'mat'; const rest = stripHead(raw, MAT_RE); if (rest) processLine(rest); continue; }
      if (STEP_HEADER.test(raw)) { mode = 'step'; const rest = stripHead(raw, STEP_RE); if (rest) processLine(rest); continue; }
      processLine(raw);
    }
    return { name, cat, materials, steps, yield: yieldText, fScore: f, hScore: h };
  }

  /* 实时预览：粘贴即解析，下方即时显示识别结果 */
  let liveTimer = null;
  let parseCatOverride = null;
  function liveParse() {
    const pi = $('#parseInput'); if (!pi) return;
    const v = pi.value.trim();
    const live = $('#parseLive');
    if (!live) return;
    if (!v || isURL(v) || /xiaohongshu|xhslink/i.test(v) || v.replace(/\s/g, '').length < 12) { live.hidden = true; return; }
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      const d = parseContent(v);
      const effCat = parseCatOverride || d.cat;
      const catName = effCat === 'food' ? '🧁 食品DIY' : '🧶 手工DIY';
      const matL = d.materials.length
        ? d.materials.slice(0, 6).map(x => `<li>${esc(x.name)}${x.amount ? ' · <b>' + esc(x.amount) + '</b>' : ''}</li>`).join('')
        : '<li class="empty">未识别到材料</li>';
      const stepL = d.steps.length
        ? d.steps.slice(0, 3).map(s => '<li>' + esc(s) + '</li>').join('')
        : '<li class="empty">未识别到步骤</li>';
      const yieldHtml = d.yield ? `<div class="pl-yield">🍽 份量：${esc(d.yield)}</div>` : '';
      live.innerHTML = `<div class="pl-card">
        <div class="pl-top"><button type="button" class="pl-cat" id="plCatToggle" title="点此切换分类">${catName} ⇄</button><span class="pl-name">${esc(d.name)}</span></div>
        ${yieldHtml}
        <div class="pl-stats"><span>📦 材料 ${d.materials.length} 项</span><span>📝 步骤 ${d.steps.length} 项</span></div>
        <ul class="pl-mat">${matL}</ul>
        <div class="pl-steps"><div class="pl-k">步骤预览</div><ol class="pl-step-list">${stepL}</ol></div>
        <div class="pl-hint">确认无误点「粘贴并解析」→ 选 添加 / 编辑 填入对应分区</div>
      </div>`;
      live.hidden = false;
      const tog = $('#plCatToggle'); if (tog) tog.onclick = () => { parseCatOverride = (effCat === 'food') ? 'hand' : 'food'; liveParse(); };
    }, 350);
  }

  function showParseResult(data) {
    const catName = data.cat === 'food' ? '食品DIY' : '手工DIY';
    const matHtml = data.materials.length
      ? data.materials.map(x => `<li>${esc(x.name)}${x.amount ? ' · <b>' + esc(x.amount) + '</b>' : ''}</li>`).join('')
      : '<li class="empty">未识别出材料，可点「编辑」补充</li>';
    const stepHtml = data.steps.length
      ? data.steps.map(s => '<li>' + esc(s) + '</li>').join('')
      : '<li class="empty">未识别出步骤，可点「编辑」补充</li>';
    const yieldHtml = data.yield ? `<div class="pr-row"><span class="pr-k">份量 / 产量</span><b class="pr-v">${esc(data.yield)}</b></div>` : '';
    showModal(`<h3>🤖 识别结果 · ${catName}</h3>
      <div class="parse-result">
        <div class="pr-row"><span class="pr-k">内容名字</span><b class="pr-v">${esc(data.name)}</b></div>
        <div class="pr-row"><span class="pr-k">识别分类</span><b class="pr-v">${catName}</b></div>
        ${yieldHtml}
        <div class="pr-row"><span class="pr-k">已识别</span><span class="pr-v" style="font-size:13px;font-weight:600">📦 材料 ${data.materials.length} 项 ｜ 📝 步骤 ${data.steps.length} 项</span></div>
        <div class="pr-block"><div class="pr-k">所需材料 / 克重</div><ul class="pr-list">${matHtml}</ul></div>
        <div class="pr-block"><div class="pr-k">制作步骤</div><ol class="pr-list">${stepHtml}</ol></div>
      </div>
      <div class="tri-actions">
        <button class="btn ghost" id="pCancel">取消</button>
        <button class="btn" id="pAdd">添加</button>
        <button class="btn outline" id="pEdit">编辑</button>
      </div>`);
    $('#pCancel').onclick = closeModal;
    $('#pAdd').onclick = () => {
      const c = getCraft(); const arr = data.cat === 'food' ? c.food : c.hand;
      arr.items.unshift({ id: uid(), name: data.name || '未命名', materials: data.materials || [], steps: data.steps || [], yield: data.yield || '' });
      save(); closeModal(); craftState.cat = data.cat; paintCraftArea();
      alert('已添加到' + catName + '：' + (data.name || '未命名') + ' ✅');
    };
    $('#pEdit').onclick = () => openCraftEditor(data.cat, { name: data.name, materials: data.materials, steps: data.steps, yield: data.yield || '' });
  }

  /* ===================================================================
     弹窗
     =================================================================== */
  function showModal(html) {
    $('#modal').innerHTML = html; $('#modalMask').hidden = false;
  }
  function closeModal() { $('#modalMask').hidden = true; $('#modal').innerHTML = ''; }
  $('#modalMask').onclick = e => { if (e.target.id === 'modalMask') closeModal(); };

  /* ===================================================================
     顶部操作：今日重置 / 备份 / 恢复
     =================================================================== */
  $('#resetTodayBtn').onclick = () => {
    if (!confirm('确认清空今日打卡与今日新增记录？（累积数据不受影响）')) return;
    const t = todayStr();
    // 重置所有每日打卡清单
    SECTIONS.forEach(s => (s.modules || []).forEach(m => {
      if (m.type === 'checklist') { const d = M(m.id); d.date = t; d.checks = {}; }
    }));
    // 删除「今日」新增的列表项
    SECTIONS.forEach(s => (s.modules || []).forEach(m => {
      if ((m.type === 'list' || m.type === 'dates') && DB.modules[m.id]?.items) {
        DB.modules[m.id].items = DB.modules[m.id].items.filter(it => it.date !== t);
      }
    }));
    // 删除今日体重
    if (DB.modules['h_weight']?.records) DB.modules['h_weight'].records = DB.modules['h_weight'].records.filter(r => r.date !== t);
    // 清空今日心情 / 喝水
    DB.mood = { date: t, emoji: '' }; DB.water = { date: t, count: 0 };
    save();
    if (current === 'home') renderHome(); else if (current === 'recent') renderRecent(); else renderSection(SECTIONS.find(x => x.id === current));
    alert('今日已重置 ✅');
  };

  $('#exportBtn').onclick = () => {
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `我的工作台备份_${todayStr()}.json`; a.click();
  };
  $('#importBtn').onclick = () => $('#importFile').click();
  $('#importFile').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { const data = JSON.parse(r.result); if (confirm('恢复将覆盖当前数据，确定？')) { DB = data; save(); location.reload(); } }
      catch (err) { alert('文件格式错误'); }
    };
    r.readAsText(f);
  };

  $('#brandBtn').onclick = () => { openSection('home'); closeDrawer(); };
  $('#menuBtn').onclick = () => $('#sidebar').classList.toggle('open');
  $('#sidebarMask').onclick = closeDrawer;
  // 窗口变大时清除抽屉状态
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeDrawer(); });

  /* ===================================================================
     启动
     =================================================================== */
  (function init() {
    // 日期变更时自动重置每日打卡
    const t = todayStr();
    if (DB.lastDate && DB.lastDate !== t) {
      SECTIONS.forEach(s => (s.modules || []).forEach(m => {
        if (m.type === 'checklist') { const d = M(m.id); d.date = t; d.checks = {}; }
      }));
      save();
    }
    DB.lastDate = t; save();
    renderNav();
    openSection('home');
    registerSW();
  })();

  /* ---- 注册 Service Worker（仅 http/https 下生效，用于「添加到主屏幕」与离线） ---- */
  function registerSW() {
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => { /* 忽略：file:// 下不支持 */ });
      });
    }
  }
})();
