# Katabasis
Sala de lectura Katabasis.

Katabasis es una sala de lectura bilingüe para descubrir literatura de dominio
público. Muestra una lectura por vez, permite abrir original y traducción en
paralelo, guardar favoritos, activar paquetes opcionales y explorar obras y
autores en un mapa.

La restauración inicial contenía **143 lecturas**, **71 obras de arte** y
**21 paquetes opcionales**; la colección se ha ampliado desde entonces. Las preferencias y los
favoritos se guardan localmente en el navegador.

## Abrir Katabasis

Cuando GitHub Pages esté configurado para publicar `main` desde la raíz, la
aplicación estará disponible en:

<https://lulasaso-ux.github.io/katabasis/>

La página carga el HTML restaurado desde `app/` y lo reconstruye en el
navegador. No requiere dependencias, compilación ni servidor propio. Las
fuentes de textos, museos y lecturas diarias se abren en sitios externos; la
colección propiamente dicha funciona sin conexión después de terminar la carga.

## Estructura actual

`index.html` es el punto de entrada estático. Los archivos
`app/katabasis-*.txt` son partes consecutivas del HTML autocontenido recibido,
incluyendo datos, estilos, lógica, fuente y reproducciones de arte. Se mantienen
separados únicamente para que el repositorio pueda publicar la aplicación
íntegra mediante GitHub Pages.

`.nojekyll` evita transformaciones del contenido por Jekyll.

## Nota de restauración

El único historial disponible de este repositorio contenía este README, no el
árbol de fuentes que describía (`corpus.py`, `texts/`, `packages/`,
`build.py`, `dist/`, etc.). La aplicación se restauró desde el archivo HTML
proporcionado. Por ello, los recuentos de esta versión ejecutable sustituyen las
cifras anteriores de 151 lecturas y 75 imágenes.

Cada ficha conserva enlaces de procedencia y notas editoriales. Las
reproducciones de arte y los textos pueden tener condiciones de derechos
individuales; este repositorio no declara una licencia única para todo su
contenido.

## Renacimiento y Romanticismo latinoamericano

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Renacimiento (superpaquete) | 12 | 6 |
| Romanticismo latinoamericano | 6 | 3 |

Las lecturas de estos dos paquetes duran como máximo **3 minutos estimados**
en español e inglés, a 190 palabras por minuto. Los poemas breves se conservan
completos; los fragmentos indican sus límites. Las traducciones de lectura
generadas por IA se identifican en las fichas. Las nueve reproducciones están
incluidas en el HTML y conservan enlaces de procedencia y de dominio público.

El soneto 18 de Shakespeare permanece únicamente en la antología original;
Renacimiento incluye el **soneto 73**. Las entradas de borrador que repetían
pasajes se consolidan al cargar, y sus favoritos se redirigen a la ficha vigente.

Validación de cantidades, versos, duración, originales, duplicados e imágenes:

```sh
node scripts/validate-curated-packages.cjs
```
