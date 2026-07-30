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
        <div class="w-head">🤖 智能解析 · 小红书笔记拆解</div>
        <p class="craft-tip">复制小红书笔记的<b>正文</b>（或链接），点「粘贴并解析」会自动读取剪贴板，帮你梳理「材料 / 克重」与「步骤」，并判断属于 🧁食品 还是 🧶手工。</p>
        <textarea id="parseInput" class="note-area" style="min-height:90px" placeholder="这里会自动填入剪贴板内容，也可手动粘贴笔记正文…"></textarea>
        <div class="parse-msg" id="parseMsg"></div>
        <button class="btn" id="parseBtn">📋 粘贴并解析</button>
      </div>`;
    paintCraftArea();
    $('#parseBtn').onclick = onParseClick;
    const pi = $('#parseInput');
    if (pi) pi.addEventListener('input', () => {
      const v = pi.value.trim();
      if (/xiaohongshu|xhslink/i.test(v)) {
        setParseMsg('🔗 检测到小红书链接：小红书不允许程序自动读取笔记正文（平台限制）。请在小红书 App 打开该笔记 → 右上角「…」→「复制」（选复制<b>正文</b>，不是「复制链接」）→ 回到这里把正文粘贴进来 → 点「粘贴并解析」即可自动拆材料与步骤 ✨');
      } else if (!v) {
        setParseMsg('');
      }
    });
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
          <div class="row-sub">📦 材料 ${it.materials ? it.materials.length : 0} 项 ｜ 📝 步骤 ${it.steps ? it.steps.length : 0} 项</div></div>
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
      <div class="field"><label>所需材料 / 克重</label><div id="eMat"></div><button type="button" class="btn ghost sm" id="eMatAdd">＋ 添加材料</button></div>
      <div class="field"><label>制作步骤</label><div id="eStep"></div><button type="button" class="btn ghost sm" id="eStepAdd">＋ 添加步骤</button></div>
      <div class="modal-actions"><button class="btn ghost" id="eCancel">取消</button><button class="btn" id="eOk">${isEdit ? '保存' : '添加'}</button></div>`);
    $('#eMatAdd').onclick = L.addMat; $('#eStepAdd').onclick = L.addStep;
    document.querySelectorAll('.seg-btn').forEach(b => b.onclick = () => { curCat = b.dataset.cat; document.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('on', x.dataset.cat === curCat)); });
    $('#eCancel').onclick = closeModal;
    $('#eOk').onclick = () => {
      const name = $('#eName').value.trim() || '未命名';
      const c = getCraft(); const arr = curCat === 'food' ? c.food : c.hand;
      const data = { name, materials: L.getMat(), steps: L.getStep() };
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
    setParseMsg('✅ 识别完成，请确认 / 编辑下方内容：');
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

  function parseContent(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const foodKw = ['蛋糕', '面包', '饼干', '甜点', '甜品', '烘焙', '食谱', '配方', '面团', '奶油', '糖粉', '低筋', '高筋', '鸡蛋', '牛奶', '烤箱', '打发', '裱花', '慕斯', '芝士', '戚风', '可颂', '布丁', '蛋挞'];
    const handKw = ['黏土', '超轻黏土', '折纸', '编织', '钩针', '刺绣', '手工', '拼豆', '滴胶', '串珠', '木工', 'diy', 'DIY', '羊毛毡', '不织布', '衍纸', '史莱姆', '流体熊', '数字油画', '扭棒'];
    let f = 0, h = 0;
    foodKw.forEach(k => { if (text.includes(k)) f++; });
    handKw.forEach(k => { if (text.toLowerCase().includes(k.toLowerCase())) h++; });
    const cat = f >= h ? 'food' : 'hand';

    let name = '';
    if (lines[0]) {
      let l = lines[0].replace(/^[^\w一-龥]+/, '').replace(/[🍰🧁🎂🍪🥖🍞🥐🧇🍩🥧]/g, '').trim();
      l = l.split(/[｜|·•]/)[0].trim();
      if (l.length > 30) l = l.slice(0, 30);
      name = l || '未命名作品';
    }

    const amtRe = /(\d+(?:\.\d+)?)\s*(?:克|g|G|千克|kg|KG|公斤|毫升|ml|ML|个|颗|根|片|勺|茶匙|汤匙|把|份|%|滴|张|条|块|枚|瓣|粒|杯|包|袋|簇|撮)|适量|少许|一丢丢|若干/;
    const ratioRe = /\d+\s*:\s*\d+/;
    const actionRe = /[搅拌混合倒入烤放加切揉蒸煮炒打发筛过冷藏冷冻发酵称重涂抹装饰组装擀包裱花]/;
    const materials = [], stepLines = [];
    lines.forEach((raw, idx) => {
      if (idx === 0) return;
      let l = raw.replace(/^[\s\-\*•·▪️◾◽●○◆★✓✔️⭐🔸🔹➤►]+/, '');
      l = l.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '');
      if (amtRe.test(l) || ratioRe.test(l)) {
        const r = l.match(ratioRe); const m = l.match(amtRe);
        const amount = r ? r[0] : (m ? m[0] : '适量');
        let mn = l.replace(ratioRe, '').replace(amtRe, '').replace(/[：:]/g, '').trim();
        mn = (mn.split(/[｜|·•]/)[0] || l).trim();
        if (!mn) mn = l;
        materials.push({ name: mn, amount });
      } else if (/^\s*\(?(\d+|[一二三四五六七八九十]+)\)?[\.、:：]/.test(l) || /步骤|第.?步|做法|制作|流程/.test(l)) {
        stepLines.push(l);
      } else if (actionRe.test(l) && l.length > 3) {
        stepLines.push(l);
      }
    });
    const steps = [...new Set(stepLines)];
    return { name, cat, materials, steps };
  }

  function showParseResult(data) {
    const catName = data.cat === 'food' ? '食品DIY' : '手工DIY';
    const matHtml = data.materials.length
      ? data.materials.map(x => `<li>${esc(x.name)}${x.amount ? ' · <b>' + esc(x.amount) + '</b>' : ''}</li>`).join('')
      : '<li class="empty">未识别出材料，可点「编辑」补充</li>';
    const stepHtml = data.steps.length
      ? data.steps.map(s => '<li>' + esc(s) + '</li>').join('')
      : '<li class="empty">未识别出步骤，可点「编辑」补充</li>';
    showModal(`<h3>🤖 识别结果确认</h3>
      <div class="parse-result">
        <div class="pr-row"><span class="pr-k">内容名字</span><b class="pr-v">${esc(data.name)}</b></div>
        <div class="pr-row"><span class="pr-k">识别分类</span><b class="pr-v">${catName}</b></div>
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
      arr.items.unshift({ id: uid(), name: data.name || '未命名', materials: data.materials || [], steps: data.steps || [] });
      save(); closeModal(); craftState.cat = data.cat; paintCraftArea();
      alert('已添加到' + catName + '：' + (data.name || '未命名') + ' ✅');
    };
    $('#pEdit').onclick = () => openCraftEditor(data.cat, { name: data.name, materials: data.materials, steps: data.steps });
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
