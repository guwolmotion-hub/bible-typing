from pathlib import Path
import base64

root = Path(__file__).resolve().parents[1]
html = (root/'index.html').read_text(encoding='utf-8-sig')
css = (root/'style.css').read_text(encoding='utf-8-sig')
core = (root/'core.mjs').read_text(encoding='utf-8-sig').replace('export function', 'function')
app = (root/'app.js').read_text(encoding='utf-8-sig').split('\n', 1)[1]
data = (root/'passages.json').read_text(encoding='utf-8-sig')
app = app.replace("await fetch('./passages.json')", '({ok:true,json:async()=>('+data+')})')
html = html.replace('<link rel="stylesheet" href="./style.css">', '<style>'+css+'</style>')
html = html.replace('<script type="module" src="./app.js"></script>', '<script type="module">'+core+'\n'+app+'</script>')
html = html.replace('href="./NOTICE.md"', 'href="https://github.com/guwolmotion-hub/bible-typing/blob/main/NOTICE.md"')
icon = base64.b64encode((root/'favicon.svg').read_bytes()).decode('ascii')
html = html.replace('href="./favicon.svg"', f'href="data:image/svg+xml;base64,{icon}"')
output = root.parent/'bible-typing-preview.html'
output.write_text(html, encoding='utf-8')
print(output)
