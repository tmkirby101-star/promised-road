"""Extract cited public-domain WEB passages from an upstream USFX XML snapshot.
Usage: python scripts/extract-arcade-scripture.py /path/to/eng-web.usfx.xml
Source: https://github.com/seven1m/open-bibles/blob/master/eng-web.usfx.xml
Only referenced verses ship; no runtime Scripture API is needed.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import re, json, sys
root=Path(__file__).resolve().parents[1]
books={}; verses={}
for b in ET.parse(sys.argv[1]).getroot().findall('book'):
    toc=b.find("toc[@level='2']")
    if toc is None: continue
    name=''.join(toc.itertext()).strip();books[name]=b.attrib['id']
    state={'c':None,'v':None}
    def text(t):
        if t and state['v'] is not None:
            
            for n in state['v']:
                key=(name,state['c'],n);verses[key]=verses.get(key,'')+t
    def walk(el):
        tag=el.tag
        if tag in ('f','x','s','ms','id','h','toc','ide'): return
        if tag=='c': state['c']=int(el.attrib['id']);state['v']=None
        elif tag=='v':
            nums=el.attrib['id'].split('-');state['v']=range(int(nums[0]),int(nums[-1])+1)
        elif tag=='ve':state['v']=None
        text(el.text)
        for child in el:
            walk(child);text(child.tail)
    walk(b)
refs=sorted(set(re.findall(r"ref: '([^']+)'",(root/'src/content/arcadeTrivia.ts').read_text())))
result={}
for ref in refs:
    m=re.fullmatch(r'(.+?) (\d+):(\d+)(?:[–-](\d+))?',re.sub(r' \(WEB\)$','',ref))
    if not m: continue
    name,c,v,end=m.groups();name={'Psalm':'Psalms','Song of Solomon':'Song of Solomon'}.get(name,name)
    if name not in books: raise ValueError((name,list(books)))
    parts=[]
    for n in range(int(v),int(end or v)+1):
        t=verses.get((name,int(c),n))
        if not t: raise ValueError((ref,n))
        parts.append(re.sub(r'\s+',' ',t).strip())
    result[ref]=' '.join(parts)
(root/'src/content/arcadeScripture.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f'Extracted {len(result)} cited WEB passages')
