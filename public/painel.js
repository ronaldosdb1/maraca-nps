const categoryMeta = {
  ativacoes: { label: 'Ativações do Tour', total: 0, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, color: '#ffb703' },
  acervo: { label: 'Acervo', total: 0, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, color: '#0b3b67' },
  checkout: { label: 'Checkout / saída', total: 0, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, color: '#1bbf73' }
};

const totalElement = document.getElementById('total-responses');
const dashboardGrid = document.getElementById('dashboard-grid');
const refreshBtn = document.getElementById('refresh-btn');

function renderDashboard(data) {
  dashboardGrid.innerHTML = '';
  let total = 0;

  for (const key of Object.keys(categoryMeta)) {
    const category = data.byCategory[key];
    const metrics = category || { total: 0, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    total += metrics.total;

    const card = document.createElement('article');
    card.className = 'metric-card';

    const title = document.createElement('h3');
    title.textContent = categoryMeta[key].label;
    card.appendChild(title);

    const ratingBars = document.createElement('div');
    ratingBars.className = 'rating-bars';

    for (const rating of [5, 4, 3, 2, 1]) {
      const row = document.createElement('div');
      row.className = 'rating-row';

      const emoji = document.createElement('span');
      emoji.textContent = ['😠', '🙁', '😐', '🙂', '😄'][5 - rating];

      const barTrack = document.createElement('div');
      barTrack.className = 'bar-track';

      const barFill = document.createElement('span');
      barFill.className = 'bar-fill';
      const percent = metrics.total ? (metrics.ratings[rating] / metrics.total) * 100 : 0;
      barFill.style.width = `${percent}%`;
      barFill.style.background = `linear-gradient(90deg, ${categoryMeta[key].color} 0%, #7cc6ff 100%)`;
      barTrack.appendChild(barFill);

      const count = document.createElement('span');
      count.textContent = String(metrics.ratings[rating]);

      row.append(emoji, barTrack, count);
      ratingBars.appendChild(row);
    }

    card.appendChild(ratingBars);
    dashboardGrid.appendChild(card);
  }

  totalElement.textContent = String(total);
}

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error('Erro ao carregar painel:', error);
  }
}

refreshBtn.addEventListener('click', loadStats);
loadStats();
