async function CargarGasCumplimiento(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let indicador = objDOM.querySelector('.st-dot');
        let texto = objDOM.querySelector('.st-sub');

        let res = await fetch('api/gas/cumplimiento?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos > 0) {
            indicador.classList.toggle('warn', dataOriginal.cumplimiento < 100);
            indicador.classList.toggle('ok', dataOriginal.cumplimiento >= 100);
            texto.innerText = dataOriginal.cumplimiento + "% cumplimiento";
        } else {
            indicador.classList.remove('warn', 'ok');
            texto.innerText = "Sin datos";
        }

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
    // Ajustar mapa automáticamente al cambiar el tamaño del widget
    //window.addEventListener('resize', () => chartMapa.resize());
}

async function CargarOleCumplimiento(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let indicador = objDOM.querySelector('.st-dot');
        let texto = objDOM.querySelector('.st-sub');

        let res = await fetch('api/ole/cumplimiento?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        if (dataOriginal.cantidad_datos > 0) {
            indicador.classList.toggle('warn', dataOriginal.cumplimiento < 100);
            indicador.classList.toggle('ok', dataOriginal.cumplimiento >= 100);
            texto.innerText = dataOriginal.cumplimiento + "% cumplimiento";
        } else {
            indicador.classList.remove('warn', 'ok');
            texto.innerText = "Sin datos";
        }

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
    // Ajustar mapa automáticamente al cambiar el tamaño del widget
    //window.addEventListener('resize', () => chartMapa.resize());
}


async function CargarOleKpiEntregasCrudo(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let indicador = objDOM.querySelector('.kpi-value');
        let cumplimiento_hoy = objDOM.querySelector('.cumplimiento-hoy');
        let cumplimiento_ayer = objDOM.querySelector('.cumplimiento-ayer');

        let res = await fetch('api/ole/kpi-entregas-crudo?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        console.log(dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {
            indicador.innerText = dataOriginal.ejecutado_hoy.toLocaleString('es-BO');
            cumplimiento_hoy.innerText = "▲ " + dataOriginal.cumplimiento_hoy + "% vs. programado";
            cumplimiento_hoy.classList.toggle('up', dataOriginal.cumplimiento_hoy > 0);
            cumplimiento_hoy.classList.toggle('down', dataOriginal.cumplimiento_hoy <= 0);

            cumplimiento_ayer.innerText = "▲ " + dataOriginal.cumplimiento_ayer + "% vs. ayer";
            cumplimiento_ayer.classList.toggle('up', dataOriginal.cumplimiento_ayer > 0);
            cumplimiento_ayer.classList.toggle('down', dataOriginal.cumplimiento_ayer <= 0);
        } else {
            indicador.innerText = "Sin Datos";
            cumplimiento_hoy.innerText = "";
            cumplimiento_ayer.innerText = "";
        }

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
    // Ajustar mapa automáticamente al cambiar el tamaño del widget
    //window.addEventListener('resize', () => chartMapa.resize());
}