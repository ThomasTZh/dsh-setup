import assert from 'node:assert/strict';
import test from 'node:test';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {apply,decision} from './policy.mjs';

// Point at a real toolkit with MATLAB_TOOLKIT; the default matches the
// recorded install location closely enough for the path rules under test.
const TOOLKIT=process.env.MATLAB_TOOLKIT??join(homedir(),'.matlab','agentic-toolkits','matlab','skills-catalog');

const MATLAB_CORE_SKILLS=[
  'matlab-create-live-script','matlab-debug-code','matlab-install-products','matlab-list-products',
  'matlab-read-documentation','matlab-review-code','matlab-run-tests','matlab-write-tests',
];

test('MATLAB mode permits only official MATLAB Core skills and MATLAB tools',()=>{
  for(const tool of ['mcp__matlab__evaluate_matlab_code','search_matlab_skills','read_matlab_skill']) {
    assert.equal(decision(tool,{},'/tmp/project','matlab'),'allow');
    for(const mode of ['general','everyday','web']) assert.equal(decision(tool,{},'/tmp/project',mode),'deny');
  }
  const paths=[join(TOOLKIT,'a','SKILL.md')];
  assert.equal(decision('read_files',{paths},'/tmp','matlab'),'allow');
  for(const name of MATLAB_CORE_SKILLS) assert.equal(decision('skill',{name},'/tmp','matlab'),'allow');
  for(const name of ['matlab-execute-debug','matlab-biomedical-signals','matlab-biomedical-images']) {
    assert.equal(decision('skill',{name},'/tmp','matlab'),'deny');
  }
  assert.equal(decision('mcp__playwright__browser_navigate',{},'/tmp','matlab'),'ask');
});

test('remaining modes reject MATLAB tools and skill loads',()=>{
  assert.equal(decision('mcp__matlab__evaluate_matlab_code',{code:'disp(1)'}),'deny');
  for(const name of ['matlab-review-code','matlab-debug-code','matlab-agentic-toolkit:matlab-review-code']) {
    assert.equal(decision('skill',{name}),'deny');
  }
  assert.equal(decision('skill',{name:'example-skill'}),'allow');
  assert.equal(decision('skill',{name:'example-skill'},'/tmp','matlab'),'allow');
  assert.equal(decision('read',{file_path:'/tmp/project/function.m'}),'allow');
  assert.equal(decision('read_files',{file_paths:['/tmp/project/function.m',join(homedir(),'.agents','skills','matlab-review-code','SKILL.md')]}),'deny');
});

test('ordinary file edits are unrestricted by the removed review policy',()=>{
  assert.equal(decision('write',{file_path:'/tmp/project/function.m',content:'function f; end'}),'allow');
  assert.equal(decision('edit',{file_path:'/tmp/project/MATLAB_CODE_REVIEW.md'}),'allow');
});

test('bounded local web tools are allowed in every mode',()=>{
  for(const name of ['mcp__web__web_search','mcp__web__web_fetch','mcp__web__web_crawl']) {
    assert.equal(decision(name,{},'/tmp/project','general'),'allow');
    assert.equal(decision(name,{},'/tmp/project','matlab'),'allow');
  }
});

test('browser execution still requires approval before proceeding',async()=>{
  let handler;
  let approved=false;
  let executions=0;
  let requests=0;
  apply({on:(_event,fn)=>{handler=fn;},approval:{request:async()=>{requests++;return approved?'allowed-once':'denied';}}});
  const exec={agent:{id:'everyday'},name:'mcp__playwright__browser_navigate',arguments:{url:'https://example.com'}};
  const next=async()=>{executions++;return {ok:true};};
  assert.equal((await handler(exec,next)).error.code,'LOCAL_POLICY_BLOCKED');
  assert.equal(executions,0);
  approved=true;
  assert.deepEqual(await handler(exec,next),{ok:true});
  assert.equal(executions,1);
  assert.equal(requests,2);
  assert.equal((await handler({...exec,name:'mcp__matlab__run_matlab_file'},next)).error.code,'LOCAL_POLICY_BLOCKED');
  assert.equal(executions,1);
  assert.equal(requests,2);
});
