# poetanakh

A small client-side tool for searching the Tanakh (Hebrew Bible) by metrical pattern instead of by words.

Live idea: instead of asking "where does this word appear?", ask "where does this *rhythm* appear?" — find verses whose syllabic weight pattern matches a given sequence of stressed (`-`) and light (`◡`) syllables, the way you'd scan a line of poetry.

## Background: the meter system

The `tnua`/`yated` distinction used here isn't a modern invention — it's the syllable classification underlying the quantitative meter (*ha-mishkal ha-mekhubar*) that Hebrew poetry adopted in medieval Spain, borrowed from Arabic prosody (*'arud*). Its introduction into Hebrew is traditionally associated with Dunash ben Labrat in 10th-century Spain, though the precise history is debated among scholars; regardless of its origin, it became the standard form for the Golden Age Hebrew poets — Shmuel HaNagid, Solomon ibn Gabirol, Moses ibn Ezra, and Judah Halevi among them.

In that system, every syllable is classified as either:
- **tnua** (תנועה, "moving") — a full vowel, counted as one metrical beat
- **yated** (יתד, "peg") — a light, quick syllable formed by a vocal shva (or chataf), which pairs with the vowel after it to form a single metrical unit

A line's meter is the sequence of these units — exactly the `-`/`◡` strings this tool builds from Biblical Hebrew text. The Tanakh itself predates and isn't written in this meter, so this project is really a scansion instrument borrowed from medieval Hebrew poetics and pointed at Biblical text — useful for finding verses that happen to fall into a given quantitative pattern, or for exploring how the medieval system maps onto Biblical vocalization.

## How it works

Each word is converted into a string of two symbols before matching:

- `-` (*tnua*) — a full vowel/syllable
- `◡` (*yated*) — a light syllable (shva, chataf, or a shva+dagesh pair)

The conversion (`searchWorker.js`) strips consonants and cantillation, resolves shuruk/dagesh/chataf cases, and collapses each word down to its weight pattern. A verse becomes a space-separated sequence of these patterns, and a query like `-◡-◡` is matched against it with a regex, word-boundary-aware and allowing partial-word matches.

Search runs in a Web Worker so the UI stays responsive, streaming results back as it scans; each of the 39 books is fetched and processed lazily (`data/book0.json` … `data/book38.json`) rather than loading the whole Tanakh at once.

## Usage

Open `index.html` (no build step, no dependencies) and type a pattern using only `-` and `◡`, then search. Matching verses are shown with their reference.

## Data

Tanakh text is the Masoretic version, sourced from [Sefaria](https://www.sefaria.org).

## Tech

Vanilla JS, a Web Worker, and static JSON — no framework, no build tooling.
