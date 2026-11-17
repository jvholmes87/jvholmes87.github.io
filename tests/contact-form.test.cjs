const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../contact/form.js'), 'utf8');
function setup(response) {
  const handlers = {};
  let options, script, requests = 0, resets = 0;
  const form = {addEventListener: (event, fn) => handlers[event] = fn, reportValidity: () => true, reset: () => resets++};
  const send = {disabled: true};
  const status = {textContent: ''};
  const elements = {'professional-contact': form, 'contact-submit': send, 'contact-status': status, 'turnstile-container': {}};
  const context = {
    document: {getElementById: id => elements[id], createElement: () => script = {}, head: {appendChild(){}}},
    window: {PORTFOLIO_CONTACT_CONFIG: {formId: 'abcdef', turnstileSiteKey: 'sitekey123'}, turnstile: {render: (_, opts) => {options = opts; return 0;}, reset: () => options.callback('fresh-token')}},
    FormData: class {set(){}},
    fetch: async () => { requests++; return await response(); }
  };
  vm.runInNewContext(source, context);
  script.onload();
  return {form,send,status,handlers,get options(){return options;},get requests(){return requests;},get resets(){return resets;},submit: () => handlers.submit({preventDefault(){}})};
}
(async () => {
  for (const [label,response,expected] of [
    ['success',async()=>({ok:true}), 'Your message was submitted successfully. Thank you.'],
    ['rate limit',async()=>({ok:false,status:429}), 'Too many requests. Please wait and try again.'],
    ['server error',async()=>({ok:false,status:500}), "We couldn't send your message. Please verify again and retry."],
    ['network error',async()=>{throw Error('offline');}, 'Network error. Please check your connection and try again.']
  ]) {
    const h=setup(response); h.options.callback('token'); await h.submit();
    assert.equal(h.status.textContent, expected, label+' survives reset callback');
    h.options['expired-callback'](); assert.equal(h.status.textContent, expected);
    h.options['error-callback'](); assert.equal(h.status.textContent, expected);
    assert.equal(h.resets,label==='success'?1:0);
    h.handlers.input(); assert.equal(h.status.textContent,'Complete the verification to send your message.');
    console.log('PASS '+label+' status persists; editing resumes verification guidance');
  }
  const missing=setup(async()=>({ok:true})); await missing.submit(); assert.equal(missing.requests,0);
  console.log('PASS missing token never reaches fetch');
  const invalid=setup(async()=>({ok:true})); invalid.form.reportValidity=()=>false; invalid.options.callback('token');await invalid.submit();assert.equal(invalid.requests,0);
  console.log('PASS invalid fields never reach fetch');
  let release; const pending=setup(()=>new Promise(resolve=>release=resolve));pending.options.callback('token');const first=pending.submit();pending.options.callback('another-token');assert.equal(pending.send.disabled,true);await pending.submit();assert.equal(pending.requests,1);release({ok:true});await first;
  console.log('PASS verification callbacks cannot enable duplicate in-flight submission');
})().catch(error=>{console.error(error);process.exitCode=1;});
