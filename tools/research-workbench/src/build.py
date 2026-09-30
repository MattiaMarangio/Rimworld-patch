# Rebuilds research-workbench.html from the page, the script and the tree data.
import os
here = os.path.dirname(os.path.abspath(__file__))
read = lambda f: open(os.path.join(here, f), encoding='utf-8').read()
data = read('tree.json')
assert '</script' not in data
page = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n'
        + read('page.html') + '<script>\n' + read('workbench.js') + '</script>\n</body></html>\n')
open(os.path.join(here, '..', 'research-workbench.html'), 'w', encoding='utf-8').write(page.replace('__DATA__', data))
print('built research-workbench.html')
