async function CargarGasKpiCumplimiento(nombreDOM, fechaStr) {

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

async function CargarOleKpiCumplimiento(nombreDOM, fechaStr) {

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

        //console.log(dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {
            indicador.innerText = dataOriginal.ejecutado_hoy.toLocaleString('es-BO');

            if (dataOriginal.cumplimiento_hoy < 0) {
                cumplimiento_hoy.innerText = "▼ " + dataOriginal.cumplimiento_hoy + "% vs. programado";
                cumplimiento_hoy.classList.add('down');
                cumplimiento_hoy.classList.remove('up');
            } 
            else if (dataOriginal.cumplimiento_hoy > 0) {
                cumplimiento_hoy.innerText = "▲ " + dataOriginal.cumplimiento_hoy + "% vs. programado";
                cumplimiento_hoy.classList.add('up');
                cumplimiento_hoy.classList.remove('down');
            }
            else if (dataOriginal.cumplimiento_hoy === 0) {
                cumplimiento_hoy.innerText = "100% cumplimiento vs. programado";
                cumplimiento_hoy.classList.add('up');
                cumplimiento_hoy.classList.remove('down');
            }


            if (dataOriginal.cumplimiento_ayer < 0) {
                cumplimiento_ayer.innerText = "▼ " + dataOriginal.cumplimiento_ayer + "% vs. ayer";
                cumplimiento_ayer.classList.add('down');
                cumplimiento_ayer.classList.remove('up');
            } 
            else if (dataOriginal.cumplimiento_ayer > 0) {
                cumplimiento_ayer.innerText = "▲ " + dataOriginal.cumplimiento_ayer + "% vs. ayer";
                cumplimiento_ayer.classList.add('up');
                cumplimiento_ayer.classList.remove('down');
            }
            else if (dataOriginal.cumplimiento_ayer === 0) {
                cumplimiento_ayer.innerText = "Similar vs. ayer";
                cumplimiento_ayer.classList.add('up');
                cumplimiento_ayer.classList.remove('down');
            }

           
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


async function CargarOleKpiEntregasGlp(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let indicador = objDOM.querySelector('.kpi-value');
        let cumplimiento_hoy = objDOM.querySelector('.cumplimiento-hoy');

        let res = await fetch('api/ole/kpi-entregas-glp?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        //console.log(dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {
            indicador.innerText = dataOriginal.ejecutado_hoy.toLocaleString('es-BO');

            if (dataOriginal.cumplimiento_hoy < 0) {
                cumplimiento_hoy.innerText = "▼ " + dataOriginal.cumplimiento_hoy + "% vs. programado";
                cumplimiento_hoy.classList.add('down');
                cumplimiento_hoy.classList.remove('up');
            } 
            else if (dataOriginal.cumplimiento_hoy > 0) {
                cumplimiento_hoy.innerText = "▲ " + dataOriginal.cumplimiento_hoy + "% vs. programado";
                cumplimiento_hoy.classList.add('up');
                cumplimiento_hoy.classList.remove('down');
            }
            else if (dataOriginal.cumplimiento_hoy === 0) {
                cumplimiento_hoy.innerText = "100% cumplimiento vs programado";
                cumplimiento_hoy.classList.add('up');
                cumplimiento_hoy.classList.remove('down');
            }

           
        } else {
            indicador.innerText = "Sin Datos";
            cumplimiento_hoy.innerText = "";
        }

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
   
}


async function CargarPolKpiCumplimiento(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let indicador = objDOM.querySelector('.kpi-value');
        let cumplimiento_recep_ent = objDOM.querySelector('.cumplimiento-recep-ent');
        let cumplimiento_ayer = objDOM.querySelector('.cumplimiento-ayer');

        let resCumplimiento = await fetch('api/pol/cumplimiento?fecha=' + fechaStr + '');
        let dataOriginalCumplimiento = await resCumplimiento.json();

        //console.log(dataOriginal);

        if (dataOriginalCumplimiento.cantidad_datos > 0) {
            indicador.innerText = dataOriginalCumplimiento.cumplimiento;

        } else {
            indicador.innerText = "Sin Datos";
        }

        let cumplimientoRecepciones = "";

        let resCumplimientoRecepciones = await fetch('api/pol/cumplimiento-recepciones?fecha=' + fechaStr + '');
        let dataOriginalCumplimientoRecepciones = await resCumplimientoRecepciones.json();

        cumplimientoRecepciones = "Recep. " + dataOriginalCumplimientoRecepciones.recepciones_mayor_a + "/" + dataOriginalCumplimientoRecepciones.total_recepciones;


        let cumplimientoEntregas = "";

        let resCumplimientoEntregas = await fetch('api/pol/cumplimiento-entregas?fecha=' + fechaStr + '');
        let dataOriginalCumplimientoEntregas = await resCumplimientoEntregas.json();

        cumplimientoEntregas = "Ent. " + dataOriginalCumplimientoEntregas.entregas_mayor_a + "/" + dataOriginalCumplimientoEntregas.total_entregas;

        cumplimiento_recep_ent.innerText = cumplimientoRecepciones + " · " + cumplimientoEntregas + " >= 100%";

        if (dataOriginalCumplimientoRecepciones.recepciones_mayor_a < dataOriginalCumplimientoRecepciones.total_recepciones 
            || dataOriginalCumplimientoEntregas.entregas_mayor_a < dataOriginalCumplimientoEntregas.total_entregas) {
            cumplimiento_recep_ent.classList.add('down');
            cumplimiento_recep_ent.classList.remove('up');
        } else {
            cumplimiento_recep_ent.classList.add('up');
            cumplimiento_recep_ent.classList.remove('down');
        }

        let resCumplimientoAyer = await fetch('api/pol/cumplimiento-ayer?fecha=' + fechaStr + '');
        let dataOriginalCumplimientoAyer = await resCumplimientoAyer.json();

        if (dataOriginalCumplimientoAyer.cumplimiento_ayer < 0) {
            cumplimiento_ayer.innerText = "▼ " + dataOriginalCumplimientoAyer.cumplimiento_ayer + "% vs. ayer";
            cumplimiento_ayer.classList.add('down');
            cumplimiento_ayer.classList.remove('up');
        } 
        else if (dataOriginalCumplimientoAyer.cumplimiento_ayer > 0) {
            cumplimiento_ayer.innerText = "▲ " + dataOriginalCumplimientoAyer.cumplimiento_ayer + "% vs. ayer";
            cumplimiento_ayer.classList.add('up');
            cumplimiento_ayer.classList.remove('down');
        }
        else if (dataOriginalCumplimientoAyer.cumplimiento_ayer === 0) {
            cumplimiento_ayer.innerText = "Similar vs. ayer";
            cumplimiento_ayer.classList.add('up');
            cumplimiento_ayer.classList.remove('down');
        }


    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
}