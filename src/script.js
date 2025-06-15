// src/script.js

// Detectar en qué página estamos
const path = window.location.href;

if (
  path.includes("astramilitarum.html") ||
  path.includes("greyknights.html") ||
  path.includes("adeptasororitas.html")
) {
  // --- Código para astramilitarum.html, greyknights.html y adeptasororitas.html ---
  const selectedImages = new Set();

  const gallery = document.getElementById("gallery");
  const button = document.getElementById("verSeleccion");

  if (gallery && button) {
    // Si ya hay seleccionados, cargarlos para mantener la selección visual
    const storedSelected =
      JSON.parse(localStorage.getItem("imagenesSeleccionadas")) || [];
    storedSelected.forEach((filename) => {
      document.querySelectorAll("#gallery img").forEach((img) => {
        const imgName = img.src.split("/").pop();
        if (imgName === filename) {
          selectedImages.add(filename);
          img.classList.add("selected");
        }
      });
    });

    document.querySelectorAll("#gallery img").forEach((img) => {
      img.addEventListener("click", () => {
        const filename = img.src.split("/").pop();
        if (selectedImages.has(filename)) {
          selectedImages.delete(filename);
          img.classList.remove("selected");
        } else {
          selectedImages.add(filename);
          img.classList.add("selected");
        }
      });
    });

    button.addEventListener("click", () => {
      localStorage.setItem(
        "imagenesSeleccionadas",
        JSON.stringify([...selectedImages])
      );
      localStorage.setItem("paginaAnterior", window.location.pathname);
      window.location.href = "seleccionadas.html";
    });
  }
} else if (path.includes("seleccionadas.html")) {
  // --- Código para seleccionadas.html ---
  const contenedor = document.getElementById("resultado");
  const imagenes =
    JSON.parse(localStorage.getItem("imagenesSeleccionadas")) || [];
  const volverBtn = document.getElementById("volverBtn");
  const btnTachon = document.getElementById("activarTachon");

  let paginaAnterior = localStorage.getItem("paginaAnterior");
  volverBtn.addEventListener("click", () => {
    window.location.href = paginaAnterior;
  });

  let modoTachon = false;
  btnTachon.addEventListener("click", () => {
    modoTachon = !modoTachon;
    btnTachon.textContent = modoTachon ? "Cancelar tachado" : "Tachar";
  });

  imagenes.forEach((filename) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("image-container");

    const img = document.createElement("img");
    img.src = "../assets/" + filename;

    wrapper.appendChild(img);
    contenedor.appendChild(wrapper);

    // Función para generar tachón
    const agregarTachon = (x1, y1, x2, y2) => {
      const tachon = document.createElement("div");
      tachon.classList.add("tachon");

      const izq = Math.min(x1, x2);
      const sup = Math.min(y1, y2);
      const ancho = Math.abs(x2 - x1);
      const alto = Math.abs(y2 - y1);

      tachon.style.left = `${izq}px`;
      tachon.style.top = `${sup}px`;
      tachon.style.width = `${ancho}px`;
      tachon.style.height = `${alto}px`;

      wrapper.appendChild(tachon);
    };

    // Soporte para mouse y touch
    let startX,
      startY,
      activo = false;

    const getCoords = (e, ref) => {
      const rect = ref.getBoundingClientRect();

      if (e.type.startsWith("touch")) {
        if (e.touches && e.touches.length > 0) {
          return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top,
          };
        }
        return null;
      }

      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const iniciar = (e) => {
      if (!modoTachon) return;
      e.preventDefault();
      const coords = getCoords(e, wrapper);
      if (!coords) return; // evita error si es null
      const { x, y } = coords;
      startX = x;
      startY = y;
      activo = true;
    };

    const mover = (e) => {
      if (!activo || !modoTachon) return;
      e.preventDefault();
      // No hace nada por ahora, pero evita el error
    };

    const terminar = (e) => {
      if (!activo || !modoTachon) return;
      const coords = getCoords(e, wrapper);
      if (!coords) return; // evita error si es null
      const { x, y } = coords;
      agregarTachon(startX, startY, x, y);
      activo = false;
    };

    wrapper.addEventListener("mousedown", iniciar);
    wrapper.addEventListener("mousemove", mover);
    wrapper.addEventListener("mouseup", terminar);

    wrapper.addEventListener("touchstart", iniciar, { passive: false });
    wrapper.addEventListener("touchmove", mover, { passive: false });
    wrapper.addEventListener("touchend", terminar);
  });
}
