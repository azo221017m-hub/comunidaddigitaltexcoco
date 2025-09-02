// js/script.js
const form = document.getElementById("regForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    contacto: document.getElementById("contacto").value,
    telefono: document.getElementById("telefono").value,
    descripcion: document.getElementById("descripcion").value
  };

  try {
    const res = await fetch("http://localhost:3000/api/negocios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const msg = await res.text();
    alert(msg);
    form.reset();
  } catch (err) {
    alert("❌ Error de conexión con el servidor");
  }
});
