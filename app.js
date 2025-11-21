
// État global de l'application
let appState = {
    staff: [
        {
            id: 1,
            name: "Joseph Stalin",
            role: "manager",
            photo: "",
            email: "stalin@worksphere.com", 
            phone: "01 23 45 67 89",
            zone: null,
            experiences: []
        },
        {
            id: 2,
            name: "Bruce Waine", 
            role: "security",
            photo: "",
            email: "bruce@worksphere.com",
            phone: "06 23 45 57 89", 
            zone: null,
            experiences: []
        }
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

// Restrictions par type de rôle pour chaque zone
const zoneRestrictions = {
    reception: ["receptionist", "manager"],
    server: ["technician", "manager"],
    security: ["security", "manager"],
    archive: ["manager", "receptionist", "technician", "security", "other"]
};


function loadFromLocalStorage() {
    const savedData = localStorage.getItem('workSphereData');
    if (savedData) {
        try {
            appState = JSON.parse(savedData);
            console.log("📂 Données chargées depuis le localStorage");
        } catch (error) {
            console.error("❌ Erreur lors du chargement des données:", error);
        }
    }
}


function saveToLocalStorage() {
    try {
        localStorage.setItem('workSphereData', JSON.stringify(appState));
        console.log("💾 Données sauvegardées dans le localStorage");
    } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde:", error);
    }
}



function refreshEmployeeDisplay() {
    const staffListElement = document.getElementById('unassignedStaff');
    if (!staffListElement) {
        console.error("❌ Élément unassignedStaff non trouvé");
        return;
    }
    
    staffListElement.innerHTML = '';

    const unassignedEmployees = appState.staff.filter(employee => employee.zone === null);
    
    // Message si aucun employé n'est disponible
    if (unassignedEmployees.length === 0) {
        staffListElement.innerHTML = '<div class="no-employees">Aucun employé non assigné</div>';
        return;
    }

    // Création des cartes pour chaque employé non assigné
    unassignedEmployees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.classList.add('employee-card');
        employeeDiv.setAttribute('data-employee-id', employee.id);
        employeeDiv.innerHTML = `
            <div class="employee-name">${employee.name}</div>
            <div class="employee-role">- ${getRoleDisplayName(employee.role)} -</div>
        `;
        staffListElement.appendChild(employeeDiv);
    });
}


function refreshZoneDisplays() {
    // Réinitialisation des zones avant reassignement
    Object.keys(appState.zones).forEach(zoneId => {
        appState.zones[zoneId].staff = [];
    });

    // Réassignation des employés aux zones
    appState.staff.forEach(employee => {
        if (employee.zone && appState.zones[employee.zone]) {
            appState.zones[employee.zone].staff.push(employee.id);
        }
    });

    // Mise à jour visuelle de chaque zone
    Object.keys(appState.zones).forEach(zoneId => {
        const zoneElement = document.getElementById(`${zoneId}-staff`);
        const capacityElement = document.querySelector(`[data-zone="${zoneId}"] .capacity`);
        
        if (zoneElement && capacityElement) {
            zoneElement.innerHTML = '';
            const zoneStaff = appState.zones[zoneId].staff;
            
            // Ajout des employés dans la zone
            zoneStaff.forEach(employeeId => {
                const employee = appState.staff.find(emp => emp.id === employeeId);
                if (employee) {
                    const employeeDiv = document.createElement('div');
                    employeeDiv.classList.add('employee-card', 'assigned');
                    employeeDiv.innerHTML = `
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-role">- ${getRoleDisplayName(employee.role)} -</div>
                    `;
                    zoneElement.appendChild(employeeDiv);
                }
            });

            // Mise à jour de l'affichage de capacité
            capacityElement.textContent = `${zoneStaff.length}/${appState.zones[zoneId].capacity}`;
        }
    });
}

/**
 * Convertit les codes de rôle en noms affichables
 * @param {string} role - Code du rôle
 * @returns {string} Nom affichable du rôle
 */
function getRoleDisplayName(role) {
    const roleNames = {
        'manager': 'Manager',
        'receptionist': 'Réceptionniste',
        'technician': 'Technicien IT',
        'security': 'Agent de sécurité',
        'cleaner': 'Nettoyage',
        'other': 'Autre'
    };
    return roleNames[role] || role;
}


