const nameSelect = document.getElementById('name');
TEAM_NAMES.forEach((name) => {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
  nameSelect.appendChild(option);
});

const form = document.getElementById('updateForm');
const result = document.getElementById('result');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);

  document.getElementById('resultName').textContent = data.get('name');
  document.getElementById('resultDid').textContent = data.get('did');
  document.getElementById('resultNext').textContent = data.get('next');
  document.getElementById('resultStuck').textContent = data.get('stuck') || 'Nothing noted.';

  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
