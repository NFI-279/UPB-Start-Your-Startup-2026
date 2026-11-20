(() => {
 const byId = id => document.getElementById(id);
 const dialog = byId("leadDialog"), form = byId("leadForm"), feedback = byId("leadFeedback");
 const company = byId("leadCompany"), person = byId("leadName"), email = byId("leadEmail"), message = byId("leadMessage"), attach = byId("leadAttach");
 let opener;
 document.querySelectorAll("[data-contact]").forEach(button => button.addEventListener("click", () => {
   opener=button;
   attach.disabled=!byId("fit-text").value;
   if(attach.disabled)attach.checked=false;
   byId("leadRoute").textContent=byId("contact-hub").textContent+" · "+byId("county").value;
   feedback.textContent="";
   dialog.showModal();
   document.body.classList.add("dialogOpen");
   dialog.scrollTop=0;
   dialog.querySelector(".modalClose").focus({preventScroll:true});
 }));
 function close(){dialog.close()}
 dialog.querySelector(".modalClose").addEventListener("click",close);
 dialog.addEventListener("click", e=>{
   if(e.target!==dialog)return;
   const r=dialog.getBoundingClientRect();
   if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();
 });
 dialog.addEventListener("close",()=>{document.body.classList.remove("dialogOpen");opener?.focus({preventScroll:true})});
 function requestText(full) {
   for(const [field,problem] of [[company,"Completează numele firmei."],[person,"Completează numele de contact."],[email,"Introdu o adresă de e-mail validă."]]){
     if(!field.value.trim()||!field.checkValidity()){feedback.textContent=problem;field.setAttribute("aria-invalid","true");field.focus();return null}
     field.removeAttribute("aria-invalid");
   }
   const lines=["Solicitare de demonstrație UR20",company.value.trim(),person.value.trim()+" · "+email.value.trim(),byId("leadRoute").textContent];
   if(message.value.trim())lines.push("",message.value.trim());
   if(attach.checked&&!attach.disabled){
     const sheet=byId("fit-text").value;
     lines.push("",full?sheet:sheet.split("\n").slice(2,7).join("\n"));
   }
   return lines.join("\n");
 }
 form.addEventListener("input",e=>{e.target.removeAttribute("aria-invalid");feedback.textContent=""});
 form.addEventListener("submit",e=>{
   e.preventDefault();const text=requestText(false);if(!text)return;
   feedback.textContent="Confirmă trimiterea în aplicația de e-mail. Dacă nu se deschide, descarcă cererea.";
   const link=document.createElement("a");
   link.href="mailto:office@tech-con.ro?subject="+encodeURIComponent("Demonstrație UR20 · "+company.value.trim())+"&body="+encodeURIComponent(text);
   link.click();
 });
 byId("leadSave").addEventListener("click",()=>{
   const text=requestText(true);if(!text)return;
   const url=URL.createObjectURL(new Blob(["\uFEFF",text],{type:"text/plain;charset=utf-8"}));
   const link=document.createElement("a");link.href=url;link.download="Cerere-demonstratie-UR20.txt";link.click();
   setTimeout(()=>URL.revokeObjectURL(url),2000);
   feedback.textContent="Cererea este pregătită pentru descărcare. O poți trimite la office@tech-con.ro.";
 });
})();
