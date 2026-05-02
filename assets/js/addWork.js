const workForm = document.getElementById('workForm');
const submitStatus = document.getElementById('submitStatus');

async function loadAuthState() {
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (!data.authenticated) {
      submitStatus.innerHTML = 'Please <a href="/login" style="color:#ffffff; text-decoration:underline;">log in</a> before submitting notebook work.';
      submitStatus.style.color = '#ff6b6b';
      if (workForm) {
        Array.from(workForm.elements).forEach((element) => {
          if (element.tagName !== 'BUTTON' && element.type !== 'reset') {
            element.disabled = true;
          }
        });
      }
      return false;
    }
    return true;
  } catch (error) {
    submitStatus.textContent = 'Unable to verify login status. Please refresh and try again.';
    submitStatus.style.color = '#ff6b6b';
    return false;
  }
}

if (workForm) {
  loadAuthState();
  workForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitStatus.textContent = 'Submitting your notebook work...';
    submitStatus.style.color = '#4cd964';

    const formData = new FormData(workForm);
    const pdfFile = document.getElementById('pdfFile');
    if (pdfFile && pdfFile.files.length > 0) {
      formData.set('pdfFile', pdfFile.files[0]);
    }

    try {
      const response = await fetch('/api/notebook-work', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save notebook work.');
      }

      submitStatus.textContent = 'Notebook work submitted successfully.';
      submitStatus.style.color = '#4cd964';
      workForm.reset();
    } catch (error) {
      submitStatus.textContent = `Submission failed: ${error.message}`;
      submitStatus.style.color = '#ff6b6b';
    }
  });
}
