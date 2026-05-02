import { DATA } from './site-data.js';

const app = document.querySelector('#app');
const categoryList = document.querySelector('#category-list');

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  return trimmed;
}

function makeUrls(rule, id) {
  const inject = (tpl) => tpl.replaceAll('{{id}}', id);
  return {
    cover: inject(rule.cover),
    display: inject(rule.display || rule.raw),
    raw: inject(rule.raw),
    download: rule.download,
  };
}

function buildImages(category) {
  return category.items
    .map(parseLine)
    .filter(Boolean)
    .map((line, index) => {
      const [id, alias] = line.split('.');
      const rule = DATA.providers.find((p) => p.name === alias);
      if (!rule) return null;
      return { id, alias, index, ...makeUrls(rule, id) };
    })
    .filter(Boolean);
}

function renderSidebar() {
  categoryList.innerHTML = DATA.categories
    .map((c) => `<li><a href="#/category/${c.slug}">${c.title}</a></li>`)
    .join('');
}

function renderHome() {
  app.innerHTML = `
    <h2>分类</h2>
    <div class="grid">
      ${DATA.categories
        .map(
          (c) => `
          <a class="card" href="#/category/${c.slug}">
            <div class="meta"><strong>${c.title}</strong><span class="muted">${c.items.length} 张</span></div>
          </a>`
        )
        .join('')}
    </div>
  `;
}

function renderCategory(slug) {
  const category = DATA.categories.find((c) => c.slug === slug);
  if (!category) {
    app.innerHTML = '<div class="empty">分类不存在</div>';
    return;
  }

  const images = buildImages(category);
  app.innerHTML = `
    <h2>${category.title}</h2>
    ${category.readme ? `<p class="muted">${category.readme}</p>` : ''}
    <div class="grid">
      ${images
        .map(
          (img) => `
          <article class="card">
            <a href="#/category/${slug}/image/${img.index}">
              <img src="${img.cover}" alt="${img.id}" loading="lazy" />
            </a>
            <div class="meta"><span>${img.alias}</span><span>${img.id}</span></div>
          </article>
        `
        )
        .join('')}
    </div>
  `;
}

function downloadViaBlob(url, filename) {
  fetch(url)
    .then((resp) => resp.blob())
    .then((blob) => {
      const a = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    });
}

function renderImage(slug, indexText) {
  const category = DATA.categories.find((c) => c.slug === slug);
  if (!category) {
    app.innerHTML = '<div class="empty">分类不存在</div>';
    return;
  }

  const images = buildImages(category);
  const index = Number(indexText);
  const image = images[index];
  if (!image) {
    app.innerHTML = '<div class="empty">图片不存在</div>';
    return;
  }

  app.innerHTML = `
    <p><a href="#/category/${slug}">← 返回分类</a></p>
    <h2>${category.title} / ${image.id}</h2>
    <img class="preview" src="${image.display}" alt="${image.id}" />
    <p class="muted">来源代称：${image.alias}</p>
    <p>
      <a class="btn" href="${image.raw}" target="_blank" rel="noreferrer">打开原图</a>
      <button class="btn" id="download-btn">下载</button>
    </p>
  `;

  const btn = document.querySelector('#download-btn');
  btn?.addEventListener('click', () => {
    if (image.download === 'js') {
      downloadViaBlob(image.raw, `${image.id}.jpg`);
    } else {
      window.open(image.raw, '_blank', 'noreferrer');
    }
  });
}

function router() {
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/').filter(Boolean);

  if (parts.length === 0) return renderHome();
  if (parts[0] === 'category' && parts.length === 2) return renderCategory(parts[1]);
  if (parts[0] === 'category' && parts[2] === 'image' && parts[3]) return renderImage(parts[1], parts[3]);

  app.innerHTML = '<div class="empty">页面不存在</div>';
}

window.addEventListener('hashchange', router);
renderSidebar();
router();
