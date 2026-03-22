document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 1800);
});