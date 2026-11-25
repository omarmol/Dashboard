async function CargarGasConsumoXDepartamento(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {


        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let nombreMapa = 'Bolivia';
        let rutaMapa = 'data/bolivia.json';

        const resGeo = await fetch(rutaMapa);
        const geoJson = await resGeo.json();
        echarts.registerMap(nombreMapa, geoJson);

        let res = await fetch('api/gas/consumo-ciudad?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos > 0) {
            //GraficarBarrasVerticales(eChart, dataOriginal.campo, series, titulo, subTitulo, unidadMedida);
            GraficarMapa(eChart, dataOriginal.lista, nombreMapa, titulo, subTitulo, unidadMedida);
        } else {
            GraficarSinDatos(eChart, titulo, subTitulo);
        }


        eChart.hideLoading();
        CHARTS.push(eChart);
    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
    // Ajustar mapa automáticamente al cambiar el tamaño del widget
    //window.addEventListener('resize', () => chartMapa.resize());
}


async function CargarGasConsumoTermoelectricas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/consumo-termoelectricas?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos > 0) {
            GraficarTorta(eChart, dataOriginal.lista, titulo, subTitulo, unidadMedida)
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

async function CargarGasEntregasPlantas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/entregas-plantas?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();


        const dataFormateada = dataOriginal.campo.map((nombreCampo, index) => {
            return {
                name: nombreCampo,
                value: dataOriginal.ejecutado[index] // Cambia a .programado[index] si prefieres graficar eso
            };
        });

        if (dataOriginal.cantidad_datos > 0) {
            GraficarTorta(eChart, dataFormateada, titulo, subTitulo, unidadMedida);
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

async function CargarGasTransportadoMensual(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transportado-mensual?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let [dia, mes, anio] = fechaStr.split("-").map(Number);
        let fecha = new Date(anio, mes - 1, dia);

        let diasDelMes = new Date(anio, mes, 0).getDate();
        let dias = Array.from({ length: diasDelMes }, function (_, i) { return String(i + 1); });

        // 2) Agrupar por sistema: sistema -> arreglo de valores por día
        let porCampo = {};
        dataOriginal.forEach(function (f) {
            if (!porCampo[f.campo]) {
                porCampo[f.campo] = new Array(diasDelMes).fill(null);
            }
            porCampo[f.campo][f.dia - 1] = f.ejecutado;
        });

        // 3) Construir las series de ECharts
        let series = Object.keys(porCampo).sort().map(function (nombre) {
            return {
                name: nombre,
                type: 'line',
                symbolSize: 5,
                symbol: 'circle',
                data: porCampo[nombre]
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

async function CargarGasExportacionMercadoInterno(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/entregas-ductos?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Programado', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.programado });
        series.push({ name: 'Ejecutado', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.ejecutado });
        series.push({ name: 'Hoy', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.ejecutado });


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

async function CargarGasTransitoResumen(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        //console.log("Data original: ", dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {
            GraficarSankeyTransito(eChart, dataOriginal, titulo, subTitulo, unidadMedida);
        } else {
            GraficarSinDatos(eChart, titulo, subTitulo);
        }

        eChart.hideLoading();
        CHARTS.push(eChart);

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }

}

async function CargarGasDetalleProveedorCliente(nombreDOM, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos <= 0) {
            objDOM.innerHTML = '<div class="dpc-vacio">Sin datos</div>';
            return;
        }

        const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const num = v => Number(v).toLocaleString('es-BO', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        const pct = v => Number(v).toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

        let filas = '';
        for (let i = 0; i < dataOriginal.cantidad_datos; i++) {
            const cliente = dataOriginal.cliente[i];
            const participacion = dataOriginal.porcentaje_participacion[i];
            const ancho = Math.max(0, Math.min(100, participacion));

            filas += '<tr>' +
                '<td><span class="dpc-punto prov"></span>' + esc(dataOriginal.proveedor[i]) + '</td>' +
                '<td>' + (cliente ? '<span class="dpc-punto cli"></span>' + esc(cliente) : '<span class="dpc-sin">— sin despacho —</span>') + '</td>' +
                '<td><div class="dpc-part"><div class="dpc-barra"><div style="width:' + ancho + '%"></div></div><span>' + pct(participacion) + '</span></div></td>' +
                '<td class="num">' + num(dataOriginal.programado[i]) + '</td>' +
                '<td class="num">' + num(dataOriginal.ejecutado[i]) + '</td>' +
                '<td class="num">' + num(dataOriginal.hoy[i]) + '</td>' +
                '<td class="num">' + num(dataOriginal.entrega_mutun[i]) + '</td>' +
                '</tr>';
        }

        objDOM.innerHTML =
            '<table class="dpc-tabla"><thead><tr>' +
            '<th>Proveedor</th><th>Cliente</th><th>% Particip.</th>' +
            '<th class="num">Programado</th><th class="num">Ejecutado</th><th class="num">Prog. Hoy</th><th class="num">Entrega Mutún</th>' +
            '</tr></thead><tbody>' + filas + '</tbody></table>';
    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }

}

async function CargarGasUsoDiario(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/capacidad?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ 
            name: 'Porcentaje Uso', 
            type: 'bar', 
            itemStyle: {
                borderRadius: [2, 2, 0, 0],
                color: params => params.value >= 90 ? '#e00817': params.value >= 60 && params.value < 90 ? '#d1802e' : '#84be4d'
            },
            // colorBy: 'data', 
            data: dataOriginal.porcentaje_uso });

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

async function CargarGasRecepcionesXCargador(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/recepciones?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Programado', type: 'bar', data: dataOriginal.programado });
        series.push({ name: 'Ejecutado', type: 'bar', data: dataOriginal.ejecutado });
        series.push({ name: 'Hoy', type: 'bar', data: dataOriginal.hoy });

        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasHorizontales(eChart, dataOriginal.campo, series, titulo, subTitulo, unidadMedida);
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

async function CargarGasTransporteXSistema(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transporte-sistema?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ 
            name: 'Volumen', 
            type: 'bar', 
            itemStyle: {
                borderRadius: [2, 2, 0, 0]
            },
            colorBy: 'data', 
            data: dataOriginal.ejecutado });



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

async function CargarGasParticipacionXCargador(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/participacion-cargador?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        //console.log(dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {
            GraficarTorta(eChart, dataOriginal.lista, titulo, subTitulo, unidadMedida)
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


async function CargarGasVolumenEjecutadoXProveedor(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ 
            name: 'Volumen', 
            type: 'bar', 
            itemStyle: {
                borderRadius: [2, 2, 0, 0]
            },
            colorBy: 'data', 
            data: dataOriginal.ejecutado });



        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasHorizontales(eChart, dataOriginal.proveedor, series, titulo, subTitulo, unidadMedida)
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

async function CargarGasVolumenEjecutadoXCliente(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ 
            name: 'Volumen', 
            type: 'bar', 
            itemStyle: {
                borderRadius: [2, 2, 0, 0]
            },
            colorBy: 'data', 
            data: dataOriginal.ejecutado });



        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasHorizontales(eChart, dataOriginal.cliente, series, titulo, subTitulo, unidadMedida)
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

async function CargarGasParticipacionXProveedor(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos > 0) {
            GraficarDonut(eChart, dataOriginal.lista_proveedores, titulo, subTitulo, unidadMedida)
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

async function CargarGasParticipacionXCliente(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos > 0) {
            GraficarDonut(eChart, dataOriginal.lista_clientes, titulo, subTitulo, unidadMedida)
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
