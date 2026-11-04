import json, re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
rows = [json.loads(line) for line in (root/'tools/source.jsonl').read_text(encoding='utf-8-sig').splitlines()]
lookup = {(r['code'], r['chapter'], r['verse']):r for r in rows}
shorts = [('PSA',23,1),('PSA',119,105),('PRO',16,9),('MAT',11,28),('PHP',4,13),('1TH',5,16),('1TH',5,17),('1TH',5,18),('JHN',3,16),('PSA',46,1),('PSA',121,2),('PRO',3,5),('PRO',3,6),('MAT',5,9),('MAT',6,33),('MAT',7,7),('JHN',14,6),('1CO',13,13),('ISA',41,10),('JOS',1,9),('PSA',37,5),('PSA',56,3),('PSA',100,4),('PRO',4,23),('PRO',17,22),('MAT',5,14),('MAT',5,16),('ROM',12,12),('PHP',4,4),('GEN',1,1)]
longs = [('PSA',23,1,6,'나의 목자'),('PSA',121,1,8,'나의 도움이 어디서 올꼬'),('PSA',1,1,6,'복 있는 사람'),('PSA',139,1,6,'나를 아시는 하나님'),('PRO',3,1,8,'마음을 다하여'),('PRO',16,1,9,'걸음을 인도하시는 이'),('MAT',5,3,12,'팔복'),('MAT',6,25,34,'내일 일을 염려하지 말라'),('MAT',7,7,12,'구하라 찾으라 두드리라'),('1CO',13,1,13,'사랑은 오래 참고'),('PHP',4,4,9,'아무것도 염려하지 말고'),('JHN',15,1,8,'참 포도나무')]
def clean(t):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', t)).strip()
def item(code,c,start,end,title=''):
    rs=[lookup[(code,c,v)] for v in range(start,end+1)]
    return {'id':f'{code}-{c}-{start}-{end}','book':rs[0]['name_kr'],'ref':f"{rs[0]['name_kr']} {c}:{start}"+(f'–{end}' if end!=start else ''),'title':title,'text':' '.join(clean(r['text']) for r in rs),'verses':len(rs)}
data={'short': [item(a,b,c,c) for a,b,c in shorts], 'long':[item(*r) for r in longs]}
(root/'passages.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print({k:len(v) for k,v in data.items()})
