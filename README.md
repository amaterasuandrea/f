# Anna & Andrea ❤️ — Avventura Narrativa Pixel Art 2D

Un videogioco narrativo ed emotivo in pixel art 2D con visuale dall'alto (stile classico RPG/Pokémon).  
Il gioco racconta la storia di Anna che attraversa un momento buio della propria vita e si allontana temporaneamente da chi la ama, per poi ritrovare passo dopo passo la strada verso Andrea e comprendere che non dobbiamo necessariamente affrontare le difficoltà da soli.

---

## 🎮 Come Giocare

### Metodo 1: Server Locale (Consigliato)
Poiché il gioco carica texture, audio MP3 e video MP4 in locale, si consiglia di avviare un server web locale per evitare le restrizioni CORS dei browser:

```bash
# Avvia il server web locale nella cartella del gioco
python3 -m http.server 8000
```

Apri quindi il browser su:  
👉 **[http://localhost:8000](http://localhost:8000)**

### Metodo 2: Apertura Diretta
È possibile aprire direttamente il file [`index.html`](index.html) con qualsiasi browser moderno (Chrome, Safari, Firefox, Edge).

---

## 🕹️ Comandi di Gioco

| Azione | Tastiera | Touch / Smartphone |
| :--- | :--- | :--- |
| **Movimento** | `W`, `A`, `S`, `D` oppure `Frecce Direzionali` | D-Pad su schermo (tasto 📱 D-Pad) |
| **Interazione / Esamina** | Tasto `E` oppure `Barra Spaziatrice` | Tocco diretto sul prompt interattivo |
| **Avanzamento Dialoghi** | `Spazio`, `E` oppure Click sul box | Tocco sul riquadro del dialogo |
| **Chiudi Modali / Polaroid** | `E`, `Spazio` oppure Click su `✕` | Tocco sul pulsante `✕ Chiudi` |
| **Navigazione Scene** | Barra superiore con i bottoni delle scene 1–12 | Selezione pillola della scena desiderata |

---

## 📂 Struttura del Progetto

Il progetto è organizzato in una struttura pulita e modulare:

```
pokmon/
├── index.html                   # Punto d'ingresso principale del gioco
├── README.md                    # Questa documentazione
├── .gitignore                   # File e cartelle esclusi dal controllo versione
├── assets/                      # Risorse attive in produzione
│   ├── images/
│   │   ├── backgrounds/         # Fondali pixel art delle 12 scene
│   │   ├── characters/          # Sprite di Anna e Andrea
│   │   ├── dog/                 # Sprite e pose del Labrador Lara
│   │   └── items/               # Oggetti da esaminare (polaroid, omino, lanterna, gigli)
│   ├── audio/                   # Canzone del dialogo finale (MP3)
│   ├── video/                   # Video reale epilogo (MP4)
│   └── data/                    # Griglie di collisione e dati di livello (JSON)
├── tests/                       # Suite di collaudo e test automatizzati
│   ├── test_all_11_user_verifications.js
│   ├── test_complete_finale_and_all_scenes.js
│   └── verify_three_fixes.js
└── archive/                     # Risorse di sviluppo e test (escluse da git in produzione)
    ├── animation_frames/        # Fotogrammi intermedi di prova
    ├── dev_scripts/             # Script di generazione e analisi
    ├── references/              # Fotografie e bozzetti di referenza
    └── test_outputs/            # Output e diagrammi di verifica
```

---

## 🧪 Esecuzione dei Test Automatizzati

I test di conformità verificano i dialoghi, la progressione delle 12 scene, le collisioni del ponte, il comportamento di Lara, il grande fade-in audio e la dissolvenza della vignettatura cinematografica:

```bash
# Esegui l'intera suite di collaudo
node tests/test_all_11_user_verifications.js
node tests/test_complete_finale_and_all_scenes.js
node tests/verify_three_fixes.js
```

---

## ❤️ Dedica
*«Non posso prometterti che non ci saranno altri momenti bui. Ma possiamo scegliere di non attraversarli da soli.»*  
**Andrea & Anna ❤️**
