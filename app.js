// =============================================
// WORKSPHERE - Gestion Visuelle du Personnel
// =============================================

// Données de l'application
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

// Restrictions par zone
const zoneRestrictions = {
    reception: ["receptionist", "manager"],
    server: ["technician", "manager"],
    security: ["security", "manager"],
    archive: ["manager", "receptionist", "technician", "security", "other"]
};



function loadFromLocalStorage() {
    const savedData = localStorage.getItem('workSphereData');
    if (savedData) {
        appState = JSON.parse(savedData);
        console.log("📂 Données chargées");
    }
}

function saveToLocalStorage() {
    localStorage.setItem('workSphereData', JSON.stringify(appState));
    console.log("💾 Données sauvegardées");
}



function refreshEmployeeDisplay() {
    const staffListElement = document.getElementById('unassignedStaff');
    staffListElement.innerHTML = '';

    appState.staff.forEach(employee => {
        if (employee.zone === null) {
            const employeeDiv = document.createElement('div');
            employeeDiv.classList.add('employee-card');
            employeeDiv.innerHTML = `
                <div class="employee-name">${employee.name}</div>
                <div class="employee-role">- ${employee.role} -</div>
            `;
            staffListElement.appendChild(employeeDiv);
        }
    });
}

// =============================================
// FONCTIONS MODAL
// =============================================

function setupModal() {
    const modal = document.getElementById('addEmployeeModal');
    const addButton = document.querySelector('.add-worker-btn');
    const closeButton = document.querySelector('.close-modal');
    const cancelButton = document.getElementById('cancelAddEmployee');
    const saveButton = document.getElementById('saveEmployee');

    // Ouvrir modal
    addButton.addEventListener('click', () => {
        modal.classList.add('active');
    });

    // Fermer modal
    function closeModal() {
        modal.classList.remove('active');
        document.getElementById('employeeForm').reset();
    }

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Sauvegarder employé
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('employeeName').value;
        const role = document.getElementById('employeeRole').value;
        const email = document.getElementById('employeeEmail').value;
        const phone = document.getElementById('employeePhone').value;

        if (name && role && email && phone) {
            const newEmployee = {
                id: Date.now(),
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
        } else {
            alert("Veuillez remplir tous les champs!");
        }
    });
}



function setupZoneButtons() {
    const zoneButtons = document.querySelectorAll('.add-to-zone');

    zoneButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const zoneElement = event.target.closest('.zone');
            const zoneId = zoneElement.dataset.zone;
            const allowedRoles = zoneRestrictions[zoneId];
            
            const availableEmployees = appState.staff.filter(employee => {
                if (employee.zone === null) {
                    if (allowedRoles) {
                        return allowedRoles.includes(employee.role);
                    } else {
                        return true;
                    }
                }
                return false;
            });

            console.log(`Disponible pour ${zoneId}:`, availableEmployees);
            // TODO: Ouvrir popup d'assignation
        });
    });
}



function initialiserApp() {
    loadFromLocalStorage();
    refreshEmployeeDisplay();
    setupZoneButtons();
    setupModal();
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', function() {
    initialiserApp();
});