// État de l'app
let appState = {
    staff: [
        
    ],
    zones: {
        conference: { name: "Salle de conférence", capacity: 8, staff: [] },
        reception: { name: "Réception", capacity: 4, staff: [] },
        server: { name: "Salle des serveurs", capacity: 6, staff: [] },
        security: { name: "Salle de sécurité", capacity: 4, staff: [] },
        staff: { name: "Salle du personnel", capacity: 12, staff: [] },
        archive: { name: "Salle d'archives", capacity: 4, staff: [] }
    }
};

// Restrictions
const zoneRestrictions = {
    reception: ["receptionist", "manager"],
    server: ["technician", "manager"],
    security: ["security", "manager"]
};

// Charger données
function loadFromLocalStorage() {
    const saved = localStorage.getItem('workSphereData');
    if (saved) appState = JSON.parse(saved);
}

// Sauvegarder
function saveToLocalStorage() {
    localStorage.setItem('workSphereData', JSON.stringify(appState));
}

// Afficher employés non assignés
function refreshEmployeeDisplay() {
    const list = document.getElementById('unassignedStaff');
    list.innerHTML = '';
    
    const unassigned = appState.staff.filter(e => e.zone === null);
    
    if (unassigned.length === 0) {
        list.innerHTML = '<div class="no-employees">Aucun employé non assigné</div>';
        return;
    }

    unassigned.forEach(emp => {
        list.appendChild(createEmployeeCard(emp, 'unassigned'));
    });
}

// Afficher zones
function refreshZoneDisplays() {
    // Reset zones
    Object.keys(appState.zones).forEach(zoneId => {
        appState.zones[zoneId].staff = [];
    });

    // Assigner employés
    appState.staff.forEach(emp => {
        if (emp.zone && appState.zones[emp.zone]) {
            appState.zones[emp.zone].staff.push(emp.id);
        }
    });

    // Mettre à jour l'UI
    Object.keys(appState.zones).forEach(zoneId => {
        const zoneEl = document.getElementById(`${zoneId}-staff`);
        const capacityEl = document.querySelector(`[data-zone="${zoneId}"] .capacity`);
        
        if (zoneEl && capacityEl) {
            zoneEl.innerHTML = '';
            const staffIds = appState.zones[zoneId].staff;
            
            staffIds.forEach(id => {
                const emp = appState.staff.find(e => e.id === id);
                if (emp) zoneEl.appendChild(createEmployeeCard(emp, 'assigned'));
            });

            capacityEl.textContent = `${staffIds.length}/${appState.zones[zoneId].capacity}`;
        }
    });
}

