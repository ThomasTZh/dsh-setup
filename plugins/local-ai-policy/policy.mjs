import {realpathSync} from 'node:fs';
import {resolve} from 'node:path';

export const name='local-ai-policy';
export const inject=['tools','approval'];

const READ_TOOLS=new Set(['read','read_file','read_files','glob','grep']);
const WEB_TOOLS=new Set(['mcp__web__web_search','mcp__web__web_fetch','mcp__web__web_crawl']);
const MATLAB_CORE_SKILLS=new Set([
  'matlab-create-live-script','matlab-debug-code','matlab-install-products','matlab-list-products',
  'matlab-read-documentation','matlab-review-code','matlab-run-tests','matlab-write-tests',
]);

export function decision(name,args={},workspaceRoot=process.cwd(),mode='general',workspaceOnly=false) {
  if(WEB_TOOLS.has(name)) return 'allow';
  if(mode==='matlab' && (name.startsWith('mcp__matlab__') || ['search_matlab_skills','read_matlab_skill'].includes(name))) return 'allow';
  if(name.startsWith('mcp__matlab__') || ['search_matlab_skills','read_matlab_skill'].includes(name)) return 'deny';
  if(name.startsWith('mcp__playwright__')) return 'ask';
  if(name==='skill') {
    const skill=String(args.name??'');
    if(skill.startsWith('matlab-') || skill.startsWith('matlab-agentic-toolkit:')) {
      return mode==='matlab' && MATLAB_CORE_SKILLS.has(skill) ? 'allow' : 'deny';
    }
  }
  if(READ_TOOLS.has(name)) {
    const paths=name==='read_files' ? (args.file_paths??args.paths) : undefined;
    if(paths!==undefined) {
      return Array.isArray(paths) && paths.every(path=>decision('read',{file_path:path},workspaceRoot,mode,workspaceOnly)==='allow') ? 'allow' : 'deny';
    }
    let path=resolve(workspaceRoot,String(args.filePath??args.path??args.file_path??''));
    try {path=realpathSync(path);}catch{}
    let root=resolve(workspaceRoot);
    try {root=realpathSync(root);}catch{}
    if(workspaceOnly && path!==root && !path.startsWith(root+'/')) return 'deny';
    if(mode!=='matlab' && (path.includes('/.matlab/agentic-toolkits/') ||
       path.includes('/.config/local-ai/skills/matlab') ||
       /\/\.(agents|codex|dsh)\/skills\/matlab-/.test(path))) return 'deny';
  }
  return 'allow';
}

function blocked(action) {
  return {isError:true,content:[{type:'text',text:`Blocked by local AI mode policy (${action}).`}],error:{code:'LOCAL_POLICY_BLOCKED',message:'Operation not approved'}};
}

export async function apply(ctx,config={}) {
  ctx.on('tools/execute',async(exec,next)=>{
    const workspaceRoot=exec.agent?.session?.header?.cwd??process.cwd();
    const action=decision(exec.name,exec.arguments,workspaceRoot,config.mode,!!config.workspaceOnly);
    if(action==='allow') return next();
    if(action==='ask' && exec.agent) {
      const outcome=await ctx.approval.request({agent:exec.agent,toolName:exec.name,callId:exec.callId,signal:exec.signal,
        reason:'Your local AI mode policy asks before this operation. Arguments: '+JSON.stringify(exec.arguments).slice(0,3000)});
      if(outcome==='allowed-once') return next();
    }
    return blocked(action);
  });
}