function setupModal() {
    const modal = document.getElementById('addEmployeeModal');
    const addButton = document.querySelector('.add-worker-btn');
    const closeButton = document.querySelector('.close-modal');
    const cancelButton = document.getElementById('cancelAddEmployee');
    const saveButton = document.getElementById('saveEmployee');

    // Vérification que tous les éléments existent
    if (!modal || !addButton || !closeButton || !cancelButton || !saveButton) {
        console.error("❌ Éléments du modal non trouvés");
        return;
    }

    // Ouverture du modal
    addButton.addEventListener('click', () => {
        console.log("📝 Ouverture du modal d'ajout d'employé");
        modal.style.display = 'flex';
        document.getElementById('employeeName').focus();
    });

    // Fermeture du modal
    function closeModal() {
        modal.style.display = 'none';
        document.getElementById('employeeForm').reset();
    }

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Fermeture en cliquant en dehors du modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Fermeture avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Sauvegarde d'un nouvel employé
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('employeeName').value.trim();
        const role = document.getElementById('employeeRole').value;
        const email = document.getElementById('employeeEmail').value.trim();
        const phone = document.getElementById('employeePhone').value.trim();

        // Validation des champs
        if (name && role && email && phone) {
            const newEmployee = {
                id: Date.now(), // ID unique basé sur le timestamp
                name: name,
                role: role,
                email: email,
                phone: phone,
                photo: "",
                zone: null,
                experiences: []
            };
            
            appState.staff.push(newEmployee);
            saveToLocalStorage();
            closeModal();
            refreshEmployeeDisplay();
            console.log("✅ Employé ajouté:", newEmployee);
        } else {
            alert("Veuillez remplir tous les champs!");
        }
    });

    // Soumission du formulaire avec la touche Enter
    document.getElementById('employeeForm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveButton.click();
        }
    });
}

// =============================================
// GESTION DES AFFECTATIONS AUX ZONES
// =============================================

/**
 * Configure les boutons d'ajout aux zones
 * Ajoute les écouteurs d'événements sur tous les boutons "+"
 */
function setupZoneButtons() {
    const zoneButtons = document.querySelectorAll('.add-to-zone');

    zoneButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const zoneElement = event.target.closest('.zone');
            const zoneId = zoneElement.dataset.zone;
            
            openAssignmentModal(zoneId);
        });
    });
}

/**
 * Ouvre un modal pour assigner un employé à une zone
 * @param {string} zoneId - Identifiant de la zone
 */
