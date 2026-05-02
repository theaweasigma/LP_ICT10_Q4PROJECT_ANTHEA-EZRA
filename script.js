// Initialize data from localStorage
const data = {
    classmates: JSON.parse(localStorage.getItem('classmates')) || [],
    attendance: JSON.parse(localStorage.getItem('attendance')) || {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0
    },
    moments: JSON.parse(localStorage.getItem('moments')) || []
};

let attendanceChart;

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigatePage(page);
    });
});

function navigatePage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Initialize chart if on attendance page
    if (pageName === 'attendance') {
        setTimeout(initAttendanceChart, 100);
    }
}

// ============ CLASSMATES SECTION ============

document.getElementById('addBtn').addEventListener('click', addClassmate);
document.getElementById('classmateSelect').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addClassmate();
});

function addClassmate() {
    const selected = document.getElementById('classmateSelect').value.trim();
    const subject = document.getElementById('subjectInput').value.trim();

    if (!selected || !subject) {
        alert('Please select a classmate and favorite subject');
        return;
    }

    // Parse name and school from the selected value (format: "Name (School)")
    const match = selected.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (!match) {
        alert('Invalid classmate selection');
        return;
    }

    const name = match[1].trim();
    const school = match[2].trim();

    const classmate = { id: Date.now(), name, school, subject };
    data.classmates.push(classmate);
    saveData();
    
    // Clear inputs
    document.getElementById('classmateSelect').value = '';
    document.getElementById('subjectInput').value = '';
    
    renderClassmates();
}

function renderClassmates() {
    const list = document.getElementById('classmateList');
    list.innerHTML = '';

    if (data.classmates.length === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No classmates added yet. Add one to get started!</p>';
        return;
    }

    data.classmates.forEach(classmate => {
        const card = document.createElement('div');
        card.className = 'classmate-card';
        card.innerHTML = `
            <h3>👋 ${classmate.name}</h3>
            <p><strong>School:</strong> ${classmate.school}</p>
            <p><strong>Favorite Subject:</strong> <span class="badge">${classmate.subject}</span></p>
            <button class="btn btn-danger" onclick="deleteClassmate(${classmate.id})">Remove</button>
        `;
        list.appendChild(card);
    });
}

function deleteClassmate(id) {
    if (confirm('Are you sure you want to remove this classmate?')) {
        data.classmates = data.classmates.filter(c => c.id !== id);
        saveData();
        renderClassmates();
    }
}

// ============ ATTENDANCE SECTION ============

document.getElementById('submitAttendance').addEventListener('click', recordAttendance);

function recordAttendance() {
    const day = document.getElementById('dayInput').value;
    const absences = parseInt(document.getElementById('absencesInput').value);

    if (!day || isNaN(absences) || absences < 0) {
        alert('Please select a day and enter valid number of absences');
        return;
    }

    data.attendance[day] = absences;
    saveData();
    
    // Clear inputs
    document.getElementById('dayInput').value = '';
    document.getElementById('absencesInput').value = '';
    
    updateAttendanceChart();
}

function initAttendanceChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const absenceCounts = days.map(day => data.attendance[day]);

    if (attendanceChart) {
        attendanceChart.destroy();
    }

    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Number of Absences',
                data: absenceCounts,
                borderColor: '#4169e1',
                backgroundColor: 'rgba(65, 105, 225, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#4169e1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            }
        }
    });
}

function updateAttendanceChart() {
    if (attendanceChart) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const absenceCounts = days.map(day => data.attendance[day]);
        attendanceChart.data.datasets[0].data = absenceCounts;
        attendanceChart.update();
    }
}

// ============ GALLERY SECTION ============

document.getElementById('addMomentBtn').addEventListener('click', addMoment);

function addMoment() {
    const studentName = document.getElementById('studentNameInput').value.trim();
    const title = document.getElementById('momentTitleInput').value.trim();
    const description = document.getElementById('momentDescriptionInput').value.trim();
    const photoInput = document.getElementById('photoInput');

    if (!studentName || !title || !description) {
        alert('Please fill in all fields');
        return;
    }

    let photoData = null;
    if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            saveMoment(studentName, title, description, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveMoment(studentName, title, description, photoData);
    }
}

function saveMoment(studentName, title, description, photoData) {
    const moment = {
        id: Date.now(),
        studentName,
        title,
        description,
        photo: photoData
    };
    data.moments.push(moment);
    saveData();

    // Clear inputs
    document.getElementById('studentNameInput').value = '';
    document.getElementById('momentTitleInput').value = '';
    document.getElementById('momentDescriptionInput').value = '';
    document.getElementById('photoInput').value = '';

    renderGallery();
}

function renderGallery() {
    const gallery = document.getElementById('galleryGrid');
    gallery.innerHTML = '';

    if (data.moments.length === 0) {
        gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No moments added yet. Share your memories!</p>';
        return;
    }

    data.moments.forEach(moment => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        
        let imageHTML = '<div class="gallery-image">📸</div>';
        if (moment.photo) {
            imageHTML = `<div class="gallery-image"><img src="${moment.photo}" alt="${moment.title}"></div>`;
        }

        card.innerHTML = `
            ${imageHTML}
            <div class="gallery-content">
                <h3>${moment.title}</h3>
                <p class="student-name">By ${moment.studentName}</p>
                <p>${moment.description}</p>
                <button class="btn btn-danger" onclick="deleteMoment(${moment.id})">Delete</button>
            </div>
        `;
        gallery.appendChild(card);
    });
}

function deleteMoment(id) {
    if (confirm('Are you sure you want to delete this moment?')) {
        data.moments = data.moments.filter(m => m.id !== id);
        saveData();
        renderGallery();
    }
}

// ============ STORAGE ============

function saveData() {
    localStorage.setItem('classmates', JSON.stringify(data.classmates));
    localStorage.setItem('attendance', JSON.stringify(data.attendance));
    localStorage.setItem('moments', JSON.stringify(data.moments));
}

// ============ INITIALIZATION ============

function init() {
    renderClassmates();
    renderGallery();
}

window.addEventListener('load', init);
