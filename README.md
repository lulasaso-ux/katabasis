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
ficha: «Kinder-lyck» (16 versos), «Vitvaert van mijn Dochterken» (42),
«Wiltzangk» (32), el Rey van Klaerissen del *Gysbreght van Aemstel*
(vv. 903-950) y el Rey van Engelen de *Lucifer* (vv. 281-347, con Zang,
Tegenzang y Toezang). Originales de DBNL, *De werken van Vondel*,
tomos 3, 5 y 9. Las tres reproducciones son
el retrato de Vondel por Philips Koninck (Rijksmuseum, SK-A-1954, CC0), la
matanza de los inocentes de Cornelis van Haarlem (Rijksmuseum, SK-A-128) y
la caída de los ángeles rebeldes de Frans Floris I (KMSKA Amberes, inv. 112,
CC0).

**Os Lusíadas** reúne seis lecturas portuguesas: el discurso del Viejo del
Restelo, estrofas 94 a 104 del Canto IV, donde la 94 lo pone en la playa y el
último verso de la 104 cierra el canto; los sonetos «Alma minha gentil, que te
partiste» y «Sete annos de pastor Jacob servia» de Camões; la cantiga «Comiguo
me desavym» de Sá de Miranda tal como se imprimió en el *Cancioneiro Geral* de
1516; «Este inferno de amar» de Almeida Garrett; y el soneto «Na mão de Deus»
de Antero de Quental. Originales de pt.wikisource; cada ficha declara su
edición en `source_edition`. Las tres reproducciones son los
Paneles de San Vicente de Nuno Gonçalves, panel de los Pescadores y panel del
Infante (MNAA, inv. 1366 y 1361 Pint), y el retrato de Antero de Quental por
Columbano Bordalo Pinheiro (MNAC — Museu do Chiado, inv. 1108).

Ninguna de las once lecturas pasa de **4 minutos estimados** y nueve de ellas
se leen en 1 o 2. Las seis obras visuales enlazan su ficha en Commons y la
ficha del museo que las conserva.

## Contrapasso y The Gilded Age

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Contrapasso | 5 | 3 |
| The Gilded Age | 6 | 5 |

**Contrapasso** reúne cinco lecturas de Dante fuera de la *Comedia*: el
capítulo III de la *Vita nuova* con su soneto «A ciascun’alma presa»
(edición de Barbi, 1907); la canción petrosa «Così nel mio parlar voglio esser
aspro» (83 versos); *De vulgari eloquentia* II.ii, desde los tres grandes temas
hasta el final del capítulo, donde Bertran de Born es el poeta de las armas
(edición de Giuliani, 1878); *Convivio* IV.xi, 6-14, que lo nombra entre los
generosos; y la *Epistola* XII completa, a un amigo florentino. Originales de
it.wikisource y la.wikisource; cada ficha declara en `source_edition` las
erratas de transcripción corregidas. Las tres reproducciones son el Bertran de
Born de Gustave Doré (ejemplar de *The Vision of Hell*, 1866, en el
Metropolitan, 21.36.133), el Dante de Andrea del Castagno (Uffizi) y el
encuentro florentino de *El saludo de Beatriz* de Dante Gabriel Rossetti
(National Gallery of Canada, 6750.1-3).

**The Gilded Age** reúne seis lecturas estadounidenses de 1883 a 1899: el
capítulo XXXI de *Huckleberry Finn*, desde «It made me shiver» hasta la
decisión de liberar a Jim; los tres primeros párrafos del capítulo IV de *Life
on the Mississippi*; «The New Colossus» de Emma Lazarus; «We Wear the Mask» de
Paul Laurence Dunbar; «A man said to the universe» de Stephen Crane; y «The
Man with the Hoe» de Edwin Markham, con su epígrafe. Originales de Project
Gutenberg y en.wikisource. Las cinco reproducciones son «A Fair Fit» de E. W.
Kemble para la primera edición de *Huckleberry Finn* (Metropolitan,
1986.1145.27, CC0), *The Great Bartholdi Statue* de Currier & Ives
(Metropolitan, 54.90.778, CC0), *Dressing for the Carnival* (22.220, CC0) y
*The Gulf Stream* (06.1234) de Winslow Homer, en el Metropolitan, y *Man with
a Hoe* de Jean-François Millet (J. Paul Getty Museum, 85.PA.114).

Ninguna de las once lecturas pasa de **5 minutos estimados** y cuatro de ellas
se leen en 1 o 2. Las ocho obras visuales enlazan su ficha en Commons y la
ficha del museo que las conserva.

