import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productosRef = collection(db, "productos");
let editId = null;
let productosCache = [];

// ================= GUARDAR =================
window.guardarProducto = async () => {
  try {
    const titulo = document.getElementById("titulo").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const descuento = Number(document.getElementById("descuento").value || 0);
    const genero = document.getElementById("genero").value;
    const imagen = document.getElementById("imagen").value.trim();

    const familia = document.getElementById("familia").value;
    const salida = document.getElementById("salida").value;
    const corazon = document.getElementById("corazon").value;
    const fondo = document.getElementById("fondo").value;

    if (!titulo || !precio || !imagen) {
      showToast("Completa título, precio e imagen", "warning");
      return;
    }

    const data = {
      titulo,
      precio,
      descuento,
      genero,
      imagen,
      descripcion: { familia, salida, corazon, fondo },
      fecha: new Date()
    };

    if (editId) {
      await updateDoc(doc(db, "productos", editId), data);
      showToast("Producto actualizado ✏️");
      editId = null;
    } else {
      await addDoc(productosRef, data);
      showToast("Producto guardado ✅");
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

        <p class="text-sm text-slate-500">${p.genero}</p>

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
  abrirModal("¿Seguro que deseas eliminar este producto?", async () => {
    await deleteDoc(doc(db, "productos", id));
    showToast("Producto eliminado 🗑️");
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

  document.getElementById("familia").value = p.descripcion?.familia || "";
  document.getElementById("salida").value = p.descripcion?.salida || "";
  document.getElementById("corazon").value = p.descripcion?.corazon || "";
  document.getElementById("fondo").value = p.descripcion?.fondo || "";

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
