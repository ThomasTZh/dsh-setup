import assert from 'node:assert/strict';
import test from 'node:test';
import { apply } from '../lib/index.js';

function fixture({auto, sender} = {}) {
  const messages = [];
  const handlers = new Map();
  const session = id => ({id, header: {cwd: '/tmp/project'}});
  const root = {id: 'root', session: session('root')};
  const child = {id: 'child', session: session('child')};
  const registry = new Map([[root.id, root], [child.id, child]]);
  const ctx = {
    agents: {get: id => registry.get(id), roots: () => [root]},
    on: (name, handler, options) => handlers.set(name, {handler, options}),
    get: name => name === 'mcpAutoPermission' ? auto : undefined,
  };
  apply(ctx, {}, sender ?? (message => messages.push(message)));
  return {messages, handlers, root, child};
}

test('notifies once for a root approval and preserves the decision', async () => {
  const {messages, handlers, root, child} = fixture();
  const {handler, options} = handlers.get('approval/request');
  assert.equal(options.prepend, true);
  let decisions = 0;
  const next = async () => { decisions += 1; return 'rejected'; };
  const request = {agent: root, toolName: 'bash'};
  assert.equal(await handler(request, next), 'rejected');
  assert.equal(await handler(request, next), 'rejected');
  await handler({agent: child, toolName: 'bash'}, next);
  await handler({agent: root, toolName: 'bash', signal: {aborted: true}}, next);
  assert.equal(decisions, 4);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].kind, 'attention');
  assert.equal(messages[0].reason, 'approval required');
});

test('notifies for a user question but never for a completed turn', async () => {
  const {messages, handlers, root} = fixture();
  await handlers.get('user-questions/request').handler({agent: root}, async () => ({answer: 'ok'}));
  assert.equal(messages.length, 1);
  assert.equal(messages[0].reason, 'question requires an answer');
  assert.equal(handlers.has('session/event'), false);
});

test('skips approval notifications claimed by mcp-auto-permission', async () => {
  const auto = {autoApproves: (_session, toolName) => toolName.startsWith('mcp__')};
  const {messages, handlers, root} = fixture({auto});
  const next = async () => 'allowed-once';
  const handler = handlers.get('approval/request').handler;
  await handler({agent: root, toolName: 'mcp__playwright__browser_navigate'}, next);
  assert.equal(messages.length, 0);
  await handler({agent: root, toolName: 'bash'}, next);
  assert.equal(messages.length, 1);
});

test('a throwing auto-approval lookup falls back to notifying', async () => {
  const auto = {autoApproves: () => { throw new Error('lookup failed'); }};
  const {messages, handlers, root} = fixture({auto});
  await handlers.get('approval/request').handler({agent: root, toolName: 'mcp__playwright__browser_navigate'}, async () => 'allowed-once');
  assert.equal(messages.length, 1);
});

test('sender failures do not escape or delay the decision', async () => {
  const {handlers, root} = fixture({sender: () => { throw new Error('phone unavailable'); }});
  const handler = handlers.get('approval/request').handler;
  assert.equal(await handler({agent: root, toolName: 'bash'}, async () => 'rejected'), 'rejected');
});
