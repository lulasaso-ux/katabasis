// Run: node scripts/traer-fuentes.cjs
// Descarga lo que pida scripts/manifiesto-fuentes.json y lo deja en
// scripts/_fuentes/. Solo corre en GitHub Actions: Wikisource y Wikimedia
// Commons no son alcanzables desde el entorno de desarrollo.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const out = path.join(__dirname, '_fuentes');
fs.mkdirSync(out, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifiesto-fuentes.json'), 'utf8'));
const UA = 'KatabasisSourceFetcher/1.0 (https://github.com/lulasaso-ux/katabasis)';

async function get(url, binary) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(res.status + ' ' + url);
  return binary ? Buffer.from(await res.arrayBuffer()) : res.text();
}

// Wikisource: el wikitexto crudo de una página, por su título exacto. Los
// poemas viven dentro de plantillas <poem>, que prop=extracts devuelve vacías;
// el wikitexto conserva los saltos de verso.
async function wikitext(site, title) {
  const url = `https://${site}/w/api.php?action=query&prop=revisions&rvslots=main`
    + `&rvprop=content&format=json&formatversion=2&redirects=1&titles=${encodeURIComponent(title)}`;
  const data = JSON.parse(await get(url, false));
  const page = data?.query?.pages?.[0];
  if (!page || page.missing) {
    const hits = await buscar(site, title);
    throw new Error('Página ausente: ' + title + (hits.length ? ' · candidatos: ' + hits.join(' | ') : ''));
  }
  const raw = page.revisions?.[0]?.slots?.main?.content || '';
  if (!raw.trim()) throw new Error('Página vacía: ' + title);
  return raw;
}

// El wikitexto no basta en todos los Wikisource: el alemán guarda el poema en
// una plantilla <poem>, el francés lo transcluye desde el escaneo con <pages>
// y el ruso lo pone tras una ficha. El texto ya renderizado sirve para los dos
// últimos, así que se traen ambos y se elige al componer.
async function textoPlano(site, title) {
  // action=parse resuelve la transclusión <pages> del Wikisource francés, que
  // prop=extracts devuelve vacía. Se conserva el salto de verso de los <br>.
  const url = `https://${site}/w/api.php?action=parse&prop=text&formatversion=2`
    + `&format=json&redirects=1&page=${encodeURIComponent(title)}`;
  const data = JSON.parse(await get(url, false));
  const html = data?.parse?.text || '';
  return html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<sup class="reference"[\s\S]*?<\/sup>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(p|div|dd|li|h\d)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .split('\n').map(l => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}

// Cuando el título exacto no existe, proponer candidatos en vez de rendirse.
async function buscar(site, term) {
  try {
    const url = `https://${site}/w/api.php?action=query&list=search&format=json&formatversion=2`
      + `&srlimit=5&srsearch=${encodeURIComponent(term)}`;
    const data = JSON.parse(await get(url, false));
    return (data?.query?.search || []).map(r => r.title);
  } catch { return []; }
}

// Commons: la ficha del archivo y una versión de 1200 px de ancho como máximo.
async function commonsImage(file) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo'
    + '&iiprop=url|extmetadata|mime|size&iiurlwidth=1200&format=json&formatversion=2'
    + '&titles=' + encodeURIComponent('File:' + file);
  const data = JSON.parse(await get(url, false));
  const page = data?.query?.pages?.[0];
  if (!page || page.missing) throw new Error('Archivo ausente en Commons: ' + file);
  const info = page.imageinfo[0];
  const bytes = await get(info.thumburl || info.url, true);
  const meta = info.extmetadata || {};
  const plain = v => (v && v.value ? String(v.value).replace(/<[^>]*>/g, '').trim() : '');
  return {
    file,
    mime: (info.thumbmime || info.mime || '').includes('png') ? 'image/png' : 'image/jpeg',
    width: info.thumbwidth || info.width,
    height: info.thumbheight || info.height,
    bytes: bytes.length,
    source_url: 'https://commons.wikimedia.org/wiki/' + page.title.replace(/ /g, '_'),
    image_source_url: info.thumburl || info.url,
    artist: plain(meta.Artist),
    credit: plain(meta.Credit),
    licence: plain(meta.LicenseShortName),
    licence_url: plain(meta.LicenseUrl),
    date: plain(meta.DateTimeOriginal),
    base64: 'data:' + ((info.thumbmime || info.mime || '').includes('png') ? 'image/png' : 'image/jpeg')
      + ';base64,' + bytes.toString('base64'),
  };
}

// No todo vive en un Wikisource: Vondel viene de dbnl.org y Cervantes de un
// libro de Gutenberg. Una entrada con `url` se trae tal cual y se le quita el
// marcado, conservando los saltos de línea.
async function paginaSuelta(url) {
  const html = await get(url, false);
  // Un índice sirve de poco sin sus enlaces: se conservan como «texto → ruta».
  const conEnlaces = html.replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
    (m, href, texto) => texto.replace(/<[^>]+>/g, '').trim() + ' \u2192 ' + href);
  return conEnlaces
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(p|div|dd|li|tr|h\d)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&eacute;/g, 'é')
    .split('\n').map(l => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n').trim();
}

(async () => {
  const textos = {};
  for (const t of manifest.textos || []) {
    process.stdout.write('texto  ' + t.id.padEnd(34));
    try {
      if (t.url) {
        // `raw` guarda el HTML sin tocar, para cuando hay que controlar la
        // extracción verso a verso en vez de fiarse del desmarcado general.
        const plain = t.raw ? await get(t.url, false) : await paginaSuelta(t.url);
        textos[t.id] = { ...t, body: '', plain };
        console.log('OK  página suelta' + (t.raw ? ' en crudo' : '') + ', ' + plain.length + ' car');
        continue;
      }
      const body = await wikitext(t.site, t.title);
      const plain = await textoPlano(t.site, t.title).catch(() => '');
      textos[t.id] = { ...t, url: `https://${t.site}/wiki/${encodeURIComponent(t.title)}`, body, plain };
      console.log('OK  wikitexto ' + body.length + ' car · renderizado ' + plain.length + ' car');
    } catch (e) { textos[t.id] = { ...t, error: String(e.message) }; console.log('FALLA  ' + e.message); }
  }
  fs.writeFileSync(path.join(out, 'textos.json'), JSON.stringify(textos, null, 1));

  const imagenes = {};
  for (const a of manifest.imagenes || []) {
    process.stdout.write('imagen ' + a.id.padEnd(34));
    try {
      imagenes[a.id] = { ...a, ...(await commonsImage(a.file)) };
      console.log('OK  ' + imagenes[a.id].width + 'x' + imagenes[a.id].height + ', ' + Math.round(imagenes[a.id].bytes / 1024) + ' KB');
    } catch (e) { imagenes[a.id] = { ...a, error: String(e.message) }; console.log('FALLA  ' + e.message); }
  }
  fs.writeFileSync(path.join(out, 'imagenes.json'), JSON.stringify(imagenes, null, 1));

  const fallos = [...Object.values(textos), ...Object.values(imagenes)].filter(x => x.error);
  console.log(`\nTextos: ${Object.keys(textos).length} · Imágenes: ${Object.keys(imagenes).length} · Fallos: ${fallos.length}`);
  // Un fallo no tumba la corrida: lo que sí se descargó se confirma igual y el
  // error queda escrito junto a su entrada, para corregir el manifiesto sin
  // gastar otra corrida a ciegas.
  if (fallos.length) console.log(fallos.map(f => '  ' + f.id + ': ' + f.error).join('\n'));
})();
