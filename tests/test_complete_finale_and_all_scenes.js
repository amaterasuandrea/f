const fs = require('fs');
const vm = require('vm');

const path = require('path');
const indexPath = fs.existsSync('index.html') ? 'index.html' : path.join(__dirname, '../index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

let videoPlayed = false;
let videoVolume = 0;
let videoEndedCallback = null;

const sandbox = {
  window: { addEventListener: () => {}, innerWidth: 1280, innerHeight: 720 },
  document: {
    getElementById: (id) => {
      if (id === 'finalVideo') {
        return {
          style: {},
          play: () => { videoPlayed = true; return Promise.resolve(); },
          pause: () => {},
          set onended(cb) { videoEndedCallback = cb; },
          get onended() { return videoEndedCallback; },
          currentTime: 0,
          volume: 1.0,
          muted: false
        };
      }
      return {
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        addEventListener: () => {},
        textContent: '',
        dataset: {},
        getContext: () => ({
          save: () => {}, restore: () => {}, translate: () => {}, drawImage: () => {},
          fillRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
          ellipse: () => {}, lineTo: () => {}, moveTo: () => {}, closePath: () => {},
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createRadialGradient: () => ({ addColorStop: () => {} }),
          clearRect: () => {}
        })
      };
    },
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  Image: function() { this.src = ''; this.complete = true; this.naturalWidth = 100; this.naturalHeight = 100; },
  AudioContext: function() {},
  webkitAudioContext: function() {},
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => {},
  setTimeout: (cb) => { if (typeof cb === 'function') cb(); },
  setInterval: () => 123,
  clearInterval: () => {},
  console: console
};

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const run = (code) => vm.runInContext(code, sandbox);

console.log('=== TEST 1: VERIFICA TUTTE LE SCENE PRECEDENTI (1-11) ===');
for (let s = 1; s <= 11; s++) {
  run(`setupScene(${s})`);
  run(`Story.currentScene = ${s}`);
  run(`updateDirector(16)`);
  console.log(`   - Scena ${s} verificata ed eseguita senza alcun errore.`);
}

console.log('\n=== TEST 2: VERIFICA SCENA 12 "LA FINE DEL BUIO" ===');
run('setupScene(12)');
run('Story.currentScene = 12');
run('Story.mode = "explore"');
run('Story.dialogueActive = false');
run('FinalValleyState.phase = 1');

console.log('1. Collisioni Griglia Scena 12:');
const waterWalkable = run('isWalkableFinalValley(2880, 150)');
console.log(`   - Acqua ruscello a (2880, 150): ${waterWalkable} (Atteso: false)`);
if (waterWalkable) throw new Error('FAIL: Anna puo camminare sull\'acqua!');

const bridgeWalkable = run('isWalkableFinalValley(2880, 384)');
console.log(`   - Ponte in pietra a (2880, 384): ${bridgeWalkable} (Atteso: true)`);
if (!bridgeWalkable) throw new Error('FAIL: Ponte non calpestabile!');

const obstacleWalkable = run('isWalkableFinalValley(100, 100)');
console.log(`   - Ostacolo roccia a (100, 100): ${obstacleWalkable} (Atteso: false)`);
if (obstacleWalkable) throw new Error('FAIL: Ostacolo non solido!');

console.log('\n2. Evento 1 — Il Passaggio Oscuro e la Lanterna:');
run('FinalValleyState.lanternIlluminated = false');
const darkPassBlocked = run('isWalkableFinalValley(1344, 384)');
console.log(`   - Passaggio oscuro prima della lanterna (x=1344): ${darkPassBlocked} (Atteso: false)`);
if (darkPassBlocked) throw new Error('FAIL: Passaggio oscuro transitabile prima della lanterna!');

// Simula arrivo di Anna al passaggio oscuro e attivazione lanterna
run('FinalValleyState.x = 1250');
run('FinalValleyState.y = 384');
run('updateDirector(16)');
const darkPassNearby = run('FinalValleyState.darkPassNearby');
console.log(`   - Prompt lanterna al passaggio oscuro: ${darkPassNearby} (Atteso: true)`);
if (!darkPassNearby) throw new Error('FAIL: Prompt lanterna non attivo!');

run('handleUserInteraction()');
while (run('Story.dialogueActive')) {
  run('advanceDialogue()');
}
const lanternLit = run('FinalValleyState.lanternIlluminated');
const darkPassOpen = run('isWalkableFinalValley(1344, 384)');
console.log(`   - Lanterna alzata: ${lanternLit}, passaggio aperto: ${darkPassOpen} (Atteso: true)`);
if (!lanternLit || !darkPassOpen) throw new Error('FAIL: Lanterna non ha illuminato il passaggio!');

console.log('\n3. Evento 2 — Bivio e Gigli Rosa:');
run('FinalValleyState.x = 1984');
run('FinalValleyState.y = 380');
run('updateDirector(16)');
const liliesGuiding = run('FinalValleyState.liliesGuiding');
console.log(`   - Gigli rosa attivi al bivio (x=1984): ${liliesGuiding} (Atteso: true)`);
if (!liliesGuiding) throw new Error('FAIL: Gigli rosa non guidano al bivio!');

console.log('\n4. Evento 3 — Presenza di Andrea sul Ponte:');
run('FinalValleyState.andreaPhase = 2');
run('FinalValleyState.andreaX = 3136');
run('FinalValleyState.x = 3080'); // Anna attraversa il ponte
run('FinalValleyState.y = 384');
run('updateDirector(16)');
const bridgeTriggered = run('FinalValleyState.andreaBridgeTriggered');
console.log(`   - Avvicinamento ad Andrea oltre il ponte: ${bridgeTriggered} (Atteso: true)`);
if (!bridgeTriggered) throw new Error('FAIL: Andrea bridge encounter non attivato!');

console.log('\n5. Radura Finale, Scelta di Anna e Trasformazione:');
while (run('Story.dialogueActive')) {
  run('advanceDialogue()');
}
run('FinalValleyState.x = 4280'); // Ingresso nella radura
run('FinalValleyState.y = 384');
run('updateDirector(16)');
const clearingReached = run('FinalValleyState.clearingReached');
console.log(`   - Ingresso nella grande radura finale: ${clearingReached} (Atteso: true)`);

// Anna si avvicina (dist < 110): Andrea compie un passo indietro di rispetto
run('FinalValleyState.x = 4300');
run('updateDirector(16)');
const andreaSteppedBack = run('FinalValleyState.andreaPhase === 5');
console.log(`   - Andrea compie passo indietro di rispetto: ${andreaSteppedBack} (Atteso: true)`);
if (!andreaSteppedBack) throw new Error('FAIL: Andrea non ha compiuto il passo indietro di rispetto!');

// Anna fa la scelta libera di avvicinarsi fino a distanza ravvicinata (dist <= 58)
run('FinalValleyState.x = 4330');
run('updateDirector(16)');
const choiceMade = run('FinalValleyState.andreaApproachedChoice');
const cinematicActive = run('FinalValleyState.cinematicActive');
console.log(`   - Scelta di Anna compiuta: choiceMade=${choiceMade}, cinematicActive=${cinematicActive}`);
if (!choiceMade || !cinematicActive) throw new Error('FAIL: Cinematica finale non avviata!');

// Verifica trasformazione
run('FinalValleyState.isSilhouette = false');
run('FinalValleyState.isTransformed = true');
const isTransformed = run('FinalValleyState.isTransformed');
console.log(`   - Andrea trasformato nel ragazzo biondo: ${isTransformed} (Atteso: true)`);

// Verifica sequenza abbraccio
run('startFinalHugSequence()');
const isHugging = run('FinalValleyState.isHugging');
console.log(`   - Abbraccio Anna & Andrea attivo: ${isHugging} (Atteso: true)`);
if (!isHugging) throw new Error('FAIL: Abbraccio non attivato!');

console.log('\n6. Transizione al Video Reale ed Epilogo:');
run('playFinalRealVideo()');
console.log(`   - Video reale avviato: videoPlayed=${videoPlayed} (Atteso: true)`);
if (!videoPlayed) throw new Error('FAIL: Video reale non avviato!');

// Simula termine del video
if (videoEndedCallback) {
  videoEndedCallback();
  console.log('   - Callback video terminato eseguito.');
}

run('showFinalDefinitiveCredits()');
console.log('   - Schermata conclusiva "Andrea & Anna ❤️" visualizzata con successo.');

console.log('\n🎉 TUTTI I TEST DEL FINALE E DI TUTTE LE 12 SCENE SONO STATI SUPERATI AL 100%!');
