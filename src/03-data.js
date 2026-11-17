/* ============================================================
   CYBERSITY — CONTENT DATA (Cybersecurity Fundamentals pathway)
   ============================================================ */
const MODULES = [
{ id:'m1', n:1, title:'Introduction to Cybersecurity', color:'#4c78ff', icon:'shield',
  blurb:'Core ideas, the CIA Triad and the words security professionals use every day.',
  extra:[
    {q:'What does the "A" in the CIA Triad stand for?', o:['Authentication','Availability','Access','Antivirus'], a:1, e:'CIA stands for Confidentiality, Integrity and Availability.'},
    {q:'Which of these is an asset?', o:['A company\'s customer database','A computer virus','A weak password','A phishing email'], a:0, e:'An asset is anything of value that needs protecting. The others are threats or vulnerabilities.'}
  ],
  lessons:[
  { id:'m1l1', title:'What is Cybersecurity?', mins:7,
    intro:`<p>Every day you unlock your phone, send messages, shop online and log in to school or work systems. Each of those actions depends on technology working safely.</p><p><b>Cybersecurity</b> is the practice of protecting devices, networks and data from attacks, damage and unauthorised access. In this lesson you'll learn four words that security professionals use constantly.</p>`,
    concept:{lead:'Security conversations almost always come back to these four ideas:', points:[
      ['Asset','Anything of value that needs protecting: your phone, your photos, a company\'s customer list.'],
      ['Threat','Anything that could cause harm to an asset: a scammer, a virus, even a flood.'],
      ['Vulnerability','A weakness a threat can take advantage of: an outdated app, a weak password, an unlocked door.'],
      ['Risk','The chance that a threat uses a vulnerability, combined with how bad the damage would be.']]},
    visual:{caption:'A threat only becomes a real risk when it meets a vulnerability. Remove the weakness and the risk drops.', html:`
      <div class="vrow"><div class="vbox vt-red"><b>Threat</b>Burglar</div><div class="varrow">+</div><div class="vbox vt-gold"><b>Vulnerability</b>Unlocked window</div><div class="varrow">=</div><div class="vbox vt-purple"><b>Risk</b>Break-in</div></div>
      <div style="height:14px"></div>
      <div class="vrow"><div class="vbox vt-red"><b>Threat</b>Online attacker</div><div class="varrow">+</div><div class="vbox vt-gold"><b>Vulnerability</b>Password "aina2005"</div><div class="varrow">=</div><div class="vbox vt-purple"><b>Risk</b>Account takeover</div></div>`},
    scenario:{who:'Meet Aina, 19, university student', story:'Aina uses the password <b>aina2005</b> for her email, Instagram and online banking. A shopping site she once signed up to is breached, and its list of passwords leaks online.', question:'What is the vulnerability in Aina\'s situation?', options:[
      {t:'The hackers who breached the shopping site', ok:false, fb:'The hackers are the threat. The vulnerability is the weakness they can take advantage of.'},
      {t:'Reusing one simple password on every account', ok:true, fb:'Correct. One leaked password now unlocks all of Aina\'s accounts. That reuse is the weakness.'},
      {t:'Aina\'s online banking account', ok:false, fb:'The bank account is an asset: something valuable that needs protecting.'}]},
    recap:{points:['Cybersecurity protects devices, networks and data.','Assets are valuable, threats can cause harm, vulnerabilities are weaknesses.','Risk = the chance a threat exploits a weakness × how bad the impact would be.'],
      terms:[['Asset','Something of value to protect'],['Threat','A possible source of harm'],['Vulnerability','A weakness that can be exploited'],['Risk','Likelihood × impact']]},
    activity:{type:'sort', title:'Asset, Threat or Vulnerability?', intro:'Sort each card into the right group. You get feedback after every card.',
      buckets:[{id:'asset',t:'Asset',d:'Something valuable',c:'vt-blue'},{id:'threat',t:'Threat',d:'Could cause harm',c:'vt-red'},{id:'vuln',t:'Vulnerability',d:'A weakness',c:'vt-gold'}],
      items:[
        {t:'Your family photo collection', a:'asset', fb:'Photos are valuable to you, so they are an asset.'},
        {t:'A scammer sending fake "you won a prize" messages', a:'threat', fb:'The scammer is a person who could cause harm: a threat.'},
        {t:'A phone that hasn\'t been updated in two years', a:'vuln', fb:'Missing updates leave known holes open: a vulnerability.'},
        {t:'A school\'s student records database', a:'asset', fb:'Student records are sensitive and valuable: an asset.'},
        {t:'Ransomware spreading through email attachments', a:'threat', fb:'Ransomware is malicious software that causes harm: a threat.'},
        {t:'A password written on a sticky note on the monitor', a:'vuln', fb:'Anyone walking past can read it: a vulnerability.'},
        {t:'Home Wi-Fi router still using the password "admin"', a:'vuln', fb:'Default passwords are public knowledge: a vulnerability.'},
        {t:'An angry ex-employee who still knows the office passwords', a:'threat', fb:'A person with motive and knowledge is a threat (an insider threat).'}]},
    quiz:[
      {q:'Which statement best describes cybersecurity?', o:['Protecting devices, networks and data from attacks and unauthorised access','Building faster computers','Making websites look attractive','Deleting old files to save space'], a:0, e:'Cybersecurity is about protection: keeping systems and information safe from harm and misuse.'},
      {q:'An outdated app with a known bug is an example of a…', o:['Threat','Vulnerability','Asset','Firewall'], a:1, e:'A known bug is a weakness that an attacker could use, so it is a vulnerability.'},
      {q:'When is risk highest?', o:['When a threat exists and a vulnerability lets it cause serious impact','When there are no assets to protect','When all software is up to date','When only strong passwords are used'], a:0, e:'Risk grows when a threat, a weakness and a valuable asset all come together.'}]
  },
  { id:'m1l2', title:'The CIA Triad', mins:8,
    intro:`<p>Security teams around the world use one simple model to decide what "secure" means: the <b>CIA Triad</b>. (Nothing to do with spies!)</p><p>Every security control, from a password to a backup drive, exists to protect at least one of three goals.</p>`,
    concept:{lead:'The three goals of information security:', points:[
      ['Confidentiality','Only the right people can see the information. Protected by passwords, encryption and permissions.'],
      ['Integrity','Information stays accurate and is not changed without permission. Protected by hashing, digital signatures and change logs.'],
      ['Availability','Systems and data are there when people need them. Protected by backups, spare systems and protection against flooding attacks.']]},
    visual:{caption:'The triad: a security incident usually breaks at least one corner.', html:`
      <svg viewBox="0 0 420 260" width="100%" style="max-width:460px; display:block; margin:0 auto" role="img" aria-label="CIA Triad triangle">
        <polygon points="210,24 392,236 28,236" fill="#e9dcff" stroke="#151a3e" stroke-width="5"/>
        <text x="210" y="160" text-anchor="middle" font-family="Silkscreen, monospace" font-size="22" fill="#151a3e">CIA</text>
        <rect x="140" y="4" width="140" height="36" fill="#d8e4ff" stroke="#151a3e" stroke-width="4"/><text x="210" y="28" text-anchor="middle" font-family="Silkscreen, monospace" font-size="13" fill="#151a3e">CONFIDENTIAL</text>
        <rect x="4" y="220" width="130" height="36" fill="#c9f7de" stroke="#151a3e" stroke-width="4"/><text x="69" y="244" text-anchor="middle" font-family="Silkscreen, monospace" font-size="13" fill="#151a3e">INTEGRITY</text>
        <rect x="282" y="220" width="134" height="36" fill="#fff1b8" stroke="#151a3e" stroke-width="4"/><text x="349" y="244" text-anchor="middle" font-family="Silkscreen, monospace" font-size="13" fill="#151a3e">AVAILABLE</text>
      </svg>
      <div class="vgrid" style="margin-top:14px"><div class="vbox vt-blue"><b>C · Secret</b>Your exam results are seen only by you</div><div class="vbox vt-green"><b>I · Correct</b>Nobody can change your grade from B to F</div><div class="vbox vt-gold"><b>A · Ready</b>The portal works on results day</div></div>`},
    scenario:{who:'Results day at Cybersity College', story:'On the morning exam results are released, the results portal goes offline because the server is flooded with millions of fake requests.', question:'Which part of the CIA Triad is under attack?', options:[
      {t:'Confidentiality', ok:false, fb:'No information was revealed to the wrong people.'},
      {t:'Integrity', ok:false, fb:'No results were changed. They just can\'t be reached.'},
      {t:'Availability', ok:true, fb:'Correct. This is a Distributed Denial of Service (DDoS) attack, which stops people reaching a service.'}]},
    recap:{points:['Confidentiality keeps data secret from the wrong people.','Integrity keeps data accurate and unchanged.','Availability keeps systems working when needed.'],
      terms:[['Confidentiality','Only authorised people can view data'],['Integrity','Data is accurate and unaltered'],['Availability','Systems are accessible when needed'],['DDoS','Flooding a service so real users can\'t reach it']]},
    activity:{type:'sort', title:'Which corner of the triad?', intro:'Decide which CIA goal each situation affects.',
      buckets:[{id:'c',t:'Confidentiality',d:'Kept secret',c:'vt-blue'},{id:'i',t:'Integrity',d:'Kept accurate',c:'vt-green'},{id:'a',t:'Availability',d:'Kept working',c:'vt-gold'}],
      items:[
        {t:'Someone reads a classmate\'s private messages without permission', a:'c', fb:'Private information was seen by the wrong person: confidentiality.'},
        {t:'A hacker changes a product price on a shop website from RM500 to RM5', a:'i', fb:'Data was changed without permission: integrity.'},
        {t:'A hospital system crashes and doctors can\'t view patient records', a:'a', fb:'The system wasn\'t there when needed: availability.'},
        {t:'Medical records are encrypted so only staff can read them', a:'c', fb:'Encryption keeps data secret: confidentiality.'},
        {t:'A bank keeps backups in another city in case of a flood', a:'a', fb:'Backups keep services running after disasters: availability.'},
        {t:'A student secretly edits their own grade in the school database', a:'i', fb:'Unauthorised changes break integrity.'},
        {t:'Customer login details are leaked and posted online', a:'c', fb:'Secret data was exposed: confidentiality.'},
        {t:'A website is knocked offline by a flood of fake traffic', a:'a', fb:'A DDoS attack targets availability.'}]},
    quiz:[
      {q:'Encrypting a file mainly protects its…', o:['Availability','Integrity','Confidentiality','Speed'], a:2, e:'Encryption scrambles data so only people with the key can read it, which keeps it confidential.'},
      {q:'Someone secretly changes the amount on a bank transfer. Which principle is broken?', o:['Confidentiality','Integrity','Availability','Authentication'], a:1, e:'Unauthorised changes to data break integrity.'},
      {q:'Keeping regular backups mainly supports…', o:['Availability','Confidentiality','Anonymity','Integrity only'], a:0, e:'Backups let you restore data and keep working after failures, so they support availability.'}]
  }]},

{ id:'m2', n:2, title:'Cyber Threats and Vulnerabilities', color:'#ff4fae', icon:'fish',
  blurb:'Phishing, malware, ransomware and the social engineering tricks attackers use.',
  extra:[
    {q:'What is social engineering?', o:['Manipulating people into giving up information or access','Building social media apps','Engineering network cables','A type of antivirus software'], a:0, e:'Social engineering targets people rather than technology, using trust, fear or urgency.'},
    {q:'Which action reduces malware risk the most?', o:['Keeping your operating system and apps updated','Turning off all passwords','Clicking pop-ups to close them quickly','Downloading apps from any website'], a:0, e:'Updates patch the holes that malware uses to get in.'}
  ],
  lessons:[
  { id:'m2l1', title:'Understanding Phishing', mins:9,
    intro:`<p><b>Phishing</b> is when an attacker pretends to be someone you trust, such as a bank, delivery company, school or even a friend, to trick you into clicking a link, opening a file or giving away information.</p><p>It is one of the most common ways cyber attacks begin, because it targets people rather than computers.</p>`,
    concept:{lead:'Most phishing messages share the same warning signs:', points:[
      ['Fake sender','The address looks almost right: support@n0vabank-alerts.co instead of the real domain.'],
      ['Urgency or fear','"Your account will be closed in 24 hours!" Pressure stops you from thinking.'],
      ['Suspicious links','The link text says one thing, but the real address goes somewhere else.'],
      ['Requests for secrets','Real organisations never ask for your password, PIN or one-time code (TAC/OTP) by email or message.'],
      ['Variants','Smishing = by SMS. Vishing = by voice call. Spear phishing = targeted at one specific person.']]},
    visual:{caption:'A fictional phishing email with its warning signs numbered. "Nova Bank" is made up for this lesson.', html:`
      <div class="email-mock">
        <div class="eh"><div><b>From:</b> Nova Bank Security <span class="callout">1</span>&lt;security@nova-bank-alerts.co&gt;</div><div><b>Subject:</b> URGENT: Your account has been suspended <span class="callout">2</span></div></div>
        <div class="eb">Dear Customer,<br><br>We detected unusual activity. Your account will be <b>permanently closed within 24 hours</b> <span class="callout">2</span> unless you verify your details.<br><br><span class="lnk">https://novabank.com/verify</span> <span class="callout">3</span><br><small style="color:#666">(real destination: http://nova-bank-verify.xyz/login)</small><br><br>Please confirm your password and TAC number <span class="callout">4</span> to restore access.</div>
      </div>
      <div class="vgrid" style="margin-top:14px"><div class="vbox"><b>1</b>Look-alike sender domain</div><div class="vbox"><b>2</b>Urgency and threats</div><div class="vbox"><b>3</b>Link goes somewhere else</div><div class="vbox"><b>4</b>Asks for secrets</div></div>`},
    scenario:{who:'Your phone buzzes', story:'An SMS arrives: <i>"SwiftParcel: Your parcel is on hold. Pay RM1.50 redelivery fee within 12 hours: http://swiftparcel-redeliver.top"</i>. You are expecting a parcel this week.', question:'What is the safest thing to do?', options:[
      {t:'Tap the link and pay. It\'s only RM1.50.', ok:false, fb:'The small fee is bait. The real goal is to capture your card details.'},
      {t:'Reply "STOP" so they stop messaging you', ok:false, fb:'Replying tells scammers your number is active, so you may get more scams.'},
      {t:'Check your parcel in the courier\'s official app or website (typed in yourself), then delete and report the SMS', ok:true, fb:'Correct. Go to the source yourself instead of trusting links in unexpected messages.'}]},
    realLife:'scam',
    recap:{points:['Phishing impersonates trusted organisations to steal information.','Watch for look-alike senders, urgency, mismatched links and requests for secrets.','When in doubt, contact the organisation through a channel you find yourself.'],
      terms:[['Phishing','Deceptive messages that trick people'],['Smishing','Phishing by SMS'],['Vishing','Phishing by voice call'],['Spear phishing','Phishing aimed at one specific target']]},
    activity:{type:'select', variant:'email', title:'Spot the Phishing Email', intro:'Click every part of this email that looks suspicious. There are 7 warning signs; find at least 6 to pass. Press "Check" when you are done.',
      email:{from:[{t:'From: ',x:1},{t:'Nova Bank',x:1},{t:' <security@nova-bank-alerts.co>',id:'sender',fb:'The domain "nova-bank-alerts.co" is not the bank\'s real domain.'}],
        subject:[{t:'Subject: ',x:1},{t:'URGENT!! Account suspended',id:'subject',fb:'Shouting and alarm in the subject line is a pressure tactic.'}],
        body:[
          {t:'Dear Valued Customer,',id:'greet',fb:'A generic greeting means they don\'t actually know your name.'},{t:'\n\n',x:1},
          {t:'Our system detected a login from a new device.',x:0,fb:'This line alone is normal. Real banks do send login alerts.'},{t:' ',x:1},
          {t:'Your account will be closed within 24 hours',id:'urgent',fb:'A deadline threat is designed to make you act before thinking.'},{t:' unless you verify your identity.\n\n',x:1},
          {t:'Verify now: novabank.com/secure',id:'link',fb:'The link text hides the real destination: http://nova-bank-verify.xyz.'},{t:'\n\n',x:1},
          {t:'Please reply with your password and TAC number.',id:'secret',fb:'No real bank will ever ask for your password or TAC.'},{t:'\n\n',x:1},
          {t:'Attachment: Account_Form.zip',id:'attach',fb:'Unexpected .zip attachments often contain malware.'},{t:'\n\n',x:1},
          {t:'Thank you for banking with us.',x:0,fb:'A polite sign-off is normal. It isn\'t a warning sign on its own.'}]},
      targets:['sender','subject','greet','urgent','link','secret','attach'], need:6},
    quiz:[
      {q:'Which is a common phishing warning sign?', o:['A threat that your account will be closed unless you act now','An email from a colleague about a meeting you booked','A newsletter you subscribed to','A receipt for something you bought'], a:0, e:'Urgency and threats are classic phishing pressure tactics.'},
      {q:'A message asks for your OTP/TAC to "verify your account". You should…', o:['Never share it, and contact the organisation through its official channel','Reply with the code quickly','Share it only if the logo looks real','Forward it to a friend to check'], a:0, e:'One-time codes are for you alone. Sharing one hands over access to your account.'},
      {q:'Phishing carried out by SMS is called…', o:['Vishing','Smishing','Spoofing','Spamming'], a:1, e:'SMS + phishing = smishing. Voice phishing is vishing.'}]
  },
  { id:'m2l2', title:'Malware & Ransomware', mins:8,
    intro:`<p><b>Malware</b> is short for <i>malicious software</i>: programs designed to damage, spy on or take control of devices.</p><p>Different kinds of malware behave differently, and knowing how each spreads helps you avoid it.</p>`,
    concept:{lead:'Five common kinds of malware:', points:[
      ['Virus','Attaches to files or programs and spreads when those files are opened or shared.'],
      ['Worm','Spreads by itself across networks. No click is needed.'],
      ['Trojan','Pretends to be something useful (a free game or "cracked" app) but hides something harmful.'],
      ['Ransomware','Locks or encrypts your files, then demands payment to unlock them.'],
      ['Spyware','Secretly watches what you do and steals information like passwords. Keyloggers are a type of spyware.']]},
    visual:{caption:'How each type typically gets in.', html:`
      <div class="vgrid"><div class="vbox vt-red"><b>Virus</b>Infected document shared by USB or email</div><div class="vbox vt-gold"><b>Worm</b>Unpatched computers on the same network</div><div class="vbox vt-purple"><b>Trojan</b>"Free" pirated software download</div><div class="vbox vt-blue"><b>Ransomware</b>Phishing attachment, then files encrypted</div><div class="vbox vt-green"><b>Spyware</b>Shady browser extension or app</div></div>`},
    scenario:{who:'Office PC, Monday 9 AM', story:'You turn on the shared office computer and see a red screen: <i>"Your files are encrypted! Pay 0.05 Bitcoin within 48 hours or lose everything."</i>', question:'What should you do first?', options:[
      {t:'Disconnect it from the network and report it to IT/security immediately', ok:true, fb:'Correct. Disconnecting helps stop the ransomware spreading to other computers, and experts can respond quickly.'},
      {t:'Pay the ransom quickly before the price goes up', ok:false, fb:'Paying doesn\'t guarantee you get your files back, and it funds criminals.'},
      {t:'Restart it a few times and keep working', ok:false, fb:'Restarting won\'t remove ransomware and could destroy evidence.'}]},
    recap:{points:['Malware is software built to cause harm.','Viruses need a host file, worms spread on their own, trojans disguise themselves.','Offline backups are the best defence against losing data to ransomware.'],
      terms:[['Malware','Malicious software'],['Ransomware','Encrypts files and demands payment'],['Trojan','Harmful software disguised as useful'],['Keylogger','Records your keystrokes']]},
    activity:{type:'match', title:'Match the Malware', intro:'Select a behaviour on the left, then the malware type on the right that matches it.',
      left:[
        {id:'trojan', t:'Disguised as a free movie app, it secretly opens a backdoor'},
        {id:'worm', t:'Spreads across the school network on its own, with no clicks needed'},
        {id:'ransom', t:'Encrypts your assignments and demands payment'},
        {id:'spy', t:'Records every key you type, including passwords'},
        {id:'virus', t:'Infects a document and spreads when the file is shared'}],
      right:[{id:'virus',t:'Virus'},{id:'worm',t:'Worm'},{id:'trojan',t:'Trojan'},{id:'ransom',t:'Ransomware'},{id:'spy',t:'Spyware'}]},
    quiz:[
      {q:'Which type of malware spreads by itself without user action?', o:['Trojan','Worm','Spyware','Adware'], a:1, e:'Worms self-replicate across networks, often through unpatched systems.'},
      {q:'What is the best protection against losing files to ransomware?', o:['Regular offline backups','Paying the ransom quickly','Turning off the monitor','Using a longer username'], a:0, e:'With a clean backup, you can restore your files without paying.'},
      {q:'A "free" cracked copy of a paid game that hides malware is a…', o:['Worm','Firewall','Trojan','Patch'], a:2, e:'Like the Trojan horse legend, it hides something harmful inside something attractive.'}]
  }]},

{ id:'m3', n:3, title:'Network Security Fundamentals', color:'#2ee6ff', icon:'network',
  blurb:'How networks and the internet work, plus firewalls, Wi-Fi and safe connections.',
  extra:[
    {q:'Which is the safest connection for online banking?', o:['Mobile data or a trusted home network','Any open public Wi-Fi','A network shared by a stranger','Whichever network is fastest'], a:0, e:'Trusted networks reduce the chance that someone is snooping on your traffic.'},
    {q:'A guest Wi-Fi network helps by…', o:['Keeping visitors\' devices separate from your main devices','Making the internet faster','Removing the need for passwords','Blocking all websites'], a:0, e:'Separation means a compromised guest device can\'t easily reach your personal devices.'}
  ],
  lessons:[
  { id:'m3l1', title:'How Networks Work', mins:8,
    intro:`<p>A <b>network</b> is a group of devices connected so they can share data. The internet is simply a giant network of networks.</p><p>Understanding the basic parts helps you see where attacks can happen and why certain protections matter.</p>`,
    concept:{lead:'Key building blocks:', points:[
      ['IP address','Like a home address for a device on a network, e.g. 192.168.1.10.'],
      ['Router','Directs traffic between your home network and the internet.'],
      ['DNS','The internet\'s phone book. It turns names like cybersity.app into IP addresses.'],
      ['HTTP vs HTTPS','The "S" means secure: data between you and the website is encrypted.'],
      ['Public Wi-Fi','Open networks that strangers share. Others may be able to snoop on or imitate them.']]},
    visual:{caption:'What happens when you visit a website. Example addresses use reserved documentation ranges.', html:`
      <div class="vrow"><div class="vbox vt-cyan"><b>Your laptop</b>192.168.1.10</div><div class="varrow">→</div><div class="vbox vt-blue"><b>Router</b>Home gateway</div><div class="varrow">→</div><div class="vbox vt-purple"><b>Internet</b>Many networks</div><div class="varrow">→</div><div class="vbox vt-green"><b>Web server</b>203.0.113.7</div></div>
      <div class="vrow" style="margin-top:14px"><div class="vbox vt-gold" style="min-width:280px"><b>DNS lookup</b>cybersity.app → 203.0.113.7</div><div class="vbox vt-green" style="min-width:220px"><b>HTTPS</b>🔒 Encrypted in transit</div></div>`},
    scenario:{who:'At the Café Luna', story:'You need to check your bank balance. Your phone shows two open networks: <b>CafeLuna_Guest</b> and <b>Free_Cafe_WiFi_FAST</b>.', question:'What\'s the safest choice?', options:[
      {t:'Connect to whichever has the strongest signal', ok:false, fb:'Attackers can set up fake hotspots with tempting names and strong signals.'},
      {t:'Use your mobile data for banking and keep public Wi-Fi for casual browsing', ok:true, fb:'Correct. Sensitive tasks belong on a connection you trust.'},
      {t:'Use "Free_Cafe_WiFi_FAST" because it sounds faster', ok:false, fb:'An unofficial-looking name is a red flag for an "evil twin" network.'}]},
    recap:{points:['Devices talk using IP addresses; DNS translates names to addresses.','HTTPS encrypts traffic between you and a site.','Avoid sensitive tasks on open public Wi-Fi.'],
      terms:[['IP address','A device\'s network address'],['DNS','Turns names into IP addresses'],['HTTPS','Encrypted web traffic'],['Evil twin','A fake Wi-Fi hotspot']]},
    activity:{type:'sort', title:'Safer or Risky?', intro:'Decide whether each online habit is safer or risky.',
      buckets:[{id:'safe',t:'Safer',d:'Good habit',c:'vt-green'},{id:'risk',t:'Risky',d:'Could expose you',c:'vt-red'}],
      items:[
        {t:'Logging in on a site that shows https:// and a padlock', a:'safe', fb:'HTTPS encrypts your login details in transit.'},
        {t:'Entering card details on a page starting with http://', a:'risk', fb:'Without HTTPS, data can be read in transit.'},
        {t:'Online banking on an open café Wi-Fi with no password', a:'risk', fb:'Open networks can be monitored or faked.'},
        {t:'Using your own mobile data hotspot for banking', a:'safe', fb:'Your mobile connection is private to you.'},
        {t:'Joining "Free_Airport_WiFi_2", which you found by chance', a:'risk', fb:'Unknown look-alike networks may be evil twins.'},
        {t:'Using a trusted VPN on public Wi-Fi', a:'safe', fb:'A VPN encrypts your traffic through a secure tunnel.'},
        {t:'Typing the bank\'s address yourself instead of clicking an SMS link', a:'safe', fb:'Going to the source yourself avoids phishing links.'}]},
    quiz:[
      {q:'What does DNS do?', o:['Translates website names into IP addresses','Encrypts your files','Blocks viruses','Speeds up your laptop'], a:0, e:'DNS works like a phone book for the internet.'},
      {q:'The "S" in HTTPS means data is…', o:['Encrypted between your browser and the website','Stored permanently','Sent faster','Shared publicly'], a:0, e:'HTTPS uses TLS encryption to protect data in transit.'},
      {q:'An IP address is best described as…', o:['A unique address that identifies a device on a network','A type of password','A website\'s logo','An antivirus setting'], a:0, e:'IP addresses let data find its way to the right device.'}]
  },
  { id:'m3l2', title:'Firewalls & Wi-Fi Security', mins:9,
    intro:`<p>Your home router is the front door to your digital life, and many people never change its factory settings.</p><p>In this lesson you'll learn how a <b>firewall</b> filters traffic and which router settings actually keep you safe.</p>`,
    concept:{lead:'Key protections for any network:', points:[
      ['Firewall','A digital security guard that checks traffic in and out against rules and blocks what isn\'t allowed.'],
      ['Wi-Fi encryption','WPA3 is the strongest. WPA2 is acceptable. WEP and open networks are unsafe.'],
      ['Default passwords','Routers ship with passwords like "admin" that are publicly listed online. Change them straight away.'],
      ['Firmware updates','Router software has bugs too. Updates patch them.'],
      ['Guest network','Keeps visitors and smart gadgets separate from your main devices.']]},
    visual:{caption:'A simplified firewall rule table. Traffic is checked from the top down.', html:`
      <table class="code-tbl"><tr><th>#</th><th>Rule</th><th>Traffic</th><th>Action</th></tr>
      <tr><td>1</td><td>Web browsing out</td><td>You → Internet : 443</td><td style="background:#c9f7de">ALLOW</td></tr>
      <tr><td>2</td><td>Replies to your requests</td><td>Internet → You (established)</td><td style="background:#c9f7de">ALLOW</td></tr>
      <tr><td>3</td><td>Remote desktop from unknown</td><td>Internet → PC : 3389</td><td style="background:#ffd6db">BLOCK</td></tr>
      <tr><td>4</td><td>Everything else inbound</td><td>Internet → Any</td><td style="background:#ffd6db">BLOCK</td></tr></table>`},
    scenario:{who:'New router at home', story:'Your family just got fibre internet. The technician leaves and the router still uses its factory settings. Your parents want to "just leave it".', question:'Which change matters most to make first?', options:[
      {t:'Change the default admin password', ok:true, fb:'Correct. Default credentials are publicly listed, so anyone nearby could log in and change your settings.'},
      {t:'Rename the Wi-Fi to something funny', ok:false, fb:'Fun, but it doesn\'t improve security.'},
      {t:'Move the router to the kitchen', ok:false, fb:'Placement affects signal, not security.'}]},
    recap:{points:['Firewalls allow or block traffic using rules.','Use WPA3 (or at least WPA2), never WEP or open.','Change default passwords, keep firmware updated and use a guest network.'],
      terms:[['Firewall','Filters network traffic by rules'],['WPA3','Current strongest Wi-Fi encryption'],['Firmware','Software built into devices'],['WPS','Push-button pairing with known weaknesses']]},
    activity:{type:'toggle', title:'Secure the Network', intro:'You are the admin for this home router. Choose the safest option for every setting, then press "Check".',
      settings:[
        {id:'pw', t:'Router admin password', d:'Used to log in to router settings', opts:['admin (default)','Unique strong password'], good:1, fb:['Default passwords are listed online for every router model.','A unique password stops strangers changing your settings.']},
        {id:'enc', t:'Wi-Fi security', d:'How wireless traffic is encrypted', opts:['Open','WEP','WPA3'], good:2, fb:['Anyone can join and snoop.','WEP can be cracked in minutes.','WPA3 is the current strongest standard.']},
        {id:'fw', t:'Firewall', d:'Filters incoming connections', opts:['Off','On'], good:1, fb:['Without a firewall, unwanted traffic can reach your devices.','The firewall blocks unsolicited inbound traffic.']},
        {id:'wps', t:'WPS push-button pairing', d:'Quick connect feature', opts:['On','Off'], good:1, fb:['WPS has known weaknesses that allow attackers to join.','Turning WPS off removes an easy attack path.']},
        {id:'fwup', t:'Firmware updates', d:'Router software patches', opts:['Manual (never checked)','Automatic'], good:1, fb:['Unpatched routers are a top target for attackers.','Automatic updates close holes quickly.']},
        {id:'guest', t:'Visitors & smart gadgets', d:'Where guest devices connect', opts:['Same as main network','Separate guest network'], good:1, fb:['A compromised guest device could reach your laptop.','Separation limits the damage a bad device can do.']}]},
    quiz:[
      {q:'What is the main job of a firewall?', o:['Filter network traffic based on security rules','Speed up downloads','Store passwords','Cool down the computer'], a:0, e:'Firewalls decide what traffic to allow or block.'},
      {q:'Which Wi-Fi security option is the most secure?', o:['WEP','Open','WPA3','WPS'], a:2, e:'WPA3 is the newest and strongest Wi-Fi encryption standard.'},
      {q:'Why change a router\'s default admin password?', o:['Default passwords are publicly known and easy to guess','It makes Wi-Fi faster','The router will stop working otherwise','To change the network name'], a:0, e:'Lists of default passwords are freely available online.'}]
  }]},

{ id:'m4', n:4, title:'Identity and Access Management', color:'#ffd447', icon:'key',
  blurb:'Passwords, passphrases, multi-factor authentication and least privilege.',
  extra:[
    {q:'A fingerprint is which authentication factor?', o:['Something you know','Something you have','Something you are','Somewhere you are'], a:2, e:'Biometrics (fingerprint, face) are "something you are".'},
    {q:'What is the safest way to manage many accounts?', o:['A password manager with MFA turned on','One strong password used everywhere','Writing passwords in your phone notes','Variations of your birthday'], a:0, e:'A password manager gives every account a unique strong password, and MFA adds a second lock.'}
  ],
  lessons:[
  { id:'m4l1', title:'Passwords & Passphrases', mins:8,
    intro:`<p>Passwords are still the most common lock on our digital lives, and the most commonly broken.</p><p>The good news: a few simple habits make your passwords dramatically harder to crack.</p>`,
    concept:{lead:'What makes a password strong:', points:[
      ['Length beats complexity','A long passphrase like "purple-rambutan-skates-at-noon" is stronger and easier to remember than "P@ss1!".'],
      ['Unique everywhere','If one site leaks your password, attackers try it on every other site (credential stuffing).'],
      ['Nothing personal','Names, birthdays, IC numbers and pet names are easy to guess or find online.'],
      ['Password managers','They create and remember strong, unique passwords for you. You remember just one.']]},
    visual:{caption:'Illustrative estimates of how long an offline guessing attack might take. Real times vary.', html:`
      <div class="hbar"><code>aina2005</code><div class="track"><i style="width:2%;background:#ff5d6e"></i><span>Instantly</span></div></div>
      <div class="hbar"><code>Aina@2005</code><div class="track"><i style="width:12%;background:#ff9a3d"></i><span>Minutes</span></div></div>
      <div class="hbar"><code>M@lays1a!23</code><div class="track"><i style="width:38%;background:#ffd447"></i><span>Weeks</span></div></div>
      <div class="hbar"><code>purple-rambutan-skates-at-noon</code><div class="track"><i style="width:100%;background:#2fc77a"></i><span>Centuries</span></div></div>`},
    scenario:{who:'Danial gets an alert', story:'Danial uses <b>Danial123!</b> for every account. Tonight he gets an alert: "New login to your account from an unknown device in another country."', question:'What should Danial do?', options:[
      {t:'Change that password, change it on every account that uses it, and turn on MFA', ok:true, fb:'Correct. Because he reused the password, every account using it is at risk.'},
      {t:'Ignore it. It\'s probably a glitch.', ok:false, fb:'Unknown-device alerts are often a sign of real account takeover attempts.'},
      {t:'Just delete the app from his phone', ok:false, fb:'Deleting the app doesn\'t log the attacker out or protect the account.'}]},
    recap:{points:['Use long passphrases, at least 12–16 characters.','Never reuse passwords across accounts.','Use a password manager and avoid personal information.'],
      terms:[['Passphrase','A password made of several random words'],['Credential stuffing','Trying leaked passwords on other sites'],['Password manager','A secure vault for passwords'],['Brute force','Trying every possible combination']]},
    activity:{type:'password', title:'Password Strength Challenge', intro:'Create a password that reaches at least "Strong". Watch the meter and checklist react as you type. Don\'t use a real password you actually use!'},
    quiz:[
      {q:'Which password is the strongest?', o:['P@ssw0rd','aina2005','purple-rambutan-skates-at-noon','12345678'], a:2, e:'Length matters most. A long, random passphrase beats short "complex" passwords.'},
      {q:'Why use a unique password for every account?', o:['So one leaked password can\'t unlock your other accounts','Websites require it by law','It makes logging in faster','Unique passwords never expire'], a:0, e:'Reuse lets one breach turn into many (credential stuffing).'},
      {q:'A password manager helps by…', o:['Generating and storing strong, unique passwords','Sharing your passwords with friends','Making all passwords the same','Removing the need for any security'], a:0, e:'You remember one strong master password; the manager handles the rest.'}]
  },
  { id:'m4l2', title:'MFA & Least Privilege', mins:8,
    intro:`<p>Even strong passwords can be stolen. <b>Multi-factor authentication (MFA)</b> adds a second lock so a stolen password alone isn't enough.</p><p>Once someone is logged in, <b>least privilege</b> limits what they can do.</p>`,
    concept:{lead:'Two different questions: who are you, and what can you do?', points:[
      ['Authentication','Proving who you are, for example by logging in.'],
      ['Authorisation','Deciding what you\'re allowed to do once you\'re in.'],
      ['Three factors','Something you KNOW (password, PIN), HAVE (phone, security key), ARE (fingerprint, face).'],
      ['MFA','Combining two or more different factors. Two passwords is still just one factor.'],
      ['Least privilege','Give people only the access they need for their task, nothing more.']]},
    visual:{caption:'MFA only counts when the factors come from different groups.', html:`
      <div class="vgrid"><div class="vbox vt-blue"><b>Know</b>Password · PIN · Secret answer</div><div class="vbox vt-gold"><b>Have</b>Phone app code · Security key · Smart card</div><div class="vbox vt-green"><b>Are</b>Fingerprint · Face · Voice</div></div>
      <div class="vrow" style="margin-top:14px"><div class="vbox vt-green" style="min-width:260px"><b>✔ Real MFA</b>Password + authenticator code</div><div class="vbox vt-red" style="min-width:260px"><b>✘ Not MFA</b>Password + security question</div></div>`},
    scenario:{who:'Your first week as team lead', story:'A new intern needs to schedule posts on your company\'s social media accounts.', question:'What access should the intern get?', options:[
      {t:'Access to the social media scheduling tool only', ok:true, fb:'Correct. That\'s least privilege: exactly what the task needs.'},
      {t:'Full admin access to every system so they never get blocked', ok:false, fb:'Extra access means extra damage if their account is compromised or they make a mistake.'},
      {t:'Your own username and password', ok:false, fb:'Sharing accounts removes accountability and breaks policy.'}]},
    recap:{points:['Authentication = who you are; authorisation = what you can do.','MFA combines different factor types.','Least privilege limits damage from mistakes and attacks.'],
      terms:[['MFA','Two or more different factors'],['Authentication','Verifying identity'],['Authorisation','Granting permissions'],['Least privilege','Minimum access needed']]},
    activity:{type:'sort', title:'Choose the Authentication Factor', intro:'Which type of factor is each item?',
      buckets:[{id:'know',t:'Know',d:'In your head',c:'vt-blue'},{id:'have',t:'Have',d:'In your hand',c:'vt-gold'},{id:'are',t:'Are',d:'Part of you',c:'vt-green'}],
      items:[
        {t:'Your 6-digit PIN', a:'know', fb:'A PIN is memorised: something you know.'},
        {t:'A fingerprint scan', a:'are', fb:'Biometrics are something you are.'},
        {t:'A code from an authenticator app on your phone', a:'have', fb:'The code proves you have your phone.'},
        {t:'The answer to "What was your first school?"', a:'know', fb:'Security questions are something you know, and often easy to research.'},
        {t:'Face recognition', a:'are', fb:'Your face is something you are.'},
        {t:'A physical security key plugged into USB', a:'have', fb:'A hardware key is something you have.'},
        {t:'Your password', a:'know', fb:'Something you know.'},
        {t:'A staff smart card', a:'have', fb:'A card is something you have.'}]},
    quiz:[
      {q:'Which of these is true multi-factor authentication?', o:['Password + code from an authenticator app','Password + PIN','Two different passwords','Username + password'], a:0, e:'Only the first combines two different factor types (know + have).'},
      {q:'Least privilege means…', o:['Giving users only the access they need','Giving everyone admin rights','Removing all passwords','Letting interns approve payments'], a:0, e:'Less access means less damage if something goes wrong.'},
      {q:'Authorisation decides…', o:['What you\'re allowed to do after logging in','Who you are','How long your password is','Which browser you use'], a:0, e:'Authentication proves identity; authorisation grants permissions.'}]
  }]},

{ id:'m5', n:5, title:'Security Operations and Data Protection', color:'#47f59a', icon:'eye',
  blurb:'Encryption, hashing, backups, logs, monitoring and keeping systems patched.',
  extra:[
    {q:'Which data label needs the strongest protection?', o:['Restricted','Public','Internal','Marketing'], a:0, e:'Restricted data (like medical or financial records) would cause serious harm if exposed.'},
    {q:'Changing one character in a file will make its hash…', o:['Completely different','Slightly different','Exactly the same','Shorter'], a:0, e:'This "avalanche effect" is what makes hashes good at spotting changes.'}
  ],
  lessons:[
  { id:'m5l1', title:'Encryption & Hashing', mins:9,
    intro:`<p>Data is valuable, so organisations label it by sensitivity and protect it with the right tools.</p><p>Two of the most important tools are <b>encryption</b> and <b>hashing</b>. They sound similar but do very different jobs.</p>`,
    concept:{lead:'Protecting data at rest and in transit:', points:[
      ['Classification','Label data as Public, Internal, Confidential or Restricted so it gets the right level of protection.'],
      ['Encryption','Scrambles data using a key. Only someone with the right key can unscramble it. It works both ways.'],
      ['Hashing','Turns data into a fixed-length "fingerprint". It can\'t be reversed. Used for storing passwords and checking files haven\'t changed.'],
      ['Backups (3-2-1)','Keep 3 copies of data, on 2 different types of storage, with 1 copy offsite.']]},
    visual:{caption:'Try it: type anything below to see its real SHA-256 hash. Change one letter and the whole hash changes.', html:`
      <div class="vrow"><div class="vbox vt-blue"><b>Plaintext</b>Meet at 3pm</div><div class="varrow">→ 🔑 →</div><div class="vbox vt-purple"><b>Ciphertext</b><span style="font-family:var(--f-term);font-size:18px">U2FsdGVkX1+9xk…</span></div><div class="varrow">→ 🔑 →</div><div class="vbox vt-blue"><b>Plaintext</b>Meet at 3pm</div></div>
      <div class="hash-demo"><label class="label" for="hashIn" style="color:#4a5180">Hash playground (SHA-256)</label><input id="hashIn" class="pw-input" value="cybersity" autocomplete="off"><div class="hash-out" id="hashOut">…</div></div>`},
    scenario:{who:'Club secretary duties', story:'Your club needs a list of members\' IC numbers and phone numbers for an event booking. Someone suggests emailing the spreadsheet to all 40 members.', question:'What\'s the best approach?', options:[
      {t:'Share only the data needed, through an access-controlled and encrypted shared folder', ok:true, fb:'Correct. Minimise the data, then limit who can open it.'},
      {t:'Email it as a normal attachment to everyone', ok:false, fb:'Personal data would sit in 40 inboxes, with 40 chances of a leak.'},
      {t:'Post it in the club\'s group chat', ok:false, fb:'Group chats are easily forwarded and screenshotted.'}]},
    recap:{points:['Classify data so sensitive data gets stronger protection.','Encryption is reversible with a key; hashing is one-way.','Follow the 3-2-1 backup rule.'],
      terms:[['Encryption','Reversible scrambling using a key'],['Hashing','One-way fingerprint of data'],['Classification','Labelling data by sensitivity'],['3-2-1 rule','3 copies, 2 media, 1 offsite']]},
    activity:{type:'match', title:'Protect the Data', intro:'Match each situation with the protection that fits it best.',
      left:[
        {id:'fde', t:'A laptop holding customer files could be stolen'},
        {id:'hash', t:'A website needs to store user passwords safely'},
        {id:'backup', t:'Ransomware could wipe out the office\'s files'},
        {id:'acl', t:'Only HR should be able to open salary records'},
        {id:'tls', t:'A confidential report is sent over the internet'}],
      right:[{id:'hash',t:'Hashing'},{id:'tls',t:'Encrypted connection (HTTPS/TLS)'},{id:'fde',t:'Full-disk encryption'},{id:'acl',t:'Access control permissions'},{id:'backup',t:'Offline backups'}]},
    quiz:[
      {q:'What is the key difference between encryption and hashing?', o:['Encryption can be reversed with a key; hashing is one-way','Hashing is reversible; encryption isn\'t','They are exactly the same','Hashing makes files bigger'], a:0, e:'Use encryption to protect data you need to read again; use hashing to verify data.'},
      {q:'Websites should store user passwords as…', o:['Salted hashes','Plain text','An encrypted spreadsheet emailed to staff','Screenshots'], a:0, e:'Hashing means even the website can\'t read your actual password.'},
      {q:'The 3-2-1 backup rule means…', o:['3 copies, 2 types of storage, 1 kept offsite','Back up every 3 days, 2 times, for 1 year','3 passwords, 2 users, 1 admin','Delete 3 files, keep 2, back up 1'], a:0, e:'Multiple copies in different places survive disasters and ransomware.'}]
  },
  { id:'m5l2', title:'Logs & Monitoring', mins:8,
    intro:`<p>You can't stop what you can't see. Organisations record events in <b>logs</b> and watch them for signs of trouble.</p><p>Many organisations run a <b>Security Operations Centre (SOC)</b> where analysts monitor alerts around the clock.</p>`,
    concept:{lead:'How defenders spot attacks:', points:[
      ['Logs','Records of events: logins, file access, errors, configuration changes.'],
      ['Monitoring','Watching logs and alerts to catch problems early, often with tools called SIEMs.'],
      ['Red flags','Many failed logins, logins from unusual places or times, surprise new admin accounts, large data transfers at night.'],
      ['Endpoint protection','Antivirus/EDR on devices that detects and blocks malware.'],
      ['Vulnerability management','Regularly finding, prioritising and patching weaknesses.']]},
    visual:{caption:'A snippet of authentication logs. Can you see the pattern in the highlighted rows?', html:`
      <table class="code-tbl"><tr><th>Time</th><th>Event</th><th>User</th><th>Source</th></tr>
      <tr><td>08:58</td><td>LOGIN_SUCCESS</td><td>amir.it</td><td>Office, KL</td></tr>
      <tr style="background:#ffd6db"><td>03:10</td><td>LOGIN_FAILED ×40</td><td>siti.hr</td><td>Unknown country</td></tr>
      <tr style="background:#ffd6db"><td>03:12</td><td>LOGIN_SUCCESS</td><td>siti.hr</td><td>Unknown country</td></tr>
      <tr><td>09:15</td><td>FILE_OPEN</td><td>nurul.fin</td><td>Office, KL</td></tr></table>`},
    scenario:{who:'You\'re on SOC duty tonight', story:'At 3:12 AM, the account <b>siti.hr</b> logs in successfully from an unrecognised country, straight after 40 failed attempts.', question:'What should you do?', options:[
      {t:'Treat it as a likely compromise: lock the account, alert the team and verify with Siti', ok:true, fb:'Correct. This pattern strongly suggests a brute-force attack that succeeded.'},
      {t:'Ignore it. The login eventually succeeded, so it must be Siti.', ok:false, fb:'A success after many failures from a strange location is a classic attack signature.'},
      {t:'Delete the logs to keep the system tidy', ok:false, fb:'Logs are evidence. Deleting them hides what happened.'}]},
    recap:{points:['Logs record what happens on systems.','Monitoring turns logs into early warnings.','Watch for failed-login bursts, odd locations, new admin accounts and big transfers.'],
      terms:[['Log','A record of a system event'],['SOC','Security Operations Centre'],['SIEM','Tool that collects and analyses logs'],['EDR','Endpoint detection and response']]},
    activity:{type:'select', variant:'logs', title:'Log Detective', intro:'You\'re a SOC analyst. Click every log line that looks suspicious, then press "Check". There are 5.',
      lines:[
        {id:'l1', time:'08:58', t:'LOGIN_SUCCESS user=amir.it src=10.0.4.21 (Office KL)', bad:false, fb:'A normal office login during work hours.'},
        {id:'l2', time:'09:02', t:'FILE_OPEN user=nurul.fin file=budget_q3.xlsx', bad:false, fb:'Finance opening a budget file is expected.'},
        {id:'l3', time:'02:14', t:'LOGIN_FAILED x38 user=admin src=203.0.113.45', bad:true, fb:'38 failed attempts on "admin" at 2 AM: a brute-force attack.'},
        {id:'l4', time:'02:16', t:'LOGIN_SUCCESS user=admin src=203.0.113.45 (Unknown country)', bad:true, fb:'Success from the same attacking address: the attacker got in.'},
        {id:'l5', time:'02:17', t:'USER_CREATED user=backup_svc2 by=admin', bad:true, fb:'A surprise new account right after the break-in: likely a backdoor.'},
        {id:'l6', time:'10:30', t:'PRINT job=meeting_notes.pdf user=lee.ops', bad:false, fb:'A routine print job.'},
        {id:'l7', time:'02:25', t:'DATA_TRANSFER 4.2GB to external host by backup_svc2', bad:true, fb:'Huge outbound transfer at night by the new account: data theft.'},
        {id:'l8', time:'11:05', t:'PASSWORD_CHANGED user=farah.hr (self-service)', bad:false, fb:'Users changing their own password is normal.'},
        {id:'l9', time:'13:40', t:'AV_ALERT quarantined invoice_scan.exe on PC-ACC-07', bad:true, fb:'Malware was detected. Even when it\'s blocked, it needs investigating.'},
        {id:'l10', time:'14:00', t:'SOFTWARE_UPDATE browser patched on 112 devices', bad:false, fb:'Routine patching is good practice.'}]},
    quiz:[
      {q:'Many failed logins followed by a success from an unusual location suggests…', o:['A brute-force attack that succeeded','A normal login','A printer error','A software update'], a:0, e:'This pattern is a classic sign of account compromise.'},
      {q:'What is the main purpose of security monitoring?', o:['Detecting suspicious activity early','Making computers faster','Designing websites','Writing passwords down'], a:0, e:'The earlier an attack is spotted, the less damage it does.'},
      {q:'Vulnerability management involves…', o:['Finding, prioritising and patching weaknesses','Buying new laptops every year','Creating more admin accounts','Turning off antivirus'], a:0, e:'It\'s an ongoing cycle of finding and fixing weaknesses.'}]
  }]},

{ id:'m6', n:6, title:'Incident Response and Security Governance', color:'#a46bff', icon:'flag',
  blurb:'Risk management, security policies and what to do when things go wrong.',
  extra:[
    {q:'Which comes first in the incident response lifecycle?', o:['Preparation','Recovery','Eradication','Lessons learned'], a:0, e:'Good response starts before any incident, with plans, tools and training.'},
    {q:'Why shouldn\'t you wipe an infected computer immediately?', o:['Evidence may be needed to understand what happened','Wiping is illegal','It makes the computer slower','Malware can\'t be removed'], a:0, e:'Investigators need evidence to find out how the attacker got in and what was affected.'}
  ],
  lessons:[
  { id:'m6l1', title:'Risk & Security Policies', mins:8,
    intro:`<p>No organisation can stop every threat, so security is about managing <b>risk</b>: focusing effort where it matters most.</p><p><b>Policies</b> turn those decisions into clear rules everyone can follow.</p>`,
    concept:{lead:'How organisations handle risk:', points:[
      ['Risk assessment','Rate each risk by likelihood (how probable) × impact (how bad).'],
      ['Avoid','Stop the risky activity altogether.'],
      ['Reduce','Add controls such as MFA, training or patching to lower the risk.'],
      ['Transfer','Shift the cost to someone else, for example through insurance or a trusted provider.'],
      ['Accept','Live with low risks that cost more to fix than they\'re worth.'],
      ['Security policy','The organisation\'s rules, e.g. Acceptable Use, Password and Data Handling policies.']]},
    visual:{caption:'A risk matrix. Red cells need action first.', html:`
      <div class="matrix"><div class="h"></div><div class="h">Low impact</div><div class="h">Medium</div><div class="h">High impact</div>
      <div class="h">High likelihood</div><div class="vt-gold">Medium</div><div class="vt-red">High</div><div class="vt-red"><b>Critical</b><br><small>Phishing of staff</small></div>
      <div class="h">Medium</div><div class="vt-green">Low</div><div class="vt-gold">Medium</div><div class="vt-red">High</div>
      <div class="h">Low likelihood</div><div class="vt-green">Low<br><small>Office plant log leak</small></div><div class="vt-green">Low</div><div class="vt-gold">Medium<br><small>Data centre flood</small></div></div>`},
    scenario:{who:'Kak Mira\'s Bakery', story:'A small bakery starts taking online orders and worries about customer card numbers being stolen.', question:'What\'s the most sensible approach?', options:[
      {t:'Use a trusted payment provider so the bakery never stores card numbers', ok:true, fb:'Correct. Transferring the card handling to specialists reduces the bakery\'s risk a lot.'},
      {t:'Store card numbers in a spreadsheet on the shop laptop', ok:false, fb:'That makes the laptop a high-value target with weak protection.'},
      {t:'Stop selling online forever', ok:false, fb:'Avoidance works, but here it\'s too drastic. Safer options exist.'}]},
    recap:{points:['Risk = likelihood × impact.','Four responses: avoid, reduce, transfer, accept.','Policies set clear rules; awareness makes people the first line of defence.'],
      terms:[['Likelihood','How probable a risk is'],['Impact','How much damage it would cause'],['Risk transfer','Shifting cost via insurance or providers'],['AUP','Acceptable Use Policy']]},
    activity:{type:'match', title:'Choose the Risk Response', intro:'Match each decision to the type of risk response it shows.',
      left:[
        {id:'transfer', t:'Buy cyber insurance to cover the costs of a breach'},
        {id:'reduce', t:'Roll out MFA and phishing training to staff'},
        {id:'avoid', t:'Stop using an old app that can no longer be patched'},
        {id:'accept', t:'A leak of the office plant-watering schedule would be harmless, so leave it as is'}],
      right:[{id:'avoid',t:'Avoid'},{id:'reduce',t:'Reduce'},{id:'transfer',t:'Transfer'},{id:'accept',t:'Accept'}]},
    quiz:[
      {q:'Risk is usually assessed by combining…', o:['Likelihood and impact','Speed and size','Cost and colour','Users and devices'], a:0, e:'Likelihood × impact tells you which risks to tackle first.'},
      {q:'Buying cyber insurance is an example of…', o:['Transferring risk','Avoiding risk','Accepting risk','Ignoring risk'], a:0, e:'Insurance shifts the financial impact to another party.'},
      {q:'An Acceptable Use Policy tells staff…', o:['How they may and may not use company systems','Their salary','Where to park','The Wi-Fi password'], a:0, e:'AUPs set expectations for responsible use of IT resources.'}]
  },
  { id:'m6l2', title:'Responding to Incidents', mins:9,
    intro:`<p>Even with good defences, incidents happen. What matters is responding quickly and calmly.</p><p>Security teams follow an <b>incident response lifecycle</b> so nothing important gets missed under pressure.</p>`,
    concept:{lead:'The incident response lifecycle (based on common industry frameworks):', points:[
      ['Prepare','Plans, contacts, tools and training ready before anything happens.'],
      ['Identify','Detect and confirm that an incident is really happening.'],
      ['Contain','Stop it spreading, e.g. disconnect infected machines or disable a compromised account.'],
      ['Eradicate','Remove the cause: delete malware, close the hole.'],
      ['Recover','Restore systems from clean backups and monitor them closely.'],
      ['Lessons learned','Review what happened and improve, so it doesn\'t happen again.']]},
    visual:{caption:'The cycle repeats. Lessons learned feed back into preparation.', html:`
      <div class="vrow"><div class="vbox vt-blue"><b>1 Prepare</b></div><div class="varrow">→</div><div class="vbox vt-cyan"><b>2 Identify</b></div><div class="varrow">→</div><div class="vbox vt-gold"><b>3 Contain</b></div><div class="varrow">→</div><div class="vbox vt-red"><b>4 Eradicate</b></div><div class="varrow">→</div><div class="vbox vt-green"><b>5 Recover</b></div><div class="varrow">→</div><div class="vbox vt-purple"><b>6 Lessons</b></div><div class="varrow">↺</div></div>`},
    scenario:{who:'Oops…', story:'You clicked a link in an email that looked like it came from IT and typed in your work password. A moment later, you realise the page was fake.', question:'What now?', options:[
      {t:'Report it to IT/security straight away and change your password', ok:true, fb:'Correct. Fast reporting gives the team time to contain the damage. Nobody will be angry that you reported it.'},
      {t:'Keep quiet. You\'re embarrassed.', ok:false, fb:'Silence gives the attacker time. Reporting quickly is the responsible move.'},
      {t:'Delete the email and hope nothing happens', ok:false, fb:'The attacker already has your password. Deleting the email doesn\'t undo that.'}]},
    recap:{points:['Follow the lifecycle: Prepare, Identify, Contain, Eradicate, Recover, Lessons learned.','Report incidents early, because speed limits the damage.','Preserve evidence; don\'t wipe systems before investigating.'],
      terms:[['Incident','An event threatening confidentiality, integrity or availability'],['Containment','Stopping the spread'],['Eradication','Removing the cause'],['Post-incident review','The "lessons learned" meeting']]},
    activity:{type:'order', title:'Incident Response Order', intro:'Ransomware hit a small office. Click the steps in the correct order to build the response plan.',
      steps:[
        {id:'prep', t:'Prepare: have a response plan and backups in place'},
        {id:'ident', t:'Identify: confirm the ransomware alert is real'},
        {id:'cont', t:'Contain: disconnect infected PCs from the network'},
        {id:'erad', t:'Eradicate: remove the malware and fix the entry point'},
        {id:'rec', t:'Recover: restore files from clean backups'},
        {id:'less', t:'Lessons learned: review and improve defences'}]},
    quiz:[
      {q:'What should you do first after realising you entered your password on a phishing site?', o:['Report it and change the password immediately','Wait to see what happens','Delete your browser history','Tell nobody'], a:0, e:'Speed matters. Report and reset to cut off the attacker.'},
      {q:'In incident response, "containment" means…', o:['Stopping the incident from spreading','Buying new computers','Writing the final report','Restoring backups'], a:0, e:'Contain first, then eradicate and recover.'},
      {q:'Why hold a "lessons learned" review?', o:['To improve defences so it doesn\'t happen again','To blame someone','To delete evidence','It\'s optional and pointless'], a:0, e:'Every incident is a chance to strengthen security.'}]
  }]}
];