// Créer carte employé
function createEmployeeCard(emp, state) {
    const div = document.createElement('div');
    div.className = 'employee-card';
    div.setAttribute('data-employee-id', emp.id);
    div.setAttribute('draggable', 'true');
    
    const roleNames = {
        'manager': 'Manager',
        'receptionist': 'Réceptionniste', 
        'technician': 'Technicien IT',
        'security': 'Agent de sécurité',
        'cleaner': 'Nettoyage',
        'other': 'Autre'
    };
    
    const btnClass = state === 'unassigned' ? 'delete-employee-btn' : 'unassign-employee-btn';
    const btnText = state === 'unassigned' ? '×' : '↶';
    
    // Générer les initiales pour le placeholder
    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Image ou placeholder
    const imageHtml = emp.photo ? 
        `<img src="${emp.photo}" alt="${emp.name}" class="employee-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
        '';
    
    const placeholderHtml = emp.photo ? 
        `<div class="employee-image-placeholder" style="display: none;">${initials}</div>` :
        `<div class="employee-image-placeholder">${initials}</div>`;
    
    div.innerHTML = `
        <div class="employee-card-with-image">
            ${imageHtml}
            ${placeholderHtml}
            <div class="employee-card-content">
                <div class="employee-name">${emp.name}</div>
                <div class="employee-role">- ${roleNames[emp.role]} -</div>
                ${emp.experiences && emp.experiences.length > 0 ? 
                    `<div class="employee-experience">${emp.experiences[0]}</div>` : ''}
            </div>
        </div>
        <button class="${btnClass}">${btnText}</button>
    `;
    
    // Clic sur la carte pour voir les infos
    div.addEventListener('click', (e) => {
        // Ne pas ouvrir le modal si on clique sur le bouton
        if (!e.target.classList.contains(btnClass)) {
            openEmployeeInfo(emp.id);
        }
    });
    
    const btn = div.querySelector('button');
    btn.onclick = (e) => {
        e.stopPropagation();
        if (state === 'unassigned') {
            deleteEmployee(emp.id);
        } else {
            unassignEmployee(emp.id);
        }
    };
    
    return div;
}

// Supprimer employé
function deleteEmployee(id) {
    if (!confirm("Supprimer cet employé ?")) return;
    
    const emp = appState.staff.find(e => e.id === id);
    if (!emp) return;
    
    if (emp.zone !== null) {
        alert("Désassigner d'abord de la zone !");
        return;
    }
    
    appState.staff = appState.staff.filter(e => e.id !== id);
    saveToLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
}

// Désassigner employé
function unassignEmployee(id) {
    const emp = appState.staff.find(e => e.id === id);
    if (!emp) return;
    
    if (emp.zone) {
        const zone = appState.zones[emp.zone];
        if (zone) zone.staff = zone.staff.filter(sid => sid !== id);
        emp.zone = null;
    }
    
    saveToLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
}

// Gérer les expériences dans le modal
function setupExperienceInput() {
    const experiencesContainer = document.getElementById('experiencesContainer');
    const addExperienceBtn = document.getElementById('addExperience');
    
    function addExperienceInput(value = '') {
        const expDiv = document.createElement('div');
        expDiv.className = 'experience-input';
        expDiv.innerHTML = `
            <input type="text" class="experience-field" placeholder="Compétence ou expérience" value="${value}">
            <button type="button" class="remove-experience">×</button>
        `;
        
        expDiv.querySelector('.remove-experience').onclick = () => {
            expDiv.remove();
        };
        
        experiencesContainer.appendChild(expDiv);
    }
    
    addExperienceBtn.onclick = () => addExperienceInput();
    
    // Récupérer les expériences
    window.getExperiences = () => {
        const inputs = document.querySelectorAll('.experience-field');
        const experiences = [];
        inputs.forEach(input => {
            if (input.value.trim()) {
                experiences.push(input.value.trim());
            }
        });
        return experiences;
    };
}

// Modal ajout employé
function setupModal() {
    const modal = document.getElementById('addEmployeeModal');
    const addBtn = document.querySelector('.add-worker-btn');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelAddEmployee');
    const saveBtn = document.getElementById('saveEmployee');

    function closeModal() {
        modal.style.display = 'none';
        document.getElementById('employeeForm').reset();
        // Reset experiences
        document.getElementById('experiencesContainer').innerHTML = '';
        setupExperienceInput(); // Réinitialiser avec un champ vide
    }

    addBtn.onclick = () => {
        modal.style.display = 'flex';
        setupExperienceInput(); // Initialiser les champs d'expérience
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    saveBtn.onclick = (e) => {
        e.preventDefault();
        
        const name = document.getElementById('employeeName').value.trim();
        const role = document.getElementById('employeeRole').value;
        const email = document.getElementById('employeeEmail').value.trim();
        const phone = document.getElementById('employeePhone').value.trim();
        const photo = document.getElementById('employeePhoto').value.trim();
        const experiences = window.getExperiences ? window.getExperiences() : [];

        if (name && role && email && phone) {
            const newEmp = {
                id: Date.now(),
                name: name,
                role: role,
                email: email,
                phone: phone,
                photo: photo,
                experiences: experiences,
                zone: null
            };
            
            appState.staff.push(newEmp);
            saveToLocalStorage();
            closeModal();
            refreshEmployeeDisplay();
        } else {
            alert("Veuillez remplir tous les champs obligatoires !");
        }
    };
}

// Boutons zones
function setupZoneButtons() {
    document.querySelectorAll('.add-to-zone').forEach(btn => {
        btn.onclick = (e) => {
            const zone = e.target.closest('.zone');
            openAssignmentModal(zone.dataset.zone);
        };
    });
}

// Modal assignation
function openAssignmentModal(zoneId) {
    const allowedRoles = zoneRestrictions[zoneId];
    const zone = appState.zones[zoneId];
    
    const available = appState.staff.filter(emp => {
        return emp.zone === null && (!allowedRoles || allowedRoles.includes(emp.role));
    });

    if (available.length === 0) {
        alert("Aucun employé disponible !");
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active assignment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assigner à ${zone.name}</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>📊 Capacité: ${zone.staff.length}/${zone.capacity}</p>
                <div class="employee-selection">
                    ${available.map(emp => `
                        <div class="employee-option" data-employee-id="${emp.id}">
                            <strong>${emp.name}</strong>
                            <span>-${getRoleDisplayName(emp.role)}-</span>
                            ${emp.experiences && emp.experiences.length > 0 ? 
                                `<small>${emp.experiences[0]}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" id="cancelAssignment">Annuler</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal').onclick = () => document.body.removeChild(modal);
    modal.querySelector('#cancelAssignment').onclick = () => document.body.removeChild(modal);

    modal.querySelectorAll('.employee-option').forEach(opt => {
        opt.onclick = () => {
            assignEmployeeToZone(parseInt(opt.dataset.employeeId), zoneId);
            document.body.removeChild(modal);
        };
    });
}

// Assigner à zone
function assignEmployeeToZone(empId, zoneId) {
    const emp = appState.staff.find(e => e.id === empId);
    const zone = appState.zones[zoneId];

    if (!emp || !zone) return;

    if (zone.staff.length >= zone.capacity) {
        alert("Zone pleine !");
        return;
    }

    if (emp.zone) {
        const oldZone = appState.zones[emp.zone];
        oldZone.staff = oldZone.staff.filter(id => id !== empId);
    }

    emp.zone = zoneId;
    zone.staff.push(empId);

    saveToLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
}

// Glisser-déposer
function setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('employee-card')) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-employee-id'));
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('employee-card')) {
            e.target.classList.remove('dragging');
        }
    });

    document.addEventListener('dragover', (e) => e.preventDefault());

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const zone = e.target.closest('.zone');
        if (zone) {
            const empId = parseInt(e.dataTransfer.getData('text/plain'));
            assignEmployeeToZone(empId, zone.dataset.zone);
        }
    });
}

// Nom du rôle
function getRoleDisplayName(role) {
    const names = {
        'manager': 'Manager',
        'receptionist': 'Réceptionniste',
        'technician': 'Technicien IT', 
        'security': 'Agent de sécurité',
        'cleaner': 'Nettoyage',
        'other': 'Autre'
    };
    return names[role] || role;
}
// Ouvrir modal d'information employé
function openEmployeeInfo(employeeId) {
    const emp = appState.staff.find(e => e.id === employeeId);
    if (!emp) return;

    const modal = document.getElementById('employeeInfoModal');
    const roleNames = {
        'manager': 'Manager',
        'receptionist': 'Réceptionniste', 
        'technician': 'Technicien IT',
        'security': 'Agent de sécurité',
        'cleaner': 'Nettoyage',
        'other': 'Autre'
    };

    // Mettre à jour les informations
    document.getElementById('employeeNameDisplay').textContent = emp.name;
    document.getElementById('employeeRoleDisplay').textContent = roleNames[emp.role] || emp.role;
    document.getElementById('employeeEmailDisplay').textContent = emp.email;
    document.getElementById('employeePhoneDisplay').textContent = emp.phone;
    
    // Zone assignée
    const zoneDisplay = document.getElementById('employeeZoneDisplay');
    if (emp.zone) {
        const zone = appState.zones[emp.zone];
        zoneDisplay.textContent = `📍 Assigné à: ${zone.name}`;
        zoneDisplay.style.color = 'var(--accent-color)';
    } else {
        zoneDisplay.textContent = '🚫 Non assigné';
        zoneDisplay.style.color = 'var(--warning)';
    }

    // Photo
    const photoDisplay = document.getElementById('employeePhotoDisplay');
    if (emp.photo) {
        photoDisplay.src = emp.photo;
        photoDisplay.style.display = 'block';
    } else {
        photoDisplay.style.display = 'none';
    }

    // Expériences
    const experiencesList = document.getElementById('employeeExperiencesDisplay');
    experiencesList.innerHTML = '';
    
    if (emp.experiences && emp.experiences.length > 0) {
        emp.experiences.forEach(exp => {
            const li = document.createElement('li');
            li.textContent = exp;
            experiencesList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Aucune expérience renseignée';
        li.style.color = 'var(--primary-color)';
        li.style.fontStyle = 'italic';
        experiencesList.appendChild(li);
    }

    // Afficher le modal
    modal.style.display = 'flex';
}

// Configurer le modal d'info
function setupEmployeeInfoModal() {
    const modal = document.getElementById('employeeInfoModal');
    const closeBtn = document.querySelector('#employeeInfoModal .close-modal');
    const closeInfoBtn = document.getElementById('closeEmployeeInfo');

    function closeModal() {
        modal.style.display = 'none';
    }

    closeBtn.onclick = closeModal;
    closeInfoBtn.onclick = closeModal;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// Initialiser
// Initialiser
function init() {
    loadFromLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
    setupZoneButtons();
    setupModal();
    setupEmployeeInfoModal(); // Ajouter cette ligne
    setupDragAndDrop();
}

document.addEventListener('DOMContentLoaded', init);