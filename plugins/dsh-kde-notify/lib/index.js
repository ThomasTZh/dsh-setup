import {deliver, notify} from '../../../notifications.mjs';

export const name = 'kde-notify';
export const inject = ['agents'];

/**
 * Alert a KDE Connect device when a human decision is actually required.
 * Turn completion and task failures are deliberately not notified.
 * @param ctx Cordis context for the profile root.
 * @param config Unused compatibility object.
 * @param sender Test-injectable notification sender.
 */
export function apply(ctx, config = {}, sender = notify) {
  const requests = new WeakSet();
  const isRoot = agent => agent && ctx.agents.get(agent.id) === agent && ctx.agents.roots().includes(agent);
  const send = (agent, notification) => deliver(sender, {
    app: 'DSH', ...notification, workspace: agent.session.header.cwd, sessionID: agent.id,
  });
  const autoApproves = (agent, toolName) => {
    let service;
    try {
      service = ctx.get?.('mcpAutoPermission');
    } catch {
      return false;
    }
    if (service === undefined) return false;
    try {
      return service.autoApproves(agent?.session, toolName) === true;
    } catch {
      return false;
    }
  };

  for (const [event, reason] of [
    ['approval/request', 'approval required'],
    ['user-questions/request', 'question requires an answer'],
  ]) {
    ctx.on(event, (request, next) => {
      const approval = event === 'approval/request';
      if (isRoot(request.agent) && !request.signal?.aborted && !requests.has(request)
          && !(approval && autoApproves(request.agent, request.toolName))) {
        requests.add(request);
        send(request.agent, {kind: 'attention', reason});
      }
      return next();
    }, {prepend: true});
  }
}
