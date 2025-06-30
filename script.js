// Utility functions
function getReflections() {
    return JSON.parse(localStorage.getItem('reflections') || '[]');
}
function saveReflections(reflections) {
    localStorage.setItem('reflections', JSON.stringify(reflections));
}

// Page routing based on file name
function getPage() {
    const path = window.location.pathname;
    if (path.endsWith('history.html')) return 'history';
    return 'reflect';
}

document.addEventListener('DOMContentLoaded', () => {
    const page = getPage();
    if (page === 'reflect') {
        renderReflectPage();
    } else {
        renderHistoryPage();
    }
});

// --- Reflect Page Logic ---
function renderReflectPage() {
    const main = document.getElementById('page-content');
    main.innerHTML = `
        <section class="reflect-section" aria-labelledby="reflect-title">
            <h2 id="reflect-title" style="text-align:center;">How are you feeling today?</h2>
            <div class="mood-section" role="radiogroup" aria-label="Mood selection">
                <button class="mood-btn" aria-label="Happy" data-mood="😊">😊</button>
                <button class="mood-btn" aria-label="Neutral" data-mood="😐">😐</button>
                <button class="mood-btn" aria-label="Sad" data-mood="😢">😢</button>
                <button class="mood-btn" aria-label="Angry" data-mood="😠">😠</button>
                <button class="mood-btn" aria-label="Loved" data-mood="😍">😍</button>
            </div>
            <label for="reflection-text" style="display:none;">Reflection text</label>
            <textarea id="reflection-text" class="reflection-text" placeholder="How are you feeling today?" rows="4" aria-label="Reflection"></textarea>
            <button id="save-btn" disabled>Save</button>
            <div id="confirmation" class="confirmation" style="display:none;"></div>
        </section>
    `;
    let selectedMood = null;
    const moodBtns = main.querySelectorAll('.mood-btn');
    const textarea = main.querySelector('#reflection-text');
    const saveBtn = main.querySelector('#save-btn');
    const confirmation = main.querySelector('#confirmation');

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
    const main = document.getElementById('page-content');
    const reflections = getReflections().slice().reverse();
    main.innerHTML = `
        <section aria-labelledby="history-title">
            <h2 id="history-title" style="text-align:center;">Reflection History</h2>
            <button class="clear-all-btn" id="clear-all-btn">Clear All</button>
            <ul class="history-list">
                ${reflections.map((r, i) => `
                    <li class="history-item">
                        <span class="history-mood">${r.mood}</span>
                        <div class="history-content">
                            <div>${escapeHTML(r.text)}</div>
                            <div class="history-date">${r.date}</div>
                        </div>
                        <button class="delete-btn" data-index="${reflections.length - 1 - i}">Delete</button>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;
    // Delete individual
    main.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const all = getReflections();
            all.splice(idx, 1);
            saveReflections(all);
            renderHistoryPage();
        });
    });
    // Clear all
    main.querySelector('#clear-all-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all reflections?')) {
            saveReflections([]);
            renderHistoryPage();
        }
    });
}

// Escape HTML for safe rendering
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(tag) {
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