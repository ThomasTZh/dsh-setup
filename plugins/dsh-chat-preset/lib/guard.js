/**
 * Chat preset guard: keep only the model-facing web and skill tools visible
 * for every agent that joins this preset.
 *
 * The preset's own tools are registered in the shared preset scope, while the
 * Host also registers a few global tools (for example `working_directory`).
 * A restriction at the preset scope would filter the preset's own tools too,
 * so this listener applies the restriction to each joining agent's own scope
 * once that agent exists. The web allow list is read from the agent's visible
 * tools, so it tolerates a search-only or fetch-only configuration.
 */

export const name = 'dsh-chat-preset-guard'

/** `tools` is the registry this preset narrows; no other service is touched. */
export const inject = ['tools']

/**
 * Model-facing tool kept alongside the web pair: the skill loader reads only
 * the skill files the discovery provider exposes, never a workspace path.
 */
const SKILL_TOOL = 'skill'

/**
 * Apply the restriction to the agent that just joined this preset.
 *
 * @param ctx - the preset scope's context.
 */
export function apply(ctx) {
  ctx.on('agent/created', ({ agent }) => {
    try {
      const visibleTools = agent.ctx.tools.schemas().map((schema) => schema.name)
      const webTools = visibleTools.filter(
        (toolName) => toolName === 'web_search' || toolName === 'web_fetch',
      )

      if (webTools.length === 0) {
        ctx.logger.warn('chat preset: web tools are not registered; inherited tools left unrestricted')
        return
      }

      const allow = visibleTools.includes(SKILL_TOOL) ? [...webTools, SKILL_TOOL] : webTools
      agent.ctx.tools.restrict({ allow })
    } catch (error) {
      ctx.logger.warn(`chat preset: could not restrict inherited tools: ${String(error)}`)
    }
  })
}
