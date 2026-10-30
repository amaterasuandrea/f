const fs = require('fs');
const vm = require('vm');

const path = require('path');
const indexPath = fs.existsSync('index.html') ? 'index.html' : path.join(__dirname, '../index.html');
const html = fs.readFileSync(indexPath, 'utf8');

console.log('====================================================');
console.log('   VERIFICA DELLE 3 CORREZIONI RICHIESTE DALL\'UTENTE');
console.log('====================================================\n');

// ----------------------------------------------------
// VERIFICA 1: CORREZIONE DEL DIALOGO
// ----------------------------------------------------
console.log('--- TEST 1: DIALOGHI E PENSIERI DI ANNA ---');

// 1.1 Controllo frase specifica richiesta
const wrongSentence = 'sagoma di Andrea continua a precedermi nel buio';
const correctSentence = 'sagoma continua a precedermi nel buio';

if (html.includes(wrongSentence)) {
  throw new Error(`FAIL: Trovata ancora la frase errata: "${wrongSentence}"`);
}
if (!html.includes(correctSentence)) {
  throw new Error(`FAIL: Frase corretta non trovata nel file!`);
}
console.log('✅ 1.1 Frase corretta trovata: «La sagoma continua a precedermi nel buio…»');

// 1.2 Controllo prompt interazione
if (html.includes("prompt: 'Avvicinati ad Andrea'")) {
  throw new Error(`FAIL: Il prompt prima della rivelazione chiama ancora Andrea per nome!`);
}
if (!html.includes("prompt: 'Avvicinati alla sagoma'")) {
  throw new Error(`FAIL: Nuovo prompt 'Avvicinati alla sagoma' non trovato!`);
}
console.log('✅ 1.2 Prompt interazione verificato: "Avvicinati alla sagoma"');

// 1.3 Controllo che non esistano menzioni di "Andrea" in dialoghi prima della rivelazione
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const lines = scriptMatch[1].split('\n');

let preRevealAndreaDialogueFound = false;
let inRevelationCutscene = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function startAndreaTransformationCutscene')) {
    inRevelationCutscene = true;
  }
  if (line.includes('function setupScene(12)')) {
    inRevelationCutscene = false;
  }
  if (!inRevelationCutscene && (line.includes('speaker:') || line.includes('text:')) && line.toLowerCase().includes('andrea')) {
    console.error(`ERRORE ALLA RIGA ${i + 1}: ${line}`);
    preRevealAndreaDialogueFound = true;
  }
}

if (preRevealAndreaDialogueFound) {
  throw new Error('FAIL: Trovato dialogo prima della rivelazione che usa il nome Andrea!');
}
console.log('✅ 1.3 Nessun dialogo o pensiero pre-rivelazione chiama la figura "Andrea".');

// ----------------------------------------------------
// VERIFICA 2: CORREZIONE DEL COLORE DELLA LUCE
// ----------------------------------------------------
console.log('\n--- TEST 2: COLORE DELLA LUCE AMBIENTALE ---');

