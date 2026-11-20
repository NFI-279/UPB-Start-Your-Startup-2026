# Paletizare cu UR20 · Tech-Con Industry

Prototip pentru Start Your StartUP 2026. Descarcă și deschide **index.html** în browser. Modelul CAD, fonturile și biblioteca Three.js r128 sunt încorporate în pagină. Simulatorul, pre-evaluarea și exportul funcționează offline.

- [Pagina autonomă](index.html)
- [Ghidul și verificările](outputs/Ghid-si-verificari.md)
- [Surse editabile, resurse vizuale și scripturi de verificare](work/)
- [Materialele de intrare și pachetul cu modelul STEP, prototipul inițial, pagina finală și termenii CAD](inputs/)

## Reconstruire

Din rădăcina proiectului, rulează `python work/build.py` cu Python 3. Scriptul citește prototipul din arhiva inclusă și regenerează pagina la rădăcină și în `outputs/`. Pentru verificarea țintelor cinematice rulează `node work/ik-test.js`. Pentru testul separat al alternării paleților extrage `inputs/UR20-offline.zip` în `inputs/extracted/`, apoi rulează `node work/scene-test.cjs`. Scripturile pentru capturi folosesc Chrome pe Windows. Dosarul de lucru include și schițe și capturi din etapele anterioare.

## Model și licențe

© 2023 Universal Robots A/S. Use hereof is subject to Universal Robots A/S’ Terms and Conditions for Use of Graphical Documentation. [Termenii CAD](work/ur-terms.txt), [licența Three.js](work/three-license.txt) și [licențele fonturilor](work/font-licenses.txt) sunt incluse.
