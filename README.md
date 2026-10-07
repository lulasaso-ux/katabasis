# Katabasis
Sala de lectura Katabasis.

Katabasis es una sala de lectura bilingüe para descubrir literatura de dominio
público. Muestra una lectura por vez, permite abrir original y traducción en
paralelo, guardar versos y pasajes con notas privadas en un cuaderno de
lectura, activar paquetes opcionales y explorar obras y autores en un mapa.

La restauración inicial contenía **143 lecturas**, **71 obras de arte** y
**21 paquetes opcionales**; la colección se ha ampliado desde entonces. Las preferencias y el
cuaderno de lectura se guardan localmente en el navegador.

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
cifras anteriores de 151 lecturas y 75 imágenes. Del mismo modo, las tablas de
Goethezeit, Bardolatry, Cervantismo, Contrapasso, Vondeliana, Ego Hugo y
Nashe vsyo que aparecen más abajo son las de su primera versión: los
recuentos vigentes de esos siete paquetes están en «Siete superpaquetes del
mejor autor de cada país».

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

El recorrido de un misterio a otro (puente, meditación y paso al siguiente
episodio) solo aparece cuando el libro se abre desde Paquetes. Abierto desde la
antología, un misterio se lee como cualquier otra lectura y «Anterior» y
«Siguiente» siguen el orden de la antología.

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

## Himnos nacionales 1 y 2

| Paquete | Lecturas | Versos | Obras visuales |
| --- | ---: | ---: | ---: |
| Himnos nacionales 1 | 9 | 608 | 4 |
| Himnos nacionales 2 | 8 | 457 | 3 |

Los diecisiete himnos, enteros y en su lengua original, se reparten en dos
paquetes que se activan por separado. Quien tenía activado el antiguo paquete
de himnos conserva los dos.

**Himnos nacionales 1**

| Himno | Texto |
| --- | --- |
| *La Marsellesa* (Francia) | las seis estrofas de Rouget de Lisle, con el estribillo |
| *Canto de los italianos* (Italia) | las cinco estrofas de Mameli, con el coro |
| *Wilhelmus* (Países Bajos) | las quince estrofas, en el texto moderno |
| *A Portuguesa* (Portugal) | las tres estrofas, con el estribillo |
| *Mazurca de Dąbrowski* (Polonia) | las cuatro estrofas oficiales y las dos del manuscrito de Wybicki que quedaron fuera |
| *Himnusz* (Hungría) | las ocho estrofas de Kölcsey |
| *¡Oh gloria inmarcesible!* (Colombia) | el coro y las once estrofas de Núñez |
| *Oíd, mortales* (Argentina) | las nueve estrofas de 1813, con el coro |
| *La Bayamesa* (Cuba) | las tres estrofas de Figueredo |

**Himnos nacionales 2**

| Himno | Texto |
| --- | --- |
| *Lied der Deutschen* (Alemania) | las tres estrofas; solo la tercera es el himno |
| *The Star-Spangled Banner* (Estados Unidos) | las cuatro estrofas |
| *Ô Canada* (Canadá) | las cuatro estrofas francesas de Routhier |
| *Hen Wlad Fy Nhadau* (Gales) | las tres estrofas, con el coro |
| *Himno a la Libertad* (Grecia) | las 24 primeras de las 158 estrofas de Solomós, el himno oficial |
| *Mexicanos, al grito de guerra* (México) | el coro y las diez estrofas de 1853 |
| *Dulce Patria* (Chile) | el coro y las seis estrofas de Lillo |
| *Hino Nacional* (Brasil) | las dos partes, con el coro |

Los estribillos y coros se escriben completos tras cada estrofa, como se
cantan. Los textos proceden de Wikisource en cada lengua y se comprobaron verso
a verso contra sus páginas: para México, las cuatro estrofas del texto oficial
y las otras seis del texto completo de 1899; para Polonia, la ley de 1980 y el
manuscrito de 1797. Solo se moderniza la ortografía donde la fuente usa la
antigua (*enfans*, *Yguala*, *calló* por *cayó*, acentos como *dió* o *á*) y se
corrigen «loza» en «losa» (Colombia) y las erratas «inflama la muerte» (México,
«la mente», como pide la rima), «Tremble, tyrans» y «forme ;» (Marsellesa).