function openAssignmentModal(zoneId) {
    const allowedRoles = zoneRestrictions[zoneId];
    const zone = appState.zones[zoneId];
    
    // Filtrage des employés disponibles selon les restrictions de rôle
    const availableEmployees = appState.staff.filter(employee => {
        if (employee.zone === null) {
            if (allowedRoles) {
                return allowedRoles.includes(employee.role);
            } else {
                return true; // Aucune restriction
            }
        }
        return false;
    });

    // Message si aucun employé n'est disponible
    if (availableEmployees.length === 0) {
        alert("Aucun employé disponible pour cette zone!");
        return;
    }

    // Création dynamique du modal d'assignation
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
                    ${availableEmployees.map(employee => `
                        <div class="employee-option" data-employee-id="${employee.id}">
                            <strong>${employee.name}</strong>
                            <span>-${getRoleDisplayName(employee.role)}-</span>
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

    // Gestionnaires d'événements pour le modal d'assignation
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('#cancelAssignment').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // Assignation de l'employé sélectionné
    modal.querySelectorAll('.employee-option').forEach(option => {
        option.addEventListener('click', () => {
            const employeeId = parseInt(option.dataset.employeeId);
            assignEmployeeToZone(employeeId, zoneId);
            document.body.removeChild(modal);
        });
    });
}

/**
 * Assign un employé à une zone spécifique
 * @param {number} employeeId - ID de l'employé
 * @param {string} zoneId - ID de la zone
 */
function assignEmployeeToZone(employeeId, zoneId) {
    const employee = appState.staff.find(emp => emp.id === employeeId);
    const zone = appState.zones[zoneId];

    if (!employee || !zone) {
        console.error("❌ Employé ou zone non trouvé");
        return;
    }

    // Vérification de la capacité de la zone
    if (zone.staff.length >= zone.capacity) {
        alert("Cette zone est pleine!");
        return;
    }

    // Retrait de l'employé de son ancienne zone si nécessaire
    if (employee.zone) {
        const oldZone = appState.zones[employee.zone];
        oldZone.staff = oldZone.staff.filter(id => id !== employeeId);
    }

    // Assignation à la nouvelle zone
    employee.zone = zoneId;
    zone.staff.push(employeeId);

    saveToLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
    
    console.log(`✅ ${employee.name} assigné à ${zone.name}`);
}

// =============================================
// COMPORTEMENT RESPONSIVE
// =============================================

/**
 * Gère l'adaptation de l'interface aux différentes tailles d'écran
 */
function setupResponsiveBehavior() {
    function handleResize() {
        const sidebar = document.querySelector('.sidebar');
        const workspace = document.querySelector('.workspace');
        
        if (window.innerWidth <= 768) {
            // Adaptation pour mobile
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    // Vérification initiale
    handleResize();
    
    // Écoute des changements de taille
    window.addEventListener('resize', handleResize);
}

// =============================================
// INITIALISATION DE L'APPLICATION
// =============================================

/**
 * Point d'entrée principal - Initialise toute l'application
 */
function initialiserApp() {
    console.log("🚀 Initialisation de l'application WorkSphere");
    
    // Séquence d'initialisation
    loadFromLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
    setupZoneButtons();
    setupModal();
    setupResponsiveBehavior();
    
    console.log("✅ Application initialisée avec succès");
}

// Démarrage de l'application une fois le DOM chargé
document.addEventListener('DOMContentLoaded', function() {
    initialiserApp();
});

function refreshEmployeeDisplay() {
    const staffListElement = document.getElementById('unassignedStaff');
    if (!staffListElement) {
        console.error("❌ Élément unassignedStaff non trouvé");
        return;
    }
    
    staffListElement.innerHTML = '';

    const unassignedEmployees = appState.staff.filter(employee => employee.zone === null);
    
    // Message si aucun employé n'est disponible
    if (unassignedEmployees.length === 0) {
        staffListElement.innerHTML = '<div class="no-employees">Aucun employé non assigné</div>';
        return;
    }

    // Création des cartes pour chaque employé non assigné
    unassignedEmployees.forEach(employee => {
        const employeeDiv = createEmployeeCard(employee);
        staffListElement.appendChild(employeeDiv);
    });
}

/**
 * Met à jour l'affichage de toutes les zones
 * Gère l'affectation des employés et l'affichage des capacités
 */
function refreshZoneDisplays() {
    // Réinitialisation des zones avant reassignement
    Object.keys(appState.zones).forEach(zoneId => {
        appState.zones[zoneId].staff = [];
    });

    // Réassignation des employés aux zones
    appState.staff.forEach(employee => {
        if (employee.zone && appState.zones[employee.zone]) {
            appState.zones[employee.zone].staff.push(employee.id);
        }
    });

    // Mise à jour visuelle de chaque zone
    Object.keys(appState.zones).forEach(zoneId => {
        const zoneElement = document.getElementById(`${zoneId}-staff`);
        const capacityElement = document.querySelector(`[data-zone="${zoneId}"] .capacity`);
        
        if (zoneElement && capacityElement) {
            zoneElement.innerHTML = '';
            const zoneStaff = appState.zones[zoneId].staff;
            
            // Ajout des employés dans la zone
            zoneStaff.forEach(employeeId => {
                const employee = appState.staff.find(emp => emp.id === employeeId);
                if (employee) {
                    const employeeDiv = createEmployeeCard(employee);
                    employeeDiv.classList.add('assigned');
                    zoneElement.appendChild(employeeDiv);
                }
            });

            // Mise à jour de l'affichage de capacité
            capacityElement.textContent = `${zoneStaff.length}/${appState.zones[zoneId].capacity}`;
        }
    });
}

/**
 * Crée une carte d'employé avec bouton de suppression
 * @param {Object} employee - Données de l'employé
 * @returns {HTMLElement} Élément HTML de la carte
 */
function createEmployeeCard(employee) {
    const employeeDiv = document.createElement('div');
    employeeDiv.classList.add('employee-card');
    employeeDiv.setAttribute('data-employee-id', employee.id);
    
    employeeDiv.innerHTML = `
        <div class="employee-card-content">
            <div class="employee-name">${employee.name}</div>
            <div class="employee-role">- ${getRoleDisplayName(employee.role)} -</div>
        </div>
        <button class="delete-employee-btn" title="Supprimer l'employé">.git rm</button>
    `;
    
    // Ajout de l'écouteur d'événement pour la suppression
    const deleteButton = employeeDiv.querySelector('.delete-employee-btn');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêche la propagation de l'événement
        deleteEmployee(employee.id);
    });
    
    return employeeDiv;
}

/**
 * Supprime un employé de l'application
 * @param {number} employeeId - ID de l'employé à supprimer
 */
function deleteEmployee(employeeId) {
    // Confirmation avant suppression
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.")) {
        return;
    }
    
    const employee = appState.staff.find(emp => emp.id === employeeId);
    if (!employee) {
        console.error("❌ Employé non trouvé");
        return;
    }
    
    // Retirer l'employé de sa zone si assigné
    if (employee.zone) {
        const zone = appState.zones[employee.zone];
        if (zone) {
            zone.staff = zone.staff.filter(id => id !== employeeId);
        }
    }
    
    // Supprimer l'employé de la liste
    appState.staff = appState.staff.filter(emp => emp.id !== employeeId);
    
    // Sauvegarder et rafraîchir l'affichage
    saveToLocalStorage();
    refreshEmployeeDisplay();
    refreshZoneDisplays();
    

}

