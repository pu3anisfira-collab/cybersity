/* ============================================================
   PIXEL ART — avatars, mentor robot, icons (all original, drawn in code)
   ============================================================ */
const LOOK_OPTS = {
  skin:['#ffdcb8','#f1c08f','#d39a6a','#a8704a','#6e4630'],
  hairStyle:['short','spiky','long','curly','hijab'],
  hairColor:['#1c1626','#5a3825','#c2793b','#f2d16b','#ff4fae','#2ee6ff','#7a5cff','#eef0fb'],
  shirt:['#2ee6ff','#ff4fae','#a46bff','#ffd447','#47f59a','#ff9a3d','#eef0fb','#3a4596'],
  acc:['none','glasses','headphones','cap']
};
const HAIR = {
  short:['...HHHHHH...','..HHHHHHHH..','..HHHHHHHH..','..HSSSSSSH..','..SESSSSES..','..SSSSSSSS..','...SSmmSS...','....SSSS....'],
  spiky:['..H.HH.HH.H.','..HHHHHHHHH.','..HHHHHHHH..','..HSSSSSSH..','..SESSSSES..','..SSSSSSSS..','...SSmmSS...','....SSSS....'],
  long: ['...HHHHHH...','..HHHHHHHH..','.HHHHHHHHHH.','.HHSSSSSSHH.','.HSESSSSESH.','.HSSSSSSSSH.','.HHSSmmSSHH.','.HH.SSSS.HH.'],
  curly:['..HHHHHHHH..','.HHHHHHHHHH.','.HHHHHHHHHH.','.HHSSSSSSHH.','..SESSSSES..','..SSSSSSSS..','...SSmmSS...','....SSSS....'],
  hijab:['...HHHHHH...','..HHHHHHHH..','.HHHHHHHHHH.','.HHSSSSSSHH.','.HHESSSSEHH.','.HHSSSSSSHH.','.HHHSmmSHHH.','.HHHHHHHHHH.']
};
const BODY = ['..TTTTTTTT..','.TTTTTTTTTT.','.STTTTTTTTS.','.STTTTTTTTS.'];
const LEGS = [
  ['...PPPPPP...','...PP..PP...','...PP..PP...','..BBB..BBB..'],
  ['...PPPPPP...','...PP..PP...','..PP....PP..','..BB....BB..'],
  ['...PPPPPP...','...PP..PP...','...PP..PP...','..BBB..BBB..'],
  ['...PPPPPP...','....PPPP....','....PPPP....','...BBBBBB...']
];
function shade(hex, amt){ // amt -1..1
  const n = parseInt(hex.slice(1),16); let r=n>>16, g=(n>>8)&255, b=n&255;
  const f = v => Math.max(0,Math.min(255, Math.round(amt<0 ? v*(1+amt) : v+(255-v)*amt)));
  return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function rowsToCanvas(rows, pal, outline='#05061a'){
  const h = rows.length, w = rows[0].length;
  const c = document.createElement('canvas'); c.width = w+2; c.height = h+2;
  const x = c.getContext('2d');
  const solid = (i,j) => j>=0 && j<h && i>=0 && i<w && rows[j][i] !== '.' && pal[rows[j][i]];
  if (outline){
    x.fillStyle = outline;
    for (let j=-1;j<=h;j++) for (let i=-1;i<=w;i++){
      if (solid(i,j)) continue;
      if (solid(i-1,j)||solid(i+1,j)||solid(i,j-1)||solid(i,j+1)) x.fillRect(i+1,j+1,1,1);
    }
  }
  for (let j=0;j<h;j++) for (let i=0;i<w;i++){ const k = rows[j][i]; if (k!=='.' && pal[k]){ x.fillStyle = pal[k]; x.fillRect(i+1,j+1,1,1); } }
  return c;
}
const spriteCache = new Map();
function avatarCanvas(look, frame=0, back=false){
  const key = JSON.stringify(look)+frame+back;
  if (spriteCache.has(key)) return spriteCache.get(key);
  let head = HAIR[look.hairStyle] ? HAIR[look.hairStyle].map(r=>r.split('')) : HAIR.short.map(r=>r.split(''));
  if (back){ head = head.map((r,j)=> j<7 ? r.map(ch => (ch==='S'||ch==='E'||ch==='m') ? 'H' : ch) : r); }
  let body = BODY.map(r=>r.split(''));
  if (look.hairStyle==='long' && !back){ body[0][1]='H'; body[0][10]='H'; body[1][1]='H'; body[1][10]='H'; }
  if (look.hairStyle==='long' && back){ body[0] = '..HHHHHHHH..'.split(''); body[1]='.THHHHHHHHT.'.split(''); }
  if (look.hairStyle==='hijab'){ body[0] = '.HHHHHHHHHH.'.split(''); body[1] = '.HHHHHHHHHH.'.split(''); }
  const rows = [...head, ...body, ...LEGS[frame%4].map(r=>r.split(''))];
  if (!back){
    if (look.acc==='glasses'){ rows[4] = rows[4].map((ch,i)=> [2,4,5,6,7,9].includes(i) ? 'G' : (i===3||i===8) ? 'L' : ch); }
    if (look.acc==='cap'){ rows[0]='...CCCCCC...'.split(''); rows[1]='..CCCCCCCC..'.split(''); rows[2]=rows[2].map((ch,i)=> i>=2 ? 'C' : ch); rows[2][11]='C'; }
  } else if (look.acc==='cap'){ rows[0]='...CCCCCC...'.split(''); rows[1]='..CCCCCCCC..'.split(''); }
  if (look.acc==='headphones'){ rows[0] = rows[0].map((ch,i)=> (i>=3&&i<=8) ? 'D' : ch); [3,4,5].forEach(j=>{ rows[j][1]='D'; rows[j][10]='D'; }); rows[1][2]='D'; rows[1][9]='D'; rows[2][1]='D'; rows[2][10]='D'; }
  const pal = { H:look.hairColor, S:look.skin, E:'#141026', m:shade(look.skin,-0.25), T:look.shirt, P:'#262b5e', B:'#0e0f22',
    G:'#141026', L:'#bff4ff', C:shade(look.shirt,-0.15), D:'#ff4fae' };
  const c = rowsToCanvas(rows.map(r=>r.join('')), pal);
  spriteCache.set(key, c); return c;
}
const urlCache = new Map();
function avatarURL(look, frame=0){
  const key = JSON.stringify(look)+'u'+frame;
  if (!urlCache.has(key)) urlCache.set(key, avatarCanvas(look, frame).toDataURL());
  return urlCache.get(key);
}
const BOT_ROWS = ['.....AA.....','.....AA.....','..KKKKKKKK..','..KVVVVVVK..','..KVCVVCVK..','..KVVVVVVK..','..KVVMMVVK..','..KKKKKKKK..','...VVVVVV...','.VVVZZZZVVV.','.V.VZVVZV.V.','...VVVVVV...','...VV..VV...','...KK..KK...'];
// BYTE's colours; a skin bought in the Coin Shop recolours the body
const BYTE_SKINS = { mint:{K:'#1f7a4a',V:'#47f59a',Z:'#2fc77a'}, pink:{K:'#a8216b',V:'#ff7ac0',Z:'#ff4fae'}, gold:{K:'#8a5a00',V:'#ffd447',Z:'#e0a800',A:'#ff4fae'} };
function botPal(skin){ const k = skin !== undefined ? skin : (typeof S !== 'undefined' && S.shop ? S.shop.byte : null); return {A:'#ffd447',K:'#5d2fb0',V:'#a46bff',C:'#2ee6ff',M:'#2ee6ff',Z:'#7f48e0', ...(BYTE_SKINS[k] || {})}; }
function botCanvas(skin){ return rowsToCanvas(BOT_ROWS, botPal(skin)); }
let BOT_URL = '';
// BYTE's expressions for the campus tour: face rows 3-6 (eyes and mouth) and body rows 8-10 (arms) swap per expression
const BOT_FACES = {
  normal: ['VVVVVV','VCVVCV','VVVVVV','VVMMVV'],
  happy:  ['VCVVCV','CVCCVC','MVVVVM','VMMMMV'],
  excited:['VCVVCV','VCVVCV','VVMMVV','VVMMVV'],
  wink:   ['VVVVVV','VCVCCC','MVVVVM','VMMMMV'],
  think:  ['VVCVVC','VVVVVV','VVVVVV','VVVMMV'],
  blink:  ['VVVVVV','VVVVVV','VCCVCC','VVMMVV']
};
const BOT_WAVE = [['...VVVVVV.V.','.VVVZZZZVV..','.V.VZVVZV...'], ['...VVVVVVV..','.VVVZZZZV.V.','.V.VZVVZV...']];
const botFaceCache = new Map();
function botFace(expr='normal', frame=0, wave=false){
  const k = expr+frame+wave+(S.shop ? S.shop.byte : ''); if (botFaceCache.has(k)) return botFaceCache.get(k);
  const rows = BOT_ROWS.slice(), f = BOT_FACES[expr] || BOT_FACES.normal;
  for (let i=0;i<4;i++) rows[3+i] = '..K'+f[i]+'K..';
  if (wave){ const w = BOT_WAVE[frame%2]; rows[8]=w[0]; rows[9]=w[1]; rows[10]=w[2]; }
  const c = rowsToCanvas(rows, botPal());
  botFaceCache.set(k, c); return c;
}

/* Canvas palette: night (default) or day (bright grass, brick paths, cream walls, sky-blue windows) */
const isDay = () => document.documentElement.dataset.theme === 'day';
const PAL_NIGHT = { path:['#262c66','#2a3070'], pathLine:'#1d2358', grass:'#12322a', grassDots:['#174034','#0e2a22'], sparkle:['#ff4fae','#ffd447','#2ee6ff'], trace:['#2ee6ff33','#ff4fae33'],
  trees:[['#0f4a36','#16664a','#22825c'],['#123f40','#1a5c5a','#28807a'],['#2a1d55','#3d2a7a','#5a3fa8']], trunk:'#3b2516',
  wall:'#1b2054', wallTop:'#232a6a', wallLine:'#181d4c', plate:'#0b0f2c', winOn:null, winOff:'#262c66', winGlintOff:'#3a4596', doorIn:'#0b0f2c', lamps:true, coreBase:['#303b8f','#3d4aa8'], coreBody:'#141a4a',
  sky:['#0b0f2c','#161c50'], stars:true };
const PAL_DAY = { path:['#e8cf9c','#e1c58e'], pathLine:'#c9a970', grass:'#5cb83c', grassDots:['#72cc50','#4ea532'], sparkle:['#ff6fa8','#ffe14d','#ffffff'], trace:['#ffffff66','#ffffff44'],
  trees:[['#2f7d2a','#45a33a','#6cc94f'],['#2a7a52','#3fa56d','#66cc8e'],['#c2577f','#e486a8','#ffc2d6']], trunk:'#7a4a26',
  wall:'#f3e2c0', wallTop:'#fff2d8', wallLine:'#e3cc9e', plate:'#3b2a1e', winOn:'#bfe7ff', winOff:'#8fd0ff', winGlintOff:'#e6f6ff', doorIn:'#6b4a2e', lamps:false, coreBase:['#b9a37a','#cdb98f'], coreBody:'#2b3a7a',
  sky:['#6cc4ff','#bfe7ff'], stars:false };
const pal = () => isDay() ? PAL_DAY : PAL_NIGHT;

const ICONS = {
  coin:['..XXXXXX..','.XYYYYYYX.','XYYWWYYYYX','XYWYYXYYYX','XYWYYXYYYX','XYYYYXYYYX','XYYYYXYYYX','XYYYYYYYYX','.XYYYYYYX.','..XXXXXX..'],
  bell:['....XX....','...XWWX...','..XWWWWX..','..XWWWWX..','.XWWWWWWX.','.XWWWWWWX.','XWWWWWWWWX','XXXXXXXXXX','...XYYX...','....XX....'],
  sun:['....XX....','.X..XX..X.','..XXXXXX..','..XWWWWX..','XXXWWWWXXX','XXXWWWWXXX','..XWWWWX..','..XXXXXX..','.X..XX..X.','....XX....'],
  moon:['..XXXX....','.XWWX.....','XWWX......','XWX.......','XWX.......','XWX.......','XWWX......','XWWWX..XX.','.XWWWXXWX.','..XXXXXX..'],
  compass:['...XXXX...','.XXWWWWXX.','.XWWWFWWX.','XWWWFFFWWX','XWWWWDWWWX','XWWWZZZWWX','.XWWWZWWX.','.XXWWWWXX.','...XXXX...','..........'],
  home:['....XX....','...XXXX...','..XXXXXX..','.XXXXXXXX.','XXXXXXXXXX','.XWWXXWWX.','.XWWXXWWX.','.XXXXDDXX.','.XXXXDDXX.','.XXXXDDXX.'],
  campus:['....F.....','....FFF...','....F.....','...XXXX...','..XXXXXX..','.XXXXXXXX.','.XWXWWXWX.','.XXXXXXXX.','.XWXDDXWX.','.XXXDDXXX.'],
  book:['.XXX..XXX.','XWWWXXWWWX','XWZWXXWZWX','XWWWXXWWWX','XWZWXXWZWX','XWWWXXWWWX','XWWWXXWWWX','XXXXXXXXXX','....XX....','..........'],
  chip:['..X.XX.X..','.XXXXXXXX.','XXWWWWWWXX','.XWZWWZWX.','XXWWWWWWXX','.XWZZZZWX.','XXWWWWWWXX','.XXXXXXXX.','..X.XX.X..','..........'],
  chat:['.XXXXXXXX.','XWWWWWWWWX','XWZWZWZWWX','XWWWWWWWWX','XWZZZZZWWX','XWWWWWWWWX','.XXXXXXXX.','...XX.....','..XX......','..........'],
  flag:['.X........','.XFFFFFF..','.XFFFFFFF.','.XFFWWFF..','.XFFFFFFF.','.XFFFFFF..','.X........','.X........','.X........','XXX.......'],
  trophy:['XXXXXXXXXX','X.YYYYYY.X','X.YWYYYY.X','.XYYYYYYX.','..YYYYYY..','...YYYY...','....YY....','....YY....','..XXXXXX..','..XXXXXX..'],
  scroll:['.XXXXXXXX.','XWWWWWWWWX','.XWZZZZWX.','.XWWWWWWX.','.XWZZZWWX.','.XWWWWWWX.','.XWZZZZWX.','.XWWWWRRX.','XWWWWWRRWX','.XXXXXXXX.'],
  shield:['.XXXXXXXX.','XWWWWWWWWX','XWZZZZZZWX','XWZZWZZZWX','XWZWWWZZWX','XWZZWZZZWX','.XWZZZZWX.','..XWZZWX..','...XWWX...','....XX....'],
  key:['..XXX.....','.XWWWX....','.XW.WX....','.XWWWX....','..XWX.....','..XWX.....','..XWXX....','..XWWX....','..XWX.....','..XXX.....'],
  fish:['..........','....XXX...','..XXWWWX.X','.XWWZWWWXX','XWWWWWWWWX','.XWWWWWXXX','..XXWWWX.X','....XXX...','..........','..........'],
  lock:['...XXXX...','..XW..WX..','..X....X..','.XXXXXXXX.','.XYYYYYYX.','.XYYXXYYX.','.XYYXXYYX.','.XYYYYYYX.','.XXXXXXXX.','..........'],
  star:['....XX....','....YY....','...XYYX...','XXXYYYYXXX','.XYYYYYYX.','..XYYYYX..','..XYXXYX..','.XYX..XYX.','.XX....XX.','..........'],
  network:['...XXXX...','...XWWX...','...XXXX...','....XX....','.XXXXXXXX.','.X......X.','XXX....XXX','XWX....XWX','XXX....XXX','..........'],
  eye:['..........','...XXXX...','.XXWWWWXX.','XWWWXXWWWX','XWWXZZXWWX','XWWWXXWWWX','.XXWWWWXX.','...XXXX...','..........','..........'],
  check:['..........','........XX','.......XXX','......XXX.','XX...XXX..','XXX.XXX...','.XXXXX....','..XXX.....','...X......','..........'],
  menu:['..........','XXXXXXXXXX','XXXXXXXXXX','..........','XXXXXXXXXX','XXXXXXXXXX','..........','XXXXXXXXXX','XXXXXXXXXX','..........'],
  gear:['...XXXX...','.X.XWWX.X.','.XXXWWXXX.','XXWWXXWWXX','XWWX..XWWX','XWWX..XWWX','XXWWXXWWXX','.XXXWWXXX.','.X.XWWX.X.','...XXXX...'],
  close:['XX......XX','XXX....XXX','.XXX..XXX.','..XXXXXX..','...XXXX...','...XXXX...','..XXXXXX..','.XXX..XXX.','XXX....XXX','XX......XX']
};
function iconURL(name, main='#2ee6ff', fill='#eef0fb', detail='#151a3e', outline=null){
  const key = [name,main,fill,detail,outline].join('|');
  if (urlCache.has(key)) return urlCache.get(key);
  const rows = ICONS[name] || ICONS.star;
  const pal = {X:main, W:fill, Z:detail, Y:'#ffd447', F:'#ff4fae', R:'#ff5d6e', D:'#151a3e'};
  const c = rowsToCanvas(rows, pal, outline);
  const u = c.toDataURL(); urlCache.set(key,u); return u;
}
function iconCanvas(name, main, fill='#eef0fb', detail='#151a3e'){
  return rowsToCanvas(ICONS[name]||ICONS.star, {X:main, W:fill, Z:detail, Y:'#ffd447', F:'#ff4fae', R:'#ff5d6e', D:'#151a3e'}, '#05061a');
}
const icon = (name, color='#2ee6ff', size='', cls='px') => `<img class="${cls}" alt="" src="${iconURL(name,color)}" ${size?`style="width:${size}px;height:${size}px"`:''}>`;
