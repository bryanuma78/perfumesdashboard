import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Referencia a Firestore y variables globales
const productosRef = collection(db, "ropa");
let editId = null;
let productosCache = [];

// ================= TOAST =================
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toastIcon");
  const text = document.getElementById("toastMsg");

  toast.classList.remove("hidden");
  toast.classList.add("flex");

  if (type === "success") { toast.style.borderLeftColor = "#22c55e"; icon.textContent = "✅"; }
  if (type === "error")   { toast.style.borderLeftColor = "#ef4444"; icon.textContent = "❌"; }
  if (type === "warning") { toast.style.borderLeftColor = "#facc15"; icon.textContent = "⚠️"; }

  text.textContent = msg;

  setTimeout(() => toast.classList.add("hidden"), 2500);
}

// ================= MODAL =================
let modalCallback = null;
function abrirModal(texto, callback) {
  const modal = document.getElementById("modal");
  document.getElementById("modalText").textContent = texto;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modalCallback = callback;
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.getElementById("modalOk").onclick = () => {
  if (modalCallback) modalCallback();
  cerrarModal();
};

// ================= GUARDAR =================
window.guardarProducto = async () => {
  try {
    const titulo = document.getElementById("titulo").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const descuento = Number(document.getElementById("descuento").value || 0);
    const genero = document.getElementById("genero").value;
    const imagen = document.getElementById("imagen").value.trim();

    const talla = document.getElementById("talla").value.trim();
    const color = document.getElementById("color").value.trim();
    const material = document.getElementById("material").value.trim();
    const stock = Number(document.getElementById("stock").value || 0);
    const categoria = document.getElementById("categoria").value;

    if (!titulo || !precio || !imagen) {
      showToast("Completa título, precio e imagen", "warning");
      return;
    }

    const data = { titulo, precio, descuento, genero, imagen, talla, color, material, stock, categoria, fecha: new Date() };

    if (editId) {
      await updateDoc(doc(db, "ropa", editId), data);
      showToast("Prenda actualizada ✏️");
      editId = null;
    } else {
      await addDoc(productosRef, data);
      showToast("Prenda guardada ✅");
    }

    limpiarFormulario();
    cargarProductos();

  } catch (error) {
    console.error(error);
    showToast("Error al guardar", "error");
  }
};

// ================= LEER =================
async function cargarProductos() {
  const snap = await getDocs(productosRef);
  productosCache = [];

  snap.forEach(docu => {
    productosCache.push({ id: docu.id, ...docu.data() });
  });

  pintarProductos(productosCache);
}

// ================= PINTAR =================
function pintarProductos(lista) {
  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  lista.forEach(p => {
    const precioFinal = p.descuento > 0
      ? (p.precio - (p.precio * p.descuento / 100)).toFixed(2)
      : p.precio.toFixed(2);

    contenedor.innerHTML += `
      <div class="bg-slate-50 p-4 rounded-xl shadow space-y-3">
        <img src="${p.imagen}" class="w-full h-40 object-contain rounded">
        <h3 class="font-bold">${p.titulo}</h3>

        ${
          p.descuento > 0
            ? `<p>
                <span class="line-through text-red-400">$${p.precio}</span>
                <span class="ml-2 font-bold text-green-600">$${precioFinal}</span>
              </p>
              <p class="text-sm text-green-600">${p.descuento}% OFF</p>`
            : `<p class="font-bold">$${p.precio}</p>`
        }

        <p class="text-sm">${p.categoria} · ${p.talla}</p>
        <p class="text-xs text-slate-500">${p.color} · ${p.material}</p>
        <p class="text-xs">Stock: ${p.stock}</p>

        <div class="flex gap-2">
          <button onclick="editarProducto('${p.id}')"
            class="flex-1 bg-yellow-400 hover:bg-yellow-500 py-1 rounded">
            Editar
          </button>
          <button onclick="eliminarProducto('${p.id}')"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded">
            Eliminar
          </button>
        </div>
      </div>
    `;
  });
}

// ================= BUSCAR =================
window.filtrarProductos = () => {
  const texto = document.getElementById("buscador").value.toLowerCase();
  const filtrados = productosCache.filter(p =>
    p.titulo.toLowerCase().includes(texto)
  );
  pintarProductos(filtrados);
};

// ================= ELIMINAR =================
window.eliminarProducto = id => {
  abrirModal("¿Deseas eliminar esta prenda?", async () => {
    await deleteDoc(doc(db, "ropa", id));
    showToast("Prenda eliminada 🗑️");
    cargarProductos();
  });
};

// ================= EDITAR =================
window.editarProducto = id => {
  const p = productosCache.find(x => x.id === id);
  if (!p) return;

  document.getElementById("titulo").value = p.titulo;
  document.getElementById("precio").value = p.precio;
  document.getElementById("descuento").value = p.descuento || 0;
  document.getElementById("genero").value = p.genero;
  document.getElementById("imagen").value = p.imagen;

  document.getElementById("talla").value = p.talla || "";
  document.getElementById("color").value = p.color || "";
  document.getElementById("material").value = p.material || "";
  document.getElementById("stock").value = p.stock || 0;
  document.getElementById("categoria").value = p.categoria || "";

  const img = document.getElementById("previewImg");
  img.src = p.imagen;
  img.classList.remove("hidden");

  editId = id;

  // ✨ Desplazarse al formulario y enfocar el primer input
  const form = document.querySelector(".bg-white.shadow-xl.rounded-2xl.p-8");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("titulo").focus();
};


// ================= HELPERS =================
function limpiarFormulario() {
  document.querySelectorAll("input").forEach(i => i.value = "");
  document.getElementById("previewImg").classList.add("hidden");
  editId = null;
}

// ================= INIT =================
cargarProductos();
