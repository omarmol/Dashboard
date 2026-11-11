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

async function CargarGasTransitoResumen(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/transito-resumen?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        console.log("Data original: ", dataOriginal);

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

async function CargarGasUsoDiario(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/gas/capacidad?fecha=' + fechaStr + '');
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

        series.push({ name: 'Volumen', type: 'bar', colorBy: 'data', data: dataOriginal.ejecutado });

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