/* "Teach your family" cards: a 1-minute, plain-language summary of each lesson to share with parents and grandparents */
const FAMILY_CARDS = {
  m1l1:{h:'Your phone and accounts are worth protecting', tips:['Scammers look for easy weak spots, like an old password or a phone that never updates.','Use a different password for your important accounts, like email and banking.','Turn on automatic updates so your phone fixes its own security holes.'], try:'Check together that your phone is set to update automatically.'},
  m1l2:{h:'Keep it private, correct and working', tips:['Private: never let others see your banking app, PIN or passwords.','Correct: be suspicious of messages asking you to change payment details.','Working: back up your photos so a broken or lost phone does not lose them.'], try:'Turn on photo backup together today.'},
  m2l1:{h:'Stop, check, then click', tips:['Banks never ask for your password, PIN or TAC/OTP by SMS, call or WhatsApp.','Messages that rush you ("act within 24 hours!") are a warning sign.','Do not tap links in messages. Open the official app or website yourself.'], try:'If you think you have been scammed, call NSRC 997 straight away.'},
  m2l2:{h:'Only install apps from the official app store', tips:['Never open .apk files or attachments sent by strangers on WhatsApp.','Fake wedding invitations and parcel notices can hide malware.','Keep your phone updated and your photos backed up.'], try:'Look through the apps on your phone together and remove ones you do not use.'},
  m3l1:{h:'Free public Wi-Fi is shared with strangers', tips:['Use mobile data, not public Wi-Fi, for banking.','Check the website address carefully before you log in.','Turn off auto-connect to unknown Wi-Fi networks.'], try:'Switch off auto-join for public Wi-Fi in your phone settings.'},
  m3l2:{h:'Lock your home Wi-Fi', tips:['Change the router\'s default admin password.','Use WPA2 or WPA3 security with a long Wi-Fi password.','Keep the router updated, or ask your internet provider to.'], try:'Find the sticker on your router and check its settings together.'},
  m4l1:{h:'Long passphrases beat short tricky passwords', tips:['Use 3 or 4 random words joined together, like "mango-kettle-rain-bicycle".','Never reuse your email password anywhere else.','A password manager can remember all your passwords for you.'], try:'Change one password you use on more than one account.'},
  m4l2:{h:'Turn on two-step login', tips:['Two-step login asks for a code or approval when someone signs in.','Never share that code with anyone, not even "the bank" or "the police".','Give apps and people only the access they really need.'], try:'Turn on two-step verification in WhatsApp settings.'},
  m5l1:{h:'The padlock means private, not honest', tips:['The padlock in the address bar means the connection is private, not that the website is genuine.','Use encrypted chat apps for private conversations.','A phone screen lock keeps your data scrambled if the phone is stolen.'], try:'Set a 6-digit screen lock or fingerprint unlock.'},
  m5l2:{h:'Check who is using your accounts', tips:['Turn on login and transaction alerts for email and banking.','See a login or payment you do not recognise? Change your password and call your bank.','Read alerts from your bank instead of ignoring them.'], try:'Check "Linked devices" in WhatsApp together and remove any you do not know.'},
  m6l1:{h:'Make a simple family safety plan', tips:['Family rule: never send money after a single message or call. Call back on a number you know.','Keep important documents and photos backed up.','Agree who to call first if something goes wrong.'], try:'Choose a family "safe word" to check that urgent calls are really from family.'},
  m6l2:{h:'If something goes wrong, act fast', tips:['Do not panic or hide it. Tell someone you trust.','Change your passwords and call your bank immediately.','Report scams to NSRC 997 and keep screenshots as evidence.'], try:'Save 997 in your contacts today.'}
};

