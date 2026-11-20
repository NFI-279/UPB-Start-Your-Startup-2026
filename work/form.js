(() => {
  const byId = id => document.getElementById(id);
  const number = new Intl.NumberFormat('ro-RO', {maximumFractionDigits: 2});
  const fmt = value => value !== 0 && Math.abs(value) < .01 ? '< 0,01' : number.format(value);
  const routes = {
    'Dragomirești-Deal': 'Argeș,Brașov,Brăila,București,Buzău,Călărași,Constanța,Covasna,Dâmbovița,Dolj,Giurgiu,Gorj,Ialomița,Ilfov,Olt,Prahova,Teleorman,Tulcea,Vâlcea',
    'Iași': 'Bacău,Botoșani,Galați,Harghita,Iași,Neamț,Suceava,Vaslui,Vrancea',
    'Timișoara': 'Alba,Arad,Bihor,Bistrița-Năsăud,Caraș-Severin,Cluj,Hunedoara,Maramureș,Mehedinți,Mureș,Satu Mare,Sălaj,Sibiu,Timiș'
  };
  const mapping = Object.entries(routes).flatMap(([hub, counties]) => counties.split(',').map(county => [county,hub]));
  const hubs = Object.fromEntries(mapping);
  Object.keys(hubs).sort((a,b) => a.localeCompare(b,'ro')).forEach(county => byId('county').add(new Option(county,county)));
  byId('county').value = 'Ilfov';
  byId('fit-map').innerHTML = Object.entries(routes).map(([hub, counties]) => '<p><b>'+hub+'</b><br>'+counties.replaceAll(',',', ')+'</p>').join('');
  const limits = {
    kg: ['Greutatea',.01,60,'kg'], cap:['Numărul de găleți pe palet',1,500,'găleți'], rate:['Cadența',.01,200,'găleți/min'],
    chg:['Durata schimbării paletului',0,60,'min'], hours:['Durata schimbului',.1,24,'ore'], cyc:['Ciclul ilustrativ',3,30,'s/găleată']
  };
  for (const [id,[,min,max]] of Object.entries(limits)) {
    byId(id).min = min;
    byId(id).max = max;
  }
  const selects = ['mat','han','pal','spc','operator','sh'];
  const selected = id => byId(id).selectedOptions[0].textContent;
  const list = rows => rows.map(row => '<li>'+row+'</li>').join('');
  let lastSim = '', exportText = '';
  function read() {
    const values = {}, errors = [];
    for (const [id,[label,min,max,unit]] of Object.entries(limits)) {
      const field = byId(id), v = field.valueAsNumber;
      const invalid = !Number.isFinite(v) || v < min || v > max || (id==='cap' && !Number.isInteger(v));
      field.setAttribute('aria-invalid', String(invalid));
      if (invalid) {
        errors.push(label+' trebuie să fie '+(id==='cap'?'un număr întreg ':'')+'între '+fmt(min)+' și '+fmt(max)+' '+unit+'.');
        if (field.closest('details')) field.closest('details').open = true;
      }
      values[id] = v;
    }
    for (const id of selects) values[id] = byId(id).value;
    values.cycle = values.cyc;
    return {values, errors};
  }

  function criteria(v) {
    const period = v.cap/v.rate;
    return [
      ['Greutate',25, v.kg===5 || v.kg===13 ? 25 : v.kg<=17 ? 12 : 0,
        '5 sau 13 kg primesc 25 p. Altă greutate până la 17 kg primește 12 p. Peste 17 kg se acordă 0 p. Pragul presupune 20 kg sarcină totală și 3 kg unealtă, ambele de verificat.'],
      ['Material',10,v.mat==='p'?10:0,'Plasticul primește 10 p. Alt material cere probe și primește 0 p.'],
      ['Mâner',10,v.han==='y'?10:0,'Mânerul mobil în arc primește 10 p. Celelalte variante primesc 0 p. Orientarea trebuie confirmată pe mostre.'],
      ['Cadență',20,v.rate<=60/v.cyc?20:0,'Se acordă 20 p. dacă ritmul cerut încape în ciclul ilustrativ (60 ÷ secunde/găleată), altfel 0 p.'],
      ['Palet și stivuire',10,v.pal==='e' && !window.scenarioReachWarning?10:0,'Europaletul primește 10 p. când toate pozițiile încap în raza modelată. Alt format sau o stivă inaccesibilă primește 0 p.'],
      ['Spațiu și acces',10,v.spc==='s'?10:0,'Spațiul declarat suficient primește 10 p. Spațiul limitat sau necunoscut primește 0 p.'],
      ['Operator',10,v.operator==='available'?10:0,'Disponibilitatea declarată primește 10 p. Lipsa sau disponibilitatea neconfirmată primește 0 p.'],
      ['Schimb palet',5,v.chg<=period?5:0,'Se acordă 5 p. dacă durata schimbării încape în timpul de umplere al celeilalte poziții, altfel 0 p.']
    ];
  }
  function checklist(v,period) {
    const missing = ['Testează mostre de '+fmt(v.kg)+' kg cu gripperul pneumatic și camera SICK 2D.',
      'Confirmă evaluarea riscurilor, cerințele de igienă și procedura de acces.'];
    if (v.kg>17) missing.push('Verifică sarcina combinată, centrul de greutate și limitele ansamblului cu integratorul.');
    if (v.han!=='y' || v.mat!=='p') missing.push('Documentează forma mânerului, suprafața de prindere și deformarea recipientului.');
    if (v.spc!=='s' || v.pal!=='e') missing.push('Trimite planul cotat al zonei, dimensiunile paletului și schema de stivuire.');
    if (v.operator!=='available') missing.push('Stabilește cine schimbă paleții și așază separatoarele.');
    const blocks = ['Măsoară timpii reali de umplere și spațierea la intrarea pe transportor.',
      'Verifică evacuarea paletului către înfoliere și logistică, operații din afara celulei.'];
    if (v.rate>60/v.cyc) blocks.push('Cadența cerută depășește ritmul ciclului ilustrativ. Coada de alimentare poate crește.');
    if (v.chg>period) blocks.push('Schimbarea paletului depășește fereastra disponibilă cu '+fmt(v.chg-period)+' min.');
    if (+v.sh>1) blocks.push('Confirmă acoperirea intervențiilor în toate cele '+v.sh+' schimburi declarate.');
    return {missing,blocks};
  }
  function autonomy(v) {
    const period = v.cap/v.rate, hourly = 60/period, perShift = hourly*v.hours, end = Math.max(2*period,period+v.chg);
    const fit = v.chg<=period ? 'Schimbul încape în fereastra celeilalte poziții. Marjă de '+fmt(period-v.chg)+' min.' :
      'Schimbul depășește fereastra cu '+fmt(v.chg-period)+' min. La ritmul cerut apare așteptare.';
    const assumptions = 'Necesar mediu la cadența introdusă, cu un schimb manual și separatoarele grupate într-o intervenție pe palet. Graficul presupune operator disponibil și alimentare continuă.';
    const bar = (start,length,cls) => '<i class="'+cls+'" style="left:'+100*start/end+'%;width:'+100*length/end+'%"></i>';
    byId('fit-autonomy').innerHTML = '<div class="fit-metrics"><div><strong>'+fmt(period)+'</strong><small>min/palet</small></div><div><strong>'+fmt(hourly)+'</strong><small>intervenții/oră</small></div><div><strong>'+fmt(perShift)+'</strong><small>intervenții/'+fmt(v.hours)+' h</small></div></div>'+
      '<p>'+fit+'</p><div class="fit-axis" aria-hidden="true"><b>A</b><div class="fit-track">'+bar(0,period,'fit-fill')+bar(period,v.chg,'fit-service')+'</div><b>B</b><div class="fit-track">'+bar(period,period,'fit-fill')+'</div></div>'+
      '<p class="fit-muted">A se umple între 0 și '+fmt(period)+' min, apoi intră la schimb până la '+fmt(period+v.chg)+' min (hașurat). B se umple între '+fmt(period)+' și '+fmt(2*period)+' min.</p><p class="fit-muted">'+assumptions+'</p>';
    return {period,summary:'Interval între intervenții: '+fmt(period)+' min. Necesar mediu: '+fmt(hourly)+'/oră și '+fmt(perShift)+'/schimb de '+fmt(v.hours)+' h. '+fit+' '+assumptions};
  }
  function update(force=false) {
    const {values:v,errors} = read();
    const simKey = errors.length?'invalid':JSON.stringify([v.kg,v.cap,v.rate,v.chg,v.cyc,v.operator]);
    const county = byId('county').value, hub = hubs[county];
    byId('fit-hub').textContent = county+' → '+hub+' · rutare de verificat';
    byId('contact-hub').textContent = hub;
    byId('contact-county').textContent = county+' · rutare de verificat';
    byId('fit-errors').innerHTML = list(errors);
    const state = byId('fit-state');
    const on = !errors.length;
    state.dataset.level = 'review';
    if ((force || simKey!==lastSim) && typeof window.updateScenario==='function') {
      lastSim = simKey;
      window.updateScenario(on?v:null);
    }
    exportText = '';
    if (on) {
      const rows = criteria(v), score = rows.reduce((sum,row) => sum+row[2],0);
      if (window.scenarioReachWarning) rows.push(["Rază geometrică", 0, 0, window.scenarioReachWarning+" Blocaj independent de punctaj."]);
      const stop = !!window.scenarioReachWarning || v.kg>17 || v.operator==='none';
      const status = stop?'Nepotrivit':score===100?'Potrivit':'Necesită validare tehnică';
      byId('fit-verdict').innerHTML = status+' · <strong>'+score+' / 100</strong>';
      state.dataset.level = stop?'stop':score===100?'good':'review';
      state.innerHTML = '<span>'+status+' <small>Evaluare preliminară</small></span><strong>'+score+' / 100</strong>';
      byId('fit-rules').innerHTML = '<table class="fit-gridtbl"><thead><tr><th>Criteriu și regulă</th><th>Puncte / pondere</th></tr></thead><tbody>'+rows.map(([name,weight,points,desc])=>'<tr><td><b>'+name+'</b><span>'+desc+'</span></td><td>'+points+' / '+weight+'</td></tr>').join('')+'</tbody></table>';
      const {period,summary} = autonomy(v), {missing,blocks} = checklist(v,period);
      if (window.scenarioReachWarning) blocks.push(window.scenarioReachWarning);
      byId('fit-missing').innerHTML = list(missing);
      byId('fit-blocks').innerHTML = list(blocks);
      exportText = ['Fișă tehnică pentru demonstrație · Tech-Con Industry','Scenariu fictiv | UR20 Bucket-Fit',
        'Verdict preliminar: '+status+' ('+score+'/100).',
        'Produs: '+fmt(v.kg)+' kg, '+selected('mat')+', mâner: '+selected('han')+'.',
        'Linie: '+fmt(v.rate)+' găleți/min, '+fmt(v.cyc)+' s/găleată (ciclu ilustrativ).',
        'Palet: '+selected('pal')+', '+v.cap+' găleți. Schimbare: '+fmt(v.chg)+' min.',
        'Organizare: '+v.sh+' schimburi/zi × '+fmt(v.hours)+' h. Acces: '+selected('spc')+'. Operator: '+selected('operator')+'.',
        '',summary,'','Punctaj pe criterii',...rows.map(([name,weight,points])=>name+' — '+points+'/'+weight),
        '','Date lipsă',...missing.map(x=>'• '+x),'','Blocaje amonte și aval',...blocks.map(x=>'• '+x),'',
        'Județ: '+county+'. Hub propus: '+hub+' (rutare de verificat).',
        'Viteza robotului nu este debitul fabricii. Scorul și ciclul sunt ilustrative. Compatibilitatea se confirmă prin probe.',
        'Solicitare: demonstrație tehnică pe mostre și verificarea condițiilor din fabrică.'].join('\n');
    } else {
      byId('fit-verdict').textContent = 'Evaluare în așteptare. Corectează câmpurile marcate în formular.';
      state.textContent = 'Completează sau corectează datele marcate.';
      byId('fit-autonomy').textContent = 'Calculul se actualizează după corectarea câmpurilor.';
      byId('fit-rules').textContent = 'Punctajul este disponibil pentru un scenariu valid.';
      byId('fit-missing').innerHTML = list(errors);
      byId('fit-blocks').innerHTML = list(['Completează scenariul pentru analiza fluxului.']);
    }
    byId('fit-text').value = exportText || 'Completează formularul pentru a pregăti rezumatul.';
    byId('fit-copy').disabled = byId('fit-download').disabled = byId('contact-copy').disabled = !on;
    byId('contact-feedback').textContent='Date fictive. Cererea se transmite manual.';
    byId('fit-feedback').textContent = 'Export local cu date fictive. Trimiterea se face manual.';

  }
  byId('fit-form').addEventListener('submit',e=>e.preventDefault());
  byId('fit-form').addEventListener('input',()=>update());
  byId('county').addEventListener('change',()=>update());
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
    byId('fit-form').reset();
    if (button.dataset.preset==='small') { byId('kg').value=5; byId('cap').value=100; }
    update();
  }));
  async function copySheet(feedback) {
    try {
      await navigator.clipboard.writeText(exportText);
      feedback.textContent='Fișa a fost copiată.';
    } catch {
      byId('fit-text').focus();
      byId('fit-text').select();
      let copied=false;
      try {copied=document.execCommand('copy');} catch {}
      feedback.textContent=copied?'Fișa a fost copiată.':'Textul este selectat. Folosește comanda Copiere a dispozitivului.';
    }
  }
  byId('fit-copy').addEventListener('click',()=>copySheet(byId('fit-feedback')));
  byId('contact-copy').addEventListener('click',()=>copySheet(byId('contact-feedback')));
  byId('fit-download').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob(['\uFEFF',exportText],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='Fisa-tehnica-UR20.txt';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000);
    byId('fit-feedback').textContent='Fișa .txt a fost pregătită pentru descărcare.';
  });
  window.refreshFit=()=>update(true);
  update();
})();


