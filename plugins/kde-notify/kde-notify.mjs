import {deliver, notify, remember} from '../notifications.mjs';

export const name = 'kde-notify';
export const inject = ['agents'];

export function apply(ctx, config = {}, sender = notify) {
  const fresh = remember();
  const startedAt = Date.now();
  const requests = new WeakSet();
  const isRoot = agent => agent && ctx.agents.get(agent.id) === agent && ctx.agents.roots().includes(agent);
  const send = (agent, notification) => deliver(sender, {
    app: 'DSH', ...notification, workspace: agent.session.header.cwd, sessionID: agent.id,
  });
  ctx.on('session/event', (session, event) => {
    const agent = ctx.agents.get(session.id);
    if (!isRoot(agent) || event.time < startedAt || event.type !== 'turn/end') return;
    if (!fresh(`${session.id}:turn:${event.data.turn}`)) return;
    const kind = event.data.reason.kind;
    if (kind === 'completed') send(agent, {kind: 'finished'});
    else if (['error', 'blocked', 'max-tokens'].includes(kind)) {
      const reason = {error: 'task failed', blocked: 'task blocked', 'max-tokens': 'output limit reached'}[kind];
      send(agent, {kind: 'attention', reason});
    }
  });
  for (const [event, reason] of [
    ['approval/request', 'approval required'],
    ['user-questions/request', 'question requires an answer'],
  ]) {
    ctx.on(event, (request, next) => {
      if (isRoot(request.agent) && !request.signal?.aborted && !requests.has(request)) {
        requests.add(request);
        send(request.agent, {kind: 'attention', reason});
      }
      return next();
    }, {prepend: true});
  }
}