/* "What to do in real life" box shown at the end of scam lessons (lessons with realLife:'scam') */
const SCAM_STEPS = [
  {t:'Call NSRC 997 within 24 hours', d:'The National Scam Response Centre works with banks and the police. The sooner you call, the better the chance your money can be traced and frozen.', call:true},
  {t:'Contact your bank', d:'Call the hotline on the back of your card or in the official banking app. Ask them to block your card or account, then change your online banking password.'},
  {t:'Report the number', d:'Report the scammer\'s phone number and bank account to the police (PDRM), and block and report them in the app they used. You can check suspicious numbers and accounts on the PDRM Semak Mule portal.'}
];
const LESSON_STAGES = ['Introduction','Concept','Visual example','Scenario','Recap','Activity','Lesson quiz'];

const LEVELS = [
  {xp:0, t:'Newbie'}, {xp:200, t:'Script Scout'}, {xp:450, t:'Firewall Cadet'}, {xp:800, t:'Packet Ranger'},
  {xp:1200, t:'Cyber Defender'}, {xp:1700, t:'Security Guardian'}, {xp:2300, t:'Cyber Sentinel'}
];
const XP = { lesson:50, activity:30, perfectActivity:15, quiz:40, perfectQuiz:20, module:100, final:250, mentor:5, chat:5, health:10, healthFull:50, taster:20, incident:150, tour:25, arcade:30, arcadeWin:20 }; // arcade: up to 30 XP for accuracy + 20 for finishing a run

