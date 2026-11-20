# Demonstrație locală de paletizare UR20

Deschide **index.html** prin dublu clic în Chrome sau Edge. Modelul CAD, biblioteca Three.js r128, textele și termenii de utilizare se află în același fișier. Îl poți copia singur pe alt calculator. Coperta prezintă o coregrafie automată a brațului CAD cu text pe suprafețe 3D. Butonul **Contact** deschide un formular peste aceeași pagină. Poți include pre-evaluarea în cerere, descărca textul complet sau deschide un mesaj în aplicația de e-mail. Trimiterea se confirmă în acea aplicație. Dacă sistemul solicită reducerea mișcării, poți porni manual simulatorul.

## Demonstrație de două minute

1. Derulează la **Testează linia ta.** Scenariul inițial folosește găleți de 13 kg, 44 de găleți pe palet și o intrare de 5 găleți/minut. La ×20 poți urmări depunerile accelerate. Indicatorul de timp arată timpul simulat.
2. Deschide **Produs și organizarea liniei** pentru a modifica disponibilitatea operatorului, ciclul sau durata schimbului. Modificarea unui parametru de simulare pornește calculul de la început. Alege vederea **Celulă**, **Lateral** sau **De sus** din comenzile de lângă scenă.
3. Pentru a vedea rapid alternarea, setează **2 găleți pe palet** și **2 minute** pentru schimb. Urmărește etichetele A și B. Când ambele poziții așteaptă schimbul, transportorul acumulează găleți.
4. Revino la **Exemplu 13 kg**. Deschide **Vezi rezultatul și regulile de punctaj**. Valoarea așteptată este 44 ÷ 5 = **8,8 min/palet**, adică în medie **6,82 intervenții/oră** și **54,55 intervenții într-un schimb de 8 ore**. Schimbarea de 2 minute lasă o marjă de 6,8 minute. Frecvențele sunt medii teoretice la ritmul introdus. Contorul simulatorului raportează depuneri efective din timpul simulat.
5. Alege județul, apoi **Descarcă .txt**. Fișa include scenariul, verdictul, punctele, autonomia, datele lipsă, blocajele și hub-ul propus. Trimiterea cererii de demonstrație se face manual.

## Jurnal de realizare și decizii pentru echipă

| Etapă și rezultat | Fapt | Ipoteză | De verificat | Decizii propuse echipei |
|---|---|---|---|---|
| 1 · Pagină autonomă | Deschisă de pe disc în Chrome cu rețeaua oprită. Aproximativ 2,21 MB. | Un singur fișier simplifică prezentarea pe alt calculator. | Browserul și proiectorul folosite la concurs. | Alegeți calculatorul pentru demo. Stabiliți separat dacă doriți și o versiune publică. |
| 2 · Model și celulă 3D | Opt piese CAD încorporate. Robotul depune găleți pe două poziții, iar schimbul manual poate bloca alimentarea. | Stivuirea, gripperul, dimensiunile recipientelor și ciclul inițial de 7,5 s sunt ilustrative. | Coliziuni, acces, stabilitate și comportament pe echipamente mobile reale. | Alegeți formatul de găleată pentru prezentare. Conveniți cu integratorul ce mostre se testează. |
| 3 · Bucket-Fit și fișă | Scenariul inițial primește 100/100. Schimbul de 2 minute încape în intervalul teoretic de 8,8 minute. | Ponderile, pragul de 17 kg și alocarea județelor sunt convenții de demonstrație. | Sarcina cu unealta montată, timpii reali, amplasarea și responsabilitățile regionale. | Validați regulile cu echipa tehnică. Confirmați rutarea cu echipa comercială. |
| 4 · Autoaudit | Toate cele 580 de ținte de verificare pentru cele două formate sunt în raza modelată. Abaterea maximă calculată la punctul de contact este de circa 0,30 mm. | Verificarea geometrică folosește pivoții și lungimile din prototip. | Traiectorii reale, coliziuni și limite dinamice. | Păstrați distincte rezultatele FAT și valorile simulatorului. Măsurați debitul pe linia clientului. |
| 5 · Predare | Exportul .txt a fost descărcat și citit în testul local. Textul integral al termenilor CAD și licența Three.js sunt incluse în pagină. | Utilizatorul transmite manual fișa către echipa regională. | Canalul comercial și condițiile aplicabile unei publicări ulterioare. | Alegeți destinatarul fișei. Confirmați drepturile de publicare pentru toate materialele de concurs. |

## Eroare identificată și corectată