Las siete reproducciones son de dominio público en Commons. En Himnos nacionales
1: *La Libertad guiando al pueblo* de Delacroix, *Rouget de Lisle canta la
Marsellesa* de Isidore Pils (Musée historique de Strasbourg), la *Entrada del
general Dąbrowski en Roma* de January Suchodolski (Museo Nacional de Varsovia,
MP 3815) y *La batalla de Boyacá* de Martín Tovar y Tovar (Palacio Federal
Legislativo, Caracas). En Himnos nacionales 2: *Grecia sobre las ruinas de
Missolonghi* de Delacroix, *By Dawn’s Early Light* de Edward Percy Moran e
*¡Independencia o muerte!* de Pedro Américo (Museu Paulista).

El himno más largo, el mexicano, se lee en **5 minutos estimados**; el alemán,
en uno.

## Misterios gozosos del Rosario y Misterios de la Ilíada

| Paquete | Lecturas | Versos | Obras visuales |
| --- | ---: | ---: | ---: |
| Misterios gozosos del Rosario | 5 | 82 | 5 |
| Misterios de la Ilíada | 5 | 132 | 4 |

**Misterios gozosos del Rosario** acompaña a los luminosos con los cinco
misterios de la infancia de Jesús, todos del Evangelio de Lucas, en pasajes
continuos: la anunciación (1, 26–38), la visitación con el Magníficat entero
(1, 39–56), el nacimiento y los pastores (2, 1–20), la presentación en el
templo con Simeón y Ana (2, 22–40) y el niño hallado en el templo (2, 41–52).
El griego es el de Westcott–Hort (1881) en la transcripción de dominio público
de byztxt, convertida a Unicode, sin acentos ni puntuación, como en los
luminosos. Las pinturas: *La anunciación* de Leonardo (Uffizi), *La
visitación* de Ghirlandaio (Louvre), *La natividad mística* de Botticelli
(National Gallery), *El canto de alabanza de Simeón* de Rembrandt (Mauritshuis)
y *El hallazgo del Salvador en el templo* de William Holman Hunt (Birmingham).

**Misterios de la Ilíada** sigue la cólera de Aquiles en cinco escenas: el
proemio y la súplica de Crises (1, 1–21), Héctor, Andrómaca y el casco que
asusta a Astianacte (6, 466–493), el duelo de Aquiles por Patroclo (18, 22–38),
la muerte de Héctor (22, 337–366) y Príamo besando las manos de Aquiles
(24, 477–512). Los puentes cuentan los cantos intermedios, cada escena lleva una
meditación y el desenlace llega hasta el funeral de Héctor. El griego es el de
Monro y Allen (Oxford, 1908–1920) en Perseus. Cuatro pinturas: Angelica
Kauffman, Gavin Hamilton, Jacques-Louis David y Alexander Ivanov.

Como los demás misterios, el recorrido de uno a otro solo aparece cuando el
libro se abre desde Paquetes. Las traducciones de lectura son nuevas y verso a
verso.

## La ruta de la seda

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| La ruta de la seda | 6 | 5 |

Seis pasajes de viajeros medievales hacia Oriente, cada uno en su lengua:

| Lectura | Obra | Original |
| --- | --- | --- |
| Para saber la pura verdad | Marco Polo, *Libro de las maravillas*, prólogo | francés antiguo |
| Los espíritus del desierto de Lop | ídem, cap. LVI | francés antiguo |
| Ciandu, el palacio de verano del Gran Kan | ídem, cap. LXXIV | francés antiguo |
| El sepulcro de David | Benjamín de Tudela, *Itinerario* (Jerusalén) | hebreo |
| El árbol de plata de Karakórum | Guillermo de Rubruck, *Itinerarium ad partes orientales*, cap. XXX | latín |
| El aire desordenado | Juan de Plano Carpini, *Historia Mongalorum*, cap. I | latín |

