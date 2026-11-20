from pathlib import Path
import re,base64
w=Path(__file__).parent
def read(name): return (w/name).read_text(encoding="utf-8-sig")
def write(name,s): (w/name).write_text(s,encoding="utf-8")
s=read("site.html")
hero='''<section id="intro" class="cover" aria-labelledby="coverTitle">
<div class="coverBar"><div class="coverBrand"><span class="brandIcon" aria-hidden="true"><i></i><i></i><i></i></span> TECH-CON <span class="industry">INDUSTRY</span></div><a class="contactGlass" href="#contact">Contact <span aria-hidden="true">↗</span></a></div>
<div class="stageArt"><div class="footShadow"></div><img class="studioRobot" src="data:image/webp;base64,IMAGE" alt="Brațul robotizat Universal Robots UR20 din modelul CAD" draggable="false"></div>
<h1 id="coverTitle">Techcon</h1>
<div class="coverBaseline"><div><span class="modelLine">UNIVERSAL ROBOTS / UR20</span><p>Paletizarea găleților</p></div><div class="scrollCue" aria-hidden="true">Simulator <span>↓</span></div></div></section>'''.replace("IMAGE",base64.b64encode((w/"hero.webp").read_bytes()).decode())
s=re.sub(r'<header>.*?(?=<main>)',lambda _:hero+'\n',s,flags=re.S)
s=s.replace('<div class="heading"><span class="eyebrow"><em></em> SIMULARE INTERACTIVĂ</span><h2>Testează linia ta.</h2><p>Modifică datele de producție și urmărește alimentarea, depunerea și schimbul celor doi paleți.</p></div>','<div class="simHeading"><div class="heading"><span class="eyebrow"><em></em> SIMULATOR UR20</span><h2>Testează linia ta.</h2><p>Introdu cadența și formatul găleților. Urmărește cum se umplu cei doi paleți și când trebuie să intervină operatorul.</p></div><button id="theme" title="Schimbă tema simulatorului" aria-label="Schimbă tema simulatorului">◐ Temă</button></div>')
s=s.replace('Datele aplicației PURATOS provin din materialul de concurs furnizat.', 'Sursa datelor PURATOS este studiul de caz „Implementarea unei celule robotice în industria alimentară”, Start Your StartUP 2026, pp. 2–3 și anexa 2.')
write('site.html',s)
s=read('scene.js')
start=s.index('const preview=sc.clone(true)')
end=s.index('const defaultValues=',start)
s=s[:start]+'''const up=angles(PX,HC+.49,0);
const simView=makeView(cv,sc,new THREE.Vector3(.62,.67,0),[.45,.95,5.55]);
'''+s[end:]
s=s.replace('endIntro();running=false','running=false')
s=s[:s.index(' if(heroView.visible')]+s[s.index(' if(simView.visible && valid'):]
s=s.replace('heroFrame(heroTime);draw(heroView);','').replace('if(reduced.matches)skip.hidden=true;','')
write('scene.js',s)
s=read('form.html').replace('<div><h3>Pregătirea demonstrației</h3>', '<div id="contact"><h3>Contact pentru demonstrație</h3>')
if 'id="contact"' not in s:s=s.replace('<h3>Pregătirea demonstrației</h3>','<h3 id="contact" tabindex="-1">Contact pentru demonstrație</h3>')
write('form.html',s)