**Cerința testată** a fost „verificări aritmetice (autonomie, scor), ținte inaccesibile ale robotului”. La prima deschidere în browser, formularul indica un scenariu potrivit, dar simulatorul se oprea la găleata 6 a paletului A. Verificarea rula înainte ca motorul 3D să actualizeze pozițiile paleților în coordonatele scenei. Am actualizat aceste poziții înainte de calcul. La retestarea în Chrome, același scenariu a efectuat cinci depuneri în primul minut de timp simulat.

O verificare separată a găsit patru ținte limitate artificial de rezerva de 10 mm din prototip. Verificarea geometrică folosește acum lungimile nominale ale segmentelor. Am verificat 402 ținte pentru formatul de 5 kg și 178 pentru cel de 13 kg, incluzând țintele de preluare ale fiecărui scenariu. Atingerea unui punct în model nu stabilește o marjă fizică de siguranță.

## Acoperirea verificărilor

- **Chrome pe Windows, cu rețeaua paginii dezactivată**. Încărcare de pe disc, copertă 3D animată, formular Contact în dialog modal, simulator cu trei camere prestabilite, comenzi de cameră, depuneri la ×20, pauză, resetare, selectarea scenariilor, schimbarea județului și exportul .txt. Zero cereri HTTP/HTTPS ale paginii și zero excepții JavaScript observate.
- **Formular**. Greutate negativă, cadență zero și cadență goală afișează erori și suspendă exportul. La 40 kg apare „Nepotrivit”, cu 75/100 în restul condițiilor inițiale. Regula eliminatorie prevalează asupra punctajului.
- **Motor de simulare**. La 5 găleți/min, fiecare format de referință a înregistrat 83 de depuneri în 1.000 s simulate. Au fost verificate alternarea după 44 de depuneri, blocarea unei stive prea înalte, așteptarea când lipsește operatorul și umplerea cozii.
- **Afișare**. Verificare în Chrome la 1.360 × 890 și la lățimea emulată de 390 px, cu preferința de mișcare redusă testată. Gesturile pe telefon fizic, browserele Safari și Firefox, cititoarele de ecran și copierea prin clipboardul sistemului nu au fost verificate.

Sursa datelor PURATOS este studiul de caz „Implementarea unei celule robotice în industria alimentară”, Start Your StartUP 2026, pp. 2–3 și anexa 2. Termenii pentru model sunt disponibili în subsol și în [documentul oficial Universal Robots](https://www.universal-robots.com/legal/terms-and-conditions/terms_and_conditions_for_use_of_graphical_documentation.txt).



## Actualizarea vizuală și formularul Contact

Barlow Condensed pune în evidență titlurile industriale, iar Source Sans 3 păstrează lizibile explicațiile și valorile numerice. Ambele fonturi sunt încorporate cu diacritice românești și licențele lor.

În Chrome pe Windows am verificat pagina deschisă de pe disc, cu accesul la rețea dezactivat. Pe ecranul emulat de 390 px, simulatorul precedă formularul. Nu am găsit texte informative vizibile sub 15 px sau comenzi de simulator sub 44 px. Pentru culorile de text principal, secundar și albastru închis, contrastul calculat față de nuanța metalică de referință #B8CEDC a fost de 8,60:1, 4,50:1 și 5,67:1. Verificarea acoperă această combinație, nu fiecare pixel al reflexiilor.

Testul cu procesor încetinit de patru ori la dimensiune mobilă a înregistrat o mediană de 50 ms între cadrele browserului pe 30 de intervale, cu randare software. Performanța pe telefon fizic rămâne de măsurat. În afara ecranului scenele suspendă animarea. Cu preferința de mișcare redusă activă la încărcare, coperta afișează o imagine a scenei. Cu WebGL indisponibil, ambele scene afișează imagini statice, iar formularul și fișa funcționează.

Într-o primă verificare, imaginea de rezervă se suprapunea peste simulatorul activ. Am limitat afișarea ei la cazul fără WebGL și am retestat ambele situații. Un alt test, cu 500 de găleți de 13 kg pe palet, expunea un verdict negativ cu toate punctele acordate. Criteriul „Palet și stivuire” ține acum cont de raza geometrică. Rezultatul este „Nepotrivit”, 90/100, cu poziția inaccesibilă explicată.

Pentru **Contact**, testul a deschis dialogul pe aceeași pagină, a verificat câmpurile obligatorii, a descărcat o cerere fictivă împreună cu pre-evaluarea, a verificat destinatarul și conținutul mesajului pregătit și a închis dialogul cu Escape. Testul s-a oprit înainte de lansarea aplicației de e-mail. Livrarea efectivă a unui mesaj și primirea unui răspuns nu au fost testate. Pagina oficială a producătorului și copia locală a termenilor CAD au fost reverificate, iar textul a coincis după normalizarea spațiilor.
