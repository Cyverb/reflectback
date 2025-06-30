// Utility functions
function getReflections() {
    return JSON.parse(localStorage.getItem('reflections') || '[]');
}
function saveReflections(reflections) {
    localStorage.setItem('reflections', JSON.stringify(reflections));
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.endsWith('history.html')) {
        renderHistoryPage();
    } else {
        renderReflectPage();
    }
});

// --- Reflect Page Logic ---
function renderReflectPage() {
    // Only run if the elements exist
    const moodBtns = document.querySelectorAll('.mood-btn');
    const textarea = document.getElementById('reflection-text');
    const saveBtn = document.getElementById('save-btn');
    const confirmation = document.getElementById('confirmation');
    if (!moodBtns.length || !textarea || !saveBtn || !confirmation) return;
    let selectedMood = null;
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
            updateSaveBtn();
        });
    });
    textarea.addEventListener('input', updateSaveBtn);
    function updateSaveBtn() {
        saveBtn.disabled = !(selectedMood && textarea.value.trim());
    }
    saveBtn.addEventListener('click', () => {
        if (!selectedMood || !textarea.value.trim()) return;
        const reflections = getReflections();
        const now = new Date();
        reflections.push({
            mood: selectedMood,
            text: textarea.value.trim(),
            date: now.toLocaleString()
        });
        saveReflections(reflections);
        textarea.value = '';
        moodBtns.forEach(b => b.classList.remove('selected'));
        selectedMood = null;
        updateSaveBtn();
        confirmation.textContent = 'Reflection saved!';
        confirmation.style.display = 'block';
        setTimeout(() => { confirmation.style.display = 'none'; }, 2000);
    });
}

// --- History Page Logic ---
function renderHistoryPage() {
    const list = document.getElementById('history-list');
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (!list || !clearAllBtn) return;
    const reflections = getReflections().slice().reverse();
    list.innerHTML = reflections.map((r, i) => `
        <li class="history-item">
            <span class="history-mood">${r.mood}</span>
            <div class="history-content">
                <div>${escapeHTML(r.text)}</div>
                <div class="history-date">${r.date}</div>
            </div>
            <button class="delete-btn" data-index="${reflections.length - 1 - i}">Delete</button>
        </li>
    `).join('');
    // Delete individual
    list.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const all = getReflections();
            all.splice(idx, 1);
            saveReflections(all);
            renderHistoryPage();
        });
    });
    // Clear all
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all reflections?')) {
            saveReflections([]);
            renderHistoryPage();
        }
    });
}

// Escape HTML for safe rendering
function escapeHTML(str) {
    return str.replace(/[&<>"]'/g, function(tag) {
        const chars = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return chars[tag] || tag;
    });
} 