Marco Polo se lee en la redacción francesa revisada en 1307 para Thiébault de
Cépoy, la del manuscrito del *Livre des merveilles* (BnF fr. 2810), según la
edición de Pauthier (1865). Benjamín de Tudela, en el hebreo de Adler (1907).
Rubruck y Carpini, en la edición crítica de Van den Wyngaert (*Sinica
Franciscana* I, 1929). Se quitaron las llamadas de nota y el aparato crítico;
las demás intervenciones constan en cada ficha.

Las imágenes son cuatro miniaturas del propio *Livre des merveilles* (el
frontispicio, Qubilai y la tablilla de oro, los Polo ante el Gran Kan y unos
peregrinos en Jerusalén) y la caravana del Atlas catalán (1375).

## Ego Hugo

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Ego Hugo | 6 | 6 |

«Ego Hugo» era la divisa que Victor Hugo hizo grabar en Hauteville House, su
casa del exilio en Guernesey. El paquete reúne:

| Lectura | Obra | Texto |
| --- | --- | --- |
| «Mañana, al alba…» | *Las contemplaciones*, IV, 14 | completo |
| Booz dormido | *La leyenda de los siglos* | completo |
| Los djinns | *Las orientales*, XXVIII | completo |
| Ultima verba | *Los castigos*, VII, 16 | las trece últimas estrofas |
| El obispo trabaja | *Los miserables*, I, II, 12 | capítulo completo |
| Boda de Quasimodo | *Nuestra Señora de París*, XI, 4 | capítulo completo |

Los textos franceses salen de Wikisource. En *Los djinns* se omite el epígrafe
de Dante. En el capítulo de Quasimodo se repone la inicial que falta en el
facsímil y un punto antes de «Voilà Montfaucon»; cada ficha lo indica.

Las obras visuales son dos tintas del propio Hugo (*Mi destino* y *El burgo
de Hugo Cabeza de Águila*), el retrato de Léopoldine niña de Auguste de
Châtillon, *Segadores descansando (Rut y Booz)* de Millet, el Monseñor
Bienvenu que Gustave Brion dibujó para *Los miserables* en 1862 y *La
Esmeralda* de Charles de Steuben. Cuatro son CC0 de Paris Musées.

## Poète maudit 1 y 2

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Poète maudit | 6 | 5 |
| Poète maudit 2 | 6 | 3 |

Las doce lecturas de Baudelaire, en francés y con nuevas traducciones de
lectura, se reparten en dos paquetes que se activan por separado. Quien tenía
activado el antiguo paquete «El poeta maldito» conserva los dos. El texto es
el de la edición de 1861, salvo «Recogimiento» (1868) y los poemas en prosa
(1869), y conserva su ortografía (*Poëte*, *rhythmique*).

**Poète maudit** reúne el núcleo de *Spleen e Ideal*: «Al lector», «El
albatros», «Correspondencias», «La invitación al viaje», «Armonía de la
tarde» y «Una carroña». Sus cinco obras son el retrato de Baudelaire de
Courbet, el albatros de Doré para Coleridge, el *Homenaje a Delacroix* de
Fantin-Latour, *La amante de Baudelaire reclinada* (Jeanne Duval) de Manet y
el frontispicio de Rops para *Les Épaves*.

**Poète maudit 2** recoge al Baudelaire parisino y tardío: «Spleen» («Cuando
el cielo bajo y pesado…»), «A una transeúnte», «Recogimiento», las dos
últimas partes de «El viaje» —la única lectura incompleta de los dos
paquetes— y, de los *Pequeños poemas en prosa*, «El extranjero» y
«Embriagaos». Sus tres obras son *El estrige* de Meryon, *Música en las
Tullerías* de Manet y *El naufragio de Don Juan* de Delacroix.

Ninguna de las ocho repite una obra de Poetas malditos.

## Misterios del Éxodo

| Paquete | Lecturas | Versículos | Obras visuales |
| --- | ---: | ---: | ---: |
| Misterios del Éxodo | 5 | 66 | 5 |

Los cinco misterios luminosos del Rosario, leídos en el libro del Éxodo y en
el orden del libro, no en el del Rosario:

