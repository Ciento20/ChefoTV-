// app.js - Lógica principal de Chefo TV

// Variables globales
let canales = [];
let categorias = ['Deportes', 'Entretenimiento', 'Noticias', 'Películas'];
let temaActual = 'morado';
let aperturaEnlaces = 'misma';
let editandoId = null;

// Elementos del DOM
const elementos = {
    categoriasContainer: document.getElementById('categoriasContainer'),
    botonAgregar: document.getElementById('botonAgregar'),
    formContainer: document.getElementById('formContainer'),
    nombreCanal: document.getElementById('nombreCanal'),
    urlCanal: document.getElementById('urlCanal'),
    tipoDeporte: document.getElementById('tipoDeporte'),
    tipoIdioma: document.getElementById('tipoIdioma'),
    colorCanal: document.getElementById('colorCanal'),
    colorHex: document.getElementById('colorHex'),
    mostrarIcono: document.getElementById('mostrarIcono'),
    iconoCanal: document.getElementById('iconoCanal'),
    iconoPreview: document.getElementById('iconoPreview'),
    guardarCanal: document.getElementById('guardarCanal'),
    cancelarEdicion: document.getElementById('cancelarEdicion'),
    busqueda: document.getElementById('busqueda'),
    filtroDeporte: document.getElementById('filtroDeporte'),
    filtroIdioma: document.getElementById('filtroIdioma'),
    reproductor: document.getElementById('reproductor'),
    iframeReproductor: document.getElementById('iframeReproductor'),
    botonCerrarReproductor: document.getElementById('botonCerrarReproductor'),
    notificacion: document.getElementById('notificacion'),
    botonAjustes: document.getElementById('botonAjustes'),
    menuAjustes: document.getElementById('menuAjustes'),
    selectorTema: document.getElementById('selectorTema'),
    selectorApertura: document.getElementById('selectorApertura'),
    botonExportar: document.getElementById('botonExportar'),
    botonImportar: document.getElementById('botonImportar'),
    botonBorrarTodo: document.getElementById('botonBorrarTodo'),
    modalImportar: document.getElementById('modalImportar'),
    importData: document.getElementById('importData'),
    confirmarImportacion: document.getElementById('confirmarImportacion'),
    cancelarImportacion: document.getElementById('cancelarImportacion')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    inicializarEventos();
    mostrarCategorias();
    elementos.titulo.style.opacity = '1';
    elementos.botonAgregar.style.opacity = '1';
});

// Cargar datos del localStorage
function cargarDatos() {
    const datosGuardados = localStorage.getItem('chefoTVData');
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        canales = datos.canales || [];
        categorias = datos.categorias || ['Deportes', 'Entretenimiento', 'Noticias', 'Películas'];
        temaActual = datos.tema || 'morado';
        aperturaEnlaces = datos.apertura || 'misma';
        
        // Aplicar configuración guardada
        aplicarTema(temaActual);
        elementos.selectorTema.value = temaActual;
        elementos.selectorApertura.value = aperturaEnlaces;
    }
}

// Guardar datos en localStorage
function guardarDatos() {
    const datos = {
        canales,
        categorias,
        tema: temaActual,
        apertura: aperturaEnlaces
    };
    localStorage.setItem('chefoTVData', JSON.stringify(datos));
}

// Inicializar eventos
function inicializarEventos() {
    // Formulario de canales
    elementos.botonAgregar.addEventListener('click', mostrarFormulario);
    elementos.guardarCanal.addEventListener('click', guardarCanal);
    elementos.cancelarEdicion.addEventListener('click', ocultarFormulario);
    
    // Búsqueda y filtros
    elementos.busqueda.addEventListener('input', filtrarCanales);
    elementos.filtroDeporte.addEventListener('change', filtrarCanales);
    elementos.filtroIdioma.addEventListener('change', filtrarCanales);
    
    // Reproductor
    elementos.botonCerrarReproductor.addEventListener('click', cerrarReproductor);
    
    // Ajustes
    elementos.botonAjustes.addEventListener('click', toggleMenuAjustes);
    elementos.selectorTema.addEventListener('change', cambiarTema);
    elementos.selectorApertura.addEventListener('change', cambiarAperturaEnlaces);
    elementos.botonExportar.addEventListener('click', exportarConfiguracion);
    elementos.botonImportar.addEventListener('click', mostrarModalImportar);
    elementos.botonBorrarTodo.addEventListener('click', confirmarBorrarTodo);
    elementos.confirmarImportacion.addEventListener('click', importarConfiguracion);
    elementos.cancelarImportacion.addEventListener('click', ocultarModalImportar);
    
    // Iconos y color
    elementos.mostrarIcono.addEventListener('change', toggleIcono);
    elementos.iconoCanal.addEventListener('input', actualizarIconoPreview);
    elementos.colorCanal.addEventListener('input', actualizarColorHex);
    elementos.colorHex.addEventListener('input', actualizarColorPicker);
}

