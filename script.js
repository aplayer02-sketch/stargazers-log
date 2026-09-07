const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');

// Guard DOM elements early
if (!repositoryList || !repositoryCount) {
  console.error('Required DOM elements (#repository-list or #repository-count) not found. Aborting render.');
}

const formatStars = (stars) => {
  const n = Number(stars) || 0;
  if (n < 1000) return String(n);
  // Show one decimal for thousands when not an exact multiple of 1000 (e.g., 1.5k), otherwise show "1k"
  if (n < 10000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${Math.round(n / 1000)}k`;
};

const formatDateSafe = (date) => {
  try {
    if (!date) return 'Unknown';
    const d = new Date(`${date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return 'Unknown';
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch (e) {
    console.warn('formatDateSafe failed for', date, e);
    return 'Unknown';
  }
};

const safeText = (v) => (v == null ? '' : String(v));

const clearChildren = (node) => {
  while (node && node.firstChild) node.removeChild(node.firstChild);
};

const showError = (err) => {
  if (repositoryCount) repositoryCount.textContent = '';
  if (!repositoryList) return;
  clearChildren(repositoryList);
  const p = document.createElement('p');
  p.className = 'status-message error-message';
  p.textContent = 'The repository list could not be loaded. Try refreshing the page.';
  repositoryList.appendChild(p);
  if (err) console.error(err);
};

const renderRepositories = (repositories) => {
  if (!repositoryList || !repositoryCount) return;
  repositoryCount.textContent = `${(repositories && repositories.length) || 0} saved`;

  // Clear previous
  clearChildren(repositoryList);

  if (!Array.isArray(repositories) || repositories.length === 0) {
    const p = document.createElement('p');
    p.className = 'status-message';
    p.textContent = 'No repositories saved.';
    repositoryList.appendChild(p);
    return;
  }

  repositories.forEach((repository, index) => {
    const article = document.createElement('article');
    article.className = 'repository-card';
    article.style.setProperty('--card-index', index);

    // Topline
    const topline = document.createElement('div');
    topline.className = 'card-topline';

    const langSpan = document.createElement('span');
    langSpan.className = 'language';

    const langDot = document.createElement('span');
    langDot.className = 'language-dot';
    langDot.setAttribute('aria-hidden', 'true');
    langSpan.appendChild(langDot);

    const langText = document.createTextNode(` ${safeText(repository.language)}`);
    langSpan.appendChild(langText);

    const starSpan = document.createElement('span');
    starSpan.className = 'star-count';
    starSpan.setAttribute('aria-label', `${Number(repository.stars || 0).toLocaleString()} stars`);
    starSpan.textContent = `★ ${formatStars(Number(repository.stars || 0))}`;

    topline.appendChild(langSpan);
    topline.appendChild(starSpan);

    // Title / link
    const h3 = document.createElement('h3');
    const a = document.createElement('a');
    a.href = safeText(repository.url) || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = safeText(repository.name) || safeText(repository.full_name);
    a.setAttribute('aria-describedby', `repo-${index}-meta`);
    h3.appendChild(a);

    // Full name
    const metaP = document.createElement('p');
    metaP.id = `repo-${index}-meta`;
    metaP.className = 'repository-name';
    metaP.textContent = safeText(repository.full_name);

    // Description
    const descP = document.createElement('p');
    descP.className = 'description';
    descP.textContent = safeText(repository.description);

    // Starred date
    const dateP = document.createElement('p');
    dateP.className = 'starred-date';
    dateP.textContent = `Starred ${formatDateSafe(repository.starred_at)}`;

    article.appendChild(topline);
    article.appendChild(h3);
    article.appendChild(metaP);
    article.appendChild(descP);
    article.appendChild(dateP);

    repositoryList.appendChild(article);
  });
};

(async function load() {
  if (!repositoryList || !repositoryCount) return;
  repositoryList.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('events.json');
    if (!response.ok) throw new Error(`Could not load events.json: ${response.status}`);
    const data = await response.json();
    renderRepositories(data);
  } catch (err) {
    showError(err);
  } finally {
    repositoryList.removeAttribute('aria-busy');
  }
})();