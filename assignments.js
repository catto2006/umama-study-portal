document.addEventListener('DOMContentLoaded', () => {
  const assignmentsList = document.getElementById('assignments-list');
  const titleInput = document.getElementById('assignment-title');
  const contentInput = document.getElementById('assignment-content');
  const addBtn = document.getElementById('add-assignment-btn');

  // Load saved assignments from localStorage
  let assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

  function renderAssignments() {
    assignmentsList.innerHTML = '';
    if (assignments.length === 0) {
      assignmentsList.innerHTML = '<p>No assignments yet. Start by creating one!</p>';
      return;
    }
    assignments.forEach((a, i) => {
      const div = document.createElement('div');
      div.classList.add('assignment-item');
      div.innerHTML = `
        <h4>${a.title}</h4>
        <p>${a.content.replace(/\n/g, '<br>')}</p>
        <button data-index="${i}" class="delete-btn">Delete</button>
      `;
      assignmentsList.appendChild(div);
    });
    // Add delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute('data-index');
        assignments.splice(idx, 1);
        localStorage.setItem('assignments', JSON.stringify(assignments));
        renderAssignments();
      };
    });
  }

  addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) {
      alert('Please provide both title and content for the assignment.');
      return;
    }
    assignments.push({ title, content });
    localStorage.setItem('assignments', JSON.stringify(assignments));
    titleInput.value = '';
    contentInput.value = '';
    renderAssignments();
  });

  renderAssignments();
});