// Mostrar categorías y canales
function mostrarCategorias() {
    elementos.categoriasContainer.innerHTML = '';
    
    categorias.forEach(categoria => {
        const canalesCategoria = canales.filter(c => c.categoria === categoria);
        
        if (canalesCategoria.length > 0) {
            const categoriaDiv = document.createElement('div');
            categoriaDiv.className = 'categoria';
            
            const titulo = document.createElement('h2');
            titulo.innerHTML = `
                ${categoria}
                <button class="toggle-categoria">▼</button>
            `;
            
            const lista = document.createElement('div');
            lista.className = 'link-list';
            
            canalesCategoria.forEach((canal, index) => {
                lista.appendChild(crearElementoCanal(canal, index));
            });
            
            categoriaDiv.appendChild(titulo);
            categoriaDiv.appendChild(lista);
            elementos.categoriasContainer.appendChild(categoriaDiv);
            
            // Evento para toggle categoría
            titulo.querySelector('.toggle-categoria').addEventListener('click', () => {
                categoriaDiv.classList.toggle('oculta');
                const boton = titulo.querySelector('.toggle-categoria');
                boton.textContent = categoriaDiv.classList.contains('oculta') ? '▶' : '▼';
            });
        }
    });
}

// Crear elemento de canal
function crearElementoCanal(canal, id) {
    const canalDiv = document.createElement('div');
    canalDiv.className = 'link-item';
    canalDiv.style.backgroundColor = canal.color || '#BB86FC';
    canalDiv.dataset.id = id;
    canalDiv.dataset.url = canal.url;
    canalDiv.dataset.deporte = canal.deporte;
    canalDiv.dataset.idioma = canal.idioma;
    
    // Contenido del canal
    let contenido = canal.nombre;
    if (canal.icono && canal.mostrarIcono) {
        contenido = `${canal.icono} ${canal.nombre}`;
    }
    
    canalDiv.innerHTML = `
        ${contenido}
        <div class="puntuacion">
            ${crearEstrellas(canal.puntuacion || 0)}
        </div>
        <div class="menu-contextual">
            <button class="eliminar-canal">Eliminar</button>
            <button class="editar-canal">Editar</button>
            <button class="favorito-canal">${canal.favorito ? '★ Quitar favorito' : '☆ Añadir favorito'}</button>
        </div>
    `;
    
    // Eventos del canal
    canalDiv.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-contextual button')) {
            abrirCanal(canal.url);
        }
    });
    
    canalDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        document.querySelectorAll('.link-item').forEach(item => {
            item.classList.remove('mostrar-menu');
        });
        canalDiv.classList.add('mostrar-menu');
    });
    
    // Eventos del menú contextual
    const menuContextual = canalDiv.querySelector('.menu-contextual');
    menuContextual.querySelector('.eliminar-canal').addEventListener('click', () => {
        eliminarCanal(id);
    });
    
    menuContextual.querySelector('.editar-canal').addEventListener('click', () => {
        editarCanal(id);
    });
    
    menuContextual.querySelector('.favorito-canal').addEventListener('click', () => {
        toggleFavorito(id);
    });
    
    // Evento para puntuación
    const estrellas = canalDiv.querySelectorAll('.puntuacion button');
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('click', (e) => {
            e.stopPropagation();
            calificarCanal(id, index + 1);
        });
    });
    
    return canalDiv;
}

// Crear estrellas de puntuación
function crearEstrellas(puntuacion) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        estrellas += `<button ${i <= puntuacion ? 'class="seleccionado"' : ''}>${i <= puntuacion ? '★' : '☆'}</button>`;
    }
    return estrellas;
}

// Mostrar formulario para agregar/editar canal
function mostrarFormulario() {
    elementos.formContainer.classList.add('mostrar');
    elementos.nombreCanal.focus();
    editandoId = null;
}

// Ocultar formulario
function ocultarFormulario() {
    elementos.formContainer.classList.remove('mostrar');
    resetFormulario();
}

