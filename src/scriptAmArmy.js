document.addEventListener("DOMContentLoaded", () => {
  const resultadoDiv = document.getElementById("resultadoArmy");
  const checkboxes = document.querySelectorAll(
    '.dropdown-content-army input[type="checkbox"]'
  );

  // Funciones de persistencia (declaradas al nivel superior)
  function saveHiddenProps(unitName, prop, hidden) {
    const storage = JSON.parse(localStorage.getItem("unitPropsState") || "{}");
    if (!storage[unitName]) storage[unitName] = {};
    storage[unitName][prop] = hidden;
    localStorage.setItem("unitPropsState", JSON.stringify(storage));
  }

  function loadHiddenProps(unitName, prop) {
    const storage = JSON.parse(localStorage.getItem("unitPropsState") || "{}");
    return storage[unitName]?.[prop] || false;
  }

  function saveAccordionState(unitName, isOpen) {
    const storage = JSON.parse(localStorage.getItem("accordionState") || "{}");
    storage[unitName] = isOpen;
    localStorage.setItem("accordionState", JSON.stringify(storage));
  }

  function loadAccordionState(unitName) {
    const storage = JSON.parse(localStorage.getItem("accordionState") || "{}");
    return storage[unitName] || false;
  }

  function removeUnitFromResults(name) {
    const unitDiv = document.getElementById(`unit-${name}`);
    if (unitDiv) unitDiv.remove();
  }

  function saveToLocalStorage(name, unit) {
    const savedUnits = JSON.parse(localStorage.getItem("savedUnits") || "{}");
    savedUnits[name] = {
      data: unit,
      hiddenProps: Array.from(
        document.querySelectorAll(
          `#unit-${name} input[type="checkbox"]:not(:checked)`
        )
      ).map((checkbox) => checkbox.value),
    };
    localStorage.setItem("savedUnits", JSON.stringify(savedUnits));
  }

  function removeFromLocalStorage(name) {
    const savedUnits = JSON.parse(localStorage.getItem("savedUnits")) || {};
    delete savedUnits[name];
    localStorage.setItem("savedUnits", JSON.stringify(savedUnits));
  }

  function loadSavedResults() {
    const savedUnits = JSON.parse(localStorage.getItem("savedUnits")) || {};
    Object.values(savedUnits).forEach((unitData) => {
      const unit = unitData.data;
      if (unitData && unitData.data?.name && unitData.data?.description) {
        addUnitToResults(unitData.data);
      } // Restaurar estados de propiedades ocultas
      if (unitData.hiddenProps) {
        unitData.hiddenProps.forEach((prop) => {
          saveHiddenProps(unit.name, prop, true);
        });
      }
    });

    // Marcar checkboxes correspondientes
    checkboxes.forEach((checkbox) => {
      if (savedUnits[checkbox.value]) {
        checkbox.checked = true;
      }
    });
  }

  function addUnitToResults(unit) {
    const unitDiv = document.createElement("div");
    unitDiv.id = `unit-${unit.name}`;
    unitDiv.className = "unit-container";

    // 1. Encabezado con nombre de unidad
    const unitHeader = document.createElement("div");
    unitHeader.className = "unit-header";
    unitHeader.textContent = unit.name;
    unitDiv.appendChild(unitHeader);

    // 2. Botón para desplegar propiedades
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-props";
    toggleBtn.textContent = "▼ Propiedades";
    unitHeader.appendChild(toggleBtn);

    // 3. Contenedor desplegable de propiedades
    const propsContainer = document.createElement("div");
    propsContainer.className = "props-container";

    // Obtener propiedades disponibles (excluyendo 'name')
    const properties = Object.keys(unit).filter((prop) => prop !== "name");

    // Crear checkboxes para cada propiedad
    properties.forEach((prop) => {
      const label = document.createElement("label");
      label.className = "prop-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "prop-checkbox";
      checkbox.dataset.unit = unit.name;
      checkbox.dataset.prop = prop;
      checkbox.checked = !loadHiddenProps(unit.name, prop);

      checkbox.addEventListener("change", () => {
        const propElement = document.querySelector(
          `#prop-${unit.name}-${prop}`
        );
        if (propElement) {
          propElement.style.display = checkbox.checked ? "block" : "none";
          saveHiddenProps(unit.name, prop, !checkbox.checked);
        }
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(prop));
      propsContainer.appendChild(label);
    });

    unitDiv.appendChild(propsContainer);

    // 4. Mostrar valores de propiedades
    const valuesContainer = document.createElement("div");
    valuesContainer.className = "values-container";

    properties.forEach((prop) => {
      const propValue = document.createElement("div");
      propValue.id = `prop-${unit.name}-${prop}`;
      propValue.className = "unit-prop";
      if (prop === "stratagems" || prop === "description") {
        const img = document.createElement("img");
        img.src = unit[prop];
        img.alt = unit.name;
        img.className = "unit-image"; // Podés estilizarlo con CSS si querés
        propValue.appendChild(img);
      } else {
        propValue.textContent = `${prop}: ${JSON.stringify(
          unit[prop],
          null,
          2
        )}`;
      }
      propValue.style.display = loadHiddenProps(unit.name, prop)
        ? "none"
        : "block";
      valuesContainer.appendChild(propValue);
    });

    unitDiv.appendChild(valuesContainer);
    resultadoDiv.appendChild(unitDiv);

    // Evento para toggle del acordeón
    toggleBtn.addEventListener("click", () => {
      propsContainer.classList.toggle("active");
      toggleBtn.textContent = propsContainer.classList.contains("active")
        ? "▲ Propiedades"
        : "▼ Propiedades";
      saveAccordionState(
        unit.name,
        propsContainer.classList.contains("active")
      );
    });

    // Cargar estado del acordeón
    if (loadAccordionState(unit.name)) {
      propsContainer.classList.add("active");
      toggleBtn.textContent = "▲ Propiedades";
    }
  }

  // Inicialización
  loadSavedResults();

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async function () {
      const name = this.value;
      const resultadoDiv = document.getElementById("resultadoArmy");

      try {
        const response = await fetch("../assets/am/astramilitarumarmy.json");
        if (!response.ok) throw new Error("HTTP error");
        const data = await response.json();

        if (this.checked) {
          const selectedUnit = data.find(
            (unit) => unit?.name === name && unit?.description
          );
          if (!selectedUnit) {
            console.error(`Unidad "${name}" no encontrada`);
            return;
          }
          addUnitToResults(selectedUnit);
          saveToLocalStorage(name, selectedUnit);
        } else {
          removeUnitFromResults(name);
          removeFromLocalStorage(name);
        }
      } catch (error) {
        console.error("Error:", error);
        resultadoDiv.textContent = "Error al cargar los datos";
      }
    });
  });
});
