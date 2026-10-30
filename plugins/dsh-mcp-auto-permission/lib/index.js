/**
 * MCP auto-approval for the Workspace Write + MCP permission preset.
 *
 * The preset itself is declared by this bundle's cordis.patch.yml. This plugin
 * only claims approval requests for MCP tools while that preset is current, so
 * an existing policy that asks before an MCP call no longer reaches the user.
 *
 * It deliberately does not touch tool execution or deny decisions. A policy
 * that hard-denies an MCP tool before asking remains authoritative.
 */

export const name = 'mcp-auto-permission';
export const inject = [];

const DEFAULT_PRESET = 'workspace-write-mcp';
const DEFAULT_MCP_PREFIX = 'mcp__';
const NOTE = 'Permission mode Workspace Write + MCP is active. MCP tool calls (names starting with mcp__) are pre-approved and must run without an approval prompt. This supersedes generic instructions that browser or MCP actions require approval; do not pause for approval on MCP tools. Keep requesting task authorization for consequential external actions where the task itself requires it.';

/** Resolve one session's effective permission preset without throwing. */
function presetOf(ctx, session) {
  if (session === undefined) return undefined;
  let service;
  try {
    service = ctx.get('permissionPresets');
  } catch {
    return undefined;
  }
  if (service === undefined) return undefined;
  try {
    return service.current(session);
  } catch {
    return undefined;
  }
}

/**
 * @param ctx Cordis context for the profile root.
 * @param config Optional preset and MCP tool prefix overrides.
 */
export function apply(ctx, config = {}) {
  const preset = config.preset ?? DEFAULT_PRESET;
  const mcpPrefix = config.mcpPrefix ?? DEFAULT_MCP_PREFIX;
  const autoApproves = (session, toolName) =>
    typeof toolName === 'string' && toolName.startsWith(mcpPrefix) && presetOf(ctx, session) === preset;

  if (typeof ctx.provide === 'function') ctx.provide('mcpAutoPermission', { autoApproves });

  ctx.on('approval/request', async (req, next) => {
    if (req.signal?.aborted) return 'cancelled';
    if (!autoApproves(req.agent?.session, req.toolName)) return next();
    return 'allowed-once';
  }, { prepend: true });

  if (typeof ctx.inject === 'function') {
    ctx.inject(['systemPrompt'], (scope) => {
      scope.systemPrompt.context({
        name: 'mcp-auto-permission:note',
        order: scope.systemPrompt.getContextOrder('APPROVAL_POLICY') + 1,
        text: (context) => presetOf(ctx, context.agent?.session) === preset ? NOTE : '',
      });
    });
  }
}
