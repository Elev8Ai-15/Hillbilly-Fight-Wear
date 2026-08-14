// Floating chat widget for the "Merica" chat agent (see utils/chat.ts).
// Injected before </body> on all public pages; needs the page's CSP nonce.
export function chatWidget(nonce: string): string {
  return `<div id="hfwChat">
  <button id="hfwChatBtn" aria-label="Chat with us" title="Chat with us">&#128172;</button>
  <div id="hfwChatPanel" role="dialog" aria-label="Chat with Hillbilly Fightwear">
    <div id="hfwChatHead">Merica &mdash; Hillbilly Fightwear<button id="hfwChatClose" aria-label="Close chat">&times;</button></div>
    <div id="hfwChatMsgs" aria-live="polite"></div>
    <form id="hfwChatForm">
      <input id="hfwChatInput" type="text" maxlength="500" placeholder="Ask about sizes, gear, shipping..." autocomplete="off">
      <button type="submit" aria-label="Send">&#10148;</button>
    </form>
  </div>
</div>
<style nonce="${nonce}">
  #hfwChat { position: fixed; right: 18px; bottom: 18px; z-index: 9990; font-family: 'Oswald', sans-serif; }
  #hfwChatBtn { width: 56px; height: 56px; border-radius: 50%; border: 0; background: #8B0000; color: #fff; font-size: 26px; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.35); }
  #hfwChatBtn:hover { background: #a31111; }
  #hfwChatPanel { display: none; position: fixed; right: 18px; bottom: 84px; width: 340px; max-width: calc(100vw - 36px); height: 440px; max-height: 70vh; background: #141414; color: #f2f2f2; border: 1px solid #333; border-radius: 10px; overflow: hidden; flex-direction: column; box-shadow: 0 8px 30px rgba(0,0,0,.5); }
  #hfwChat.open #hfwChatPanel { display: flex; }
  #hfwChatHead { background: #0c0c0c; border-bottom: 2px solid #8B0000; padding: 10px 14px; font-weight: 700; letter-spacing: .05em; display: flex; justify-content: space-between; align-items: center; }
  #hfwChatClose { background: none; border: 0; color: #aaa; font-size: 20px; cursor: pointer; }
  #hfwChatMsgs { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .hfwMsg { max-width: 85%; padding: 8px 12px; border-radius: 10px; font-size: 14px; line-height: 1.45; white-space: pre-wrap; word-wrap: break-word; }
  .hfwMsg.user { align-self: flex-end; background: #8B0000; color: #fff; }
  .hfwMsg.bot { align-self: flex-start; background: #262626; }
  .hfwMsg.bot a { color: #ff6b9d; }
  .hfwMsg.typing { color: #999; font-style: italic; }
  #hfwChatForm { display: flex; border-top: 1px solid #333; }
  #hfwChatInput { flex: 1; min-width: 0; background: #1c1c1c; border: 0; padding: 12px; color: #fff; font-family: inherit; font-size: 14px; }
  #hfwChatInput:focus { outline: 1px solid #8B0000; }
  #hfwChatForm button { background: #8B0000; color: #fff; border: 0; padding: 0 16px; font-size: 16px; cursor: pointer; }
</style>
<script nonce="${nonce}">
(function() {
  var GREETING = "Howdy! I'm Merica. Ask me about our gear, sizes, the 2-for-$50 deal — or let me walk you through building your own custom piece.";
  var root = document.getElementById('hfwChat');
  var msgsEl = document.getElementById('hfwChatMsgs');
  var input = document.getElementById('hfwChatInput');
  var history = [];
  try { history = JSON.parse(sessionStorage.getItem('hfw_chat') || '[]'); } catch (e) {}

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function render(role, text) {
    var div = document.createElement('div');
    div.className = 'hfwMsg ' + (role === 'user' ? 'user' : 'bot');
    // linkify /product/... , /build , /#shop , /contact paths (escaped first)
    div.innerHTML = esc(text).replace(/(^|\\s)(\\/(?:product\\/[a-z0-9-]+|build|contact|#shop))(?=[\\s.,!?]|$)/g,
      function(m, pre, path) { return pre + '<a href="' + path + '">' + path + '</a>'; });
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return div;
  }

  function open() {
    root.classList.add('open');
    if (!msgsEl.childElementCount) {
      render('bot', GREETING);
      history.forEach(function(m) { render(m.role, m.content); });
    }
    input.focus();
  }
  document.getElementById('hfwChatBtn').addEventListener('click', function() {
    root.classList.contains('open') ? root.classList.remove('open') : open();
  });
  document.getElementById('hfwChatClose').addEventListener('click', function() { root.classList.remove('open'); });

  var busy = false;
  document.getElementById('hfwChatForm').addEventListener('submit', function(ev) {
    ev.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    input.value = '';
    render('user', text);
    history.push({ role: 'user', content: text });
    if (history.length > 18) history = history.slice(-18);
    var typing = render('bot', '...');
    typing.classList.add('typing');
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        typing.remove();
        var reply = d.reply || d.error || 'Something went sideways. Email brian@hillbillyfightwear.com.';
        render('bot', reply);
        if (d.reply) {
          history.push({ role: 'assistant', content: d.reply });
          try { sessionStorage.setItem('hfw_chat', JSON.stringify(history)); } catch (e) {}
        }
      })
      .catch(function() {
        typing.remove();
        render('bot', 'Something went sideways. Email brian@hillbillyfightwear.com and we\\u2019ll get you sorted.');
      })
      .then(function() { busy = false; });
  });
})();
</script>`
}