| Paso | Éxodo | Misterio luminoso |
| --- | --- | --- |
| I. El agua hecha sangre | 7, 14–25 | Las bodas de Caná |
| II. El paso del mar | 14, 19–31 | El bautismo en el Jordán |
| III. El pan del cielo | 16, 9–21 | La institución de la Eucaristía |
| IV. Las diez palabras | 20, 1–21 | El anuncio del Reino |
| V. El rostro de Moisés | 34, 29–35 | La transfiguración |

Los pasajes son continuos: la primera plaga; el mar partido; el maná, con la
gloria en la nube, las codornices, el rocío y el pan que se pudre si se
guarda; el Decálogo entero con el miedo del pueblo ante el monte; y el rostro
de Moisés que resplandece y se cubre con un velo. Los puentes cuentan lo que
pasa entre uno y otro (las demás plagas, el canto de María, el becerro de oro)
y nombran el misterio luminoso que cada escena prefigura; el desenlace llega
hasta la nube que llena la tienda y hasta Moisés en el monte de la
transfiguración.

El hebreo es el del códice de Leningrado (WLC 4.20, dominio público) en la
edición electrónica de Open Scriptures, con puntos vocálicos y sin signos de
cantilación. Las cinco obras: *El agua convertida en sangre* de James Tissot
(Jewish Museum), *El paso de los judíos por el mar Rojo* de Aivazovski, *Los
israelitas recogiendo el maná en el desierto* de Poussin (Louvre), *Moisés con
las tablas de la ley* de Rembrandt (Gemäldegalerie, Berlín) y el grabado de
Doré *Moisés baja del monte Sinaí*.

## Kafkiano

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Kafkiano (*Kafkaesque* en inglés) | 6 | 5 |

Franz Kafka en alemán, con nuevas traducciones de lectura. Solo entran textos
que Kafka vio impresos o que Max Brod publicó en 1925:

| Lectura | Obra | Publicación |
| --- | --- | --- |
| Ante la ley | completo | *Selbstwehr*, 1915 |
| Un mensaje imperial | completo | *Selbstwehr*, 1919 |
| La mañana de Gregor Samsa | *La metamorfosis*, los cuatro primeros párrafos | *Die weißen Blätter*, 1915 |
| En la galería | completo | *Un médico rural*, 1919 |
| Odradek | «Las preocupaciones de un padre de familia», completo | *Selbstwehr*, 1919 |
| Alguien tenía que haber calumniado a Josef K. | *El proceso*, comienzo del capítulo I | 1925 |

Los textos vienen de las transcripciones de Wikisource en alemán, que siguen
la ortografía de cada primera edición (*daß*, *Oeffnete*, *Uebrigens*). Las cinco
obras: una cárcel de Piranesi, las puertas abiertas de Hammershøi, el
emperador Qianlong de Castiglione, una lámina de metamorfosis de Maria
Sibylla Merian y la amazona del Cirque Fernando de Toulouse-Lautrec.

## Los Vagabundos

| Paquete | Lecturas | Obras visuales |
| --- | ---: | ---: |
| Los Vagabundos (*The Wanderers* en inglés) | 5 | 4 |

El realismo ruso del siglo XIX en cinco lecturas, en ruso y con nuevas
traducciones de lectura, y cuatro cuadros de los Peredvízhniki, «los
ambulantes»:

| Lectura | Obra | Cuadro |
| --- | --- | --- |
| Sal al Volga | Nekrásov, *Reflexiones ante un portal de gala* (1858), versos 90–117 | Repin, *Los sirgadores del Volga* |
| La noche junto al fuego | Turguénev, «El prado de Bezhin» (1851), fragmento | — |
| Cristo en Sevilla | Dostoievski, *Los hermanos Karamázov*, V, 5, «El Gran Inquisidor», fragmento | Gué, *¿Qué es la verdad?* |
| El hombre junto a la capilla | Tolstói, *De qué viven los hombres* (1881), capítulo I, fragmento | Yaroshenko, *En todas partes hay vida* |
| El estudiante | Chéjov, «El estudiante» (1894), completo | Savrásov, *Han llegado los grajos* |

Los textos vienen de Wikisource en ruso. Nekrásov, Turguénev y Chéjov tienen
ahora su ficha de vida.

## Pantalla de carga

