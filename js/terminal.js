// Interactive terminal for the hero.
//
// Security note: everything the visitor types is rendered with
// document.createTextNode / textContent — never innerHTML — so arbitrary
// input (including markup) is displayed inert. The only anchor elements
// created use hardcoded hrefs from the LINKS table below.

const LINKS = {
  github: 'https://github.com/Panagiotis1226',
  linkedin: 'https://www.linkedin.com/in/panagiotis-nicolacacos',
  email: 'PeterNicolacacos@gmail.com',
};

const PROJECTS = [
  {
    sys: 'media',
    name: 'Media Server',
    stack: 'immich · nextcloud · linux',
    desc: 'Fully on-premise photo and file platform that replaced the household’s paid iCloud storage. Backups, updates, and uptime included.',
    arch: '[phones · laptops] → [reverse proxy] → [immich · nextcloud] → [storage]',
  },
  {
    sys: 'web',
    name: 'Web Services',
    stack: 'apache · docker compose · load balancing',
    desc: 'Horizontally scalable Apache services on Docker Compose — load-balanced and port-forwarded through the network edge.',
    arch: '[clients] → [edge router] → [load balancer] → [apache ×n]',
  },
  {
    sys: 'game',
    name: 'Game Server Deployment',
    stack: 'minecraft · web server · json config',
    desc: 'Interconnected Minecraft servers behind a public-facing website — provisioning, networking, and world data managed as JSON config.',
    arch: '[players] → [proxy] → [mc-server ×n] ↔ [web]',
  },
  {
    sys: 'sec',
    name: 'Network Security',
    stack: 'wazuh siem · port scanning · hardening',
    desc: 'Wazuh SIEM agents on every endpoint feeding a central dashboard; unnecessary open ports scanned and closed.',
    arch: '[endpoints ×n] → [wazuh agents] → [siem manager] → [alerts]',
  },
];

// Automation work at Polysleep — mirrors the "work" section of the page.
const WORK = [
  ['reporting', 'the morning briefing — daily sales, order & CX metrics'],
  ['risk', 'order-risk screening across every order in a date range'],
  ['fulfillment', 'same-recipient shipment consolidation'],
  ['inventory', 'stock answers straight from the data warehouse'],
  ['voice', 'review replies in the brand voice, en / fr'],
  ['forecasting', 'a faster 300-plus-pivot planning workbook'],
];

const SKILLS = [
  ['automation', 'Prompt engineering · Claude skills · SOP writing · Ollama · APIs · BigQuery · Excel'],
  ['systems', 'Shopify · Cin7 · ShipStation · Gorgias · Asana · Microsoft 365'],
  ['infra & sec', 'Linux · Docker · Nginx · Proxmox · Wazuh SIEM · VPN · AWS · GCP · VMware'],
  ['scripting', 'Python · JavaScript · Bash · Git · C# · Java · PHP · Swift · HTML/CSS'],
];

const EXPERIENCE = [
  ['dec 2025 →', 'Business Systems & Operations Analyst · E-commerce & AI — Polysleep'],
  ['2025 →', 'Bachelor’s degree — ESG UQAM (in progress)'],
  ['may 2025 →', 'Content Creator — self-employed'],
  ['2025', 'Programming Intern · Full-Stack — Jaqln.ai'],
  ['2024', 'Software QA Analyst — PlaytestCloud'],
  ['summer 2024', 'Operations Manager — CSRDP Soccer Camp'],
  ['2023 – 2025', 'DEC Computer Science: Programming — LaSalle College'],
];

const CERTS = [
  ['google', 'Cybersecurity courses — Foundations · Security Risks · Network Security'],
  ['aws educate', 'Compute · Networking · Cloud 101'],
  ['codecademy', 'JavaScript · Node.js · Command Line · iOS · Ethical Hacking · Cybersecurity'],
];

const WHOAMI = [
  { text: 'Panagiotis “Peter” Nicolacacos', cls: 't-bright' },
  'CS grad (DEC, LaSalle College) in Montréal. Business systems',
  '& AI automation at Polysleep by day. I automate the',
  'busywork and run the servers underneath — linux, docker,',
  'and a homelab that never stops breaking in educational ways.',
];

const NOW = [
  ['working', 'business systems & AI automation @ Polysleep'],
  ['operating', 'a homelab with four live systems'],
  ['studying', 'bachelor’s, ESG UQAM'],
  ['next', 'a systems, automation, or IT role'],
];