## Tragedia y Comedia

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Tragedia | 6 | 5 |
| Comedia | 6 | 4 |

**Tragedia** reúne seis lecturas: el himno a Zeus del *Agamenón* de Esquilo
(160-183); los versos finales de *Edipo rey* de Sófocles (1524-1530); el
monólogo de Medea ante sus hijos en la *Medea* de Eurípides (1021-1080); el
último parlamento de *Otelo* (V.2); la confesión de Fedra a Enone en la
*Fedra* de Racine (I.3, vv. 269-316); y el último soliloquio del *Doctor
Fausto* de Marlowe. Los griegos proceden de los textos TEI de la Perseus
Digital Library (ediciones de Smyth, Storr y Murray). Las cinco
reproducciones son *Edipo y la Esfinge* de Gustave Moreau, la *Medea* de
William Wetmore Story, la lámina 14 del *Otelo* de Théodore Chassériau y el
*Fausto* de Rembrandt, todas del Metropolitan (CC0), y la *Fedra* de
Alexandre Cabanel (Petit Palais, PDUT1500, CC0).

**Comedia** reúne seis lecturas: Estrepsíades y Sócrates en *Las nubes* de
Aristófanes (218-238); el lamento de Euclión en la *Aulularia* de Plauto
(713-726); el monólogo de Harpagón en *El avaro* de Molière (IV.7); «All the
world’s a stage» de *Como gustéis* (II.7); el pasaje de las seis llaves del
*Arte nuevo de hacer comedias* de Lope de Vega; y el monólogo del alcalde en
*El inspector* de Gógol (V.8). Las cuatro reproducciones son una estatuilla
ática de actor cómico, el frontispicio de Hogarth para *El avaro* grabado por
John Vandergucht y *Los comediantes franceses* de Watteau, del Metropolitan
(CC0), y *Las siete edades del hombre* de William Mulready (Victoria and
Albert Museum, FA.138[O]).

Ninguna de las doce lecturas pasa de **3 minutos estimados** y nueve de ellas
se leen en 1 o 2. Las nueve obras visuales enlazan su ficha en Commons y la
ficha del museo que las conserva.

## Nashe vsyo

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Nashe vsyo | 6 | 3 |

**Nashe vsyo** («Наше всё», «nuestro todo», como llamó Apolón Grigóriev a
Pushkin en 1859) reúne seis lecturas de Alexander Pushkin distintas de «Я вас
любил», que ya estaba en el catálogo: «Я помню чудное мгновенье», el poema a
Anna Kern; «Пророк»; la carta de Tatiana a Oneguin (*Eugenio Oneguin*, III);
los versos 1-20 de la Introducción de *El jinete de bronce*; «Зимнее утро»; y
«Я памятник себе воздвиг нерукотворный». Los textos proceden de Wikisource en
ruso y se comprobaron contra sus páginas. Las tres reproducciones son el
retrato de Pushkin de Orest Kiprenski (Galería Tretiakov, inv. 168), la
*Vista del monumento a Pedro I en la plaza del Senado* de Vasili Súrikov
(Museo de Arte Súrikov de Krasnoyarsk) e *Invierno* de Iván Shishkin (Museo
Ruso, Ж-2803).

Ninguna de las seis lecturas pasa de **3 minutos estimados** y cinco de ellas
se leen en 1 o 2. Las tres obras visuales enlazan su ficha en Commons y la
ficha del museo que las conserva.

## República de las letras

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| República de las letras | 6 | 5 |

**República de las letras** reúne seis cartas, de 1345 a 1755: la de Petrarca a
Cicerón (*Familiares* XXIV, 3), completa; los dos primeros párrafos de la
carta de Erasmo a Ulrich von Hutten sobre Tomás Moro (1519); la jornada de
Maquiavelo en su finca y en su estudio, de la carta a Francesco Vettori del 10
de diciembre de 1513; la invitación de Descartes a Guez de Balzac para que se
retire a Ámsterdam (1631); la carta de Madame de Sévigné a Coulanges sobre la
boda de Lauzun (15 de diciembre de 1670), completa; y el primer párrafo de la
carta de Voltaire a Rousseau del 30 de agosto de 1755. Los textos proceden de
Wikisource en latín, italiano y francés y se comprobaron contra sus páginas;
en Descartes (edición Adam-Tannery) la s larga, u/v e i/j se componen según el
uso moderno. Las cinco reproducciones son el *Erasmo* de Durero, la portada de
Reinier Nooms para sus vistas de Ámsterdam y el *Voltaire* de Houdon, del
Metropolitan (CC0); la *Mujer leyendo una carta* de Vermeer (Rijksmuseum,
SK-C-251); y el retrato de Madame de Sévigné atribuido a Claude Lefèbvre
(Musée Carnavalet, P1978, CC0).

