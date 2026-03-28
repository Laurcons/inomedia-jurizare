/**
 * Load test script.
 * Usage:
 *   npm run load-test
 *   TARGET_URL=https://other-host.example.com npm run load-test
 */

// const TARGET = 'http://localhost:3000';
const TARGET = 'https://inomedia-2026.laurcons.ro';

const SIMPLE_TEACHERS = 100; // teachers 1–100
const STUDENT_TEACHERS = 100; // teachers 101–200
const STUDENTS_PER_TEACHER = 30;

const JITTER_MAX_MS = 10000; // each actor waits up to this long before starting
const THINK_MIN_MS = 1000; // min pause between requests within one actor
const THINK_MAX_MS = 10000; // max pause between requests within one actor

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

interface Metric {
  label: string;
  ms: number;
  status: number;
  ok: boolean;
}

const metrics: Metric[] = [];

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function ts() {
  return new Date().toISOString().slice(11, 23);
}

function log(actor: string, msg: string) {
  console.log(`${ts()}  ${actor.padEnd(18)}  ${msg}`);
}

// ---------------------------------------------------------------------------
// Timing helpers
// ---------------------------------------------------------------------------

function jitter(): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.random() * JITTER_MAX_MS));
}

function think(): Promise<void> {
  const ms = THINK_MIN_MS + Math.random() * (THINK_MAX_MS - THINK_MIN_MS);
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// HTTP helper — manual cookie jar (iron-session sets a single cookie)
// ---------------------------------------------------------------------------

type Jar = Map<string, string>;

async function req(
  jar: Jar,
  label: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jar.size > 0) {
    headers['Cookie'] = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  const start = Date.now();
  let res: Response;
  try {
    res = await fetch(`${TARGET}${path}`, {
      method: body !== undefined ? 'POST' : 'GET',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    metrics.push({ label, ms: Date.now() - start, status: 0, ok: false });
    throw err;
  }

  const ms = Date.now() - start;
  metrics.push({ label, ms, status: res.status, ok: res.ok });

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const [nameValue] = setCookie.split(';');
    const eqIdx = nameValue.indexOf('=');
    if (eqIdx !== -1) {
      jar.set(nameValue.slice(0, eqIdx).trim(), nameValue.slice(eqIdx + 1).trim());
    }
  }

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

// ---------------------------------------------------------------------------
// Shared flow: OTP login
// ---------------------------------------------------------------------------

async function login(jar: Jar, email: string, actor: string) {
  const r1 = await req(jar, 'send-otp', '/api/auth/send-otp', { email });
  if (!r1.ok) throw new Error(`send-otp → ${r1.status}: ${JSON.stringify(r1.data)}`);
  await think();

  const r2 = await req(jar, 'verify-otp', '/api/auth/verify-otp', { email, otp: '000000' });
  if (!r2.ok) throw new Error(`verify-otp → ${r2.status}: ${JSON.stringify(r2.data)}`);
  log(actor, 'logged in');
}

// ---------------------------------------------------------------------------
// Actor: simple-voting teacher
// ---------------------------------------------------------------------------

let simpleDone = 0;

async function runSimpleTeacher(n: number, videoIds: string[]) {
  const actor = `simple-${n}`;
  const email = `teacher${n}@test.com`;
  const jar: Jar = new Map();

  await jitter();
  await login(jar, email, actor);
  await think();

  const r1 = await req(jar, 'set-method', '/api/teacher/vote-method', { method: 'simple' });
  if (!r1.ok) throw new Error(`set-method → ${r1.status}: ${JSON.stringify(r1.data)}`);
  await think();

  const r2 = await req(jar, 'cast-vote', '/api/teacher/vote/cast', { ranking: videoIds.slice(0, 10) });
  if (!r2.ok) throw new Error(`cast-vote → ${r2.status}: ${JSON.stringify(r2.data)}`);

  simpleDone++;
  log(actor, `✓ vote cast  [${simpleDone}/${SIMPLE_TEACHERS} simple done]`);
}

// ---------------------------------------------------------------------------
// Actor: student-voting teacher
// ---------------------------------------------------------------------------

let studentTeacherDone = 0;
let studentVotesDone = 0;

async function runStudentTeacher(n: number, videoIds: string[]) {
  const actor = `student-${n}`;
  const email = `teacher${n + SIMPLE_TEACHERS}@test.com`;
  const jar: Jar = new Map();

  await jitter();
  await login(jar, email, actor);
  await think();

  const r1 = await req(jar, 'set-method', '/api/teacher/vote-method', { method: 'students' });
  if (!r1.ok) throw new Error(`set-method → ${r1.status}: ${JSON.stringify(r1.data)}`);
  const joinCode = (r1.data as { joinCode?: string })?.joinCode;
  if (!joinCode) throw new Error('no joinCode in vote-method response');
  log(actor, `join code ${joinCode} — casting ${STUDENTS_PER_TEACHER} student votes`);
  await think();

  for (let s = 1; s <= STUDENTS_PER_TEACHER; s++) {
    const r = await req(jar, 'student-vote', '/api/student/vote', {
      ranking: videoIds.slice(0, 10),
      studentName: `Student_${n}_${s}`,
      studentClass: 'IX A',
      code: joinCode,
    });
    if (!r.ok) throw new Error(`student-vote ${s} → ${r.status}: ${JSON.stringify(r.data)}`);
    studentVotesDone++;
    await think();
  }

  const r2 = await req(jar, 'submit-students', '/api/teacher/students/submit', {});
  if (!r2.ok) throw new Error(`submit-students → ${r2.status}: ${JSON.stringify(r2.data)}`);

  studentTeacherDone++;
  log(
    actor,
    `✓ submitted  [${studentTeacherDone}/${STUDENT_TEACHERS} student-teachers done | ${studentVotesDone} student votes total]`,
  );
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function pct(sorted: number[], p: number) {
  return sorted[Math.min(Math.floor((sorted.length * p) / 100), sorted.length - 1)];
}

function printReport(totalMs: number) {
  const errors = metrics.filter((m) => !m.ok);
  const rps = ((metrics.length / totalMs) * 1000).toFixed(1);

  console.log('\n' + '═'.repeat(74));
  console.log('  LOAD TEST REPORT');
  console.log('═'.repeat(74));
  console.log(`  Target:          ${TARGET}`);
  console.log(`  Duration:        ${(totalMs / 1000).toFixed(1)}s`);
  console.log(`  Total requests:  ${metrics.length}   (${rps} req/s)`);
  console.log(`  Errors:          ${errors.length}`);
  if (errors.length > 0) {
    const byLabel = new Map<string, number>();
    for (const e of errors) byLabel.set(e.label, (byLabel.get(e.label) ?? 0) + 1);
    for (const [label, count] of byLabel) {
      console.log(`    ${label}: ${count} error(s)`);
    }
  }
  console.log('');

  const COL = { label: 20, n: 6, err: 6, min: 6, mean: 6, p50: 6, p95: 6, p99: 6, max: 6 };
  const head =
    'Endpoint'.padEnd(COL.label) +
    'Count'.padStart(COL.n) +
    'Err'.padStart(COL.err) +
    'Min'.padStart(COL.min) +
    'Mean'.padStart(COL.mean) +
    'p50'.padStart(COL.p50) +
    'p95'.padStart(COL.p95) +
    'p99'.padStart(COL.p99) +
    'Max'.padStart(COL.max) +
    '  (ms)';
  console.log(head);
  console.log('─'.repeat(head.length));

  const order = [
    'send-otp',
    'verify-otp',
    'start-voting',
    'get-videos',
    'set-method',
    'cast-vote',
    'student-vote',
    'submit-students',
  ];

  const groups = new Map<string, Metric[]>();
  for (const m of metrics) {
    if (!groups.has(m.label)) groups.set(m.label, []);
    groups.get(m.label)!.push(m);
  }

  for (const label of order) {
    const group = groups.get(label);
    if (!group) continue;
    const sorted = group.map((m) => m.ms).sort((a, b) => a - b);
    const errCount = group.filter((m) => !m.ok).length;
    const mean = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
    console.log(
      label.padEnd(COL.label) +
        String(group.length).padStart(COL.n) +
        String(errCount).padStart(COL.err) +
        String(sorted[0]).padStart(COL.min) +
        String(mean).padStart(COL.mean) +
        String(pct(sorted, 50)).padStart(COL.p50) +
        String(pct(sorted, 95)).padStart(COL.p95) +
        String(pct(sorted, 99)).padStart(COL.p99) +
        String(sorted[sorted.length - 1]).padStart(COL.max),
    );
  }

  console.log('═'.repeat(74) + '\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n▶  Inomedia Load Test`);
  console.log(`   Target: ${TARGET}`);
  console.log(`   ${SIMPLE_TEACHERS} simple-voting teachers`);
  console.log(`   ${STUDENT_TEACHERS} student-voting teachers × ${STUDENTS_PER_TEACHER} students each\n`);

  // --- Setup: admin login, start voting, fetch video IDs ---
  const adminJar: Jar = new Map();
  log('setup', 'admin login...');
  await login(adminJar, 'admin1@test.com', 'setup');
  await think();

  log('setup', 'starting voting period...');
  const rv = await req(adminJar, 'start-voting', '/api/admin/voting/start', {});
  if (!rv.ok) throw new Error(`start-voting → ${rv.status}: ${JSON.stringify(rv.data)}`);
  await think();

  log('setup', 'fetching video IDs...');
  const rw = await req(adminJar, 'get-videos', '/api/videos');
  if (!rw.ok) throw new Error(`get-videos → ${rw.status}`);
  const videoIds = (rw.data as { id: string }[]).map((v) => v.id);
  if (videoIds.length < 10) throw new Error(`Need ≥10 videos, got ${videoIds.length}`);
  log('setup', `${videoIds.length} videos loaded — launching ${SIMPLE_TEACHERS + STUDENT_TEACHERS} actors\n`);

  // --- Run all actors in parallel ---
  const start = Date.now();

  const simpleActors = Array.from({ length: SIMPLE_TEACHERS }, (_, i) =>
    runSimpleTeacher(i + 1, videoIds).catch((err: Error) => {
      log(`simple-${i + 1}`, `✗ ${err.message}`);
    }),
  );

  const studentActors = Array.from({ length: STUDENT_TEACHERS }, (_, i) =>
    runStudentTeacher(i + 1, videoIds).catch((err: Error) => {
      log(`student-${i + 1}`, `✗ ${err.message}`);
    }),
  );

  await Promise.all([...simpleActors, ...studentActors]);

  printReport(Date.now() - start);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