// Resetear formulario
function resetFormulario() {
    elementos.nombreCanal.value = '';
    elementos.urlCanal.value = '';
    elementos.tipoDeporte.value = 'futbol';
    elementos.tipoIdioma.value = 'español';
    elementos.colorCanal.value = '#BB86FC';
    elementos.colorHex.value = '#BB86FC';
    elementos.mostrarIcono.checked = false;
    elementos.iconoCanal.value = '';
    elementos.iconoCanal.style.display = 'none';
    elementos.iconoPreview.textContent = '📺';
    editandoId = null;
}

// Guardar canal (nuevo o editado)
function guardarCanal() {
    const nombre = elementos.nombreCanal.value.trim();
    const url = elementos.urlCanal.value.trim();
    
    if (!nombre || !url) {
        mostrarNotificacion('Nombre y URL son requeridos', 'error');
        return;
    }
    
    const canal = {
        nombre,
        url,
        categoria: 'Deportes', // Por defecto, se puede expandir
        deporte: elementos.tipoDeporte.value,
        idioma: elementos.tipoIdioma.value,
        color: elementos.colorHex.value,
        mostrarIcono: elementos.mostrarIcono.checked,
        icono: elementos.iconoCanal.value || '📺',
        fechaCreacion: new Date().toISOString()
    };
    
    if (editandoId !== null) {
        // Editar canal existente
        canales[editandoId] = canal;
        mostrarNotificacion('Canal actualizado correctamente');
    } else {
        // Nuevo canal
        canales.push(canal);
        mostrarNotificacion('Canal agregado correctamente');
    }
    
    guardarDatos();
    mostrarCategorias();
    ocultarFormulario();
}

// Editar canal
function editarCanal(id) {
    const canal = canales[id];
    if (!canal) return;
    
    elementos.nombreCanal.value = canal.nombre;
    elementos.urlCanal.value = canal.url;
    elementos.tipoDeporte.value = canal.deporte || 'futbol';
    elementos.tipoIdioma.value = canal.idioma || 'español';
    elementos.colorCanal.value = canal.color || '#BB86FC';
    elementos.colorHex.value = canal.color || '#BB86FC';
    elementos.mostrarIcono.checked = canal.mostrarIcono || false;
    elementos.iconoCanal.value = canal.icono || '📺';
    elementos.iconoPreview.textContent = canal.icono || '📺';
    
    if (canal.mostrarIcono) {
        elementos.iconoCanal.style.display = 'block';
    }
    
    elementos.formContainer.classList.add('mostrar');
    editandoId = id;
}

// Eliminar canal
function eliminarCanal(id) {
    if (confirm('¿Estás seguro de eliminar este canal?')) {
        canales.splice(id, 1);
        guardarDatos();
        mostrarCategorias();
        mostrarNotificacion('Canal eliminado');
    }
}

// Toggle favorito
function toggleFavorito(id) {
    canales[id].favorito = !canales[id].favorito;
    guardarDatos();
    mostrarCategorias();
    mostrarNotificacion(canales[id].favorito ? 'Añadido a favoritos' : 'Eliminado de favoritos');
}

// Calificar canal
function calificarCanal(id, puntuacion) {
    canales[id].puntuacion = puntuacion;
    guardarDatos();
    mostrarCategorias();
    mostrarNotificacion('Puntuación guardada');
}

// Abrir canal
function abrirCanal(url) {
    if (aperturaEnlaces === 'nueva') {
        window.open(url, '_blank');
    } else {
        elementos.iframeReproductor.src = url;
        elementos.reproductor.style.display = 'block';
        elementos.botonCerrarReproductor.style.display = 'block';
    }
}

// Cerrar reproductor
function cerrarReproductor() {
    elementos.iframeReproductor.src = '';
    elementos.reproductor.style.display = 'none';
    elementos.botonCerrarReproductor.style.display = 'none';
}

// Filtrar canales
function filtrarCanales() {
    const textoBusqueda = elementos.busqueda.value.toLowerCase();
    const filtroDeporte = elementos.filtroDeporte.value;
    const filtroIdioma = elementos.filtroIdioma.value;
    
    document.querySelectorAll('.link-item').forEach(item => {
        const nombre = item.textContent.toLowerCase();
        const deporte = item.dataset.deporte;
        const idioma = item.dataset.idioma;
        
        const coincideBusqueda = nombre.includes(textoBusqueda);
        const coincideDeporte = filtroDeporte === 'todos' || deporte === filtroDeporte;
        const coincideIdioma = filtroIdioma === 'todos' || idioma === filtroIdioma;
        
        item.style.display = coincideBusqueda && coincideDeporte && coincideIdioma ? 'flex' : 'none';
    });
}

