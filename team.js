const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const cardsGrid = document.getElementById('cardsGrid');
const dateLine = document.getElementById('dateLine');
const missingSection = document.getElementById('missingSection');
const missingList = document.getElementById('missingList');

function formatRiyadhTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-US', {
    timeZone: 'Asia/Riyadh',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRiyadhDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function renderCard(update) {
  const card = document.createElement('div');
  card.className = 'card';

  const badgeClass = update.on_time ? 'badge-ontime' : 'badge-late';
  const badgeText = update.on_time ? 'On time' : 'Late';

  card.innerHTML = `
    <div class="card-top">
      <div>
        <p class="card-name"></p>
        <p class="card-time">${formatRiyadhTime(update.created_at)} Riyadh time</p>
      </div>
      <span class="badge ${badgeClass}">${badgeText}</span>
    </div>
    <p class="card-label did">Did</p>
    <p class="card-text"></p>
    <p class="card-label next">Next</p>
    <p class="card-text"></p>
    <p class="card-label stuck">Stuck</p>
    <p class="card-text"></p>
  `;

  card.querySelector('.card-name').textContent = update.name;
  const textEls = card.querySelectorAll('.card-text');
  textEls[0].textContent = update.did;
  textEls[1].textContent = update.next;
  textEls[2].textContent = update.stuck || 'Nothing noted.';

  return card;
}

function renderMissing(missing) {
  if (!missing || missing.length === 0) {
    missingSection.classList.add('hidden');
    return;
  }

  missingList.innerHTML = '';
  missing.forEach((name) => {
    const pill = document.createElement('span');
    pill.className = 'missing-pill';
    pill.textContent = name;
    missingList.appendChild(pill);
  });

  missingSection.classList.remove('hidden');
}

async function loadTeamUpdates() {
  try {
    const response = await fetch('/.netlify/functions/get-updates');
    if (!response.ok) throw new Error('Failed to load');

    const data = await response.json();

    loadingState.classList.add('hidden');
    dateLine.textContent = formatRiyadhDate(data.date);

    renderMissing(data.missing);

    if (data.updates.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    cardsGrid.innerHTML = '';
    data.updates.forEach((update) => {
      cardsGrid.appendChild(renderCard(update));
    });
  } catch (err) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
  }
}

loadTeamUpdates();
