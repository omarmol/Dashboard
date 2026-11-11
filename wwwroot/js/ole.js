async function CargarImagenOleaje(nombreDOM, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);

        const resImagen = await fetch('servicios/DatosImagenOleaje.ashx?fecha=' + fechaStr + '');
        const dataImagen = await resImagen.json();

        //const imgElement = document.getElementById('imagenExcel');
        //const lblSinImagen = document.getElementById('lblSinImagen');
        // console.log(dataImagen.formato);
        // console.log(objDOM);
        //console.log(dataImagen.imagenBase);

        if (dataImagen.imagen_base64) {
            // Construimos la Data URI con el formato y la cadena Base64
            //console.log('ingresa');
            objDOM.src = `data:${dataImagen.formato};base64,${dataImagen.imagen_base64}`;
            objDOM.style.display = 'block';
        } else {
            //lblSinImagen.style.display = 'inline';
        }
    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
}



async function CargarOleTanquesArica(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/ole/tanques-arica?fecha=' + fechaStr);
        let dataOriginal = await res.json();

        //console.log(dataOriginal.oleTanquesArica);
        //window.addEventListener('resize', () => chart.resize());
        ////console.log(serieLotes);

        GraficarTanques(eChart, dataOriginal.oleTanquesArica, titulo, subTitulo, unidadMedida);

        eChart.hideLoading();
        eChart.resize();
        CHARTS.push(eChart);


    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }

}

async function CargarOleDespachoCisternas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        
        let res = await fetch('api/ole/cisternas-arica?fecha=' + fechaStr);
        let dataOriginal = await res.json();

            dataOriginal.cisternas.forEach(cisterna => {
                cisterna.color = PRODUCTOS[cisterna.producto] ?? '#000000';
            });

        const contenedor = document.getElementById(nombreDOM);

        // Paleta de respaldo para tipos que no traigan color propio
        //const PALETA = ['#d97706', '#5b6b7b', '#6c4fd8', '#0a8091', '#c0392b', '#1e8449', '#b5338a'];

        // ====== DATOS DE PRUEBA ======
        // Agrega o quita objetos y las tarjetas se ajustan solas.
        /*let datos = [
            { id: 'do', nombre: 'Despacho DO', cisternas: 36, volumen: 7408.9, color: '#d97706' },
            { id: 'cr', nombre: 'Despacho CR', cisternas: 0, volumen: 0, color: '#5b6b7b' },
            { id: 'ia', nombre: 'Despacho I&A', cisternas: 0, volumen: 0, color: '#6c4fd8' },
        ];*/

        // 'de-DE' da 7.408,9 (punto de miles, coma decimal)
        const fmt = n => Number(n).toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        });

        // Camión SVG; el color de la cisterna se pasa por parámetro
        const camion = color => `
                    <svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <ellipse cx="60" cy="47" rx="48" ry="3" fill="rgba(0,0,0,.08)"/>
                        <rect x="4" y="30" width="112" height="6" rx="2" fill="#8a97a5"/>
                        <rect x="6" y="14" width="26" height="20" rx="3" fill="#e6ebf0" stroke="#1b2a3a" stroke-width="1"/>
                        <rect x="9" y="17" width="12" height="8" rx="1.5" fill="#bfe3ee"/>
                        <rect x="36" y="9" width="78" height="25" rx="12.5" fill="${color}" stroke="#1b2a3a" stroke-width="1"/>
                        <rect x="46" y="12" width="58" height="4" rx="2" fill="#fff" opacity=".3"/>
                        <line x1="60" y1="10" x2="60" y2="33" stroke="rgba(0,0,0,.25)"/>
                        <line x1="90" y1="10" x2="90" y2="33" stroke="rgba(0,0,0,.25)"/>
                        <g fill="#1f2d3d">
                        <circle cx="24" cy="38" r="6.5"/><circle cx="80" cy="38" r="6.5"/><circle cx="98" cy="38" r="6.5"/>
                        </g>
                        <g fill="#8a97a5">
                        <circle cx="24" cy="38" r="2.5"/><circle cx="80" cy="38" r="2.5"/><circle cx="98" cy="38" r="2.5"/>
                        </g>
                    </svg>`;

        // Crea la estructura de una tarjeta (solo una vez por tipo)
        function crearTarjeta(d, color) {
            const card = document.createElement('div');
            card.className = 'dc-card';
            card.dataset.id = d.producto;
            card.style.setProperty('--accent', color);
            card.innerHTML = `
                <div class="dc-truck">${camion(color)}</div>
                <div class="dc-label" data-f="nombre"></div>
                <div class="dc-count">
                <span class="num" data-f="cisternas">–</span>
                <span class="unit" data-f="unidad">cisternas</span>
                </div>
                <div class="dc-volume">Volumen: <b data-f="volumen">–</b> Bbl</div>`;
            return card;
        }

        // Sincroniza el DOM con el arreglo: crea, actualiza, reordena y elimina
        function renderizar(lista) {
            const existentes = new Map(
                [...contenedor.children].map(el => [el.dataset.id, el])
            );

            lista.forEach((d, i) => {
                const color = d.color;
                let card = existentes.get(d.producto);

                if (!card) card = crearTarjeta(d, color);   // tipo nuevo
                existentes.delete(d.producto);

                const set = (campo, texto) => {
                    const el = card.querySelector(`[data-f="${campo}"]`);
                    if (el.textContent !== String(texto)) el.textContent = texto;
                };

                set('nombre', 'Despacho ' + d.producto);
                set('cisternas', d.nro_cisternas);
                set('unidad', d.nro_cisternas === 1 ? 'cisterna' : 'cisternas');
                set('volumen', fmt(d.barriles));

                contenedor.appendChild(card);               // respeta el orden del arreglo
            });

            // Elimina tarjetas cuyo tipo ya no está en los datos
            existentes.forEach(el => el.remove());
        }


        renderizar(dataOriginal.cisternas);
        //setInterval(simular, 5000);                     // cambia valores cada 5 s

        // Útil en la consola para probar el crecimiento horizontal:
        // datos.push({ id: 'x1', nombre: 'Despacho X1', cisternas: 5, volumen: 980.3 }); renderizar(datos);
        //window.dcRenderizar = renderizar;               // para usarla después con datos reales

        


    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }

}