const BADGES = [
  {id:'hello', t:'Hello, World', d:'Joined the Cybersity campus', icon:'home', c:'#4c78ff'},
  {id:'firstbyte', t:'First Byte', d:'Completed your first lesson', icon:'book', c:'#2ee6ff'},
  {id:'phish', t:'Phish Spotter', d:'Found every sign in Spot the Phishing Email', icon:'fish', c:'#ff4fae'},
  {id:'pass', t:'Passphrase Pro', d:'Built an Excellent password', icon:'key', c:'#ffd447'},
  {id:'perfect', t:'Perfect Score', d:'Scored 100% on any quiz', icon:'star', c:'#ffd447'},
  {id:'curious', t:'Curious Mind', d:'Asked BYTE 3 questions', icon:'chip', c:'#a46bff'},
  {id:'social', t:'Social Butterfly', d:'Sent your first community message', icon:'chat', c:'#ff4fae'},
  {id:'module', t:'Module Master', d:'Passed your first module assessment', icon:'trophy', c:'#ffd447'},
  {id:'netguard', t:'Network Guardian', d:'Secured the router with every setting right', icon:'network', c:'#2ee6ff'},
  {id:'detective', t:'Log Detective', d:'Found every suspicious log line', icon:'eye', c:'#47f59a'},
  {id:'halfway', t:'Halfway Hero', d:'Passed 3 module assessments', icon:'shield', c:'#4c78ff'},
  {id:'grad', t:'Cyber Graduate', d:'Earned the Certificate of Completion', icon:'scroll', c:'#ffd447'},
  {id:'homesafe', t:'Home Secured', d:'Reached a 100% Safety Score at Home Base', icon:'shield', c:'#47f59a'},
  {id:'explorer', t:'Career Explorer', d:'Completed a taster mission from the Career Compass', icon:'compass', c:'#ffd447'},
  {id:'arc_virus', t:'Virus Buster', d:'Saved the campus in Virus Escape with 70%+ accuracy', icon:'shield', c:'#47f59a'},
  {id:'arc_rocket', t:'Firewall Pilot', d:'Finished Rocket Firewall with 70%+ accuracy', icon:'star', c:'#2ee6ff'},
  {id:'arc_packet', t:'Packet Sorter', d:'Finished Packet Drop with 70%+ accuracy', icon:'network', c:'#ff4fae'},
  {id:'orient', t:'Orientation Complete', d:'Finished the campus tour with BYTE', icon:'campus', c:'#a46bff'},
  {id:'defender', t:'Campus Defender', d:'Secured all six buildings during the campus incident', icon:'shield', c:'#ff5d6e'}
];