Mientras se cargan los archivos de la sala, `index.html` muestra la portada
de Katabasis (`app/katabasis-portada.webp`, 1000 × 1000, 37 KB): un cayado con
un arco, cintas y un escudo con laurel sobre «Descender · leer · renacer». El
fondo toma el color del papel de la imagen y debajo quedan el estado y una
barra de progreso fina.

## Siete superpaquetes del mejor autor de cada país

| Paquete | Autor | Lecturas | Obras visuales |
| --- | --- | ---: | ---: |
| Goethezeit | Goethe | 10 | 8 |
| Bardolatry | Shakespeare | 10 | 8 |
| Cervantismo | Cervantes | 10 | 8 |
| Contrapasso | Dante | 10 | 8 |
| Vondeliana | Vondel | 10 | 8 |
| Ego Hugo | Hugo | 10 | 8 |
| Nashe vsyo | Pushkin | 11 | 8 |

Cada uno de estos siete paquetes pasó a diez lecturas y ocho obras visuales,
que es el tope; Nashe vsyo tiene once, porque «Al mar» entró después de su
cuadro. La regla es un solo superpaquete por país, el de su mejor
autor; de ahí que Baudelaire, en una Francia que ya tiene a Hugo, quede en
dos paquetes de seis (Poète maudit 1 y 2) y no en un superpaquete.

Las lecturas nuevas son textos breves y completos siempre que se pueda: los
sonetos de Shakespeare, las *rime* de Dante anteriores a la *Comedia*, los
poemas sueltos de Goethe, las piezas de Vondel que no estaban en DBNL con el
resto, los poemas de Hugo fuera de *Les Contemplations* y los de Pushkin que
no son *Onegin*. Lo que se extrajo y no entró queda anotado en el manifiesto
de fuentes para una segunda parte.

Las obras visuales se traen de Wikimedia Commons con
`.github/workflows/traer-fuentes.yml`, porque el entorno de desarrollo no
alcanza Commons. `scripts/manifiesto-fuentes.json` nombra los archivos; si un
nombre no existe, el script prueba los alternativos y después busca en el
espacio Archivo:, dejando anotados los candidatos. Cada ficha guarda la
imagen en base64, la procedencia, el autor, la licencia declarada en Commons
y el texto alternativo en los dos idiomas.

## Superpaquetes

Un paquete con diez lecturas o más es un *superpaquete*: hoy lo son Ruinas (14),
Poetas malditos (12), Renacimiento (12), Goethezeit (10), Bardolatry (10),
Cervantismo (10), Contrapasso (10), Vondeliana (10), Ego Hugo (10) y
Nashe vsyo (11). La
distinción no se asigna a mano: se calcula con el número de lecturas del
paquete (`SUPER_PACKAGE_MIN` en `app/katabasis-37.txt`), de modo que un paquete
que crezca hasta diez lecturas pasa a serlo.

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

## El mapa como un atlas antiguo

El mapa de Obras y autores se dibuja como un mapamundi de doble hemisferio del
siglo XVII. Tiene dos hemisferios en proyección estereográfica, partidos por los
meridianos 20° O y 160° E, como en los atlas holandeses, y dos discos polares
pequeños entre ellos. Los países siguen siendo los mismos y se pueden pulsar
igual; cada uno se colorea según su número de lecturas u obras. Los que entran
en un disco polar también se pueden tocar ahí.

El grabado incluye:

- papel envejecido y doble filete en el marco;
- bordes graduados en tramos de 10°, meridianos y paralelos cada 10°;
- trópicos y círculos polares discontinuos, y la eclíptica punteada;
- el sombreado de las costas;
- dos rosas de los vientos con sus rumbos, tres barcos y una cartela «ORBIS
  LECTORVM»;
- los nombres latinos de los hemisferios, los polos, los océanos y la «Terra
  Australis Incognita».

Mundo, Europa y Américas encuadran la misma lámina. La geometría se calcula a
partir de los trazados equirectangulares del mapa (x = (lon+180)·2,5;
y = (85−lat)·2,5) y está en `app/atlas-hemispheres.json`; `app/atlas.js` y
`app/atlas.css` dibujan los adornos. Todo funciona sin conexión.

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
node scripts/validate-reading-titles.cjs
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

