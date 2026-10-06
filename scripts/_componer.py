# Ayudante de composición (no se publica): toma lecturas escritas como listas de
# tercias verso a verso y las inserta en reading-package-additions.json y en
# reading-titles.json, calculando los conteos de palabras que exige el validador.
import json, sys

RAIZ = '/home/user/katabasis'
ADIC = RAIZ + '/app/reading-package-additions.json'
TITULOS = RAIZ + '/app/reading-titles.json'

def construir(lecturas, titulos):
    d = json.load(open(ADIC, encoding='utf-8'))
    t = json.load(open(TITULOS, encoding='utf-8'))
    existentes = {w['id'] for w in d['works']}
    nuevas = []
    for L in lecturas:
        if L['id'] in existentes:
            raise SystemExit('ya existe: ' + L['id'])
        versos = L.pop('versos')
        segs = [[{'original': o, 'es': e, 'en': n}] for o, e, n in versos]
        obra = dict(L)
        obra['segments'] = segs
        for idioma in ('es', 'en'):
            palabras = ' '.join(s[idioma] for g in segs for s in g).strip().split()
            obra['reading_words_' + idioma] = len(palabras)
        nuevas.append(obra)
        print('%-30s %3d versos · %4d pal. ES · %4d pal. EN'
              % (obra['id'], len(segs), obra['reading_words_es'], obra['reading_words_en']))
    d['works'].extend(nuevas)
    t['readings'].update(titulos)
    json.dump(d, open(ADIC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    json.dump(t, open(TITULOS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('\n%d lecturas añadidas · %d registros de título' % (len(nuevas), len(titulos)))
