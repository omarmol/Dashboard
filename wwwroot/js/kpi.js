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