/* Campus Incident: a virus monster attacks the campus (presenter gear menu, or the campus alert after Module 2).
   Virus Escape secures these buildings in this order; the campus shows each one restored. */
const INCIDENT = [ {b:'library'}, {b:'ailab'}, {b:'community'}, {b:'challenge'}, {b:'achieve'}, {b:'cert'} ];
/* Career Compass: signpost on the plaza, role quiz, role pages with taster missions and roadmaps */
const CAREER_SIGN = {id:'compass', name:'Career Compass', view:'career', color:'#ffd447', icon:'compass', desc:'Find the cyber role that fits you and your roadmap to a first job'};
const CAREERS = [
  {id:'soc', t:'SOC Analyst', icon:'eye', c:'#47f59a', tag:'The detective who watches for attacks',
    what:'A SOC (Security Operations Centre) analyst watches an organisation\'s alerts and logs, spots the signs of an attack and raises the alarm early. Many people start their cyber career here.',
    day:['Check new alerts from security tools and decide which ones are real','Dig through logs to see what a suspicious account or device did','Write up findings and pass serious cases to the incident response team'],
    fit:'You enjoy spotting patterns and the small details other people miss.',
    mission:{lesson:'m5l2', brief:'A SOC analyst\'s day starts with logs. Find every suspicious line before the attacker gets further.'},
    road:{basics:'Module 5: Logs & Monitoring', next:'Networking basics, Linux and Windows command line, reading alerts in a SIEM tool', practice:'TryHackMe SOC Level 1 path, LetsDefend, Blue Team Labs Online', cert:'ISC2 CC or CompTIA Security+, later CompTIA CySA+', exp:'Home lab with a free SIEM, blue-team CTFs, IT helpdesk or SOC internship', job:'Junior SOC Analyst (Tier 1)'}},
  {id:'pentest', t:'Penetration Tester', icon:'key', c:'#ff4fae', tag:'The ethical hacker who breaks in first',
    what:'A penetration tester is paid, with written permission, to find a way into systems, websites or even staff inboxes before criminals do, then explains exactly how to fix each hole.',
    day:['Agree with the client what may be tested and what is off-limits','Probe websites, networks and people (for example with a phishing test) for weaknesses','Write a clear report of every weakness and how to fix it'],
    fit:'You love puzzles, asking "what if?" and finding loopholes.',
    mission:{lesson:'m2l1', brief:'Pen testers run phishing tests to check whether staff can be tricked. Can you spot every trick in this email?'},
    road:{basics:'Module 2: Phishing & Malware', next:'Networking, Linux, how websites work, basic Python or Bash scripting', practice:'TryHackMe Jr Penetration Tester path, Hack The Box Academy, picoCTF', cert:'CompTIA Security+, then an entry pen-test certificate such as eJPT or CompTIA PenTest+', exp:'CTF competitions, legal practice labs, bug bounty programmes, internship', job:'Junior Penetration Tester'}},
  {id:'ir', t:'Incident Responder', icon:'flag', c:'#ff9a3d', tag:'The firefighter when an attack hits',
    what:'When an attack gets through, the incident responder takes charge: contains the damage, removes the attacker and gets the organisation running again, step by step.',
    day:['Lead the response when ransomware or a breach is confirmed','Isolate infected devices and collect evidence','Help restore systems and run the "lessons learned" review'],
    fit:'You stay calm under pressure and like fixing things fast.',
    mission:{lesson:'m6l2', brief:'Ransomware just hit a small office. Put the response plan in the right order before it spreads.'},
    road:{basics:'Module 6: Incident Response', next:'How operating systems work, malware basics, digital forensics, clear communication', practice:'CyberDefenders, LetsDefend, Blue Team Labs Online', cert:'CompTIA Security+, later CompTIA CySA+ or GIAC GCIH', exp:'Start in a SOC, join incident simulation exercises, blue-team CTFs', job:'Junior Incident Response Analyst'}},
  {id:'grc', t:'GRC / Risk Analyst', icon:'scroll', c:'#a46bff', tag:'The planner who keeps the rules strong',
    what:'GRC means Governance, Risk and Compliance. These analysts decide which risks matter most, write security policies and check that the organisation follows laws and standards.',
    day:['Run risk assessments and update the risk register','Write or update policies such as the Acceptable Use Policy','Prepare the organisation for audits against standards like ISO/IEC 27001'],
    fit:'You like organising, writing clearly and seeing the big picture.',
    mission:{lesson:'m6l1', brief:'A GRC analyst decides how to handle each risk. Match every decision to the right risk response.'},
    road:{basics:'Module 6: Risk & Security Policies', next:'Risk management, frameworks such as NIST CSF and ISO/IEC 27001, data protection laws such as Malaysia\'s PDPA', practice:'NIST CSF 2.0 quick-start guides, ISO/IEC 27001 introduction courses, a practice risk assessment for a small business', cert:'ISC2 CC or CompTIA Security+, then ISO/IEC 27001 Foundation; later ISACA CISA', exp:'Write a security policy for a club or small business, audit or compliance internship', job:'Junior GRC Analyst'}},
  {id:'net', t:'Network Security Engineer', icon:'network', c:'#2ee6ff', tag:'The builder of safe networks',
    what:'A network security engineer designs and looks after the networks that keep data moving, and builds the defences around them: firewalls, secure Wi-Fi, VPNs and separated network zones.',
    day:['Set up and review firewall rules','Configure secure Wi-Fi and VPN access for staff','Monitor network health and fix weak settings'],
    fit:'You like building things and making technology work together.',
    mission:{lesson:'m3l2', brief:'A router has been left with unsafe settings. Secure the network before anyone notices.'},
    road:{basics:'Module 3: Network Security', next:'Networking in depth (IP addressing, routing, switching), firewalls and VPNs, Linux', practice:'Cisco Packet Tracer (with Cisco Networking Academy), TryHackMe Pre Security path, a home lab', cert:'Cisco CCST Networking or CompTIA Network+, then CompTIA Security+ or Cisco CCNA', exp:'Build a home lab, IT support or network internship, campus IT volunteering', job:'Junior Network Security Engineer'}}
];
const ROADMAP_STEPS = [
  {k:'basics', t:'Cybersity basics', cover:'full'},
  {k:'next', t:'Next skills', cover:'part'},
  {k:'practice', t:'Practice platforms', cover:'none'},
  {k:'cert', t:'Entry-level certificate', cover:'none'},
  {k:'exp', t:'Experience', cover:'none'},
  {k:'job', t:'First job', cover:'none'}
];
const CAREER_QUIZ = [
  {q:'You have a free afternoon. What sounds most fun?', o:[
    {t:'Spotting patterns in a pile of data', r:'soc'},{t:'Solving a tricky puzzle or escape room', r:'pentest'},{t:'Helping a friend fix a problem fast', r:'ir'},{t:'Planning an event so nothing goes wrong', r:'grc'},{t:'Building or setting up gadgets', r:'net'}]},
  {q:'In a group project, you are usually the one who…', o:[
    {t:'Notices the small detail everyone missed', r:'soc'},{t:'Tests the idea to see where it breaks', r:'pentest'},{t:'Steps up when things go wrong', r:'ir'},{t:'Organises the tasks and deadlines', r:'grc'},{t:'Sets up the tools so everything works', r:'net'}]},
  {q:'Which Cybersity game did you enjoy most (or sounds best)?', o:[
    {t:'Log Detective', r:'soc'},{t:'Spot the Phishing Email', r:'pentest'},{t:'Incident Response Order', r:'ir'},{t:'Choose the Risk Response', r:'grc'},{t:'Secure the Network', r:'net'}]},
  {q:'Which way of working suits you best?', o:[
    {t:'Steady shifts, watching screens for clues', r:'soc'},{t:'Short projects, hacking with permission', r:'pentest'},{t:'Fast action whenever the alarm rings', r:'ir'},{t:'Meetings, documents and advising managers', r:'grc'},{t:'Hands-on with routers, firewalls and settings', r:'net'}]},
  {q:'What would make you proudest at work?', o:[
    {t:'Catching an attacker early', r:'soc'},{t:'Finding a weakness before criminals do', r:'pentest'},{t:'Getting a company back online after an attack', r:'ir'},{t:'Helping a company pass a security audit', r:'grc'},{t:'Designing a network attackers cannot get into', r:'net'}]}
];