async function CargarOleResumenMensualCisternas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {
    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/ole/mensual-cisternas?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let [dia, mes, anio] = fechaStr.split("-").map(Number);
        let fecha = new Date(anio, mes - 1, dia);

        let diasDelMes = new Date(anio, mes, 0).getDate();
        let dias = Array.from({ length: diasDelMes }, function (_, i) { return String(i + 1); });

        // 2) Agrupar por sistema: sistema -> arreglo de valores por día
        let porProducto = {};
        dataOriginal.forEach(function (f) {
            if (!porProducto[f.producto]) {
                porProducto[f.producto] = new Array(diasDelMes).fill(null);
            }
            porProducto[f.producto][f.dia - 1] = f.barriles;
        });

        // 3) Construir las series de ECharts
        let series = Object.keys(porProducto).sort().map(function (nombre) {
            return {
                name: nombre,
                type: 'line',
                symbolSize: 5,
                symbol: 'circle',
                data: porProducto[nombre]
            };
        });

        //if (dataOriginal.cantidad_datos > 0) {
        GraficarLineasHorizontales(eChart, dias, series, titulo, subTitulo, unidadMedida);
        //} else {
        //    GraficarSinDatos(eChart, titulo, subTitulo);
        //}

        eChart.hideLoading();
        //eChart.resize();
        CHARTS.push(eChart);

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }

}

async function CargarOleEntregasCrudo(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/ole/entregas-crudo?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Programado', type: 'bar', data: dataOriginal.programado });
        series.push({ name: 'Ejecutado', type: 'bar', data: dataOriginal.ejecutado });
        series.push({ name: 'Hoy', type: 'bar', data: dataOriginal.ejecutado });


        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasVerticales(eChart, dataOriginal.campo, series, titulo, subTitulo, unidadMedida)
        } else {
            GraficarSinDatos(eChart, titulo, subTitulo);
        }



        eChart.hideLoading();
        //eChart.resize();
        CHARTS.push(eChart);

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }



}

async function CargarOleEntregasGlp(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/ole/entregas-glp?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Programado', type: 'bar', data: dataOriginal.programado });
        series.push({ name: 'Ejecutado', type: 'bar', data: dataOriginal.ejecutado });
        series.push({ name: 'Hoy', type: 'bar', data: dataOriginal.ejecutado });


        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasVerticales(eChart, dataOriginal.campo, series, titulo, subTitulo, unidadMedida)
        } else {
            GraficarSinDatos(eChart, titulo, subTitulo);
        }



        eChart.hideLoading();
        //eChart.resize();
        CHARTS.push(eChart);

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }



}

async function CargarOleCapacidad(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/ole/capacidad?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Porcentaje Uso', type: 'bar', colorBy: 'data', data: dataOriginal.porcentaje_uso });

        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasHorizontales(eChart, dataOriginal.sistema, series, titulo, subTitulo, unidadMedida)
        } else {
            GraficarSinDatos(eChart, titulo, subTitulo);
        }

        eChart.hideLoading();
        //eChart.resize();
        CHARTS.push(eChart);

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }



}

        

