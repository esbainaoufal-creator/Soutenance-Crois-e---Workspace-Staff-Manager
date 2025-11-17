

let appState = {};
let zoneRestrictions = {};

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        appState = data.initialData;
        zoneRestrictions = data.zoneRestrictions;
        
        initialiserApp();
    })
    .catch(error => {
        console.error("Erreur chargement JSON:", error);
    });

function initialiserApp() {
    const staffListElement = document.getElementById('unassignedStaff');
    const zoneButtons = document.querySelectorAll('.add-to-zone');


    console.log("Employés:", appState.staff.length);
    console.log("Zones:", Object.keys(appState.zones).length);
    console.log("Loaded employees:", appState.staff);

    appState.staff.forEach(employee => {
        const employeeDiv = document.createElement('div');

        employeeDiv.classList.add('employee-card');
        employeeDiv.innerHTML =
        `<div class="employee-name">${employee.name}</div>
     <div class="employee-role">- ${employee.role} -</div>`;
        staffListElement.appendChild(employeeDiv);
    });

    zoneButtons.forEach(button => {
    
        button.addEventListener('click', (event) => {
    const zoneElement = event.target.closest('.zone');
    const zoneId = zoneElement.dataset.zone;
    console.log("Clicked zone:", zoneId);
});
    });

}