/* Home Base: the learner's dorm on campus. Real-life actions, self-reported, raise the Safety Score. */
const HOME_BASE = {id:'home', name:'Home Base', view:'home', color:'#47f59a', roof:'#1f7a4a', icon:'home', desc:'Your dorm: real-life security checklist and Safety Score'};
const HEALTH_CHECKS = [
  {id:'mfa', t:'Turn on 2FA for your email', icon:'key',
    how:'Open your email account settings, go to Security and turn on 2-Step Verification. Choose an authenticator app if it is offered.',
    why:'Your email can reset every other password, so it is the master key to all your accounts.'},
  {id:'update', t:'Update your phone', icon:'shield',
    how:'Go to Settings, then System or Software update, install anything waiting and switch on automatic updates.',
    why:'Most attacks use security holes that already have a fix. Updating closes them.'},
  {id:'unique', t:'Use a unique password for your main account', icon:'lock',
    how:'Change it to a long passphrase you use nowhere else, or let a password manager create one for you.',
    why:'If another site leaks your password, attackers cannot reuse it to get into your main account.'},
  {id:'screen', t:'Set a screen lock', icon:'lock',
    how:'Go to Settings, then Security or Face ID & Passcode, and set a 6-digit PIN, fingerprint or face unlock.',
    why:'A lost, stolen or borrowed phone stays private: your chats, photos and banking apps stay locked.'},
  {id:'backup', t:'Back up your photos', icon:'star',
    how:'Turn on Google Photos or iCloud backup, or copy your photos to an external drive.',
    why:'A broken phone, theft or ransomware will not wipe out your memories.'},
  {id:'perms', t:'Review app permissions', icon:'eye',
    how:'Go to Settings, then Privacy or Permission manager, and remove location, camera, microphone and contacts access that apps do not need.',
    why:'Fewer permissions means less of your data leaks if an app turns out to be malicious.'},
  {id:'nsrc', t:'Save the scam hotline 997', icon:'chat',
    how:'Add a contact called "NSRC Scam Hotline" with the number 997.',
    why:'If you are scammed, calling the National Scam Response Centre quickly gives the best chance of freezing the money.'}
];
const HOME_STAGES = [
  {t:'Dark and plain', d:'Tick your first action to switch the lights on.'},
  {t:'Lights on', d:'Your dorm is waking up. Reach 4 actions to lock the door.'},
  {t:'Locked down', d:'The door is padlocked. Finish every action to raise the shield.'},
  {t:'Shield up', d:'Fully secured. Your dorm glows with a shield and sign.'}
];

