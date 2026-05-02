const workForm = document.getElementById('workForm');
const submitStatus = document.getElementById('submitStatus');

if (workForm) {
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
