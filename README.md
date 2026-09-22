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

## Goethezeit y Misterios de Don Quijote

Goethezeit reúne cuatro lecturas: Erlkönig, la canción de Mignon, Margarita
ante la rueca y un fragmento de la carta del 10 de mayo de Werther. Conserva
sin repetir la Canción nocturna del caminante. Incluye dos pinturas inspiradas
en Goethe, de Moritz von Schwind y Ernst Meisel, con procedencia y derechos.

Don Quijote recorre cinco misterios: la vocación caballeresca, los molinos,
los galeotes, la derrota ante la Blanca Luna y la muerte de Alonso Quijano.
Cuatro fragmentos nuevos se unen a la ficha original de los molinos, accesible
desde ambos paquetes sin duplicarse. Cada episodio lleva un puente narrativo
y una meditación editorial, separados del texto de Cervantes. Incluye un
grabado de Gustave Doré. Originales: Project Gutenberg, libro 2000.

Los datos y las reproducciones se encuentran en
`app/reading-package-additions.json`. El cargador los incorpora antes de
inicializar la sala. La duración de los misterios cuenta también los puentes,
las meditaciones y el desenlace. La validación comprueba ambos idiomas,
la navegación de los cinco episodios y la activación compartida de los molinos.

## Bardolatry, Cervantismo y dos recorridos épicos

| Paquete | Lecturas nuevas | Obras visuales |
| --- | ---: | ---: |
| Bardolatry | 4 | 2 |
| Cervantismo | 4 | 1 |
| Misterios de Guerra y paz | 5 | 1 |
| Misterios de la Eneida | 5 | 2 |

Bardolatry añade el soneto 116 y pasajes de Hamlet, Macbeth y La tempestad,
sin repetir los sonetos 18 y 73. Cervantismo reúne cuatro pasajes de las
Novelas ejemplares y conserva separados los misterios del Quijote.
Los dos recorridos nuevos enlazan cinco momentos decisivos de cada obra con
puentes narrativos, meditaciones y desenlace. Los originales proceden de
Project Gutenberg, Wikisource en ruso y The Latin Library; cada ficha enlaza
su fuente y distingue las traducciones y síntesis editoriales. Las seis
reproducciones de arte incluyen procedencia y derechos de dominio público.

## Vondeliana y Os Lusíadas

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Vondeliana | 5 | 3 |
| Os Lusíadas | 6 | 3 |

**Vondeliana** reúne cinco lecturas de Joost van den Vondel en neerlandés del
siglo XVII, con la ortografía de la fuente conservada y declarada en cada
ficha. Vondel nació en Colonia de padres neerlandeses y se convirtió al
catolicismo en 1641: cumple el criterio del proyecto por partida doble.
Tres poemas van completos —«Kinder-lyck» (16 versos), «Vitvaert van mijn
Dochterken» (42) y «Wiltzangk» (32)— y los dos coros van íntegros, no como
selección de estrofas: el Rey van Klaerissen del *Gysbreght van Aemstel*
(vv. 903-950, cierre del acto III) y el Rey van Engelen de *Lucifer*
(vv. 281-347, cierre del acto I, con Zang, Tegenzang y Toezang). Originales
de DBNL, *De werken van Vondel*, tomos 3, 5 y 9. Las tres reproducciones son
el retrato de Vondel por Philips Koninck (Rijksmuseum, SK-A-1954, CC0), la
matanza de los inocentes de Cornelis van Haarlem (Rijksmuseum, SK-A-128) y
la caída de los ángeles rebeldes de Frans Floris I (KMSKA Amberes, inv. 112,
CC0).

**Os Lusíadas** reúne seis lecturas portuguesas. El discurso del Viejo del
Restelo va entero, estrofas 94 a 104 del Canto IV: la 94 lo pone en la playa
y le cede la voz, y el último verso de la 104 cierra también el canto. Las
otras cinco van completas: los sonetos «Alma minha gentil, que te partiste»
y «Sete annos de pastor Jacob servia» de Camões, la cantiga «Comiguo me
desavym» de Sá de Miranda tal como se imprimió en el *Cancioneiro Geral* de
1516, «Este inferno de amar» de Almeida Garrett y el soneto «Na mão de Deus»
de Antero de Quental. No se repiten el soneto de Camões ni el poema de Pessoa
que ya estaban en el catálogo. Originales de pt.wikisource; cada ficha declara
su edición en `source_edition`. Las tres reproducciones son los
Paneles de San Vicente de Nuno Gonçalves, panel de los Pescadores y panel del
Infante (MNAA, inv. 1366 y 1361 Pint), y el retrato de Antero de Quental por
Columbano Bordalo Pinheiro (MNAC — Museu do Chiado, inv. 1108).

Ninguna de las once lecturas pasa de **4 minutos estimados** y nueve de ellas
se leen en 1 o 2. Las seis obras visuales enlazan su ficha en Commons y la
ficha del museo que las conserva.

## Las vidas detrás de las obras

Obras y autores continúa debajo del mapa y su índice con una cronología
vertical de nacimientos y muertes. Permite buscar autores, filtrar por época
y desplegar sus lecturas. Refleja los paquetes activos, independientemente
del país seleccionado en el atlas. Cada época tiene su propia escala temporal,
indicada en el gráfico; las fechas aproximadas se marcan con `c.` y línea
discontinua.

`app/author-lives.json` conserva años, incertidumbres, notas de atribución y
enlaces biográficos de Wikidata, consultados el 22 de septiembre de 2026.
Los calificadores de calendario juliano/gregoriano no se interpretan como
incertidumbre del año. Las autorías anónimas, colectivas o de biografía
incierta permanecen en una sección explicada, sin asignarles vidas ficticias.
`app/author-timeline.js` y `.css` contienen el renderizador y sus estilos.

Con todos los paquetes activos hay **220 lecturas, 142 autores o autorías y
106 obras visuales**. Las biografías cubren los 142 registros: 129 con fechas
y 13 sin límites biográficos seguros. Al añadir autores, hay que incorporar
también su registro biográfico o una nota que explique la incertidumbre.

```sh
node scripts/validate-curated-packages.cjs
node scripts/validate-author-timeline.cjs
```
