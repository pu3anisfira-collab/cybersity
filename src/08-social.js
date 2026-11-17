/* ============================================================
   BYTE — scripted AI mentor  ·  COMMUNITY — rooms, presence, moderation
   ============================================================ */
const COMMUNITY_USERS = [
  {name:'Aisyah.NetNinja', status:'on', title:'Packet Ranger', look:{skin:'#d39a6a',hairStyle:'hijab',hairColor:'#a46bff',shirt:'#2ee6ff',acc:'none'}},
  {name:'PixelPanda', status:'on', title:'Firewall Cadet', look:{skin:'#ffdcb8',hairStyle:'spiky',hairColor:'#1c1626',shirt:'#ff4fae',acc:'headphones'}},
  {name:'Leo_Learns', status:'on', title:'Newbie', look:{skin:'#f1c08f',hairStyle:'short',hairColor:'#5a3825',shirt:'#47f59a',acc:'glasses'}},
  {name:'Hana.exe', status:'on', title:'Cyber Defender', look:{skin:'#ffdcb8',hairStyle:'long',hairColor:'#ff4fae',shirt:'#a46bff',acc:'none'}},
  {name:'Ravi.Root', status:'idle', title:'Security Guardian', look:{skin:'#a8704a',hairStyle:'curly',hairColor:'#1c1626',shirt:'#ffd447',acc:'cap'}},
  {name:'Mei_Firewall', status:'on', title:'Script Scout', look:{skin:'#f1c08f',hairStyle:'long',hairColor:'#1c1626',shirt:'#ff9a3d',acc:'glasses'}},
  {name:'CipherCat', status:'off', title:'Packet Ranger', look:{skin:'#6e4630',hairStyle:'short',hairColor:'#2ee6ff',shirt:'#3a4596',acc:'headphones'}},
  {name:'Danial_H', status:'off', title:'Script Scout', look:{skin:'#d39a6a',hairStyle:'spiky',hairColor:'#c2793b',shirt:'#eef0fb',acc:'none'}}
];

