from pathlib import Path
import re, json, html, struct, base64
from zipfile import ZipFile
work = Path(__file__).resolve().parent
def read(name): return (work/name).read_text(encoding="utf-8-sig")
with ZipFile(work.parent/"inputs"/"UR20-offline.zip") as source:
    original=source.read("Pre-evaluare paletizare UR20.html").decode("utf-8-sig")
assembly = original[original.index("const PARTS="):original.index("/* ---------- evaluare")]
assembly = assembly.replace("L1+L2-.01","L1+L2")
match = re.search(r"const PARTS=(\[.*?\]);", assembly, re.S)
compact = []
for part in json.loads(match[1]):
    n = part["n"]
    raw = base64.b64decode(part["b"])
    assert len(raw) >= 9*n  # The supplied renderer reads positions and normals from the first nine bytes per vertex.
    unique = {}
    indices = bytearray()
    for i in range(n):
        vertex = raw[6*i:6*i+6] + raw[6*n+3*i:6*n+3*i+3]
        index = unique.setdefault(vertex,len(unique))
        indices.extend(struct.pack("<H",index))
    packed = b"".join(unique) + indices
    compact.append([n,len(unique),base64.b64encode(packed).decode()])
decoder = """
// Expand the indexed archive to the layout used by the original CAD loader.
function unpackPart([n, count, encoded]) {
  const src = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const raw = new Uint8Array(9*n);
  for (let i=0, j=count*9; i<n; i++, j+=2) {
    const offset=(src[j] + 256*src[j+1])*9;
    raw.set(src.subarray(offset,offset+6),i*6);
    raw.set(src.subarray(offset+6,offset+9),n*6+i*3);
  }
  return {n,bytes:raw};
}
"""
assembly = decoder + assembly.replace(match[0],"const PARTS="+json.dumps(compact,separators=(',',':'))+".map(unpackPart);")
def uri(name,fmt):
    return "data:image/"+fmt+";base64,"+base64.b64encode((work/name).read_bytes()).decode()
form,report=read("form.html").split("<!--REPORT-->")
report,contact=report.split("<!--CONTACT-->")
font_css=read("fonts.css") if (work/"fonts.css").exists() else ""
css=font_css+read("site.css").replace("NOISE",uri("grain.png","png"))
page=read("site.html").replace("/*STYLE*/",css).replace("<!--FORM-->",form).replace("<!--REPORT-->",report).replace("<!--CONTACT-->",contact)
page=page.replace("SIMPOSTER",uri("still-cell.webp","webp")).replace("SMALLSTILL",uri("still-mobile.webp","webp")).replace("BIGSTILL",uri("still-desktop.webp","webp"))
page=page.replace("<!--FONTS-->",html.escape(read("font-licenses.txt")) if (work/"font-licenses.txt").exists() else "")
page=page.replace("<!--TERMS-->",html.escape(read("ur-terms.txt"))).replace("<!--MIT-->",html.escape(read("three-license.txt")))
scene=read("scene.js") if (work/"scene.js").exists() else ""
scene=scene.replace("const defaultValues=",read("hero-live.js")+"\nconst defaultValues=")
scene=scene.replace("const bin=atob(p.b),u=new Uint8Array(bin.length);for(let k=0;k<u.length;k++)u[k]=bin.charCodeAt(k);","const u=p.bytes;")
# Let the document and its static cover paint before allocating the model.
page=page.replace("<!--LEAD-->",read("lead.html"))
scripts=[read("three.min.js"),read("lead.js"),read("form.js"),"requestAnimationFrame(()=>setTimeout(()=>{\n"+assembly+"\n"+scene+"\n},0));"]
page=page.replace("<!--SCRIPTS-->","\n".join("<script>\n"+s+"\n</script>" for s in scripts))
(work.parent/"outputs"/"index.html").write_text(page,encoding="utf-8")
(work.parent/"index.html").write_bytes((work.parent/"outputs"/"index.html").read_bytes())
print("HTML bytes:", len(page.encode()), "CAD parts:", len(compact))



