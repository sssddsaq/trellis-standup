const nameSelect = document.getElementById('name');
TEAM_NAMES.forEach((name) => {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
  nameSelect.appendChild(option);
});

const form = document.getElementById('updateForm');
const result = document.getElementById('result');
const submitBtn = form.querySelector('button[type="submit"]');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const payload = {
    name: data.get('name'),
    did: data.get('did'),
    next: data.get('next'),
    stuck: data.get('stuck'),
  };

  errorEl.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  const FALLBACK_ERROR = "Couldn't save that — check your connection and try again.";

  try {
    const response = await fetch('/.netlify/functions/save-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = FALLBACK_ERROR;
      try {
        const errBody = await response.json();
        if (errBody && errBody.error) message = errBody.error;
      } catch {}
      throw new Error(message);
    }

    document.getElementById('resultName').textContent = payload.name;
    document.getElementById('resultDid').textContent = payload.did;
    document.getElementById('resultNext').textContent = payload.next;
    document.getElementById('resultStuck').textContent = payload.stuck || 'Nothing noted.';

    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    errorEl.textContent = err.message || FALLBACK_ERROR;
    errorEl.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit update';
  }
});