const BUILDINGS = [
  {id:'library', name:'Cyber Library', view:'library', color:'#4c78ff', roof:'#2a3fa8', icon:'book', desc:'Learning modules and lesson materials'},
  {id:'ailab', name:'AI Lab', view:'mentor', color:'#a46bff', roof:'#5d2fb0', icon:'chip', desc:'Chat with BYTE, your AI Cybersecurity Mentor'},
  {id:'community', name:'Community Hub', view:'community', color:'#ff4fae', roof:'#a8216b', icon:'chat', desc:'Discussion rooms and learners online'},
  {id:'challenge', name:'Challenge Centre', view:'challenge', color:'#ff9a3d', roof:'#b0561a', icon:'flag', desc:'Activities, quizzes and assessments'},
  {id:'achieve', name:'Achievement Hall', view:'achievements', color:'#ffd447', roof:'#a8851a', icon:'trophy', desc:'XP, levels, badges and progress'},
  {id:'cert', name:'Certificate Hall', view:'certificate', color:'#2ee6ff', roof:'#1a7f93', icon:'scroll', desc:'Certificate eligibility and your certificate'}
];

const TIPS = [
  'Real banks will never ask for your password or TAC/OTP by SMS, email or phone.',
  'Turn on automatic updates. Most attacks use holes that already have a fix.',
  'Hover over a link before clicking to see where it really goes.',
  'A long passphrase beats a short "complex" password.',
  'Use mobile data instead of open public Wi-Fi for banking.',
  'Back up important files using the 3-2-1 rule.',
  'If you clicked something suspicious, report it quickly. Speed limits damage.'
];