// Toggle icono en formulario
function toggleIcono() {
    elementos.iconoCanal.style.display = elementos.mostrarIcono.checked ? 'block' : 'none';
    if (elementos.mostrarIcono.checked) {
        elementos.iconoCanal.focus();
    }
}

// Actualizar vista previa del icono
function actualizarIconoPreview() {
    elementos.iconoPreview.textContent = elementos.iconoCanal.value || '📺';
}

// Actualizar color hex desde el picker
function actualizarColorHex() {
    elementos.colorHex.value = elementos.colorCanal.value;
}

// Actualizar color picker desde el hex
function actualizarColorPicker() {
    if (/^#[0-9A-F]{6}$/i.test(elementos.colorHex.value)) {
        elementos.colorCanal.value = elementos.colorHex.value;
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'exito') {
    elementos.notificacion.textContent = mensaje;
    elementos.notificacion.className = 'notificacion mostrar';
    
    if (tipo === 'error') {
        elementos.notificacion.style.backgroundColor = '#CF6679';
    } else {
        elementos.notificacion.style.backgroundColor = '#370083';
    }
    
    setTimeout(() => {
        elementos.notificacion.classList.remove('mostrar');
    }, 3000);
}

// Toggle menú de ajustes
function toggleMenuAjustes() {
    elementos.menuAjustes.classList.toggle('mostrar');
}

// Cambiar tema
function cambiarTema() {
    temaActual = elementos.selectorTema.value;
    aplicarTema(temaActual);
    guardarDatos();
}

// Aplicar tema seleccionado
function aplicarTema(tema) {
    document.documentElement.className = tema.includes('-claro') ? 'tema-claro ' + tema : tema;
}

// Cambiar modo de apertura de enlaces
function cambiarAperturaEnlaces() {
    aperturaEnlaces = elementos.selectorApertura.value;
    guardarDatos();
}

// Exportar configuración
function exportarConfiguracion() {
    const datos = {
        canales,
        categorias,
        tema: temaActual,
        apertura: aperturaEnlaces,
        version: '1.0',
        fechaExportacion: new Date().toISOString()
    };
    
    const datosStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([datosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chefo-tv-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('Configuración exportada');
    elementos.menuAjustes.classList.remove('mostrar');
}

// Mostrar modal de importación
function mostrarModalImportar() {
    elementos.modalImportar.style.display = 'block';
    elementos.importData.focus();
    elementos.menuAjustes.classList.remove('mostrar');
}

// Ocultar modal de importación
function ocultarModalImportar() {
    elementos.modalImportar.style.display = 'none';
    elementos.importData.value = '';
}

// Importar configuración
function importarConfiguracion() {
    try {
        const datos = JSON.parse(elementos.importData.value);
        
        if (!datos.canales || !Array.isArray(datos.canales)) {
            throw new Error('Formato de datos inválido');
        }
        
        if (confirm('¿Reemplazar la configuración actual? Esto borrará todos los canales existentes.')) {
            canales = datos.canales;
            categorias = datos.categorias || categorias;
            temaActual = datos.tema || temaActual;
            aperturaEnlaces = datos.apertura || aperturaEnlaces;
            
            aplicarTema(temaActual);
            elementos.selectorTema.value = temaActual;
            elementos.selectorApertura.value = aperturaEnlaces;
            
            guardarDatos();
            mostrarCategorias();
            ocultarModalImportar();
            mostrarNotificacion('Configuración importada correctamente');
        }
    } catch (error) {
        mostrarNotificacion('Error al importar: ' + error.message, 'error');
    }
}

// Confirmar borrado completo
function confirmarBorrarTodo() {
    if (confirm('¿Estás seguro de borrar TODOS los canales y configuraciones? Esto no se puede deshacer.')) {
        localStorage.removeItem('chefoTVData');
        canales = [];
        categorias = ['Deportes', 'Entretenimiento', 'Noticias', 'Películas'];
        temaActual = 'morado';
        aperturaEnlaces = 'misma';
        
        aplicarTema(temaActual);
        elementos.selectorTema.value = temaActual;
        elementos.selectorApertura.value = aperturaEnlaces;
        
        mostrarCategorias();
        elementos.menuAjustes.classList.remove('mostrar');
        mostrarNotificacion('Todos los datos han sido borrados');
    }
}