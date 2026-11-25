async function CargarPolRecepciones(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/pol/recepciones?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Programado', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.programado });
        series.push({ name: 'Ejecutado', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.ejecutado });
        series.push({ name: 'Hoy', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.hoy });


        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasVerticales(eChart, dataOriginal.poliducto, series, titulo, subTitulo, unidadMedida)
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

async function CargarPolEntregas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/pol/entregas?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ name: 'Programado', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.programado });
        series.push({ name: 'Ejecutado', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.ejecutado });
        series.push({ name: 'Hoy', type: 'bar', itemStyle: { borderRadius: [2, 2, 0, 0] }, data: dataOriginal.hoy });


        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasVerticales(eChart, dataOriginal.poliducto, series, titulo, subTitulo, unidadMedida)
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

async function CargarPolCumplimientoEntregas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/pol/cumplimiento-entregas?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({
            name: 'Cumplimiento',
            type: 'bar',
            itemStyle: {
                borderRadius: [2, 2, 0, 0],
                color: params => params.value >= 100 ? '#84be4d' : '#e00817'
            },
            data: dataOriginal.cumplimiento
        });

        if (dataOriginal.cantidad_datos > 0) {
            GraficarBarrasVerticales(eChart, dataOriginal.poliducto, series, titulo, subTitulo, unidadMedida)
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

async function CargarPolCapacidad(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

    try {
        let objDOM = document.getElementById(nombreDOM);
        let eChart = echarts.init(objDOM, tema);
        eChart.showLoading();

        let res = await fetch('api/pol/capacidad?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        let series = [];

        series.push({ 
            name: 'Porcentaje Uso', 
            type: 'bar', 
            itemStyle: {
                borderRadius: [2, 2, 0, 0],
                color: params => params.value >= 90 ? '#e00817': params.value >= 60 && params.value < 90 ? '#d1802e' : '#84be4d'
            },
            colorBy: 'data', 
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