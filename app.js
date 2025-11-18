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

let zoneRestrictions = {
    reception: ["receptionist", "manager"],
    server: ["technician", "manager"],
    security: ["security", "manager"],
    archive: ["manager", "receptionist", "technician", "security", "other"]
};

// Load from localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('workSphereData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        appState = parsedData;
        console.log("📂 Loaded saved data");
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('workSphereData', JSON.stringify(appState));
    console.log("💾 Data saved!");
}

function initialiserApp() {
    const staffListElement = document.getElementById('unassignedStaff');
    const zoneButtons = document.querySelectorAll('.add-to-zone');

    // Clear existing staff display
    staffListElement.innerHTML = '';

    // Display unassigned employees
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

    // Zone button handlers
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

            console.log(`Available for ${zoneId}:`, availableEmployees);
            // TODO: Show popup with availableEmployees
        });
    });

    // Save button handler
    const saveButton = document.querySelector('.add-worker-btn');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            // TODO: Open add employee modal
            console.log("Add employee clicked");
        });
    }
}


loadFromLocalStorage();
initialiserApp();