/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner uses CommonJS. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../features/subscriptions/checkout-safety.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};vm.runInNewContext('(function(exports){'+code+'\n})')(mod.exports);
const {canStartCheckout,checkoutErrorMessage}=mod.exports;
const ready={loading:false,checkoutLoading:false,confirmingCheckout:false,paymentUnconfirmed:false,subscriptionData:{hasAccess:false}};
test('only confirmed lack of access permits starting Checkout',()=>{
  assert.equal(canStartCheckout(ready),true);
  for(const patch of [{loading:true},{checkoutLoading:true},{confirmingCheckout:true},{paymentUnconfirmed:true},{subscriptionData:null},{subscriptionData:{hasAccess:true}}]) {
    assert.equal(canStartCheckout({...ready,...patch}),false);
  }
});
test('conflicts and ambiguous older payment attempts explain recovery without inviting another payment',()=>{
  for(const code of ['SUBSCRIPTION_ALREADY_EXISTS','CHECKOUT_RECONCILIATION_REQUIRED']) {
    assert.match(checkoutErrorMessage({response:{data:{code}}}),/antes de volver a pagar/);
  }
  assert.match(checkoutErrorMessage(null),/mismo intento pendiente/);
});


function pageHarness(options={}) {
  const state=[],effects=[],calls=[],refs=[];let cursor=0,refCursor=0;
  const router={replace:url=>calls.push(['route',url])};
  const mocks={
    react:{...require('react'),useState:initial=>{const index=cursor++;if(!(index in state))state[index]=initial;return [state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];},
      useRef:initial=>{const i=refCursor++;return refs[i]??(refs[i]={current:initial});},useCallback:fn=>fn,useEffect:fn=>effects.push(fn)},
    'next/navigation':{useRouter:()=>router},
    sonner:{toast:{info:(...args)=>calls.push(['info',...args]),error:(...args)=>calls.push(['error',...args]),success:()=>{}}},
    '@/components/ui/button':{Button:'button'},
    '@/features/auth/storage/token-storage':{tokenStorage:{remove(){}}},
    '@/features/subscriptions/checkout-safety':mod.exports,
    '@/features/subscriptions/services/subscriptions.service':{subscriptionsService:{
      getCurrent:async()=>{if(options.loadFails)throw Error('Offline');return {hasAccess:false,subscription:null};},
      createCheckout:async()=>{calls.push(['checkout']);if(options.conflict)throw {response:{data:{code:'SUBSCRIPTION_ALREADY_EXISTS'}}};return {checkoutUrl:'https://checkout.stripe.test'};},
    }},
  };
  const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../app/subscription-required/page.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX},fileName:'page.tsx'}).outputText;
  const page={exports:{}};
  vm.runInNewContext('(function(require,module,exports){'+code+'\n})',{
    window:{location:{search:'',assign:url=>calls.push(['assign',url])}},URLSearchParams,setTimeout:fn=>{fn();},
    console:{error(){}},Intl,Date,
  })(name=>name in mocks?mocks[name]:require(name),page,page.exports);
  const render=()=>{cursor=0;refCursor=0;return page.exports.default();};
  const flushEffects=async()=>{for(const fn of effects.splice(0))fn();await new Promise(resolve=>setImmediate(resolve));};
  return {render,flushEffects,calls};
}
function subscribeButton(node) {
  if(!node||typeof node!=='object')return null;
  if(node.type==='button'&&node.props.className?.includes('bg-purple-700'))return node;
  for(const child of [node.props?.children].flat(Infinity)){const found=subscribeButton(child);if(found)return found;}
  return null;
}
async function readyPage(h) {h.render();await h.flushEffects();h.render();await h.flushEffects();return h.render();}
test('real paywall blocks Checkout while subscription lookup is unresolved or fails',async()=>{
  const h=pageHarness({loadFails:true});assert.equal(subscribeButton(h.render()).props.disabled,true);
  await h.flushEffects();h.render();await h.flushEffects();assert.equal(subscribeButton(h.render()).props.disabled,true);
  assert.equal(h.calls.some(c=>c[0]==='checkout'),false);
});
test('real paywall serializes two clicks even before React rerenders',async()=>{
  const h=pageHarness();const button=subscribeButton(await readyPage(h));assert.equal(button.props.disabled,false);
  button.props.onClick();button.props.onClick();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.calls.filter(c=>c[0]==='checkout').length,1);assert.equal(h.calls.filter(c=>c[0]==='assign').length,1);
});
test('real paywall keeps purchase disabled after server reports existing payment',async()=>{
  const h=pageHarness({conflict:true});subscribeButton(await readyPage(h)).props.onClick();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(subscribeButton(h.render()).props.disabled,true);assert.equal(h.calls.some(c=>c[0]==='assign'),false);
});