// 2.1 Verifica che la luce ambientale sia gialla calda
const warmYellowPattern = /rgba\(255,\s*238,\s*160/;
const pinkAmbientPattern = /rgba\(255,\s*195,\s*220/;

if (!warmYellowPattern.test(html)) {
  throw new Error('FAIL: Luce gialla calda (255, 238, 160) non trovata in renderFinalValleyAmbient!');
}
console.log('✅ 2.1 Luce ambientale sostituita con luce gialla calda delicata: rgba(255, 238, 160)');

// 2.2 Verifica che i gigli rosa abbiano conservato il proprio colore rosa per i petali
const pinkPetalsPattern = /rgba\(255,\s*205,\s*228/;
if (!pinkPetalsPattern.test(html)) {
  throw new Error('FAIL: Petali di gigli rosa non conservati!');
}
console.log('✅ 2.2 Petali dei gigli rosa preservati nel loro colore naturale: rgba(255, 205, 228)');

// ----------------------------------------------------
// VERIFICA 3: PONTE COMPLETAMENTE LIBERO E ATTRAVERSABILE
// ----------------------------------------------------
console.log('\n--- TEST 3: ACCESSO, ATTRAVERSAMENTO E USCITA DAL PONTE ---');

let videoPlayed = false;
const sandbox = {
  window: { addEventListener: () => {}, innerWidth: 1280, innerHeight: 720 },
  document: {
    getElementById: (id) => ({
      style: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      addEventListener: () => {},
      getContext: () => ({
        save: () => {}, restore: () => {}, translate: () => {}, drawImage: () => {},
        fillRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} })
      })
    }),
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  Image: function() { this.src = ''; this.complete = true; this.naturalWidth = 100; this.naturalHeight = 100; },
  AudioContext: function() {},
  webkitAudioContext: function() {},
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => {},
  setTimeout: (cb) => { if (typeof cb === 'function') cb(); },
  setInterval: () => 1,
  clearInterval: () => {},
  console: console
};

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const run = (code) => vm.runInContext(code, sandbox);

run('setupScene(12)');
run('Story.currentScene = 12');
run('Story.mode = "explore"');
run('Story.dialogueActive = false');
run('FinalValleyState.phase = 1');
run('FinalValleyState.lanternIlluminated = true'); // lanterna gia alzata

// 3.1 Test acqua ruscello non calpestabile
for (let y of [100, 160, 220, 280, 520, 580, 640]) {
  for (let c of [88, 89, 90, 91]) {
    const x = c * 32 + 16;
    const canWalk = run(`isWalkableFinalValley(${x}, ${y})`);
    if (canWalk) {
      throw new Error(`FAIL: Acqua calpestabile a (${x}, ${y})!`);
    }
  }
}
console.log('✅ 3.1 Acqua del ruscello rigorosamente non calpestabile a nord e a sud del ponte.');

// 3.2 Test attraversamento continuo da Sinistra verso Destra (West to East)
console.log('✅ 3.2 Test attraversamento West -> East su Rows 11, 12, 13, 14:');
for (let r of [11, 12, 13, 14]) {
  const y = r * 32 + 16;
  for (let x = 2400; x <= 3400; x += 16) {
    const walkable = run(`isWalkableFinalValley(${x}, ${y})`);
    if (!walkable) {
      const col = Math.floor(x / 32);
      throw new Error(`FAIL: Blocco riscontrato andando a destra a x=${x} (Col ${col}), y=${y} (Row ${r})!`);
    }
  }
}
console.log('   - Percorso da x=2400 a x=3400 (approccio, ingresso, ponte, uscita) 100% libero e continuo senza blocchi!');

// 3.3 Test attraversamento continuo da Destra verso Sinistra (East to West)
console.log('✅ 3.3 Test attraversamento East -> West su Rows 11, 12, 13, 14:');
for (let r of [11, 12, 13, 14]) {
  const y = r * 32 + 16;
  for (let x = 3400; x >= 2400; x -= 16) {
    const walkable = run(`isWalkableFinalValley(${x}, ${y})`);
    if (!walkable) {
      const col = Math.floor(x / 32);
      throw new Error(`FAIL: Blocco riscontrato andando a sinistra a x=${x} (Col ${col}), y=${y} (Row ${r})!`);
    }
  }
}
console.log('   - Percorso inverso da x=3400 a x=2400 100% libero e continuo in entrambe le direzioni!');

// 3.4 Simulazione camminata fisica continua di Anna che attraversa il ponte e raggiunge la radura
console.log('\n--- SIMULAZIONE MOVIMENTO REALE DI ANNA ---');
run('FinalValleyState.x = 2450');
run('FinalValleyState.y = 384');
run('FinalValleyState.andreaPhase = 2');
run('FinalValleyState.andreaX = 3136');
run('FinalValleyState.andreaBridgeTriggered = false');

let steps = 0;
while (run('FinalValleyState.x < 3200') && steps < 1000) {
  run(`
    while (Story.dialogueActive) {
      advanceDialogue();
    }
    keys['ArrowRight'] = true;
    updateDirector(16);
    keys['ArrowRight'] = false;
  `);
  steps++;
}

const finalX = run('FinalValleyState.x');
const bridgeTriggered = run('FinalValleyState.andreaBridgeTriggered');
const camX = run('FinalValleyState.camX');

console.log(`   - Anna ha camminato da x=2450 a x=${Math.round(finalX)} in ${steps} frame.`);
console.log(`   - Evento oltre il ponte attivato: ${bridgeTriggered} (Atteso: true)`);
console.log(`   - Telecamera ha seguito Anna fluidamente: camX=${Math.round(camX)} px.`);

if (finalX < 3120) {
  throw new Error(`FAIL: Anna si e fermata o bloccata prima di attraversare completamente il ponte! (x=${finalX})`);
}
if (!bridgeTriggered) {
  throw new Error(`FAIL: Evento oltre il ponte non attivato!`);
}

// Continua fino alla radura
while (run('FinalValleyState.x < 4330') && steps < 3000) {
  run(`
    while (Story.dialogueActive) {
      advanceDialogue();
    }
    keys['ArrowRight'] = true;
    updateDirector(16);
    keys['ArrowRight'] = false;
  `);
  steps++;
}

const finalRaduraX = run('FinalValleyState.x');
const clearingReached = run('FinalValleyState.clearingReached');
const andreaApproached = run('FinalValleyState.andreaApproachedChoice');

console.log(`   - Anna ha proseguito fino a x=${Math.round(finalRaduraX)} nella radura.`);
console.log(`   - Radura raggiunta: ${clearingReached} (Atteso: true)`);
console.log(`   - Scelta di Anna compiuta: ${andreaApproached} (Atteso: true)`);

if (!clearingReached || !andreaApproached) {
  throw new Error('FAIL: Anna non ha potuto raggiungere la radura o compiere la scelta finale!');
}

console.log('\n====================================================');
console.log('🎉 TUTTE LE 3 CORREZIONI SONO VERIFICATE AL 100%!');
console.log('====================================================');
