/* ── JWT helpers ─────────────────────────────── */
function getToken()       { return sessionStorage.getItem('jwt_token'); }
function setToken(t)      { sessionStorage.setItem('jwt_token', t); }
function removeToken()    { sessionStorage.removeItem('jwt_token'); }

function parseJwt(token) {
    try {
        const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
        return JSON.parse(decodeURIComponent(atob(b64).split('').map(c =>
            '%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    } catch { return null; }
}

function isTokenExpired(token) {
    const p = parseJwt(token);
    return !p || !p.exp || Date.now() >= p.exp * 1000;
}

function requireAuth() {
    const t = getToken();
    if (!t || isTokenExpired(t)) { removeToken(); window.location.href='/signIn'; return null; }
    return t;
}

function requireRole(role) {
    const t = requireAuth();
    if (!t) return null;
    const p = parseJwt(t);
    if (!p.roles || !p.roles.includes(role)) { window.location.href='/403'; return null; }
    return t;
}

function logout() { removeToken(); window.location.href='/signIn'; }

/* ── Date helpers ────────────────────────────── */
function calcAge(birthdate) {
    const b = new Date(birthdate), now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    if (now.getMonth() < b.getMonth() || (now.getMonth()===b.getMonth() && now.getDate()<b.getDate())) age--;
    return age;
}
function fmtDate(d) {
    return new Date(d).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' });
}

/* ── API helpers ─────────────────────────────── */
async function apiPost(ep, data) {
    const r = await fetch('/api'+ep, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    return { status: r.status, data: await r.json() };
}
async function apiGet(ep) {
    const r = await fetch('/api'+ep, { headers:{'Authorization':'Bearer '+getToken()} });
    if (r.status===401) { removeToken(); window.location.href='/signIn'; return null; }
    if (r.status===403) { window.location.href='/403'; return null; }
    return r.json();
}
async function apiPut(ep, data) {
    const r = await fetch('/api'+ep, { method:'PUT', headers:{'Authorization':'Bearer '+getToken(),'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (r.status===401) { removeToken(); window.location.href='/signIn'; return null; }
    return { status: r.status, data: await r.json() };
}
