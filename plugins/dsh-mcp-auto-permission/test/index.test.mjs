import assert from 'node:assert/strict';
import test from 'node:test';
import { apply } from '../lib/index.js';

function harness({preset = 'workspace-write-mcp', withInject = true, permission = true} = {}) {
  let handler;
  let noteText;
  let autoService;
  const ctx = {
    on(event, fn) {
      if (event === 'approval/request') handler = fn;
    },
    provide(name, service) {
      if (name === 'mcpAutoPermission') autoService = service;
    },
    get(name) {
      if (!permission || name !== 'permissionPresets') return undefined;
      return { current: () => preset };
    },
  };
  if (withInject) {
    ctx.inject = (services, register) => {
      if (services[0] !== 'systemPrompt') return;
      register({
        systemPrompt: {
          getContextOrder: () => 115,
          context: (definition) => { noteText = definition.text; },
        },
      });
    };
  }
  apply(ctx, { preset: 'workspace-write-mcp' });
  return {
    handler,
    note: () => noteText?.({ agent: { session: {} } }),
    autoApproves: autoService?.autoApproves,
  };
}

const mcpRequest = { agent: { session: {} }, toolName: 'mcp__playwright__browser_navigate' };
const otherRequest = { agent: { session: {} }, toolName: 'bash' };

test('claims MCP approval requests under the new preset', async () => {
  const { handler } = harness();
  let nextCalls = 0;
  const outcome = await handler(mcpRequest, async () => { nextCalls += 1; return 'rejected'; });
  assert.equal(outcome, 'allowed-once');
  assert.equal(nextCalls, 0);
});

test('leaves non-MCP requests and other presets to the remaining answerers', async () => {
  const { handler } = harness();
  let nextCalls = 0;
  const next = async () => { nextCalls += 1; return 'rejected'; };
  assert.equal(await handler(otherRequest, next), 'rejected');
  assert.equal(nextCalls, 1);

  const other = harness({ preset: 'workspace-write' });
  assert.equal(await other.handler(mcpRequest, next), 'rejected');
  assert.equal(nextCalls, 2);
});

test('returns cancelled for an aborted request', async () => {
  const { handler } = harness();
  let nextCalls = 0;
  const outcome = await handler({ ...mcpRequest, signal: { aborted: true } }, async () => { nextCalls += 1; return 'rejected'; });
  assert.equal(outcome, 'cancelled');
  assert.equal(nextCalls, 0);
});

test('falls back when the permission service or projection is unavailable', async () => {
  for (const options of [{ permission: false }, { preset: null }]) {
    const { handler } = harness(options);
    let nextCalls = 0;
    assert.equal(await handler(mcpRequest, async () => { nextCalls += 1; return 'rejected'; }), 'rejected');
    assert.equal(nextCalls, 1);
  }
});

test('exposes auto-approval state for notification suppression', () => {
  const active = harness();
  assert.equal(active.autoApproves({}, 'mcp__playwright__browser_navigate'), true);
  assert.equal(active.autoApproves({}, 'bash'), false);
  const inactive = harness({ preset: 'workspace-write' });
  assert.equal(inactive.autoApproves({}, 'mcp__playwright__browser_navigate'), false);
});

test('adds the model-facing note only while the preset is current', () => {
  const active = harness();
  assert.match(active.note(), /pre-approved/);
  const inactive = harness({ preset: 'workspace-write' });
  assert.equal(inactive.note(), '');
  const noInject = harness({ withInject: false });
  assert.equal(noInject.note(), undefined);
});
