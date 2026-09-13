# Katabasis

Una antología para descubrir literatura de dominio público: una lectura por
pantalla, originales con traducciones de lectura en español e inglés, favoritos,
paquetes opcionales, mapa de obras y autores, y una obra de arte después de cada
cinco lecturas nuevas.

La edición actual contiene **151 lecturas y 75 imágenes**: el MVP de 51 lecturas
más 23 paquetes opcionales. Incluye República de las Letras y Englyn de Gales.
Los paquetes se activan en la aplicación; las preferencias y los favoritos se
guardan en el navegador utilizado.

## Abrir la página

Descarga este repositorio como ZIP, extráelo y abre `dist/index.html`. Conserva
la carpeta `dist/art` junto al HTML para que se vean todas las pinturas.
La carpeta `dist` también está lista para un alojamiento estático.

## Generar un solo HTML para compartir

Con Python 3, desde la carpeta del proyecto:

```sh
python build.py
```

El resultado, `dist/index.html`, contiene textos, estilos, lógica, fuente e
imágenes. Puedes enviarlo como un único archivo y abrirlo sin conexión. Los
vínculos a fuentes y lecturas litúrgicas externas sí requieren internet.

## Generar la versión para alojamiento

```sh
python build.py --web
```

Genera `dist/index.html` con imágenes relativas en `dist/art`. Las pinturas
conservan los mismos bytes que la versión independiente. Separarlas permite
seguir añadiendo paquetes sin superar el límite de tamaño de un archivo del
alojamiento y sin reducir su calidad.

## Contenido y fuentes

- `corpus.py` y `texts/`: MVP y ampliaciones editoriales.
- `packages/`: lecturas, originales, generadores y manifiestos de paquetes.
- `assets/paintings/` y `assets/package-art/`: imágenes y sus atribuciones.
- `template.html`, `app.js` y archivos asociados: interfaz.
- `packages/README.md`: decisiones de selección, edición y traducción.

Los textos se identifican como obras completas o fragmentos. El límite editorial
es de 1.900 palabras traducidas por lectura, incluyendo los enlaces narrativos
de los misterios. Cada ficha conserva la fuente, edición y nota de derechos.
Las traducciones nuevas generadas por IA se identifican como traducciones de
lectura; las versiones galesas buscan transmitir sentido e imágenes y no
prometen reproducir la métrica o la musicalidad original.

Los metadatos de cada ilustración especifican los derechos de la reproducción
consultada. Este repositorio no asigna una licencia única a todos los materiales.
