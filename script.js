/* =========================================
   1. SYSTEM UI (Windows & Clock)
   ========================================= */
function toggleWindow(id, title) {
    const win = document.getElementById(id);
    const taskbarContainer = document.getElementById('taskbar-apps');
    const buttonId = id + '-btn';

    // Get the icon source from the desktop icon to reuse it in the taskbar
    // This looks for the image inside the desktop icon div
    const desktopIcon = document.querySelector(`.icon[ondblclick*="${id}"] img`);
    const iconSrc = desktopIcon ? desktopIcon.src : '';

    if (win.style.display === "none" || win.style.display === "") {
        win.style.display = "block";
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = "100");
        win.style.zIndex = "1000";

        if (!document.getElementById(buttonId)) {
            const btn = document.createElement('div');
            btn.id = buttonId;
            btn.className = 'task-button active';
            
            // Added the <img> tag here to show the icon in the taskbar
            btn.innerHTML = `
                <img src="${iconSrc}" style="width:16px; height:16px; margin-right:5px;">
                <span>${title}</span>
            `;
            
            btn.onclick = () => toggleWindow(id, title);
            taskbarContainer.appendChild(btn);
        } else {
            document.getElementById(buttonId).classList.add('active');
        }
    } else {
        win.style.display = "none";
        const btnToRemove = document.getElementById(buttonId);
        if (btnToRemove) btnToRemove.remove();
    }
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    const btn = document.getElementById(id + '-btn');
    
    win.style.display = "none"; // Hide the window
    if (btn) btn.classList.remove('active'); // Turn off the "pressed" look
}

function toggleMaximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    const isMaximized = win.classList.contains('maximized');

    if (isMaximized) {
        win.classList.remove('maximized');
        win.style.left = win.dataset.originalLeft || '';
        win.style.top = win.dataset.originalTop || '';
        win.style.width = win.dataset.originalWidth || '';
        win.style.height = win.dataset.originalHeight || '';

        delete win.dataset.originalLeft;
        delete win.dataset.originalTop;
        delete win.dataset.originalWidth;
        delete win.dataset.originalHeight;
    } else {
        win.dataset.originalLeft = win.style.left || '';
        win.dataset.originalTop = win.style.top || '';
        win.dataset.originalWidth = win.style.width || '';
        win.dataset.originalHeight = win.style.height || '';

        win.classList.add('maximized');
    }

    const maxBtn = win.querySelector('.max-btn');
    if (maxBtn) {
        maxBtn.title = isMaximized ? 'Maximize window' : 'Restore window';
        maxBtn.textContent = isMaximized ? '\u25A1' : '\u25A1';
    }
}

function closeWelcome() {
    document.getElementById('welcome-modal').style.display = 'none';
    
    // 1. Show the music player window
    toggleWindow('music-win', 'Music_Player'); 
    
    // 2. Play the music
    playMusic();
}

/* =========================================
   2. DRAGGING LOGIC
   ========================================= */
function makeDraggable(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;
    const header = win.querySelector('.window-header');

    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        if (win.classList.contains('maximized')) {
            toggleMaximizeWindow(windowId);
        }

        isDragging = true;
        win.classList.add('dragging');
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = "100");
        win.style.zIndex = "1000";
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        win.classList.remove('dragging');
    });
}

/* =========================================
   3. MUSIC PLAYER LOGIC
   ========================================= */
function playMusic() {
    const audio = document.getElementById('audio-element');
    if (audio) audio.play().catch(e => console.log("Playback interaction required"));
}

function pauseMusic() {
    document.getElementById('audio-element').pause();
}

function changeVolume(val) {
    document.getElementById('audio-element').volume = val;
}

/* =========================================
   4. INITIALIZATION (Runs when page loads)
   ========================================= */
window.addEventListener('DOMContentLoaded', () => {
    // Start Clock
    setInterval(updateClock, 1000);
    updateClock();

    // Add maximize buttons to every openable window
    document.querySelectorAll('.window').forEach(win => {
        const controls = win.querySelector('.window-controls');
        if (!controls || controls.querySelector('.max-btn')) return;

        const maxBtn = document.createElement('button');
        maxBtn.className = 'max-btn';
        maxBtn.type = 'button';
        maxBtn.title = 'Maximize window';
        maxBtn.innerHTML = '&#9633;';
        maxBtn.addEventListener('click', event => {
            event.stopPropagation();
            toggleMaximizeWindow(win.id);
        });

        const closeBtn = controls.querySelector('.close-btn');
        if (closeBtn) {
            controls.insertBefore(maxBtn, closeBtn);
        } else {
            controls.appendChild(maxBtn);
        }
    });

    // Setup Draggable Windows
    makeDraggable('visual-research-win');
    makeDraggable('statement-win');
    makeDraggable('geoepistemology-win');
    makeDraggable('are-robots-racist-win');
    makeDraggable('data-portraits-win');
    makeDraggable('production-planning-win');
    makeDraggable('audio-production-win');
    makeDraggable('visual-production-win');
    makeDraggable('prototype-production-win');
    makeDraggable('review-documents-win');
    makeDraggable('music-win');    

    // Setup Music Progress Bar
    const audio = document.getElementById('audio-element');
    const progressFill = document.getElementById('progress-fill');
    
    if (audio && progressFill) {
        audio.addEventListener('timeupdate', () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = percentage + "%";
        });
    }

    // Modal Background Click
    window.onclick = function(event) {
        const modal = document.getElementById('welcome-modal');
        if (event.target == modal) modal.style.display = "none";
    }
});