/* ------------------------- BYTE (scripted mentor) ------------------------- */
const KB = [
  {k:['hello','hi ','hey','salam','good morning','good evening'], a:`Hey there! 👋 I'm BYTE, your cybersecurity mentor. Ask me about any topic from your lessons, like phishing, passwords, firewalls or encryption, or say <b>"quiz me"</b> for a practice question.`},
  {k:['thank','thanks','tq','terima kasih'], a:`Anytime! Learning security is a team sport. Keep going, because every lesson makes you a little harder to hack. 💪`},
  {k:['what is cybersecurity','what\'s cybersecurity','define cybersecurity'], a:`<p><b>Cybersecurity</b> is protecting devices, networks and data from attacks, damage and unauthorised access.</p><p>Think of it like home security for your digital life: locks (passwords), alarms (monitoring), insurance (backups) and knowing not to open the door to strangers (phishing awareness).</p>`},
  {k:['cia','triad','confidentiality','integrity','availability'], a:`<p>The <b>CIA Triad</b> is the three goals of security:</p><ul><li><b>Confidentiality</b>: only the right people can see it (encryption, passwords)</li><li><b>Integrity</b>: it stays accurate and unchanged (hashing, signatures)</li><li><b>Availability</b>: it works when you need it (backups, DDoS protection)</li></ul><p>Tip: when you hear about an attack, ask "which corner did it break?"</p>`},
  {k:['threat','vulnerability','asset','risk'], a:`<p>Easy way to remember:</p><ul><li><b>Asset</b> = what you protect (your phone)</li><li><b>Threat</b> = what could harm it (a thief)</li><li><b>Vulnerability</b> = the weakness (no screen lock)</li><li><b>Risk</b> = chance it happens × how bad it would be</li></ul>`},
  {k:['phish','scam','suspicious email','fake email','suspicious link'], a:`<p><b>Phishing</b> is a message pretending to be someone you trust so you'll click, download or share secrets. Red flags:</p><ul><li>Sender address that's <i>almost</i> right</li><li>Urgency: "act within 24 hours!"</li><li>Links whose real destination doesn't match</li><li>Requests for passwords or OTP/TAC codes</li></ul><p>Golden rule: don't use the link. Go to the official app or website yourself.</p>`},
  {k:['smish','sms','vish','phone call','scam call'], a:`<p><b>Smishing</b> = phishing by SMS, <b>vishing</b> = phishing by voice call. Scammers may pretend to be a courier, bank, police or a government agency.</p><p>Hang up or ignore, then call the organisation using a number from its official website. Real organisations won't pressure you to transfer money or share codes on the spot.</p>`},
  {k:['social engineering','manipulat'], a:`<p><b>Social engineering</b> means hacking people instead of computers, using trust, fear, curiosity or urgency.</p><p>Examples: a caller pretending to be IT support, a USB stick labelled "Salaries" left in the car park, or someone tailgating through a secure door. Pause and verify before you act.</p>`},
  {k:['malware','virus','worm','trojan','spyware','keylogger'], a:`<ul><li><b>Virus</b>: hides in files and spreads when they're shared</li><li><b>Worm</b>: spreads by itself across networks</li><li><b>Trojan</b>: disguised as something useful</li><li><b>Spyware</b>: secretly watches you and steals data</li></ul><p>Best defences: keep software updated, install apps only from official stores, and don't open unexpected attachments.</p>`},
  {k:['ransomware','ransom','encrypted my files'], a:`<p><b>Ransomware</b> locks your files and demands payment.</p><p>If it happens: <b>disconnect from the network</b>, report it immediately and don't pay (it funds criminals and doesn't guarantee recovery). The best protection is <b>offline backups</b> using the 3-2-1 rule.</p>`},
  {k:['password manager'], a:`<p>A <b>password manager</b> is a secure vault that creates and remembers a strong, unique password for every account. You only remember one strong master password.</p><p>Turn on MFA for the manager itself, and you're in great shape.</p>`},
  {k:['password','passphrase','strong password'], a:`<p>Strong password recipe:</p><ul><li><b>Long</b>: 12–16+ characters (length beats complexity)</li><li><b>Unique</b>: never reuse across accounts</li><li><b>Unguessable</b>: no names, birthdays or IC numbers</li></ul><p>Try a passphrase of random words like <code>mango-rocket-quiet-lantern</code>, and let a password manager remember the rest.</p>`},
  {k:['mfa','2fa','two factor','two-factor','multi-factor','otp','authenticator'], a:`<p><b>Multi-factor authentication</b> combines different types of proof:</p><ul><li>Something you <b>know</b> (password)</li><li>Something you <b>have</b> (phone, security key)</li><li>Something you <b>are</b> (fingerprint, face)</li></ul><p>Even if your password leaks, the attacker still needs your second factor. Authenticator apps are safer than SMS codes. And <b>never</b> share an OTP with anyone.</p>`},
  {k:['least privilege','authoris','authoriz','permission','access control'], a:`<p><b>Authentication</b> proves who you are. <b>Authorisation</b> decides what you can do.</p><p><b>Least privilege</b> means giving people only the access they need, so the intern who posts on social media doesn't need access to payroll. Less access = less damage if an account is compromised.</p>`},
  {k:['firewall'], a:`<p>A <b>firewall</b> is like a security guard at the door of your network. It checks traffic against rules and blocks anything not allowed, such as unknown outsiders trying to connect to your computer.</p><p>Your laptop and home router both have one, so keep it switched on.</p>`},
  {k:['vpn'], a:`<p>A <b>VPN</b> creates an encrypted tunnel between your device and the VPN server, so people on the same public Wi-Fi can't snoop on your traffic.</p><p>It doesn't make you invisible or protect you from phishing, so you still need good habits.</p>`},
  {k:['https','http','padlock','ssl','tls'], a:`<p><b>HTTPS</b> means the connection between your browser and the website is encrypted, which you can see from the padlock.</p><p>Careful: the padlock means the connection is private, <i>not</i> that the site is honest. Phishing sites can have HTTPS too, so always check the actual domain name.</p>`},
  {k:['wifi','wi-fi','public network','hotspot','router','wpa'], a:`<p>Wi-Fi safety checklist:</p><ul><li>Home router: change the default admin password, use <b>WPA3</b> (or WPA2), keep firmware updated, turn off WPS</li><li>Public Wi-Fi: avoid banking; use mobile data or a trusted VPN</li><li>Watch for "evil twin" hotspots with look-alike names</li></ul>`},
  {k:['ip address','dns','network','protocol'], a:`<p>Quick network basics:</p><ul><li><b>IP address</b>: a device's address on a network</li><li><b>Router</b>: directs traffic between your network and the internet</li><li><b>DNS</b>: turns names like cybersity.app into IP addresses</li><li><b>Protocol</b>: the rules devices use to talk (HTTP, DNS, SMTP)</li></ul>`},
  {k:['hash'], a:`<p><b>Hashing</b> turns data into a fixed-length fingerprint. It's <b>one-way</b>: you can't turn the hash back into the original.</p><p>Websites store password hashes instead of real passwords, and even a one-letter change produces a completely different hash. Try it in the Lesson 5.1 hash playground!</p>`},
  {k:['encrypt','decrypt','cipher'], a:`<p><b>Encryption</b> scrambles data with a key so only someone with the right key can read it. Unlike hashing, it's <b>reversible</b>.</p><p>You use it every day: HTTPS websites, WhatsApp messages and phone storage are all encrypted.</p>`},
  {k:['backup','3-2-1','321'], a:`<p>The <b>3-2-1 backup rule</b>: keep <b>3</b> copies of important data, on <b>2</b> different types of storage, with <b>1</b> copy offsite or offline.</p><p>It protects you from ransomware, theft, broken drives and accidents.</p>`},
  {k:['log','monitor','soc','siem'], a:`<p><b>Logs</b> are records of events like logins and file access. A <b>SOC</b> (Security Operations Centre) watches them for warning signs:</p><ul><li>Bursts of failed logins</li><li>Logins from unusual places or times</li><li>Surprise new admin accounts</li><li>Huge data transfers at night</li></ul>`},
  {k:['incident','breach','hacked','got hacked','compromised','clicked a link','clicked the link'], a:`<p>If you think something went wrong:</p><ul><li><b>Report it</b> to IT/security straight away (speed matters!)</li><li>Change the affected password, and anywhere else you reused it</li><li>Disconnect an infected device from the network</li><li>Don't delete evidence</li></ul><p>Pros follow: Prepare → Identify → Contain → Eradicate → Recover → Lessons learned.</p>`},
  {k:['policy','governance','risk management','insurance'], a:`<p>Organisations manage risk by rating <b>likelihood × impact</b>, then choosing a response:</p><ul><li><b>Avoid</b>: stop the activity</li><li><b>Reduce</b>: add controls such as MFA and training</li><li><b>Transfer</b>: insurance or a trusted provider</li><li><b>Accept</b>: live with small risks</li></ul><p><b>Policies</b> write those decisions down as rules everyone follows.</p>`},
  {k:['career','job','work in cyber','become a','certification','comptia','cisco','isc2'], a:`<p>Cybersecurity has many paths: SOC analyst, penetration tester, GRC (governance, risk & compliance), security engineer, digital forensics and more.</p><p>After Cybersity, beginners often look at entry-level certifications like ISC2 CC, Cisco CCST Cybersecurity or CompTIA Security+. (Cybersity's certificate is an internal completion certificate, not one of those.)</p>`},
  {k:['xp','level','badge','point'], a:`<p>You earn <b>XP</b> for lessons (+50), activities (+30), quizzes (+40), module assessments (+100) and the final assessment (+250). XP raises your level, from Newbie up to Cyber Sentinel. Badges unlock for special achievements. Check the Achievement Hall!</p>`},
  {k:['certificate'], a:`<p>To earn the <b>Cybersity Certificate of Completion</b>: finish all 12 lessons and activities, pass all 6 module assessments, then pass the final assessment. The Certificate Hall shows a live checklist of what's left.</p>`},
  {k:['how do i','how to use','where','navigate','campus','stuck'], a:`<p>Quick tour: the <b>Cyber Library</b> has your lessons, the <b>Challenge Centre</b> has activities and assessments, the <b>Community Hub</b> is for chatting with other learners, and the <b>Achievement Hall</b> tracks your progress. The top menu jumps anywhere instantly. The Dashboard's <b>Continue</b> button always takes you to your next step.</p>`}
];
const UNSAFE = [/hack (into|my|someone|a|an|her|his|their)/i, /\b(crack|steal|bypass|break into)\b.*(password|account|wifi|instagram|facebook|whatsapp|tiktok)/i, /(make|create|write|build|code).*(virus|malware|ransomware|keylogger|trojan|worm|botnet)/i, /\bddos\b.*(someone|website|server|school)/i, /(spy on|track|read).*(girlfriend|boyfriend|wife|husband|someone|friend)'?s?/i, /phishing (page|site|kit|email) (for|to|that)/i, /(sql injection|exploit) (on|against) /i];
const Mentor = (() => {
  let typing = false, pendingQuiz = null;
  if (!S.mentorLog || !S.mentorLog.length) S.mentorLog = [{from:'bot', html:`Hi! I'm <b>BYTE</b>, your AI Cybersecurity Mentor. Ask me anything about the lessons. I explain things in plain language and can quiz you for practice.`, t:Date.now()}];
  function suggests(){
    const l = S.currentLesson ? lessonById(S.currentLesson) : null;
    const base = l ? [`Explain "${l.title}" simply`, 'Quiz me on this lesson', 'Give me a real-life example'] : ['What is phishing?', 'How do I make a strong password?', 'Quiz me'];
    return [...base, 'What should I do if I clicked a bad link?', 'Can you hack an Instagram account for me?'].slice(0,5);
  }
  function msgHTML(m){
    const me = m.from==='me';
    return `<div class="msg ${me?'me':'bot'} ${m.warn?'warn':''}"><div class="av"><img class="px" alt="" src="${me?avatarURL(S.user.look):BOT_URL}"></div><div style="min-width:0"><div class="meta">${me?esc(S.user.name):'BYTE · AI mentor'} · ${hhmm(new Date(m.t))}</div><div class="bubble">${m.html}</div></div></div>`;
  }
  function chatHTML(mode){
    const l = S.currentLesson ? lessonById(S.currentLesson) : null;
    return `<div class="chat"><div class="chat-head"><img class="px" src="${BOT_URL}" alt="" style="width:26px;height:30px"><div style="flex:1;min-width:0"><b class="label" style="font-size:13px">BYTE</b><div style="font-size:12px;color:var(--muted)">${l?`Lesson context: ${esc(l.title)}`:'AI Cybersecurity Mentor'}</div></div><span class="dot" title="Online"></span>${mode==='drawer'?`<button class="icon-btn" style="width:32px;height:32px" data-act="toggleDrawer" aria-label="Close mentor">${icon('close','#9aa3da',14)}</button>`:''}</div>
      <div class="chat-log mentor-log" aria-live="polite"></div>
      <div class="suggests">${suggests().map(s=>`<button data-act="mentorSuggest" data-arg="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <form class="chat-input mentor-form"><input class="input" placeholder="Ask BYTE a cybersecurity question…" maxlength="300" aria-label="Message BYTE"><button class="btn purple" type="submit">Send</button></form>
      <div class="disclaimer">Prototype: BYTE gives scripted answers here. The full system connects to a live AI service with lesson context and safety filters.</div></div>`;
  }
  function paint(){
    document.querySelectorAll('.mentor-log').forEach(el=>{ el.innerHTML = S.mentorLog.map(msgHTML).join('') + (typing?`<div class="msg bot"><div class="av"><img class="px" alt="" src="${BOT_URL}"></div><div class="bubble typing"><span></span><span></span><span></span></div></div>`:''); el.scrollTop = el.scrollHeight; });
  }
  function bind(root){
    root.querySelectorAll('.mentor-form').forEach(f=> f.addEventListener('submit', e=>{ e.preventDefault(); const i=f.querySelector('input'); const v=i.value.trim(); if (!v) return; i.value=''; ask(v); }));
    paint();
  }
  function lessonExplain(l){
    return `<p>Here's <b>${esc(l.title)}</b> in simple terms:</p><ul>${l.concept.points.slice(0,4).map(([t,d])=>`<li><b>${esc(t)}</b>: ${esc(d)}</li>`).join('')}</ul><p>Real-life example: ${l.scenario.story.replace(/<[^>]+>/g,'')}</p><p>Want me to <b>quiz you</b> on it?</p>`;
  }
  function reply(text){
    const t = ' '+text.toLowerCase()+' ';
    if (pendingQuiz){ const m = t.trim().match(/^([abcd])\b/); if (m){ const q=pendingQuiz; pendingQuiz=null; const i='abcd'.indexOf(m[1]); return i===q.a ? `✅ <b>Correct!</b> ${esc(q.e)} Say "quiz me" for another.` : `Not quite. The answer is <b>${'ABCD'[q.a]}: ${esc(q.o[q.a])}</b>. ${esc(q.e)}`; } pendingQuiz=null; }
    if (UNSAFE.some(r=>r.test(text))) return {warn:true, html:`<p>🛡️ I can't help with getting into accounts, devices or networks you don't own, or with creating malware. That's illegal and harms real people.</p><p>What I <i>can</i> do is explain how those attacks work at a high level so you can <b>defend</b> against them. For example, ask me "how do attackers steal Instagram accounts and how do I protect mine?"</p>`};
    if (/quiz me|test me|practice question/.test(t)){ const l = S.currentLesson ? lessonById(S.currentLesson) : pick(ALL_LESSONS); const q = prepQ(pick([...l.quiz])); pendingQuiz = q; return `<p>Practice question on <b>${esc(l.title)}</b>:</p><p><b>${esc(q.q)}</b></p><ul style="list-style:none;padding-left:0">${q.o.map((o,i)=>`<li><b>${'ABCD'[i]}.</b> ${esc(o)}</li>`).join('')}</ul><p>Reply with A, B, C or D.</p>`; }
    if (/explain .*(simpl|terms)|in simple terms|this lesson|example/.test(t) && S.currentLesson){ const l=lessonById(S.currentLesson); if (/example/.test(t)) return `<p>Real-life example from <b>${esc(l.title)}</b>:</p><p>${l.scenario.story}</p><p><i>${esc(l.scenario.question)}</i> Hint: ${esc(l.scenario.options.find(o=>o.ok).fb)}</p>`; return lessonExplain(l); }
    const titleHit = ALL_LESSONS.find(l=> t.includes(l.title.toLowerCase())); if (titleHit) return lessonExplain(titleHit);
    let best=null, score=0; KB.forEach(e=>{ const s = e.k.filter(k=>t.includes(k)).length; if (s>score){ score=s; best=e; } });
    if (best) return best.a;
    return `<p>Good question! In this prototype I know the core beginner topics: phishing, malware, passwords, MFA, networks, firewalls, encryption, hashing, logs, risk and incident response.</p><p>In the full Cybersity platform, I'd send your question to a live AI model with your lesson as context. Try rephrasing with one of those topics, or tap a suggestion below.</p>`;
  }
  function ask(text){
    if (typing) return;
    S.mentorLog.push({from:'me', html:esc(text), t:Date.now()}); typing=true; paint();
    timers.push(setTimeout(()=>{}, 0));
    setTimeout(()=>{
      const r = reply(text); typing=false;
      S.mentorLog.push(typeof r==='string' ? {from:'bot', html:r, t:Date.now()} : {from:'bot', html:r.html, warn:r.warn, t:Date.now()});
      S.mentorLog = S.mentorLog.slice(-40); S.mentorCount++; save(); paint();
      if (S.mentorCount<=10) addXP(XP.mentor, 'Asked BYTE a question');
      if (S.mentorCount===3) award('curious');
    }, 700 + Math.random()*700);
  }
  function openDrawer(){ UI.drawer=true; const d=$('#drawer'); if (!d) return; d.innerHTML = chatHTML('drawer'); d.classList.remove('hidden'); bind(d); const i=d.querySelector('input'); if (i) i.focus({preventScroll:true}); }
  function toggleDrawer(){ if (UI.drawer){ UI.drawer=false; $('#drawer').classList.add('hidden'); } else openDrawer(); }
  function reset(){ S.mentorLog = [{from:'bot', html:`Hi! I'm <b>BYTE</b>, your AI Cybersecurity Mentor. Ask me anything about the lessons.`, t:Date.now()}]; pendingQuiz=null; }
  return { chatHTML, bind, ask, openDrawer, toggleDrawer, reset, paint };
})();
function viewMentor(el){
  const l = S.currentLesson ? lessonById(S.currentLesson) : null;
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · AI Lab</div><h1>AI Lab</h1><p>BYTE explains cybersecurity concepts in plain language, gives examples and quizzes you for practice. It never does your graded quizzes for you.</p></div></div>
  <div class="mentor-layout">
    <aside class="grid" style="align-content:start">
      <div class="mentor-card"><img class="px" src="${BOT_URL}" alt=""><h2>BYTE</h2><p class="muted" style="font-size:13px; margin-top:6px">AI Cybersecurity Mentor · Online</p>${l?`<div class="pill purple" style="margin-top:12px; display:inline-block">Context: ${esc(l.title)}</div>`:''}</div>
      <div class="panel"><div class="section-title">I can help you</div><ul class="recap-list" style="margin:0; font-size:14px">${['Explain a lesson in simpler words','Give real-world examples','Quiz you for practice','Suggest what to do in a security situation'].map(t=>`<li>${t}</li>`).join('')}</ul></div>
      <div class="panel"><div class="section-title">Campus tour</div><p style="font-size:13.5px">Want me to walk you around the campus again?</p><button class="btn purple small" style="margin-top:10px" data-act="tourReplay">Replay campus tour</button></div>
      <div class="panel safety-panel"><div class="section-title" style="color:var(--pink-ink)">Safety rules</div><p style="font-size:13.5px">BYTE teaches defence. It won't help with hacking accounts, making malware or anything illegal. Try the last suggestion chip to see how it responds.</p></div>
    </aside>
    <div id="mentorPage">${Mentor.chatHTML('page')}</div>
  </div>`;
  Mentor.bind($('#mentorPage'));
}

/* ------------------------- COMMUNITY ------------------------- */
const ROOMS = [
  {id:'lounge', name:'General Lounge', d:'Say hi and hang out'},
  {id:'help', name:'Help Desk', d:'Stuck on something? Ask here'},
  {id:'threats', name:'Threat Talk', d:'Module 2 · phishing and malware'},
  {id:'study', name:'Study Squad', d:'Find study buddies'},
  {id:'wins', name:'Achievement Wall', d:'Share badges and milestones'}
];
const Community = (() => {
  let mid = 1; const U = n => COMMUNITY_USERS.find(u=>u.name===n);
  const ago = m => Date.now() - m*60000;
  const seed = (room, rows) => rows.map(([n,txt,m])=>({id:mid++, user:n, text:txt, t:ago(m)}));
  const MSG = {
    lounge: seed('lounge',[['PixelPanda','Morning everyone! Coffee and Module 3 today ☕',42],['Hana.exe','Morning! Module 3 router activity is fun, set everything to WPA3 😄',39],['Leo_Learns','I just joined yesterday. Is it okay if I know literally nothing about cyber? 😅',21],['Aisyah.NetNinja','@Leo_Learns totally! That\'s what Cybersity is for. Start at the Cyber Library',19],['Mei_Firewall','Fun fact: I changed my home router password after lesson 3.2. It was still "admin" 💀',6]]),
    help: seed('help',[['Leo_Learns','What\'s the difference between a virus and a worm again?',55],['Ravi.Root','Virus needs a host file + someone to share it. Worm spreads by itself across the network.',53],['Leo_Learns','Ohhh that makes sense, thanks!',52],['Mei_Firewall','Tip: you can also ask BYTE in the AI Lab, it explains really clearly',12]]),
    threats: seed('threats',[['Hana.exe','Got an SMS today "your parcel is on hold, pay RM1.50". Classic smishing 🙄',80],['PixelPanda','The tiny fee is the bait. They want your card details',77],['Aisyah.NetNinja','Reported mine to the bank and deleted it. Spot the Phishing Email activity helped a lot',30]]),
    study: seed('study',[['Mei_Firewall','Anyone want to do Module 4 together tonight 9pm?',120],['PixelPanda','I\'m in! Need to beat my password quiz score',115],['Hana.exe','I can join, already done it, happy to help 🙌',60]]),
    wins: seed('wins',[['Hana.exe','Just earned the Cybersity certificate!! 🎓',300],['Aisyah.NetNinja','Congrats Hana!! 🎉',290],['Ravi.Root','Finally got Log Detective badge 🔍',45]])
  };
  MSG.wins[0].share = {icon:'scroll', color:'#ffd447', html:'earned the <b>Cybersity Certificate of Completion</b>'};
  MSG.wins[2].share = {icon:'eye', color:'#47f59a', html:'unlocked the <b>Log Detective</b> badge'};
  const AMBIENT = {
    lounge:['Anyone else addicted to the XP bar? 😂','Campus looks so nice at night','Just finished my first module assessment!','Remember to take breaks, folks'],
    help:['How many questions are in the final assessment?','Is WPA2 still okay or must it be WPA3?','Does MFA by SMS count as real MFA?'],
    threats:['Saw a fake "bank" page with https today. Padlock ≠ safe!','Ransomware lesson made me set up backups finally','My aunt got a vishing call pretending to be from a courier'],
    study:['Quiz tip: read the explanations even when you get it right','Module 5 hashing playground is so cool','Who\'s up for a Module 6 run tomorrow?'],
    wins:['Level 4 Packet Ranger unlocked!','Got Perfect Score on the CIA quiz 💯','Passed Module 2 assessment 🎉']
  };
  const REPLIES = [
    [/^(hi|hello|hey|salam|morning|evening)/i, n=>[`Hey ${n}! Welcome 👋`,`Hi ${n}! Which module are you on?`]],
    [/phish|scam|sms|link/i, ()=>['Rule of thumb: never click, go to the official site yourself','Ugh scammers are everywhere. Good on you for spotting it!']],
    [/password|passphrase/i, ()=>['Passphrases FTW. Long > complex','I finally started using a password manager after Module 4']],
    [/help|stuck|confus|don\'t understand|dont understand/i, ()=>['Try asking BYTE in the AI Lab, it explains step by step!','Which lesson? Maybe we can help']],
    [/module|lesson|quiz|assessment/i, ()=>['Good luck! Read the explanations after each answer, they really help','The module assessments mix questions from both lessons, so revise both']],
    [/thank|tq|thanks/i, ()=>['Anytime 🙌','No problem!']],
    [/badge|xp|level|certificate/i, ()=>['Let\'s gooo 🎉','Congrats!! 🙌']]
  ];
  let typingWho = null;
  const MOD = [
    {re:/[\w.+-]+@[\w-]+\.[\w.]+/, why:'an email address'},
    {re:/(\+?6?01\d[-\s]?\d{3,4}[-\s]?\d{4})|(\b\d{9,12}\b)/, why:'a phone number'},
    {re:/\b\d{6}-\d{2}-\d{4}\b/, why:'an IC number'},
    {re:/(my )?password (is|=|:)/i, why:'a password'},
    {re:/\b(stupid|idiot|dumb|bodoh)\b/i, why:'disrespectful language'}
  ];
  function look(n){ return n===S.user?.name ? S.user.look : (U(n)?.look || COMMUNITY_USERS[0].look); }
  function msgHTML(m){
    if (m.system) return `<div class="cmsg sys"><div class="av">${icon('shield','#ff5d6e',20)}</div><div style="min-width:0"><span class="nm">Cybersity Safety</span><span class="tm">only visible to you</span><div class="tx">${m.text}</div></div></div>`;
    const me = m.user===S.user?.name;
    return `<div class="cmsg"><div class="av"><img class="px" alt="" src="${avatarURL(look(m.user))}"></div><div style="min-width:0; flex:1"><span class="nm" style="color:${me?'var(--cyan-ink)':'var(--text)'}">${esc(m.user)}${me?' (you)':''}</span><span class="tm">${hhmm(new Date(m.t))}</span>
      <div class="tx">${m.removed?'<i class="muted">[Message removed by a moderator]</i>':esc(m.text)}</div>
      ${m.share && !m.removed?`<div class="share-card"><img class="px" alt="" src="${iconURL(m.share.icon, m.share.color)}"><span>${esc(m.user)} ${m.share.html}</span></div>`:''}</div>
      ${!me && !m.removed?`<button class="rep" data-act="reportMsg" data-arg="${m.id}">${m.reported?'Reported':'Report'}</button>`:''}</div>`;
  }
  function paint(){
    const log = $('#commLog'); if (!log) return;
    log.innerHTML = (MSG[UI.room]||[]).map(msgHTML).join('') + (typingWho?`<div class="cmsg"><div class="av"><img class="px" alt="" src="${avatarURL(look(typingWho))}"></div><div class="muted" style="font-size:13px; padding-top:8px">${esc(typingWho)} is typing<span class="typing"> <span></span><span></span><span></span></span></div></div>`:'');
    log.scrollTop = log.scrollHeight;
  }
  function post(room, user, text, extra={}){ const m = {id:mid++, user, text, t:Date.now(), ...extra}; MSG[room].push(m); if (UI.room===room) paint(); return m; }
  function botReply(text){
    const others = COMMUNITY_USERS.filter(u=>u.status==='on'); const who = pick(others).name;
    let line = null; for (const [re,f] of REPLIES){ if (re.test(text)){ line = pick(f(S.user.name)); break; } }
    if (!line) line = pick(['Nice one!','Haha true','Same here 😄','Good point','Agreed 👍']);
    const room = UI.room;
    setTimeout(()=>{ if (UI.room===room){ typingWho=who; paint(); } }, 700);
    setTimeout(()=>{ typingWho=null; post(room, who, line); }, 2200+Math.random()*1200);
  }
  function send(text){
    const hit = MOD.find(r=>r.re.test(text));
    if (hit){ MSG[UI.room].push({id:mid++, system:true, text:`Your message wasn't posted because it looks like it contains <b>${hit.why}</b>. Keep personal details private and be kind. That's lesson one of staying safe online!`}); paint(); return; }
    post(UI.room, S.user.name, text); S.msgsSent++; save();
    if (S.msgsSent<=5) addXP(XP.chat, 'Posted in the community');
    if (S.msgsSent===1) award('social');
    botReply(text);
  }
  function startAmbient(){ timers.push(setInterval(()=>{ if (S.view!=='community') return; const pool = AMBIENT[UI.room]; const who = pick(COMMUNITY_USERS.filter(u=>u.status==='on')).name; typingWho=who; paint(); setTimeout(()=>{ typingWho=null; post(UI.room, who, pick(pool)); }, 1500); }, 26000)); }
  function postShare(html, ic, color){ const plain = html.replace(/<[^>]+>/g,''); post('wins', S.user.name, 'Sharing a milestone! 🎉', {share:{icon:ic, color, html}}); S.msgsSent++; save(); if (S.msgsSent===1) award('social'); }
  function removeMessage(id){ Object.values(MSG).forEach(list=>list.forEach(m=>{ if (m.id===id) m.removed=true; })); paint(); }
  function find(id){ for (const [room,list] of Object.entries(MSG)){ const m=list.find(x=>x.id===id); if (m) return {room,m}; } return null; }
  return { MSG, paint, send, startAmbient, postShare, removeMessage, find, msgCount: r => MSG[r].length };
})();
function viewCommunity(el){
  const room = ROOMS.find(r=>r.id===UI.room) || ROOMS[0];
  const people = [{name:S.user.name, status:'on', title:levelInfo().t, look:S.user.look, me:true}, ...COMMUNITY_USERS];
  el.innerHTML = `<div class="page-head"><div><div class="crumbs">Campus · Community Hub</div><h1>Community Hub</h1><p>Join a room and chat with other learners in real time. Be kind, help each other and keep personal details private.</p></div></div>
  <div class="comm-layout">
    <aside><div class="rooms">${ROOMS.map(r=>`<button class="room ${r.id===room.id?'on':''}" data-act="room" data-arg="${r.id}"><span># ${esc(r.name)}</span><small>${Community.msgCount(r.id)}</small></button>`).join('')}</div>
      <div class="rules"><b class="label" style="color:var(--gold-ink)">Room rules</b><br>Be respectful · No personal info (phone, email, IC, passwords) · Report anything harmful. Messages are checked automatically.</div></aside>
    <section class="chat" style="height:min(640px,74vh)">
      <div class="chat-head"><div style="flex:1; min-width:0"><b># ${esc(room.name)}</b><div class="muted" style="font-size:12px">${esc(room.d)}</div></div><span class="pill green" style="font-size:9px">● ${people.filter(p=>p.status==='on').length} online</span></div>
      <div class="chat-log" id="commLog" style="gap:6px"></div>
      <form class="chat-input" id="commForm"><input class="input" id="commIn" placeholder="Message #${esc(room.name)}" maxlength="240" aria-label="Message"><button class="btn pink" type="submit">Send</button></form>
    </section>
    <aside class="panel presence" style="padding:14px"><div class="section-title">Learners</div>${people.map(p=>`<div class="who"><div class="av"><img class="px" alt="" src="${avatarURL(p.look)}"></div><div style="flex:1; min-width:0"><div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${esc(p.name)}${p.me?' (you)':''}</div><div class="muted" style="font-size:11px">${esc(p.title)}</div></div><span class="status ${p.status}"></span></div>`).join('')}</aside>
  </div>`;
  Community.paint();
  $('#commForm').addEventListener('submit', e=>{ e.preventDefault(); const v=$('#commIn').value.trim(); if (!v) return; $('#commIn').value=''; Community.send(v); });
  Community.startAmbient();
}
window.EXTRA_ACTIONS = Object.assign(window.EXTRA_ACTIONS||{}, {
  mentorSuggest: s => Mentor.ask(s),
  room: r => { UI.room = r; renderView(); },
  reportMsg: id => { const f = Community.find(+id); if (!f || f.m.reported) return;
    showModal(`<div class="label" style="color:var(--pink-ink)">Report message</div><h2>Why are you reporting this?</h2><p class="quote-box"><b>${esc(f.m.user)}:</b> ${esc(f.m.text)}</p>
      <div style="display:grid; gap:8px; text-align:left">${['Spam or scam','Harassment or bullying','Sharing personal information','Harmful or illegal content'].map((r,i)=>`<label style="display:flex; gap:10px; align-items:center; padding:8px 10px; background:var(--panel-2); border:2px solid #000"><input type="radio" name="rr" value="${r}" ${i===0?'checked':''}> ${r}</label>`).join('')}</div>
      <div class="actions"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn pink" data-act="submitReport" data-arg="${id}">Send report</button></div>`); },
  submitReport: id => { const f = Community.find(+id); const reason = (document.querySelector('input[name="rr"]:checked')||{}).value || 'Other';
    f.m.reported = true; S.reports.unshift({mid:f.m.id, user:f.m.user, room:f.room, text:f.m.text, reason, status:'open', at:Date.now()}); save(); closeModal(); Community.paint(); toast('Report sent to moderators. Thanks for keeping Cybersity safe.'); }
});