/* ---------- CYBER ARCADE content ----------
   Arcade games answer by moving, so options must fit in lanes, gates and bins: short questions,
   3 options of 1-4 words (correct answer first; the game shuffles them) and a one-line explanation. */
const ARCADE_GAMES = [
  {id:'virus', t:'Virus Escape', color:'#47f59a', diff:'Medium', badge:'arc_virus',
    desc:'A virus monster is loose on campus. Run, switch into the lane with the right answer and secure all 6 buildings.',
    how:'Switch lanes to run through the sign with the right answer. Wrong lanes make you stumble and the monster gets closer.'},
  {id:'rocket', t:'Rocket Firewall', color:'#2ee6ff', diff:'Easy', badge:'arc_rocket',
    desc:'Pilot your rocket through deep space and fly through the gate with the right answer.',
    how:'Steer up and down into the gate with the right answer. A wrong gate costs a shield.'},
  {id:'packet', t:'Packet Drop', color:'#ff4fae', diff:'Hard', badge:'arc_packet',
    desc:'Data packets are falling. Slide each one into the right bin before the stack overflows.',
    how:'Move each falling block left or right and drop it into the correct bin. Wrong bins stack junk blocks.'}
];
const ARCADE_QS = [
  // Module 1: cybersecurity basics and the CIA triad
  {m:1, q:'Your phone photos are an…', o:['Asset','Threat','Vulnerability'], e:'Anything valuable you need to protect is an asset.'},
  {m:1, q:'A scammer sending fake prizes is a…', o:['Threat','Asset','Firewall'], e:'A person who could cause harm is a threat.'},
  {m:1, q:'An app never updated is a…', o:['Vulnerability','Threat','Asset'], e:'A weakness attackers can use is a vulnerability.'},
  {m:1, q:'In the CIA triad, "C" means…', o:['Confidentiality','Control','Cyber'], e:'Confidentiality keeps information private.'},
  {m:1, q:'A website flooded offline breaks…', o:['Availability','Integrity','Confidentiality'], e:'Availability means systems work when people need them.'},
  {m:1, q:'Someone secretly changed your grade. Which is broken?', o:['Integrity','Availability','Confidentiality'], e:'Integrity means data stays accurate and unaltered.'},
  {m:1, q:'Risk = likelihood × …', o:['Impact','Speed','Cost'], e:'Risk combines how likely something is and how bad it would be.'},
  // Module 2: phishing and malware
  {m:2, q:'SMS: "Parcel on hold, pay RM2 here". This is…', o:['Phishing','A real update','A backup'], e:'Fake parcel SMS is a common phishing trick in Malaysia.'},
  {m:2, q:'A caller from "your bank" asks for your TAC. You…', o:['Hang up','Read it out','Text it back'], e:'Banks never ask for your TAC or OTP.'},
  {m:2, q:'Phishing by SMS is called…', o:['Smishing','Vishing','Spoofing'], e:'SMS phishing is called smishing.'},
  {m:2, q:'Phishing by phone call is…', o:['Vishing','Smishing','Pharming'], e:'Voice phishing is called vishing.'},
  {m:2, q:'Malware that locks files for money:', o:['Ransomware','Adware','Firewall'], e:'Ransomware encrypts files and demands payment.'},
  {m:2, q:'Lost money to a scam? Call…', o:['NSRC 997','A game shop','Nobody'], e:'Call the National Scam Response Centre at 997 as fast as possible.'},
  {m:2, q:'A wedding invite .apk on WhatsApp?', o:["Don't open it",'Install it','Forward it'], e:'.apk files from strangers often hide malware.'},
  {m:2, q:'Malware that records your typing:', o:['Keylogger','Backup','Patch'], e:'A keylogger secretly records what you type.'},
  // Module 3: networks, firewalls and Wi-Fi
  {m:3, q:'A firewall…', o:['Filters traffic','Speeds up Wi-Fi','Stores files'], e:'A firewall allows or blocks network traffic using rules.'},
  {m:3, q:'Safest home Wi-Fi security:', o:['WPA3','WEP','Open network'], e:'WPA3 is the newest and strongest Wi-Fi security.'},
  {m:3, q:'Banking at a café? Use…', o:['Mobile data','Free Wi-Fi','Guest Wi-Fi'], e:'Mobile data is safer than shared public Wi-Fi.'},
  {m:3, q:'The HTTPS padlock means…', o:['Encrypted link','Honest website','No viruses'], e:'The padlock means the connection is encrypted, not that the site is genuine.'},
  {m:3, q:'Router password "admin" is…', o:['Risky','Fine','Strong'], e:'Default passwords are public knowledge, so change them.'},
  {m:3, q:'DNS turns website names into…', o:['IP addresses','Passwords','Emails'], e:'DNS looks up the IP address for a website name.'},
  {m:3, q:'A VPN on café Wi-Fi…', o:['Encrypts traffic','Blocks all malware','Hides you completely'], e:'A VPN encrypts your traffic to the VPN server.'},
  // Module 4: passwords, MFA and access
  {m:4, q:'Strongest password?', o:['purple-kite-rain-42','P@ssw0rd','aina2005'], e:'Long random passphrases beat short tricky ones.'},
  {m:4, q:'Use one password everywhere?', o:['Never','Always','Only for banks'], e:'One leak would unlock every account.'},
  {m:4, q:'An SMS code is something you…', o:['Have','Know','Are'], e:'The code arrives on your phone: something you have.'},
  {m:4, q:'Your fingerprint is something you…', o:['Are','Know','Have'], e:'Biometrics are something you are.'},
  {m:4, q:'Give users only the access they need:', o:['Least privilege','Full admin','Shared login'], e:'Least privilege limits the damage if an account is hacked.'},
  {m:4, q:'Best way to keep many passwords:', o:['Password manager','Sticky notes','Same password'], e:'A password manager stores a strong unique password for every account.'},
  {m:4, q:'Someone asks for your OTP. Share it?', o:['Never','If polite','If urgent'], e:'Never share one-time codes with anyone.'},
  // Module 5: encryption, hashing, logs and backups
  {m:5, q:'Hashing is…', o:['One-way','Reversible','Compression'], e:'A hash cannot be turned back into the original data.'},
  {m:5, q:'Encryption is…', o:['Reversible with a key','One-way only','Deleting data'], e:'Encrypted data can be decrypted with the right key.'},
  {m:5, q:'3-2-1 backups: keep 1 copy…', o:['Offsite','Deleted','Printed'], e:'Keep one copy offsite or offline, safe from ransomware.'},
  {m:5, q:'38 failed logins at 2 AM means…', o:['Brute force attack','Normal use','A backup'], e:'Many failed logins means someone is guessing passwords.'},
  {m:5, q:'Who watches security alerts all day?', o:['SOC analyst','Web designer','Cashier'], e:'Security Operations Centre analysts monitor alerts.'},
  {m:5, q:'Why install updates?', o:['Fix security holes','Use more battery','Slow the phone'], e:'Updates patch known weaknesses.'},
  // Module 6: risk and incident response
  {m:6, q:'Buying cyber insurance is…', o:['Transferring risk','Avoiding risk','Accepting risk'], e:'Insurance shifts the cost of a breach to another party.'},
  {m:6, q:'Ransomware found! First move:', o:['Disconnect the PC','Pay the ransom','Ignore it'], e:'Containing the infection stops it spreading.'},
  {m:6, q:'Clicked a phishing link at work?', o:['Report it now','Hide it','Delete the email'], e:'Reporting fast lets IT contain the damage.'},
  {m:6, q:'Last incident response step:', o:['Lessons learned','Prepare','Identify'], e:'Review what happened and improve for next time.'},
  {m:6, q:'An Acceptable Use Policy sets…', o:['Rules for systems','Staff salaries','Wi-Fi speed'], e:'An AUP sets rules for using company systems.'},
  {m:6, q:'Stopping an unpatchable app is…', o:['Avoiding risk','Transferring risk','Accepting risk'], e:'Stopping the risky activity avoids the risk.'}
];
// Packet Drop: short items sorted into bins (two sets)
const ARCADE_SORT = [
  {id:'saferisky', t:'Safe or risky?', bins:['Safe','Risky'], items:[
    {t:'Unique passphrase', b:'Safe', e:'A long unique passphrase is hard to guess.'},
    {t:'Same password everywhere', b:'Risky', e:'One leak unlocks every account.'},
    {t:'Turn on 2FA', b:'Safe', e:'A second factor stops most account takeovers.'},
    {t:'Share OTP with caller', b:'Risky', e:'Nobody genuine ever needs your OTP.'},
    {t:'Automatic updates on', b:'Safe', e:'Updates fix known security holes.'},
    {t:'Banking on café Wi-Fi', b:'Risky', e:'Public Wi-Fi is shared with strangers.'},
    {t:'Screen lock PIN', b:'Safe', e:'A lock keeps a lost phone private.'},
    {t:'Router password "admin"', b:'Risky', e:'Default passwords are public knowledge.'},
    {t:'Weekly photo backup', b:'Safe', e:'Backups protect against loss and ransomware.'},
    {t:'Click "You won!" link', b:'Risky', e:'Surprise prizes are a classic phishing lure.'},
    {t:'Check sender address', b:'Safe', e:'Look-alike senders reveal phishing.'},
    {t:'Install .apk from chat', b:'Risky', e:'Apps from chats can hide malware.'},
    {t:'Save 997 in contacts', b:'Safe', e:'You can call the scam hotline fast if needed.'},
    {t:'Post your IC number', b:'Risky', e:'IC numbers help scammers steal identities.'},
    {t:'WPA3 home Wi-Fi', b:'Safe', e:'WPA3 is the strongest Wi-Fi security.'},
    {t:'Password on sticky note', b:'Risky', e:'Anyone walking past can read it.'}]},
  {id:'threats', t:'Spot the threat', bins:['Phishing','Malware','Safe'], items:[
    {t:'Fake parcel SMS', b:'Phishing', e:'It tricks you into paying or logging in.'},
    {t:'Caller wants your TAC', b:'Phishing', e:'Voice phishing aims to steal codes.'},
    {t:'"Verify account" email', b:'Phishing', e:'Urgent verify links steal passwords.'},
    {t:'Fake prize login page', b:'Phishing', e:'Look-alike pages steal logins.'},
    {t:'Ransomware locks files', b:'Malware', e:'Ransomware is malicious software.'},
    {t:'Keylogger records typing', b:'Malware', e:'Keyloggers secretly capture what you type.'},
    {t:'Trojan game download', b:'Malware', e:'Trojans hide inside "free" apps.'},
    {t:'Worm spreads on network', b:'Malware', e:'Worms copy themselves across networks.'},
    {t:'Spyware in free app', b:'Malware', e:'Spyware watches what you do.'},
    {t:'Official app store update', b:'Safe', e:'Updates from official stores are safe.'},
    {t:'2FA prompt you started', b:'Safe', e:'Approving your own login is expected.'},
    {t:'Antivirus scan', b:'Safe', e:'Scanning helps find malware.'},
    {t:'Password manager', b:'Safe', e:'It stores strong unique passwords.'},
    {t:'Portal via bookmark', b:'Safe', e:'Bookmarks avoid look-alike links.'}]}
];
