async function CargarGasKpi1Cumplimiento(nombreDOM, fechaStr) {

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

async function CargarOleKpi1Cumplimiento(nombreDOM, fechaStr) {

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

async function CargarPolKpi1Cumplimiento(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let indicador = objDOM.querySelector('.st-dot');
        let texto = objDOM.querySelector('.st-sub');

        let cumplimientoRecepciones = "";

        let resCumplimientoRecepciones = await fetch('api/pol/kpi-cumplimiento-recepciones?fecha=' + fechaStr + '');
        let dataOriginalCumplimientoRecepciones = await resCumplimientoRecepciones.json();

        cumplimientoRecepciones = "Recep. " + dataOriginalCumplimientoRecepciones.recepciones_mayor_a + "/" + dataOriginalCumplimientoRecepciones.total_recepciones;


        let cumplimientoEntregas = "";

        let resCumplimientoEntregas = await fetch('api/pol/kpi-cumplimiento-entregas?fecha=' + fechaStr + '');
        let dataOriginalCumplimientoEntregas = await resCumplimientoEntregas.json();

        cumplimientoEntregas = "Ent. " + dataOriginalCumplimientoEntregas.entregas_mayor_a + "/" + dataOriginalCumplimientoEntregas.total_entregas;

        texto.innerText = cumplimientoRecepciones + " · " + cumplimientoEntregas + " >= 100%";

        if (dataOriginalCumplimientoRecepciones.recepciones_mayor_a < dataOriginalCumplimientoRecepciones.total_recepciones 
            || dataOriginalCumplimientoEntregas.entregas_mayor_a < dataOriginalCumplimientoEntregas.total_entregas) {
            indicador.classList.add('warn');
            indicador.classList.remove('ok');
        } else {
            indicador.classList.remove('warn');
            indicador.classList.add('ok');
        }



    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
}


async function CargarOleKpi2EntregasCrudo(nombreDOM, fechaStr) {

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


async function CargarOleKpi2EntregasGlp(nombreDOM, fechaStr) {

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


async function CargarPolKpi2Cumplimiento(nombreDOM, fechaStr) {

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

        let resCumplimientoRecepciones = await fetch('api/pol/kpi-cumplimiento-recepciones?fecha=' + fechaStr + '');
        let dataOriginalCumplimientoRecepciones = await resCumplimientoRecepciones.json();

        cumplimientoRecepciones = "Recep. " + dataOriginalCumplimientoRecepciones.recepciones_mayor_a + "/" + dataOriginalCumplimientoRecepciones.total_recepciones;


        let cumplimientoEntregas = "";

        let resCumplimientoEntregas = await fetch('api/pol/kpi-cumplimiento-entregas?fecha=' + fechaStr + '');
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


async function CargarGasKpi3TransporteXEmpresa(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let tr_ejecutado = objDOM.querySelector('#tr-ejecutado');
        let tr_cumplimiento = objDOM.querySelector('#tr-cumplimiento');
        let tr_programado = objDOM.querySelector('#tr-programado');
        let tr_hoy = objDOM.querySelector('#tr-hoy');
        let ts_ejecutado = objDOM.querySelector('#ts-ejecutado');
        let ts_cumplimiento = objDOM.querySelector('#ts-cumplimiento');
        let ts_programado = objDOM.querySelector('#ts-programado');
        let ts_hoy = objDOM.querySelector('#ts-hoy');
        let gtb_ejecutado = objDOM.querySelector('#gtb-ejecutado');
        let gtb_cumplimiento = objDOM.querySelector('#gtb-cumplimiento');
        let gtb_programado = objDOM.querySelector('#gtb-programado');
        let gtb_hoy = objDOM.querySelector('#gtb-hoy');


        let res = await fetch('api/gas/transporte-empresa?fecha=' + fechaStr + '');
        let dataOriginal = await res.json();

        //console.log(dataOriginal);

        tr_ejecutado.innerText = '#N/D';
        tr_programado.innerText = '#N/D';
        tr_hoy.innerText = '#N/D';
        ts_ejecutado.innerText = '#N/D';
        ts_programado.innerText = '#N/D';
        ts_hoy.innerText = '#N/D';
        gtb_ejecutado.innerText = '#N/D';
        gtb_programado.innerText = '#N/D';
        gtb_hoy.innerText = '#N/D';

        dataOriginal.forEach(function (f) {

            if (f.sistema == 'YPFB TRANSPORTE S.A.'){
                tr_ejecutado.innerText = f.ejecutado;
                tr_programado.innerText = 'Prog: ' + f.programado;
                tr_hoy.innerText = 'Hoy: ' + f.hoy;

                if (f.cumplimiento > 0){
                    tr_cumplimiento.innerText = "▲ " + f.cumplimiento + '% vs. Prog.';
                    tr_cumplimiento.classList.add('up');
                    tr_cumplimiento.classList.remove('flat');
                } else if (f.cumplimiento < 0) {
                    tr_cumplimiento.innerText = "▼ " + f.cumplimiento + '% vs. Prog.';
                    tr_cumplimiento.classList.add('down');
                    tr_cumplimiento.classList.remove('flat');
                } else {
                    tr_cumplimiento.innerText = "Similar vs. Prog.";
                    tr_cumplimiento.classList.add('up');
                    tr_cumplimiento.classList.remove('flat');
                }

            }else if (f.sistema == 'YPFB TRANSIERRA S.A.'){
                ts_ejecutado.innerText = f.ejecutado;
                ts_programado.innerText = 'Prog: ' + f.programado;
                ts_hoy.innerText = 'Hoy: ' + f.hoy;
                if (f.cumplimiento > 0){
                    ts_cumplimiento.innerText = "▲ " + f.cumplimiento + '% vs. Prog.';
                    ts_cumplimiento.classList.add('up');
                    ts_cumplimiento.classList.remove('flat');
                } else if (f.cumplimiento < 0) {
                    ts_cumplimiento.innerText = "▼ " + f.cumplimiento + '% vs. Prog.';
                    ts_cumplimiento.classList.add('down');
                    ts_cumplimiento.classList.remove('flat');
                } else {
                    ts_cumplimiento.innerText = "Similar vs. Prog.";
                    ts_cumplimiento.classList.add('up');
                    ts_cumplimiento.classList.remove('flat');
                }
            }
            else if (f.sistema == 'GTB'){
                gtb_ejecutado.innerText = f.ejecutado;
                gtb_programado.innerText = 'Prog: ' + f.programado;
                gtb_hoy.innerText = 'Hoy: ' + f.hoy;
                if (f.cumplimiento > 0){
                    gtb_cumplimiento.innerText = "▲ " + f.cumplimiento + '% vs. Prog.';
                    gtb_cumplimiento.classList.add('up');
                    gtb_cumplimiento.classList.remove('flat');
                } else if (f.cumplimiento < 0) {
                    gtb_cumplimiento.innerText = "▼ " + f.cumplimiento + '% vs. Prog.';
                    gtb_cumplimiento.classList.add('down');
                    gtb_cumplimiento.classList.remove('flat');
                } else {
                    gtb_cumplimiento.innerText = "Similar vs. Prog.";
                    gtb_cumplimiento.classList.add('up');
                    gtb_cumplimiento.classList.remove('flat');
                }
            }
            else {
                console.warn("Sistema no reconocido: ", f.sistema);
            }

            
        });

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
}

async function CargarNovedades(nombreDOM, fechaStr, tipoLeyenda) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let contenido = objDOM.querySelector('.tm-label');

        //console.log(contenido);

        let res = await fetch('api/generic/leyendas?fecha=' + fechaStr + '&tipo_leyenda=' + tipoLeyenda);
        //console.log(res);
        //console.log(res.status);
        let dataOriginal = await res.json();

        //console.log(dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {
            let textoSeguro = document.createElement('span');
            contenido.innerHTML = dataOriginal.contenido
                .split(/<\/div\s*>|<\/?br\s*\/?>/gi)
                .map(linea => {
                    textoSeguro.textContent = linea;
                    return textoSeguro.innerHTML;
                })
                .join('<br>');

        } else {
            contenido.innerText = "Sin Datos";
        }

        

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
}

async function CargarEstadoPuerto(nombreDOM, fechaStr) {

    try {

        let objDOM = document.getElementById(nombreDOM);
        let contenido = objDOM.querySelector('.tm-label');

        //console.log(contenido);

        let res = await fetch('api/generic/leyendas?fecha=' + fechaStr + '&tipo_leyenda=estado_puerto');
        //console.log(res);
        //console.log(res.status);
        let dataOriginal = await res.json();

        //console.log(dataOriginal);

        if (dataOriginal.cantidad_datos > 0) {

            if (dataOriginal.contenido.includes("CERRADO")) {
                objDOM.classList.add("color-red");
                objDOM.classList.remove("color-green");
            } else {
                objDOM.classList.add("color-green");
                objDOM.classList.remove("color-red");
            }

            let textoSeguro = document.createElement('span');
            contenido.innerHTML = dataOriginal.contenido
                .split(/<\/div\s*>|<\/?br\s*\/?>/gi)
                .map(linea => {
                    textoSeguro.textContent = linea;
                    return textoSeguro.innerHTML;
                })
                .join('<br>');

        } else {
            contenido.innerText = "Sin Datos";
            objDOM.classList.add("color-green");
            objDOM.classList.remove("color-red");
        }

        

    }
    catch (error) {
        console.error("Ocurrió un error: ", error);
        alert("Ocurrió un error: " + error);
    }
}