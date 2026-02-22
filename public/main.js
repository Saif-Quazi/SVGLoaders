const els = {
    size: document.getElementById('size'),
    stroke: document.getElementById('stroke'),
    speedOptions: document.querySelectorAll('.speedOption'),
    speedIndicator: document.getElementById('speedIndicator'),
    fgColor: document.getElementById('fgColor'),
    fgHex: document.getElementById('fgHex'),
    bgColor: document.getElementById('bgColor'),
    bgHex: document.getElementById('bgHex'),
    sizeValue: document.getElementById('sizeValue'),
    strokeValue: document.getElementById('strokeValue'),
    dimensions: document.getElementById('dimensions'),
    preview: document.getElementById('loaderPreview'),
    urlText: document.getElementById('urlText'),
    urlBar: document.getElementById('urlBar'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    themeToggle: document.getElementById('themeToggle')
};

const ICONS = {
    sun: '<svg class="themeIcon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    moon: '<svg class="themeIcon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    copy: '<svg class="copyIcon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M2 11V3a1 1 0 0 1 1-1h8"/></svg>',
    copySuccess: '<svg class="copyIcon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6 11 13 4"/></svg>'
};

const defaults = { size: 100, stroke: 4, speed: 'normal', fg: '000000', bg: 'E5E7EB' };
let currentSpeed = 'normal';
let debounceTimer;

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = els.themeToggle.querySelector('.themeIcon, .theme-icon');
    console.log('applyTheme called with', theme, 'icon?', icon);
    if (icon) {
        if (theme === 'dark') {
            icon.innerHTML = ICONS.moon;
        } else {
            icon.innerHTML = ICONS.sun;
        }
    }
}

function initTheme() {
    const userOverride = localStorage.getItem('themeOverride');
    const defaultTheme = 'light';
    if (!userOverride) {
        localStorage.setItem('systemPreference', defaultTheme);
    }
    const theme = userOverride || defaultTheme;
    applyTheme(theme);
}

function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

function updatePreview() {
    const size = els.size.value;
    const stroke = els.stroke.value;
    const fg = els.fgHex.value.replace('#', '');
    const bg = els.bgHex.value.replace('#', '');
    console.log('updatePreview', { size, stroke, fg, bg });
    if (!els.dimensions) console.warn('dimensions element missing');
    els.sizeValue.textContent = size;
    els.strokeValue.textContent = stroke;
    els.dimensions.textContent = `${size} x ${size}`;

    const params = new URLSearchParams();
    if (stroke != defaults.stroke) params.append('stroke', stroke);
    if (fg != defaults.fg) params.append('fg', fg);
    if (bg != defaults.bg) params.append('bg', bg);
    if (currentSpeed != defaults.speed) params.append('speed', currentSpeed);

    const query = params.toString();
    const path = `/${size}${query ? '?' + query : ''}`;
    const displayUrl = `svgloader.netlify.app/${size}${query ? '?' + query : ''}`;

    els.urlText.textContent = displayUrl;
    loadImage(path);
}

function loadImage(path) {
    els.preview.classList.add('loading');
    const img = new Image();
    img.onload = () => {
        els.preview.src = path;
        setTimeout(() => els.preview.classList.remove('loading'), 100);
    };
    img.onerror = () => {
        els.preview.classList.remove('loading');
    };
    img.src = path;
}

const debouncedUpdate = debounce(updatePreview, 1000);

function syncColorToHex(colorInput, hexInput) {
    hexInput.value = colorInput.value.substring(1).toUpperCase();
    debouncedUpdate();
}

function syncHexToColor(hexInput, colorInput) {
    const hex = hexInput.value.replace('#', '').toUpperCase();
    if (/^[0-9A-F]{6}$/i.test(hex)) {
        colorInput.value = '#' + hex;
        debouncedUpdate();
    }
}

function setSpeed(speed) {
    currentSpeed = speed;

    let activeBtn = null;
    els.speedOptions.forEach((btn) => {
        const isActive = btn.dataset.value === speed;
        btn.classList.toggle('active', isActive);
        if (isActive) activeBtn = btn;
    });

    if (activeBtn) {
        const btnRect = activeBtn.getBoundingClientRect();
        const pillRect = activeBtn.parentElement.getBoundingClientRect();
        const leftOffset = btnRect.left - pillRect.left - 4;

        els.speedIndicator.style.width = `${btnRect.width}px`;
        els.speedIndicator.style.transform = `translateX(${leftOffset}px)`;
    }

    debouncedUpdate();
}

els.size.addEventListener('input', () => {
    els.sizeValue.textContent = els.size.value;
    els.dimensions.textContent = `${els.size.value} x ${els.size.value}`;
    debouncedUpdate();
});

els.stroke.addEventListener('input', () => {
    els.strokeValue.textContent = els.stroke.value;
    debouncedUpdate();
});

els.speedOptions.forEach(btn => {
    btn.addEventListener('click', () => setSpeed(btn.dataset.value));
});

els.fgColor.addEventListener('input', () => syncColorToHex(els.fgColor, els.fgHex));
els.fgHex.addEventListener('input', () => syncHexToColor(els.fgHex, els.fgColor));
els.bgColor.addEventListener('input', () => syncColorToHex(els.bgColor, els.bgHex));
els.bgHex.addEventListener('input', () => syncHexToColor(els.bgHex, els.bgColor));

els.copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText('https://' + els.urlText.textContent);
        els.copyBtn.innerHTML = ICONS.copySuccess;
        els.copyBtn.classList.add('copied');
        setTimeout(() => {
            els.copyBtn.innerHTML = ICONS.copy;
            els.copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) { }
});

els.resetBtn.addEventListener('click', () => {
    els.size.value = defaults.size;
    els.stroke.value = defaults.stroke;
    setSpeed(defaults.speed);
    els.fgHex.value = defaults.fg;
    els.fgColor.value = '#' + defaults.fg;
    els.bgHex.value = defaults.bg;
    els.bgColor.value = '#' + defaults.bg;
    updatePreview();
});

els.themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('themeOverride', newTheme);
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const userOverride = localStorage.getItem('themeOverride');
    if (!userOverride) {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        localStorage.setItem('systemPreference', newSystemTheme);
        applyTheme(newSystemTheme);
    }
});

window.addEventListener('resize', () => {
    setSpeed(currentSpeed);
});

initTheme();
setTimeout(() => {
    setSpeed(currentSpeed);
    updatePreview();
    els.dimensions.style.display = 'block';
}, 0);