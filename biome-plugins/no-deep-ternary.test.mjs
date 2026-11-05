import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const plugin = fileURLToPath(
  new URL('./no-deep-ternary.grit', import.meta.url)
);
const iifePlugin = fileURLToPath(
  new URL('./no-deep-ternary-iife.grit', import.meta.url)
);

test('registers both plugins and disables the built-in rule', () => {
  const config = JSON.parse(
    readFileSync(new URL('../biome.json', import.meta.url), 'utf8')
  );
  assert.equal(config.linter.rules.style.noNestedTernary, 'off');
  for (const path of [
    './biome-plugins/no-deep-ternary.grit',
    './biome-plugins/no-deep-ternary-iife.grit',
  ]) {
    assert.ok(
      config.plugins.some(
        (entry) => entry.path === path && entry.includes.includes('src/**')
      )
    );
  }
});

function lint(source, mode = 'check') {
  const directory = mkdtempSync(join(tmpdir(), 'biome-ternary-'));
  try {
    writeFileSync(
      join(directory, 'biome.json'),
      JSON.stringify({
        root: true,
        vcs: { enabled: false },
        linter: { rules: { preset: 'none' } },
        plugins: [plugin, iifePlugin],
      })
    );
    const fixture = join(directory, 'fixture.tsx');
    writeFileSync(fixture, source);
    const result = spawnSync(
      'pnpm',
      [
        'exec',
        'biome',
        'lint',
        '--config-path',
        directory,
        '--reporter=json',
        ...(mode === 'check' ? [] : ['--write']),
        ...(mode === 'unsafe' ? ['--unsafe'] : []),
        fixture,
      ],
      { encoding: 'utf8', timeout: 10_000 }
    );
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    assert.ok(result.stdout, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(
      report.diagnostics.every(
        (diagnostic) =>
          diagnostic.category === 'plugin' && diagnostic.severity === 'error'
      ),
      result.stdout
    );
    return {
      ...report,
      exitCode: result.status,
      source: readFileSync(fixture, 'utf8'),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('allows depth 2 and reports depth 3', () => {
  const valid = lint('const value = a ? b : c ? d : e;');
  assert.equal(valid.diagnostics.length, 0);
  assert.equal(valid.exitCode, 0);
  const result = lint('const value = a ? b : c ? d : e ? f : g;');
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.exitCode, 1);
  assert.match(result.diagnostics[0].message, /Ternary depth exceeds 2/);
});

test('fixes directly returned ternaries using early returns', () => {
  const result = lint(
    'function choose() { return a ? b : c ? d : e ? f : g; }',
    'safe'
  );
  assert.match(
    result.source,
    /if \(a\) \{ return b; \} return c \? d : e \? f : g;/
  );
  assert.doesNotMatch(result.source, /\blet\b|\(\(\) =>/);
  assert.equal(lint(result.source).diagnostics.length, 0);
});

test('offers opt-in IIFE fixes for inline expressions', () => {
  const source = 'const value = a ? b : c ? d : e ? f : g;';
  assert.equal(lint(source, 'safe').source, source);
  const result = lint(source, 'unsafe');
  assert.match(result.source, /const value = \(\(\) => \{/);
  assert.doesNotMatch(result.source, /\blet\b/);
  assert.equal(lint(result.source).diagnostics.length, 0);
});

test('does not move await into a synchronous IIFE', () => {
  const source =
    'async function choose() { const value = a ? await b() : c ? d : e ? f : g; }';
  const result = lint(source, 'unsafe');
  assert.equal(result.source, source);
  assert.equal(result.diagnostics.length, 1);
});

for (const source of [
  'const value = a ? b : c;',
  'const value = a ? (b ? c : d) : e;',
  'const value = a ? b : (c ? d : e);',
  'const value = (a ? b : c) ? d : e;',
  'const value = a ? (b ? c : d) : (e ? f : g);',
  'const value = a ? (() => b ? c : d ? e : f) : g;',
  'const value = a ? function () { return b ? c : d ? e : f; } : g;',
  'const value = a ? { method() { return b ? c : d ? e : f; } } : g;',
  'type Value<T> = T extends A ? B : T extends C ? D : T extends E ? F : G;',
]) {
  test(`allows independent depths: ${source}`, () => {
    assert.equal(lint(source).diagnostics.length, 0);
  });
}

for (const source of [
  'const value = a ? (b ? (c ? d : e) : f) : g;',
  'const value = ((a ? b : c ? d : e)) ? f : g;',
  'const value = a ? b : (((c ? d : e ? f : g)));',
  'const value = a ? consume(b ? c : d ? e : f) : g;',
  'const value = a ? <span>{b ? c : d ? e : f}</span> : g;',
  'const value = a ? b : c ? d : e ? f : g ? h : i;',
]) {
  test(`reports deep expressions: ${source}`, () => {
    const result = lint(source);
    assert.ok(result.diagnostics.length >= 1);
    assert.equal(result.source, source);
  });
}

for (const source of [
  'const choose = () => a ? b : c ? d : e ? f : g;',
  'const choose = () => ((a ? b : c ? d : e ? f : g));',
  'async function choose() { return a ? await b() : c ? d : e ? f : g; }',
  'function* choose() { return a ? yield b : c ? d : e ? f : g; }',
  'const choose = async () => a ? await b() : c ? d : e ? f : g;',
  'function choose() { if (outer) { return a ? b : c ? d : e ? f : g; } }',
]) {
  test(`uses existing function scope: ${source}`, () => {
    const result = lint(source, 'safe');
    assert.match(result.source, /if \(a\)/);
    assert.doesNotMatch(result.source, /\blet\b|\(\(\) =>/);
    assert.equal(lint(result.source).diagnostics.length, 0);
  });
}

for (const source of [
  'function* choose() { const value = a ? yield b : c ? d : e ? f : g; }',
  'const value = a /* keep */ ? b : c ? d : e ? f : g;',
  'function choose() { return a /* keep */ ? b : c ? d : e ? f : g; }',
  'const value = a ? eval("b") : c ? d : e ? f : g;',
  'const value = a ? useValue() : c ? d : e ? f : g;',
  'const value = a ? (() => b) : c ? d : e ? f : g;',
]) {
  test(`leaves manual-review cases unchanged: ${source}`, () => {
    const result = lint(source, 'unsafe');
    assert.equal(result.source, source);
    assert.ok(result.diagnostics.length >= 1);
  });
}

for (const source of [
  'function choose() { if (outer) return a ? b : c ? d : e ? f : g; }',
  'function choose() { if (outer) return a ? b : c ? d : e ? f : g; return a ? b : c ? d : e ? f : g; }',
  'function choose() { if (outer) {} else return a ? b : c ? d : e ? f : g; }',
  'function choose() { while (outer) return a ? b : c ? d : e ? f : g; }',
  'function choose() { for (;;) return a ? b : c ? d : e ? f : g; }',
  'function choose() { label: return a ? b : c ? d : e ? f : g; }',
]) {
  test(`does not expand unbraced control flow: ${source}`, () => {
    const result = lint(source, 'safe');
    assert.equal(result.source, source);
  });
}

test('preserves lazy branch evaluation for both fix kinds', () => {
  for (const mode of ['safe', 'unsafe']) {
    for (const flags of [
      [true, true, true],
      [false, true, true],
      [false, false, true],
      [false, false, false],
    ]) {
      const source =
        mode === 'safe'
          ? 'function choose() { return check(0) ? hit(0) : check(1) ? hit(1) : check(2) ? hit(2) : hit(3); } choose();'
          : 'const value = check(0) ? hit(0) : check(1) ? hit(1) : check(2) ? hit(2) : hit(3); value;';
      function evaluate(code) {
        const calls = [];
        const value = runInNewContext(code, {
          check(index) {
            calls.push(`check${index}`);
            return flags[index];
          },
          hit(index) {
            calls.push(`hit${index}`);
            return index;
          },
        });
        return { calls, value };
      }
      const fixed = lint(source, mode).source;
      assert.deepEqual(evaluate(fixed), evaluate(source));
      assert.equal(lint(fixed, mode).source, fixed);
    }
  }
});

test('does not report the same source twice when suppressed', () => {
  const source =
    '// biome-ignore lint/plugin: Intentional decision table.\nconst value = a ? b : c ? d : e ? f : g;';
  assert.equal(lint(source).diagnostics.length, 0);
});

test('safe fixes never enable IIFE fixes elsewhere in the file', () => {
  const inline = 'const value = a ? b : c ? d : e ? f : g;';
  const source = `${inline}\nfunction choose() { return a ? b : c ? d : e ? f : g; }`;
  const result = lint(source, 'safe');
  assert.ok(result.source.startsWith(inline));
  assert.match(result.source, /if \(a\) \{ return b; \}/);
  assert.doesNotMatch(result.source, /\(\(\) =>/);
  assert.equal(lint(result.source).diagnostics.length, 1);
});

test('unsafe fixes handle independent inline expressions without overlapping', () => {
  const source =
    'const first = a ? b : c ? d : e ? f : g;\nconst second = h ? i : j ? k : l ? m : n;';
  const result = lint(source, 'unsafe');
  assert.equal(lint(result.source).diagnostics.length, 0);
  assert.equal((result.source.match(/\(\(\) =>/g) ?? []).length, 2);
});

test('retains the evaluation context of this and arguments in an IIFE', () => {
  const source =
    'const value = a ? this.value : b ? arguments[0] : c ? 3 : 4; value;';
  const fixed = lint(source, 'unsafe').source;
  for (const flags of [
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [false, false, false],
  ]) {
    function evaluate(code) {
      return runInNewContext(code, {
        a: flags[0],
        b: flags[1],
        c: flags[2],
        value: 1,
        arguments: [2],
      });
    }
    assert.equal(evaluate(fixed), evaluate(source));
  }
});