const NEOFETCH_ART = [
  '  ████████▄   ',
  '  ██     ██   ',
  '  ████████▀   ',
  '  ██      ▄██ ',
  '  ██      ▀▀  ',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function initTerminal(root, chipsEl, {
  reduceMotion = false,
  getTheme = () => 'dark',
  setTheme = (t) => t,
  traceSystem = () => {},
} = {}) {
  if (!root) return;

  const out = root.querySelector('.terminal-out');
  const body = root.querySelector('.terminal-body');
  const input = root.querySelector('.terminal-input');
  const promptText = 'peter@folio:~$';

  const history = [];
  let historyIndex = -1;
  let busy = false;
  let booted = false;

  /* ---------- rendering (textContent only) ---------- */

  function line(content, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    if (typeof content === 'string') {
      div.textContent = content;
    } else if (Array.isArray(content)) {
      for (const seg of content) {
        const span = document.createElement('span');
        if (seg.cls) span.className = seg.cls;
        span.textContent = seg.text;
        div.append(span);
      }
    } else if (content && content.href) {
      const a = document.createElement('a');
      a.href = content.href;
      a.textContent = content.text;
      if (/^https?:/.test(content.href)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      if (content.prefix) div.append(document.createTextNode(content.prefix));
      div.append(a);
    }
    // Preserve blank lines in the pre-wrap container.
    if (!div.textContent) div.append(document.createTextNode(' '));
    out.append(div);
    return div;
  }

  function print(lines) {
    for (const l of lines) {
      if (typeof l === 'string' || Array.isArray(l)) line(l);
      else if (l.segments) line(l.segments);
      else line(l.href ? l : l.text, l.cls);
    }
    body.scrollTop = body.scrollHeight;
  }

  function echoCommand(cmd) {
    const div = document.createElement('div');
    const p = document.createElement('span');
    p.className = 't-accent';
    p.textContent = promptText + ' ';
    div.append(p, document.createTextNode(cmd));
    out.append(div);
    body.scrollTop = body.scrollHeight;
  }

  async function typeLine(text, cls) {
    const div = line('', cls);
    div.textContent = '';
    for (const ch of text) {
      div.textContent += ch;
      body.scrollTop = body.scrollHeight;
      await sleep(18);
    }
  }

  /* ---------- commands ---------- */

  const commands = {
    help: {
      desc: 'list available commands',
      run() {
        const names = Object.keys(commands).filter((c) => !commands[c].hidden);
        const pad = Math.max(...names.map((n) => n.length)) + 3;
        return [
          { text: 'available commands:', cls: 't-dim' },
          ...names.map((n) => `  ${n.padEnd(pad)}${commands[n].desc}`),
          { text: 'tab completes · ↑↓ history · ctrl+l clears', cls: 't-dim' },
        ];
      },
    },
    whoami: {
      desc: 'who is this guy',
      run: () => WHOAMI,
    },
    now: {
      desc: 'what’s running right now',
      run: () => NOW.map(([k, v]) => [
        { text: `  ${k.padEnd(12)}`, cls: 't-dim' },
        { text: v, cls: 't-bright' },
      ]),
    },
    work: {
      desc: 'automation I build at Polysleep',
      run: () => [
        { text: 'automation that removes work:', cls: 't-dim' },
        ...WORK.map(([k, v]) => [
          { text: `  ${k.padEnd(13)}`, cls: 't-accent' },
          { text: v },
        ]),
        { text: 'every one ships with an SOP.', cls: 't-dim' },
      ],
    },
    projects: {
      desc: 'list projects — `projects 3` for detail',
      run(args) {
        const n = parseInt(args[0], 10);
        if (n >= 1 && n <= PROJECTS.length) {
          const p = PROJECTS[n - 1];
          // Light up the same system in the topology diagram for a moment.
          traceSystem(p.sys);
          setTimeout(() => traceSystem(null), 4000);
          return [
            { text: `${String(n).padStart(2, '0')} · ${p.name}`, cls: 't-bright' },
            { text: `   stack: ${p.stack}`, cls: 't-dim' },
            `   ${p.desc}`,
            { text: `   ${p.arch}`, cls: 't-accent' },
          ];
        }
        if (args[0]) return [{ text: `projects: no project #${args[0]} — try 1–${PROJECTS.length}`, cls: 't-err' }];
        return [
          ...PROJECTS.map((p, i) => `  ${String(i + 1).padStart(2, '0')}  ${p.name}`),
          { text: 'run `projects <n>` for details', cls: 't-dim' },
        ];
      },
    },
    skills: {
      desc: 'print skills.conf',
      run: () => SKILLS.map(([k, v]) => `  ${k.padEnd(14)}${v}`),
    },
    experience: {
      desc: 'work & education history',
      run: () => EXPERIENCE.map(([k, v]) => [
        { text: `  ${k.padEnd(14)}`, cls: 't-dim' },
        { text: v },
      ]),
    },
    certs: {
      desc: 'certifications',
      run: () => CERTS.map(([k, v]) => [
        { text: `  ${k.padEnd(14)}`, cls: 't-dim' },
        { text: v },
      ]),
    },
    theme: {
      desc: 'theme dark | light — repaint the page',
      run(args) {
        const want = (args[0] || '').toLowerCase();
        if (!want) {
          return [`theme: ${getTheme()}`, { text: 'usage: theme dark | light | toggle', cls: 't-dim' }];
        }
        if (!['dark', 'light', 'toggle'].includes(want)) {
          return [{ text: `theme: unknown theme '${want}' — try dark or light`, cls: 't-err' }];
        }
        const next = setTheme(want === 'toggle' ? (getTheme() === 'dark' ? 'light' : 'dark') : want);
        return [{ text: `theme set to ${next}. the terminal stays dark — some things are sacred.`, cls: 't-dim' }];
      },
    },
    contact: {
      desc: 'ways to reach me',
      run: () => [
        { prefix: '  email     ', text: LINKS.email, href: `mailto:${LINKS.email}` },
        { prefix: '  github    ', text: 'github.com/Panagiotis1226', href: LINKS.github },
        { prefix: '  linkedin  ', text: 'panagiotis-nicolacacos', href: LINKS.linkedin },
      ],
    },
    open: {
      desc: 'open github | linkedin',
      run(args) {
        const target = LINKS[args[0]];
        if (!target || !/^https?:/.test(target)) {
          return [{ text: `open: unknown target '${args[0] || ''}' — try github or linkedin`, cls: 't-err' }];
        }
        window.open(target, '_blank', 'noopener');
        return [{ text: `opening ${args[0]} …`, cls: 't-dim' }];
      },
    },
    ls: {
      desc: 'list files',
      run: () => ['about.txt  now.txt  work.log  projects/  skills.conf'],
    },
    cat: {
      desc: 'cat a file',
      run(args) {
        const f = args[0] || '';
        if (f === 'about.txt') return WHOAMI;
        if (f === 'skills.conf') return commands.skills.run();
        if (f === 'now.txt') return commands.now.run();
        if (f === 'work.log') return commands.work.run();
        return [{ text: `cat: ${f || 'missing operand'}: No such file`, cls: 't-err' }];
      },
    },
    echo: {
      desc: 'echo text back',
      run: (args) => [args.join(' ')],
    },
    date: {
      desc: 'print the date',
      run: () => [new Date().toString()],
    },
    uname: {
      desc: 'system info',
      run: () => ['folio 3.0.0-petestech x86_64 GNU/HTML'],
    },
    neofetch: {
      desc: 'the screenshot command',
      run() {
        const info = [
          ['host', 'gh.petestech.com'],
          ['os', 'github pages (static)'],
          ['shell', 'vanilla-js 3.0'],
          ['resolution', `${window.innerWidth}x${window.innerHeight}`],
          ['packages', '0 (none needed)'],
          ['uptime', 'since 2023'],
          ['theme', `${getTheme()} (try \`theme\`)`],
        ];
        const rows = Math.max(NEOFETCH_ART.length, info.length);
        const artWidth = NEOFETCH_ART[0].length;
        const lines = [];
        for (let i = 0; i < rows; i++) {
          const art = NEOFETCH_ART[i] || ' '.repeat(artWidth);
          const kv = info[i] ? [
            { text: info[i][0].padEnd(12), cls: 't-dim' },
            { text: info[i][1], cls: 't-bright' },
          ] : [];
          lines.push([{ text: art + '  ', cls: 't-accent' }, ...kv]);
        }
        return lines;
      },
    },
    nmap: {
      desc: 'scan a host (try this one)',
      async run(args, ctx) {
        const host = args[0] || 'gh.petestech.com';
        const step = reduceMotion ? 0 : 450;
        ctx.print([{ text: `Starting Nmap 7.95 ( folio edition ) at ${new Date().toLocaleTimeString()}`, cls: 't-dim' }]);
        await sleep(step);
        ctx.print([`Nmap scan report for ${host}`]);
        await sleep(step * 2);
        ctx.print(['PORT     STATE     SERVICE']);
        await sleep(step);
        ctx.print([{ text: '443/tcp  open      https (github-pages)', cls: 't-accent' }]);
        await sleep(step);
        ctx.print([{ text: '80/tcp   open      http → 301 https', cls: 't-accent' }]);
        await sleep(step);
        ctx.print([{ text: '22/tcp   filtered  ssh (nice try)', cls: 't-warn' }]);
        await sleep(step);
        ctx.print([{ text: 'Nmap done: 1 host up — attack surface: a static site', cls: 't-dim' }]);
        return [];
      },
    },
    sudo: {
      desc: 'ask for more power',
      run: () => [{ text: 'peter is not in the sudoers file. This incident will be reported.', cls: 't-err' }],
    },
    clear: {
      desc: 'clear the screen',
      run() {
        out.replaceChildren();
        return [];
      },
    },
    exit: {
      desc: 'log out',
      run() {
        input.blur();
        return [{ text: 'logout', cls: 't-dim' }];
      },
    },
    rm: {
      hidden: true,
      desc: '',
      async run(args, ctx) {
        if (args.join(' ').replace(/\s+/g, ' ').includes('-rf /')) {
          ctx.print([{ text: 'rm: removing /index.html …', cls: 't-err' }]);
          await sleep(reduceMotion ? 0 : 900);
          ctx.print(['…kidding. This site is version-controlled.']);
          return [];
        }
        return [{ text: 'rm: refusing to remove anything on a portfolio', cls: 't-warn' }];
      },
    },
  };

  /* ---------- input handling ---------- */

  async function exec(raw) {
    const cmd = raw.trim();
    echoCommand(cmd);
    if (!cmd) return;

    history.push(cmd);
    historyIndex = history.length;

    const [name, ...args] = cmd.split(/\s+/);
    const entry = commands[name.toLowerCase()];
    if (!entry) {
      print([{ text: `bash: ${name}: command not found — try 'help'`, cls: 't-err' }]);
      return;
    }

    busy = true;
    try {
      const result = await entry.run(args, { print });
      if (result && result.length) print(result);
    } finally {
      busy = false;
    }
  }

  input.addEventListener('keydown', (e) => {
    if (busy && e.key === 'Enter') return;

    if (e.key === 'Enter') {
      const value = input.value;
      input.value = '';
      exec(value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) input.value = history[--historyIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        input.value = history[++historyIndex];
      } else {
        historyIndex = history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.trimStart().toLowerCase();
      if (!partial || partial.includes(' ')) return;
      const matches = Object.keys(commands)
        .filter((c) => !commands[c].hidden && c.startsWith(partial));
      if (matches.length === 1) {
        input.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        echoCommand(input.value);
        print([matches.join('  ')]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      out.replaceChildren();
    } else if (e.key === 'c' && e.ctrlKey && !window.getSelection().toString()) {
      echoCommand(input.value + '^C');
      input.value = '';
    }
  });

  // Click anywhere in the frame focuses the input (but never steal a text selection).
  body.addEventListener('click', () => {
    if (!window.getSelection().toString()) input.focus({ preventScroll: true });
  });

  /* ---------- chips (touch helpers) ---------- */

  if (chipsEl) {
    chipsEl.hidden = false;
    chipsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cmd]');
      if (btn && !busy) exec(btn.dataset.cmd);
    });
  }

  /* ---------- boot ---------- */

  async function boot() {
    if (booted) return;
    booted = true;
    busy = true;
    try {
      if (reduceMotion) {
        print(['folio v3.0 — boot ok (14ms)', { text: 'type `help` to look around — or `work` to skip ahead.', cls: 't-dim' }]);
      } else {
        await typeLine('folio v3.0 — boot ok (14ms)');
        await typeLine('type `help` to look around — or `work` to skip ahead.', 't-dim');
      }
    } finally {
      busy = false;
    }
  }

  root.hidden = false;

  const bootObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      bootObserver.disconnect();
      boot();
    }
  }, { threshold: 0.15 });
  bootObserver.observe(root);
}
