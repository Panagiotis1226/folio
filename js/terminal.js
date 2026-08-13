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
  cv: 'CV.pdf',
};

const PROJECTS = [
  {
    name: 'Game Server Deployment',
    stack: 'minecraft · web server · json config',
    desc: 'Interconnected Minecraft servers behind a public-facing website — provisioning, networking, and world data managed as JSON config.',
    arch: '[players] → [proxy] → [mc-server ×n] ↔ [web]',
  },
  {
    name: 'Media Server',
    stack: 'immich · nextcloud · linux',
    desc: 'Fully on-premise photo and file platform that replaced the household’s paid iCloud storage. Backups, updates, and uptime included.',
    arch: '[phones · laptops] → [reverse proxy] → [immich · nextcloud] → [storage]',
  },
  {
    name: 'Web Services',
    stack: 'apache · docker compose · load balancing',
    desc: 'Horizontally scalable Apache services on Docker Compose — load-balanced and port-forwarded through the network edge.',
    arch: '[clients] → [edge router] → [load balancer] → [apache ×n]',
  },
  {
    name: 'Network Security',
    stack: 'wazuh siem · port scanning · hardening',
    desc: 'Wazuh SIEM agents on every endpoint feeding a central dashboard; unnecessary open ports scanned and closed.',
    arch: '[endpoints ×n] → [wazuh agents] → [siem manager] → [alerts]',
  },
];

const SKILLS = [
  ['languages', 'Python · JavaScript · C# · Java · PHP · Swift · Bash · HTML/CSS · .NET'],
  ['infra & ops', 'Linux · Docker · AWS · Node.js · Ollama · CLI'],
  ['tools', 'Git · VS Code · Visual Studio · Xcode · IntelliJ · VMware'],
];

const WHOAMI = [
  { text: 'Panagiotis “Peter” Nicolacacos', cls: 't-bright' },
  'CS student in Montréal. I build web software and run the',
  'servers it lives on — linux, docker, and a homelab that',
  'never stops breaking in educational ways.',
];

const NEOFETCH_ART = [
  '  ████████▄   ',
  '  ██     ██   ',
  '  ████████▀   ',
  '  ██      ▄██ ',
  '  ██      ▀▀  ',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function initTerminal(root, chipsEl, { reduceMotion = false } = {}) {
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
    projects: {
      desc: 'list projects — `projects 3` for detail',
      run(args) {
        const n = parseInt(args[0], 10);
        if (n >= 1 && n <= PROJECTS.length) {
          const p = PROJECTS[n - 1];
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
    contact: {
      desc: 'ways to reach me',
      run: () => [
        { prefix: '  email     ', text: LINKS.email, href: `mailto:${LINKS.email}` },
        { prefix: '  github    ', text: 'github.com/Panagiotis1226', href: LINKS.github },
        { prefix: '  linkedin  ', text: 'panagiotis-nicolacacos', href: LINKS.linkedin },
      ],
    },
    cv: {
      desc: 'open the resume (pdf)',
      run() {
        window.open(LINKS.cv, '_blank', 'noopener');
        return [{ text: 'opening CV.pdf …', cls: 't-dim' }];
      },
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
      run: () => ['about.txt  projects/  skills.conf  CV.pdf'],
    },
    cat: {
      desc: 'cat a file',
      run(args) {
        const f = args[0] || '';
        if (f === 'about.txt') return WHOAMI;
        if (f === 'skills.conf') return commands.skills.run();
        if (f === 'CV.pdf') return [{ text: 'cat: CV.pdf: binary file — try `cv` instead', cls: 't-warn' }];
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
      run: () => ['folio 2.0.0-petestech x86_64 GNU/HTML'],
    },
    neofetch: {
      desc: 'the screenshot command',
      run() {
        const info = [
          ['host', 'gh.petestech.com'],
          ['os', 'github pages (static)'],
          ['shell', 'vanilla-js 2.0'],
          ['resolution', `${window.innerWidth}x${window.innerHeight}`],
          ['packages', '0 (none needed)'],
          ['uptime', 'since 2023'],
          ['theme', 'dark [locked]'],
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
        print(['folio v2.0 — boot ok (14ms)', { text: 'type `help` to look around, or just scroll.', cls: 't-dim' }]);
      } else {
        await typeLine('folio v2.0 — boot ok (14ms)');
        await typeLine('type `help` to look around, or just scroll.', 't-dim');
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
  }, { threshold: 0.4 });
  bootObserver.observe(root);
}
