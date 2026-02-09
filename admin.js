let salto = 0;
let total = 0;
let busqueda = '';
let categoriaActual = '';
let ordenActual = '';

window.onload = function() {
    cargarCategorias();
    cargarProductos();
};

async function cargarCategorias() {
    const res = await fetch('https://dummyjson.com/products/category');
    const cats = await res.json();
    
    const select = document.getElementById('categoria');
    cats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

async function cargarProductos() {
    let url = 'https://dummyjson.com/products?limit=10&skip=' + salto;
    
    if (busqueda) {
        url = `https://dummyjson.com/products/search?q=${busqueda}&limit=10&skip=${salto}`;
    }
    else if (categoriaActual) {
        url = `https://dummyjson.com/products/category/${categoriaActual}?limit=10&skip=${salto}`;
    }
    
    if (ordenActual) {
        const [campo, orden] = ordenActual.split('-');
        const separador = url.includes('?') ? '&' : '?';
        url += `${separador}sortBy=${campo}&order=${orden}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    
    total = data.total;
    mostrarProductos(data.products);
    actualizarPaginacion();
}

function mostrarProductos(productos) {
    const tabla = document.getElementById('tabla');
    tabla.innerHTML = '';
    
    productos.forEach(p => {
        tabla.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.thumbnail}" alt="${p.title}"></td>
                <td>${p.title}</td>
                <td>$${p.price}</td>
                <td>${p.category}</td>
                <td>
                    <button class="btn-editar" onclick="editar(${p.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminar(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function buscar() {
    busqueda = document.getElementById('buscar').value;
    categoriaActual = '';
    document.getElementById('categoria').value = '';
    salto = 0;
    cargarProductos();
}

function filtrarCategoria() {
    categoriaActual = document.getElementById('categoria').value;
    busqueda = '';
    document.getElementById('buscar').value = '';
    salto = 0;
    cargarProductos();
}

function ordenar() {
    ordenActual = document.getElementById('ordenar').value;
    salto = 0;
    cargarProductos();
}

function anterior() {
    if (salto >= 10) {
        salto -= 10;
        cargarProductos();
    }
}

function siguiente() {
    if (salto + 10 < total) {
        salto += 10;
        cargarProductos();
    }
}

function actualizarPaginacion() {
    const pagina = (salto / 10) + 1;
    const totalPaginas = Math.ceil(total / 10);
    document.getElementById('info').textContent = `Página ${pagina} de ${totalPaginas}`;
    
    document.getElementById('btnAnterior').disabled = salto === 0;
    document.getElementById('btnSiguiente').disabled = salto + 10 >= total;
}

async function editar(id) {
    const titulo = prompt('Nuevo título:');
    const precio = prompt('Nuevo precio:');
    
    if (titulo && precio) {
        const res = await fetch(`https://dummyjson.com/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titulo, price: parseFloat(precio) })
        });
        
        const data = await res.json();
        alert('Producto actualizado: ' + data.title);
        cargarProductos();
    }
}

async function eliminar(id) {
    if (confirm('¿Eliminar este producto?')) {
        await fetch(`https://dummyjson.com/products/${id}`, {
            method: 'DELETE'
        });
        
        alert('Producto eliminado');
        cargarProductos();
    }
}