## Traducciones oficiales

El menú junto al número de lecturas cambia entre «Traducciones de IA» (todas
las lecturas, con la traducción literal de trabajo) y «Solo traducciones
oficiales». En el segundo modo quedan solo las lecturas que tienen una
traducción publicada de dominio público al español o al inglés, y esa versión
sustituye a la de IA, alineada con el original por estrofa o párrafo. El
traductor, la edición y la fuente se indican bajo el texto. Si la lectura solo
tiene versión oficial en el otro idioma, el lector lo dice y muestra el
original. La elección se guarda en el navegador.

Solo entran traducciones publicadas antes de 1930 cuyo traductor murió antes
de 1946. Hay 120 lecturas con traducción oficial: 117 en inglés y 34 en
español. `app/official-translations.json` guarda los bloques de texto y el
intervalo de filas del original que cubre cada uno; `app/official.js` y
`app/official.css` hacen el menú y la presentación.
`scripts/validate-official.cjs` comprueba que cada lectura exista, que la
lengua no sea la del original, que las fechas cumplan el criterio y que los
bloques cubran todas las filas sin huecos.

```sh
node scripts/validate-official.cjs
```

## Compartir como imagen

En el libro, junto a «Guardar», hay un botón discreto «Compartir». Abre un
editor que pone la lectura entera sobre una de las pinturas del museo; si antes
se selecciona un pasaje del libro, el botón pasa a «Compartir selección» y solo
se usa ese pasaje (de la columna donde empezó la selección, sin las glosas). Mientras hay
una selección aparece también, abajo, un botón flotante «Compartir selección»,
también en la lectura sencilla; la selección se conserva aunque un toque la
deshaga en el celular, hasta que se vuelve a tocar el texto o se cambia de
lectura. En
el editor se elige la pintura: una lectura de un paquete abre con las obras
de su paquete (antes las ligadas a esa lectura) y solo «Otra al azar» mezcla
todo el museo; las lecturas de la colección base, sin paquete, abren con
cualquier pintura. Un menú «Paquete» sobre las miniaturas limita la
elección a las pinturas de un paquete (o de la antología original); con un
paquete elegido, «Otra al azar» sortea solo entre ellas.

El encuadre mueve la pintura en tres ejes: horizontal, vertical y acercar (de
1× a 4×). Se ajusta con tres deslizadores o directamente sobre la imagen:
arrastrando, con la rueda del ratón o pellizcando con dos dedos, que acercan
hacia el punto señalado. Con el teclado, las flechas la mueven, + y − acercan
y alejan, y 0 (o un doble clic) la vuelve a centrar. Cada pintura recuerda su
propio encuadre (`katabasis-share-crops-v1`), y como se guarda en proporciones
se conserva al cambiar de formato.

Las demás opciones:

- Formato: cuadrado, vertical, 2:3, historia, horizontal y cabecera (3:1).
- Letra: ocho tipos, tamaño, interlineado, espaciado entre letras, cursiva,
  mayúsculas y comillas.
- Color de la letra: marfil, blanco, oro, rosa, tinta o cualquier otro con el
  selector de color.
- Composición: texto arriba, al centro o abajo; alineado a la izquierda,
  centrado o a la derecha; ancho de la columna; recuadro translúcido detrás
  del texto.
- Marco: filete, doble, esquinas, arco, paspartú o banda.
- Pintura de fondo: tono natural, blanco y negro, sepia, cálido, frío o
  desvaído; velo, viñeta y desenfoque.
- Autor y obra, crédito de la pintura y marca, cada uno opcional.

«Volver al estilo inicial» deshace todas las opciones de estilo. La imagen se guarda en
PNG o se comparte o copia donde el navegador lo permite. El texto se ajusta al
espacio; los versos se mantienen enteros cuando caben y, si un texto largo no
cabe con letra legible, se corta y el editor lo avisa. `app/share.js` y
`app/share.css` contienen el editor; las letras se cargan de Google Fonts al
abrirlo y el estilo elegido se recuerda en el navegador.

## Lectura sencilla y libro abierto