Ninguna de las seis lecturas pasa de **4 minutos estimados** y cinco de ellas
se leen en 3 o menos. Las cinco obras visuales enlazan su ficha en Commons y la
ficha del museo que las conserva.

## Las vidas detrás de las obras

Obras y autores continúa debajo del mapa con una cronología de nacimientos y
muertes. Sin país seleccionado, la lista completa de autores queda plegada
bajo «Ver todos los autores y sus obras». La cronología muestra un periodo
por vez, elegido en una lista ordenada de arriba abajo por nacimiento:

- La Antigüedad · 800 a. C.–500
- Los siglos medievales · 500–1400
- Del Renacimiento al Barroco · 1400–1700
- La modernidad · 1700–1900
- Vidas sin fechas seguras

La búsqueda por nombre recorre todos los periodos. Refleja los paquetes
activos, independientemente del país seleccionado en el atlas. Cada periodo
tiene su propia escala temporal; las fechas aproximadas se marcan con `c.` y
línea discontinua.

`app/author-lives.json` conserva años, incertidumbres, notas de atribución y
enlaces biográficos de Wikidata, consultados el 22 de septiembre de 2026.
Los calificadores de calendario juliano/gregoriano no se interpretan como
incertidumbre del año. Las autorías anónimas, colectivas o de biografía
incierta permanecen en una sección explicada, sin asignarles vidas ficticias.
`app/author-timeline.js` y `.css` contienen el renderizador y sus estilos.

Con todos los paquetes activos hay **255 lecturas, 160 autores o autorías y
131 obras visuales**. Las biografías cubren los 160 registros: 147 con fechas
y 13 sin límites biográficos seguros. Al añadir autores, hay que incorporar
también su registro biográfico o una nota que explique la incertidumbre.

## Pinturas en el atlas

El atlas alterna entre Escritos y Pinturas. En Pinturas, cada país cuenta y
lista las obras visuales agrupadas por artista, y cada una abre su ficha. Una
pintura se sitúa en el país o la escuela donde trabajó su autor: Bruegel en
Bélgica, El Greco en España, Fuseli en Gran Bretaña, Whistler en Estados
Unidos. Las obras de los paquetes llevan su `region`; las de la colección
original se asignan en `painting_regions` de
`app/reading-package-additions.json`, que también añade Bélgica y Suiza al
mapa.

## Palabra por palabra

Cada lectura permite, sobre el texto original, mostrar debajo de cada palabra
su traducción literal, tomada fuera de contexto. Los originales en español se
glosan en inglés; los ingleses, en español, y los demás en ambas lenguas,
según el idioma de lectura. El chino clásico se glosa carácter por carácter,
el geʽez se separa por su signo de palabra y en hebreo se ignoran los signos
de cantilación.

`app/gloss-lexicon.json` guarda las glosas por idioma y forma de palabra:
28 idiomas y 26.634 entradas, sin entradas que ninguna lectura use.
`app/gloss.js` divide el texto y lo presenta; `app/extras.css` contiene sus
estilos. Al añadir o corregir una lectura hay que glosar también sus palabras
nuevas.

```sh
node scripts/validate-curated-packages.cjs
node scripts/validate-author-timeline.cjs
node scripts/validate-glosses.cjs
node scripts/validate-compass.cjs
```

## Brújula

La brújula sitúa a 77 autores en dos ejes: de la narración transparente a la
forma y el esteticismo, y del desencanto a la trascendencia. «Haz match
conmigo» tiene 18 preguntas de cinco grados: 8 para el eje vertical y 10 para
el horizontal. Tres de las horizontales preguntan hacia dónde prefiere mirar el
lector (lo que el hambre, la guerra o el dinero hacen a la gente, frente a lo
verdadero, lo bello o lo que merece amarse) y las demás, qué espera de una obra.
Los dos polos de cada pregunta están redactados para que ninguno suene a
defecto. Cada respuesta extrema mueve el resultado 10 puntos en horizontal y
12,5 en vertical; con respuestas coherentes, fuertes o moderadas, se llega a
los cuatro cuadrantes. `app/compass-data.js` guarda autores y preguntas, y
`scripts/validate-compass.cjs` comprueba que las preguntas estén completas en
los dos idiomas, que los ejes estén equilibrados y que cada cuadrante sea
alcanzable y tenga al menos ocho autores.
