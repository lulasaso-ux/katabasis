(function (root) {
  'use strict';
  // A word is a run of letters, marks or digits, optionally joined by an
  // apostrophe or hyphen (d'aspeito, chamam-te, ἀλλ᾽). Everything else is
  // punctuation or space and stays in the text as written.
  const WORD = /[\p{L}\p{M}\p{N}]+(?:['’ʼ᾽\-‐][\p{L}\p{M}\p{N}]+)*/gu;
  const HAN = /\p{Script=Han}/u;
  const CANTILLATION = /[֑-ֽ֯]/g;
  const DIGITS = /^\p{N}+$/u;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Glosses are keyed by the word as it would be looked up out of context.
  function key(word) {
    return word.normalize('NFC').replace(CANTILLATION, '').replace(/[’ʼ᾽]/g, "'").replace(/‐/g, '-').toLowerCase();
  }
  function words(text) {
    return (text.match(WORD) || []).filter(w => !DIGITS.test(w));
  }
  // Classical Chinese is glossed character by character; Geʽez separates
  // words with its own word divider rather than with spaces.
  function pieces(chunk, lang) {
    if (lang === 'zh') {
      const out = [];
      for (const ch of chunk) {
        if (HAN.test(ch) || !out.length) out.push(ch);
        else out[out.length - 1] += ch;
      }
      return out;
    }
    if (lang === 'gez') return chunk.split(/(?<=[፡።፣፤፥፦፧፨])/u).filter(Boolean);
    return [chunk];
  }
  // The lookup keys a reading needs, in order of first appearance.
  function keys(text, lang) {
    const out = [];
    for (const chunk of text.split(/\s+/)) {
      for (const piece of pieces(chunk, lang)) {
        for (const w of (lang === 'zh' ? [...piece].filter(ch => HAN.test(ch)) : words(piece))) out.push(key(w));
      }
    }
    return out;
  }
  // Which translations a reading's original needs: the reader's two
  // languages, minus the language the original is already in.
  function targets(lang) {
    return ['es', 'en'].filter(l => l !== lang);
  }
  function gloss(piece, lang, lexicon, target) {
    const entry = lexicon && lexicon[lang];
    if (!entry) return '';
    const slot = target === 'es' ? 0 : 1;
    const found = (lang === 'zh' ? [...piece].filter(ch => HAN.test(ch)) : words(piece))
      .map(w => (entry[key(w)] || [])[slot])
      .filter(Boolean);
    return found.join(' ');
  }
  function render(text, lang, lexicon, target) {
    return String(text).split(/(\s+)/).map(chunk => {
      if (!chunk || /^\s+$/.test(chunk)) return chunk;
      return pieces(chunk, lang).map(piece => {
        const meaning = gloss(piece, lang, lexicon, target);
        return `<span class="gl"><span class="gl-w">${escape(piece)}</span><span class="gl-t" lang="${target}" dir="ltr">${meaning ? escape(meaning) : '&#8203;'}</span></span>`;
      }).join('');
    }).join('');
  }
  function available(lang, lexicon) {
    return !!(lexicon && lexicon[lang] && Object.keys(lexicon[lang]).length);
  }
  root.KatabasisGloss = {key, keys, targets, gloss, render, available};
})(globalThis);