«Seguir leyendo» abre la lectura en su traducción, en una sola columna y con
letra grande. «Abrir el libro» pasa a la edición completa: el original junto a
la traducción, palabra por palabra, las traducciones oficiales, «Guardar» y
«Compartir». Cada vez que se abre una lectura desde la antología empieza en la
lectura sencilla. `app/reader.js` y `app/reader.css` contienen esta vista.

## Nombre y título de cada lectura

`app/reading-titles.json` registra, para cada una de las 278 lecturas, su tipo,
el nombre del texto en la app y su título, en español y en inglés:

| Tipo | Lecturas | Nombre del texto | Título |
| --- | ---: | --- | --- |
| Poema | 110 | el título del poema | el título del poema |
| Texto completo | 17 | su título (cuento, fábula, salmo, poema en prosa) | su título |
| Fragmento | 139 | el título de la app | el libro, la obra o el relato de donde viene |
| Carta | 12 | el título de la app | la carta o el epistolario |

Así, «Ser o no ser» es un fragmento de *Hamlet*, «Dante encuentra a Virgilio»
de *La Divina Comedia* y «Entro en las antiguas cortes» de la *Carta a Francesco
Vettori*. Las imágenes que se comparten firman con el título. Los poemas que
aparecían con un título que no era el suyo lo recuperan: *Proverbios y
cantares, XXIX* (Machado), *El guardador de rebaños, II* (Pessoa), *Odas, I, 11*
(Horacio), *Salmo 117* y, en inglés, *I grow a white rose* (Martí). Los poemas sin
título se nombran por sus primeras palabras, como *¿Qué es poesía?* (Bécquer).
`scripts/validate-reading-titles.cjs` comprueba que ninguna lectura quede sin
registro y que poemas y fragmentos sigan esa regla.

## Cuaderno de lectura

«Guardados» es ahora el **cuaderno de lectura**. Al seleccionar un verso o un
pasaje, en la lectura sencilla o en el libro abierto, aparece «Guardar pasaje»
junto a «Compartir»: el pasaje se guarda con una nota privada opcional. «Guardar»
sigue conservando lecturas y pinturas enteras, y a cada una también se le puede
escribir una nota.

El cuaderno se ve de dos maneras: *Recientes*, por fecha, y *Mi antología*,
agrupado por autor en orden alfabético, con las obras en el orden del catálogo
y las pinturas al final. Cada pasaje puede abrirse en el libro (se señala el
lugar), compartirse como imagen, anotarse de nuevo o quitarse.

Todo se guarda solo en el navegador (`katabasis-notebook-v1` y
`katabasis-favorites-v1` en `localStorage`); nadie más lo ve. «Descargar mi
antología» produce un texto (.txt) con los pasajes, sus obras y las notas, y
«Copia de seguridad» un JSON que «Restaurar una copia» vuelve a cargar en este u
otro dispositivo sin borrar lo que ya hay. `app/notebook.js` y
`app/notebook.css` contienen el cuaderno.

## Primeras líneas

En Aprender, **Primeras líneas** entrega una sola línea de un texto de la
antología. Se escribe antes o después de ella; la línea queda fija en la página,
recuadrada y en negrita, y no se puede borrar ni escribir encima. Al terminar
aparece lo que hizo el autor con esa línea: el comienzo del texto hasta unas
ocho líneas después, con la obra y un enlace para leerla completa.

Se eligen de una a cinco rondas. La ronda *k* usa la línea *k* de un texto
distinto: primera línea, segunda, y así hasta la quinta. Cualquier ronda se
puede saltar para pasar a la siguiente, y al final se puede volver a empezar.
El juego marca las palabras que el jugador comparte con el autor, sin contar
puntos ni las palabras de la línea dada.

Los textos salen de los paquetes activos, en el idioma de la interfaz. Se
descartan las líneas demasiado cortas o largas y los estribillos repetidos, y
se evitan los textos vistos en las últimas rondas. Lo escrito no se envía a
ningún sitio. Tras revelar el texto, un botón permite guardarlo en el cuaderno:
el fragmento del autor queda como pasaje, y lo que escribió el jugador, con la
línea dada en su sitio, como su nota, que aún se puede editar antes de
guardar.
`app/firstlines.js` y `app/firstlines.css` contienen el ejercicio.
