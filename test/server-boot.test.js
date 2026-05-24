// Vitest unit suite for src/backend/server.js — boot-time validation.
//
// Per WO-305.2.a (D18 reconciliation): asserts the boot-validation
// behavior canonized in gold vision v1.7 §10 Configuration:
//   ORG_NAME and CRISIS_LINE must be present and non-empty at server
//   boot. If either is unset or empty, server.js emits a
//   `config_invalid` §10 log event and calls process.exit(1) before
//   the HTTP listener binds.
//
// Per WO-310.9a D.3: REQUIRED_ENV extended with three magic-link keys
// (RESEND_API_KEY, RESEND_FROM_ADDRESS, MAGIC_LINK_SECRET). The
// success-path test now seeds these alongside the original two so the
// listener binds. Failure-path tests still assert that the missing
// original-key name appears in the error string; because the error
// surfaces every missing key joined by ', ', toContain('ORG_NAME')
// remains valid even when other keys are absent in the same run.
//
// Five test cases — four failure paths + one success path:
//   1. ORG_NAME unset            → exit 1; config_invalid log
//   2. ORG_NAME empty string     → exit 1; config_invalid log
//   3. CRISIS_LINE unset         → exit 1; config_invalid log
//   4. CRISIS_LINE empty string  → exit 1; config_invalid log
//   5. All present and non-empty → boot succeeds; app.listen called
//
// Test pattern: validation runs at module-top-level (import side
// effect). Per-test vi.resetModules() + dynamic import re-runs the
// boot logic. dotenv/config mocked as no-op so a real .env file
// cannot repopulate process.env mid-test. app.js mocked so app.listen
// is a no-op spy (no port binding). process.exit spied to throw
// (intercept) so dynamic import rejects on the failure path.
// process.stdout.write spied to capture the §10 JSON log line.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv/config', () => ({}));

vi.mock('../src/backend/app.js', () => ({
  default: { listen: vi.fn() },
}));

// Per WO-310.8d Edit 2: server.js now calls bootstrapSchema() between
// REQUIRED_ENV validation and app.listen(). Boot-time validation tests
// must mock the bootstrap module so they exercise the env-validation
// contract without depending on a reachable database. Mock returns the
// success-path no-op shape (schema_already_applied) so test 5 (success
// path) reaches app.listen unobstructed; failure-path tests 1–4 exit
// 1 from REQUIRED_ENV check before bootstrapSchema is invoked.
vi.mock('../src/db/bootstrap-schema.js', () => ({
  bootstrapSchema: vi.fn().mockResolvedValue({
    applied: false,
    reason: 'schema_already_applied',
  }),
}));

describe('server.js boot-time validation', () => {
  let exitSpy;
  let stdoutSpy;
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit intercepted');
    });
    stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    // baseline known-good — individual tests override
    process.env.ORG_NAME = 'TestOrg';
    process.env.CRISIS_LINE = '988';
    // WO-310.9a: REQUIRED_ENV gained three magic-link keys. Seed them
    // here so the success path reaches app.listen; failure-path tests
    // delete or empty ORG_NAME/CRISIS_LINE only, leaving these set.
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.RESEND_FROM_ADDRESS = 'test@example.com';
    process.env.MAGIC_LINK_SECRET = 'test-magic-link-secret';
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stdoutSpy.mockRestore();
    process.env = { ...origEnv };
    process.env.ORG_NAME = origEnv.ORG_NAME;
    process.env.CRISIS_LINE = origEnv.CRISIS_LINE;
  });

  function findConfigInvalidLog() {
    return stdoutSpy.mock.calls.find((call) => {
      try {
        const parsed = JSON.parse(call[0]);
        return (
          parsed.level === 'error' && parsed.event === 'config_invalid'
        );
      } catch {
        return false;
      }
    });
  }

  it('exits 1 when ORG_NAME is unset', async () => {
    delete process.env.ORG_NAME;
    process.env.CRISIS_LINE = '988';

    await expect(import('../src/backend/server.js')).rejects.toThrow(
      'process.exit intercepted'
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
    const logCall = findConfigInvalidLog();
    expect(logCall).toBeTruthy();
    const parsed = JSON.parse(logCall[0]);
    expect(parsed.error).toContain('ORG_NAME');
  });

  it('exits 1 when ORG_NAME is empty string', async () => {
    process.env.ORG_NAME = '';
    process.env.CRISIS_LINE = '988';

    await expect(import('../src/backend/server.js')).rejects.toThrow(
      'process.exit intercepted'
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
    const logCall = findConfigInvalidLog();
    expect(logCall).toBeTruthy();
    const parsed = JSON.parse(logCall[0]);
    expect(parsed.error).toContain('ORG_NAME');
  });

  it('exits 1 when CRISIS_LINE is unset', async () => {
    process.env.ORG_NAME = 'TestOrg';
    delete process.env.CRISIS_LINE;

    await expect(import('../src/backend/server.js')).rejects.toThrow(
      'process.exit intercepted'
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
    const logCall = findConfigInvalidLog();
    expect(logCall).toBeTruthy();
    const parsed = JSON.parse(logCall[0]);
    expect(parsed.error).toContain('CRISIS_LINE');
  });

  it('exits 1 when CRISIS_LINE is empty string', async () => {
    process.env.ORG_NAME = 'TestOrg';
    process.env.CRISIS_LINE = '';

    await expect(import('../src/backend/server.js')).rejects.toThrow(
      'process.exit intercepted'
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
    const logCall = findConfigInvalidLog();
    expect(logCall).toBeTruthy();
    const parsed = JSON.parse(logCall[0]);
    expect(parsed.error).toContain('CRISIS_LINE');
  });

  it('boot succeeds when both env vars are present and non-empty', async () => {
    process.env.ORG_NAME = 'TestOrg';
    process.env.CRISIS_LINE = '988';

    await expect(
      import('../src/backend/server.js')
    ).resolves.toBeDefined();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(findConfigInvalidLog()).toBeFalsy();

    const appModule = await import('../src/backend/app.js');
    expect(appModule.default.listen).toHaveBeenCalled();
  });
});
