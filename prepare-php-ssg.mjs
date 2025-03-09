import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Browser } from 'happy-dom'

const distPHPSSGPath = join(import.meta.dirname, 'dist-php-ssg')

rmSync(distPHPSSGPath, { recursive: true, force: true, maxRetries: 2 })
cpSync(join(import.meta.dirname, 'dist'), distPHPSSGPath, {
  recursive: true,
})

rmSync(join(distPHPSSGPath, '.vite'), { recursive: true, force: true, maxRetries: 2 })

const indexContent = readFileSync(join(distPHPSSGPath, 'index.html'), 'utf8')

const browser = new Browser()
const page = browser.newPage()

page.url = 'https://example.com'
page.content = indexContent

const document = page.mainFrame.document

Array.from(document.head.children)
  .find((el) => el.tagName === 'title')
  ?.remove()

const contentMeta = {
  html: {
    attrs: attrsToObject(document.documentElement.attributes),
  },
  head: {
    attrs: attrsToObject(document.head.attributes),
    innerHTML: document.head.innerHTML,
  },
  body: {
    attrs: attrsToObject(document.body.attributes),
    innerHTML: document.body.innerHTML,
  },
}

await browser.close()

writeFileSync(join(distPHPSSGPath, 'metadata.json'), `${JSON.stringify(contentMeta)}`)

writeFileSync(
  join(distPHPSSGPath, 'index.php'),
  `<?php
function frs_crossword_get_template_meta($baseURL) {
  $string = file_get_contents(__DIR__ . '/metadata.json');
  $string = str_replace('/frs-path-to-be-replaced-frs/', $baseURL, $string);
  $data = json_decode($string, true);
  $data['head']['innerHTML'] .= '<script>window.__frs_crossword_withBaseURL = (filename) => "' . $baseURL . '" + filename;</script>';
  return $data;
}
?>`,
)
rmSync(join(distPHPSSGPath, 'index.html'))

///

function attrsToObject(attrs) {
  return Object.fromEntries(Array.from(attrs).map((attr) => [attr.name, attr.value]))
}
