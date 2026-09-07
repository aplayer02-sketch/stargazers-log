const repositoryList = document.querySelector('#repository-list');
const repositoryCount = document.querySelector('#repository-count');

const formatStars = (stars) => {
  if (stars < 1000) {
    return stars.toString();
  }

  return `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`;
};

const formatDate = (date) => new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}).format(new Date(`${date}T00:00:00`));

const renderRepositories = (repositories) => {
  repositoryCount.textContent = `${repositories.length} saved`;

  repositoryList.innerHTML = repositories.map((repository, index) => `
    <article class="repository-card" style="--card-index: ${index}">
      <div class="card-topline">
        <span class="language"><span class="language-dot" aria-hidden="true"></span>${repository.language}</span>
        <span class="star-count" aria-label="${repository.stars.toLocaleString()} stars">★ ${formatStars(repository.stars)}</span>
      </div>
      <h3><a href="${repository.url}" target="_blank" rel="noreferrer">${repository.name}</a></h3>
      <p class="repository-name">${repository.full_name}</p>
      <p class="description">${repository.description}</p>
      <p class="starred-date">Starred ${formatDate(repository.starred_at)}</p>
    </article>
  `).join('');
};

const showError = () => {
  repositoryCount.textContent = '';
  repositoryList.innerHTML = '<p class="status-message error-message">The repository list could not be loaded. Try refreshing the page.</p>';
};

fetch('events.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Could not load events.json: ${response.status}`);
    }

    return response.json();
  })
  .then(renderRepositories)
  .catch(showError);
