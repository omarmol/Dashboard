        let GRID_PRINCIPAL;
        let TEMA_DASHBOARD = '';
        let FECHA_DASHBOARD = '';
        let CHARTS = [];
        var TEMAS = {};


        var chartGasRecepciones;
        var chartGasEntregasDuctos;
        var chartGasEntregasPlantas;
        var chartGasConsumoXDepartamento;
        var chartGasCapacidad;
        var chartGasTransporteXSistema;
        var chartLinePack;

        const PRODUCTOS = {
            CR: '#6b4226',
            GLP: '#1e6cd2',
            GE: '#2e9e4f',
            KE: '#29b6d8',
            DO: '#e0b400',
            LS: '#66748a',
        };

        // FUNCIONES TEMAS

        function cargarTema(nombre, url) {
            return fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (json) {
                    TEMAS[nombre] = json;
                    echarts.registerTheme(nombre, json);
                });
        }

        function colorDelTema(nombre, indice) {
            var paleta = TEMAS[nombre] && TEMAS[nombre].color;
            if (!paleta || !paleta.length) return null;
            return paleta[indice % paleta.length];
        }

        async function exportarDashboardCompletoPDF() {
            const { jsPDF } = window.jspdf;

            const dashboardElement = document.getElementById('grid-principal');
            const headerElement = document.getElementById('principal'); // Tu div de cabecera

            if (!dashboardElement) {
                alert('No se encontró el contenedor principal del dashboard.');
                return;
            }


            try {
                const scale = 2; // Alta resolución para textos y gráficos
                const bgBody = getComputedStyle(document.body).backgroundColor;

                // 1. Capturar el div "cabecera" de forma independiente
                let headerImgData = null;
                let headerHeightMm = 0;
                const gap = 5; // Espacio en milímetros entre la cabecera y el inicio del dashboard en cada página

                if (headerElement) {
                    const headerCanvas = await html2canvas(headerElement, {
                        scale: scale,
                        useCORS: true,
                        logging: false,
                        backgroundColor: bgBody
                    });
                    headerImgData = headerCanvas.toDataURL('image/png');

                    // Calcular la altura proporcional de la cabecera en milímetros para el PDF
                    // (Nota: al dividir por `headerCanvas.width`, la escala de `scale` se anula matemáticamente)
                    const pdfPageWidth = 297; // Ancho A4 Landscape
                    const margin = 10;
                    const printableWidth = pdfPageWidth - (margin * 2);
                    headerHeightMm = (headerCanvas.height * printableWidth) / headerCanvas.width;
                }

                // 2. Capturar todo el dashboard principal
                const canvas = await html2canvas(dashboardElement, {
                    scale: scale,
                    useCORS: true,
                    logging: false,
                    backgroundColor: bgBody
                });

                // 3. Inicializar jsPDF en formato A4 Horizontal (Landscape)
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth();   // 297 mm
                const pageHeight = pdf.internal.pageSize.getHeight(); // 210 mm
                const margin = 10;                                    // 10 mm de margen

                const printableWidth = pageWidth - (margin * 2);
                const printableHeight = pageHeight - (margin * 2);

                // 4. Calcular el espacio vertical REAL disponible para los gráficos descontando la cabecera y el margen
                const availableDashboardHeightMm = printableHeight - headerHeightMm - (headerHeightMm > 0 ? gap : 0);

                // Altura en píxeles de canvas equivalente a ese espacio disponible por página
                const canvasPageHeight = canvas.width * (availableDashboardHeightMm / printableWidth);

                // 5. Mapear las coordenadas de los widgets para el corte inteligente
                const items = dashboardElement.querySelectorAll('.grid-stack-item');
                const cutPoints = [];
                const parentRect = dashboardElement.getBoundingClientRect();

                items.forEach(item => {
                    const rect = item.getBoundingClientRect();
                    const top = (rect.top - parentRect.top) * scale;
                    const bottom = (rect.bottom - parentRect.top) * scale;
                    cutPoints.push({ top, bottom });
                });

                let currentY = 0;
                let pageNum = 1;

                // 6. Bucle de paginación e impresión por página
                while (currentY < canvas.height) {
                    let targetY = currentY + canvasPageHeight;

                    if (targetY < canvas.height) {
                        let ajustado = false;
                        // Verificar si el corte atraviesa un widget por la mitad
                        for (let item of cutPoints) {
                            if (item.top > currentY && item.top < targetY && item.bottom > targetY) {
                                targetY = item.top; // Ajustar corte antes de cortar el widget
                                ajustado = true;
                                break;
                            }
                        }
                        if (!ajustado && targetY <= currentY) {
                            targetY = currentY + canvasPageHeight;
                        }
                    } else {
                        targetY = canvas.height;
                    }

                    // Agregar página nueva a partir de la segunda iteración
                    if (pageNum > 1) {
                        pdf.addPage();
                    }

                    // A. DIBUJAR LA CABECERA EN ESTA PÁGINA
                    let contentStartY = margin;
                    if (headerElement && headerImgData) {
                        pdf.addImage(headerImgData, 'PNG', margin, margin, printableWidth, headerHeightMm);
                        contentStartY = margin + headerHeightMm + gap; // Desplazar el contenido hacia abajo de la cabecera
                    }

                    // B. RECORTAR Y DIBUJAR LA PORCIÓN DEL DASHBOARD CORRESPONDIENTE A ESTA PÁGINA
                    const sliceHeight = targetY - currentY;
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = sliceHeight;
                    const ctx = tempCanvas.getContext('2d');

                    ctx.drawImage(
                        canvas,
                        0, currentY, canvas.width, sliceHeight,
                        0, 0, canvas.width, sliceHeight
                    );

                    const sliceImgData = tempCanvas.toDataURL('image/png');
                    const sliceHeightMm = (sliceHeight * printableWidth) / canvas.width;

                    pdf.addImage(sliceImgData, 'PNG', margin, contentStartY, printableWidth, sliceHeightMm);

                    // C. Pie de página opcional (ej: número de página)
                    pdf.setFontSize(8);
                    pdf.setTextColor(140);
                    pdf.text(`Página ${pageNum}`, pageWidth - margin - 15, pageHeight - 5);

                    currentY = targetY;
                    pageNum++;
                }

                // 7. Descargar el PDF resultante
                const fecha = new Date().toISOString().slice(0, 10);
                pdf.save(`Dashboard_Con_Cabecera_${fecha}.pdf`);

            } catch (error) {
                console.error('Error al generar PDF con cabecera:', error);
                alert('Ocurrió un error al generar el PDF.');
            } finally {
                //if (btnExport) btnExport.innerHTML = textoOriginal;
            }
        }


        function InicializarBarraDias() {

            try {
                const contenedorDias = document.getElementById('barraDias');
                const titulo_dashboard = document.getElementById('titulo_dashboard');
                const mes_actual = document.getElementById('mes_actual');
                const fechaActual = new Date();
                const anio = fechaActual.getFullYear();
                const mes = fechaActual.getMonth() -1;
                const hoy = fechaActual.getDate();

                
                // const anio = 2026;
                // const mes = 10;
                // const hoy = 15;

                // Calcular cuántos días tiene el mes actual
                const diasEnElMes = new Date(anio, mes + 1, 0).getDate();

                // Función para formatear el día a YYYY-MM-DD
                const formatearFecha = (dia) => {
                    const m = String(mes + 1).padStart(2, '0');
                    const d = String(dia).padStart(2, '0');
                    return `${anio}-${m}-${d}`;
                    //return `${d}-${m}-${anio}`;
                };

                // Función para formatear el día a YYYY-MM-DD
                const formatearFecha2 = (dia) => {
                    const m = String(mes + 1).padStart(2, '0');
                    const d = String(dia).padStart(2, '0');
                    //return `${anio}-${m}-${d}`;
                    return `${d}.${m}.${anio}`;
                };

                const nombreMes = (mes) => {

                    switch (mes) {
                        case 1:
                            return 'Enero';
                        case 2:
                            return 'Febrero';
                        case 3:
                            return 'Marzo';
                        case 4:
                            return 'Abril';
                        case 5:
                            return 'Mayo';
                        case 6:
                            return 'Junio';
                        case 7:
                            return 'Julio';
                        case 8:
                            return 'Agosto';
                        case 9:
                            return 'Septiembre';
                        case 10:
                            return 'Octubre';
                        case 11:
                            return 'Noviembre';
                        case 12:
                            return 'Diciembre';
                        default:
                    }

                    return 'Mes';
                };

                // Construir los botones
                for (let dia = 1; dia <= diasEnElMes; dia++) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-dia';
                    btn.textContent = dia;

                    // Marcar el día de hoy como activo por defecto
                    if (dia === hoy) {
                        btn.classList.add('activo');
                    }

                    btn.addEventListener('click', function () {
                        // Quitar clase activo de todos los botones
                        document.querySelectorAll('.btn-dia').forEach(b => b.classList.remove('activo'));

                        // Agregar clase activo al botón presionado
                        this.classList.add('activo');

                        titulo_dashboard.innerText = 'Reporte Diario ' + formatearFecha2(dia);

                        // Obtener fecha en formato YYYY-MM-DD y actualizar gráfico
                        //const fechaFiltro = formatearFecha(dia);

                        FECHA_DASHBOARD = formatearFecha(dia);
                        CargarGraficos(FECHA_DASHBOARD);
                    });

                    contenedorDias.appendChild(btn);
                }

                // console.log(hoy);
                // console.log(mes);
                // console.log(anio);

                titulo_dashboard.innerText = 'Reporte Diario ' + formatearFecha2(hoy);
                mes_actual.innerText = nombreMes(mes + 1) + ' ' + anio;

                

                FECHA_DASHBOARD = formatearFecha(hoy);
                CargarGraficos(FECHA_DASHBOARD);
            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
            // Cargar el gráfico por primera vez con el día de hoy
            //cargarGraficoTorta(formatearFecha(hoy));
        }

        // Cargar datos y renderizar el Mapa de Bolivia
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

        //async function CargarGasTransporteXSistema(fechaStr) {
        //    //var chartGasEntregasDuctos = echarts.init(document.getElementById('chartGasEntregasDuctos'));

        //    try {

        //        chartGasTransporteXSistema = echarts.init(document.getElementById('chartGasTransporteXSistema'), 'customized');
        //        chartGasTransporteXSistema.showLoading();

        //        const res = await fetch('servicios/GasSistemasTransporte.ashx?fecha=' + fechaStr + '');
        //        const data = await res.json();

        //        const option = {
        //            title: {
        //                text: 'Transporte por Sistemas (MMPCD)',
        //                subtext: 'Ejecutado, mayor a menor'
        //            },
        //            tooltip: {
        //                trigger: 'axis',
        //                axisPointer: { type: 'shadow' }
        //            },
        //            grid: {
        //                top: '15%',
        //                left: '3%',
        //                right: '15%',
        //                bottom: '3%',
        //                containLabel: true
        //            },
        //            yAxis: {
        //                type: 'category',
        //                data: data.sistema
        //            },
        //            xAxis: {
        //                type: 'value',
        //                name: 'Volumen'
        //            },
        //            series: [
        //                {
        //                    name: 'Transporte',
        //                    type: 'bar',
        //                    data: data.ejecutado,
        //                    itemStyle: { color: '#b6d634' },
        //                    label: {
        //                        show: true,
        //                        formatter: '{c}'
        //                    },
        //                }
        //            ]
        //        };

        //        chartGasTransporteXSistema.hideLoading();
        //        chartGasTransporteXSistema.setOption(option);
        //    }
        //    catch (error) {
        //        console.error("Ocurrió un error: ", error);
        //        alert("Ocurrió un error: " + error);
        //    }

        //}

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

        function GraficarSankeyTransito(objetoEcharts, data, titulo, subTitulo, unidadMedida) {

            try {
                const COLOR_AR = '#2563eb', COLOR_BR = '#1b9a6c';
                const claves = [
                    { k: 'programado', txt: 'Programado' },
                    { k: 'ejecutado', txt: 'Ejecutado' },
                    { k: 'hoy', txt: 'Programado Hoy' }
                ];
                let claveActiva = 'ejecutado';

                const fmt = n => n.toLocaleString('es-BO', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' ' + unidadMedida;
                const grad = (a, b) => new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: a }, { offset: 1, color: b }]);
                // Bandera de Bolivia en el nodo central
                const banderaBolivia = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#d52b1e' }, { offset: 0.33, color: '#d52b1e' },
                    { offset: 0.33, color: '#f9e300' }, { offset: 0.66, color: '#f9e300' },
                    { offset: 0.66, color: '#007934' }, { offset: 1, color: '#007934' }
                ]);

                // Suma por proveedor y por cliente conservando el orden de aparición
                const agrupa = (nombres, valores) => {
                    const mapa = new Map();
                    nombres.forEach((n, i) => mapa.set(n, (mapa.get(n) || 0) + (valores[i] || 0)));
                    return mapa;
                };

                const construye = clave => {
                    const ar = agrupa(data.proveedor, data[clave]);
                    const br = agrupa(data.cliente, data[clave]);

                    const lbl = (pos, align) => ({
                        position: pos, align: align,
                        formatter: p => '{n|' + p.data.etiqueta + '}\n{v|' + fmt(p.value) + '}',
                        rich: {
                            n: { fontWeight: 'bold', fontSize: 11, lineHeight: 15 },
                            v: { fontSize: 11, lineHeight: 15, opacity: 0.7 }
                        }
                    });

                    const nodes = [
                        ...[...ar.keys()].map(n => ({ name: 'ar|' + n, etiqueta: n, depth: 0, itemStyle: { color: COLOR_AR }, label: lbl('left', 'right') })),
                        {
                            name: 'BOLIVIA', etiqueta: 'BOLIVIA', depth: 1,
                            itemStyle: { color: banderaBolivia, borderColor: '#1e293b', borderWidth: 1 },
                            label: {
                                position: 'top', align: 'center', distance: 6,
                                formatter: p => '{c|BOLIVIA}\n{c|' + fmt(p.value) + '}',
                                rich: { c: { fontWeight: 'bold', fontSize: 11, lineHeight: 14 } }
                            }
                        },
                        ...[...br.keys()].map(n => ({ name: 'br|' + n, etiqueta: n, depth: 2, itemStyle: { color: COLOR_BR }, label: lbl('right', 'left') }))
                    ];

                    const links = [
                        ...[...ar].map(([n, v]) => ({ source: 'ar|' + n, target: 'BOLIVIA', value: v, lineStyle: { color: grad('#b4c6f6', '#a9b5c4') } })),
                        ...[...br].map(([n, v]) => ({ source: 'BOLIVIA', target: 'br|' + n, value: v, lineStyle: { color: grad('#a9b6bd', '#b1d9ca') } }))
                    ];
                    return { nodes, links };
                };

                const botones = () => claves.map((c, i) => ({
                    type: 'group',
                    right: 20 + (claves.length - 1 - i) * 112,
                    top: 12,
                    onclick: () => dibuja(c.k),
                    children: [
                        {
                            type: 'rect', shape: { width: 104, height: 26, r: 8 },
                            style: {
                                fill: c.k === claveActiva ? '#2563eb' : 'rgba(0,0,0,0)',
                                stroke: c.k === claveActiva ? '#2563eb' : '#94a3b8'
                            }
                        },
                        {
                            type: 'text', left: 'center', top: 6,
                            style: {
                                text: c.txt, fontSize: 11, fontWeight: 'bold',
                                fill: c.k === claveActiva ? '#fff' : '#64748b'
                            }
                        }
                    ]
                }));

                const paises = () => [['ARGENTINA', '10%'], ['BOLIVIA', '50%'], ['BRASIL', '90%']].map(([txt, x]) => ({
                    type: 'text', left: x, top: 56,
                    style: { text: txt, fontSize: 11, fontWeight: 'bold', fill: '#64748b', textAlign: 'center' }
                }));

                const dibuja = clave => {
                    claveActiva = clave;
                    const { nodes, links } = construye(clave);
                    objetoEcharts.setOption({
                        animationDuration: 500,
                        title: { text: titulo, subtext: subTitulo, left: 'left' },
                        tooltip: {
                            trigger: 'item',
                            formatter: p => p.dataType === 'edge'
                                ? p.data.source.replace(/^(ar|br)\|/, '') + ' → ' + p.data.target.replace(/^(ar|br)\|/, '') + '<br/><b>' + fmt(p.data.value) + '</b>'
                                : '<b>' + p.data.etiqueta + '</b><br/>' + fmt(p.value)
                        },
                        graphic: [...botones(), ...paises()],
                        series: [{
                            type: 'sankey',
                            left: 230, right: 230, top: 90, bottom: 20,
                            nodeWidth: 16,
                            nodeGap: 12,
                            layoutIterations: 0,
                            draggable: false,
                            nodeAlign: 'justify',
                            emphasis: { focus: 'adjacency' },
                            lineStyle: { curveness: 0.5, opacity: 1 },
                            data: nodes,
                            links: links
                        }]
                    }, true);
                };

                dibuja(claveActiva);

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

        async function CargarPerfil(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr, ducto) {

            try {
                let objDOM = document.getElementById(nombreDOM);
                let eChart = echarts.init(objDOM, tema);
                eChart.showLoading();

                let res = await fetch('api/perfil/general?fecha=' + fechaStr + '&ducto=' + ducto);
                let dataOriginal = await res.json();

                dataOriginal.lotePerfiles.forEach(lote => {
                    lote.color = PRODUCTOS[lote.producto] ?? '#000000';
                });

                //console.log(dataOriginal.lotePerfiles);

                //console.log(dataOriginal);

                const anclas = dataOriginal.ductoPerfiles.map(p => [p.km, p.elevacion]);

                //console.log(anclas);

                /*const perfil = [];
                for (let km = 0; km <= 400; km += 0.5) {
                    let i = anclas.findIndex(a => a[0] >= km); if (i < 1) i = 1;
                    const [k0, h0] = anclas[i - 1], [k1, h1] = anclas[i];
                    perfil.push([km, Math.round(h0 + (h1 - h0) * (km - k0) / (k1 - k0) + Math.sin(km * 1.7) * 25)]);
                }*/
                const perfil = anclas;

                //console.log(perfil);

                // UNA sola serie de línea con todo el perfil. El color lo decide el visualMap.
                const seriePerfil = {
                    name: 'Perfil',
                    type: 'line',
                    xAxisIndex: 0, yAxisIndex: 0,
                    showSymbol: false,
                    data: perfil,
                    lineStyle: { width: 2 },
                    areaStyle: { opacity: 0.45 }
                };

                const productosUnicos = [...new Set(dataOriginal.lotePerfiles.map(lote => lote.producto))];
                //console.log(productosUnicos);
                // Series vacías solo para que la leyenda muestre GE y GLP con su color
                const serieLeyenda = productosUnicos.map(p => ({
                    name: p,
                    type: 'line',
                    data: [],
                    itemStyle: {
                        color: dataOriginal.lotePerfiles.find(l => l.producto === p).color
                    }
                }));
                //console.log(serieLeyenda);


                const estaciones = dataOriginal.ductoPerfiles.filter(dp => dp.descripcionPunto !== "");
                // Líneas verticales de las estaciones con etiqueta rotada
                const serieEstaciones = {
                    type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: [], silent: true,
                    markLine: {
                        symbol: ['none', 'none'], animation: false,
                        lineStyle: { type: 'dashed', color: '#d9a066', width: 1 },
                        data: estaciones.map(e => ({
                            xAxis: e.km,
                            label: {
                                formatter: e.descripcionPunto + ' · ' + e.km.toFixed(2).replace(/\.?0+$/, '') + ' km',
                                position: 'end', rotate: e.vertical ? 90 : 45,
                                align: 'left', verticalAlign: 'middle',
                                color: '#c77a1e', fontWeight: 600, fontSize: 12
                            }
                        }))
                    }
                };
                //console.log(serieEstaciones);

                // Barra inferior de lotes (rectángulos con el nombre y el rango debajo)
                const serieLotes = {
                    type: 'custom', xAxisIndex: 1, yAxisIndex: 1, silent: true, z: 3,
                    data: dataOriginal.lotePerfiles.map((l, i) => [l.ini, l.fin, i]),
                    encode: { x: [0, 1] },
                    renderItem: (params, api) => {
                        const l = dataOriginal.lotePerfiles[api.value(2)], cs = params.coordSys;
                        const x0 = Math.max(api.coord([api.value(0), 0])[0], cs.x);
                        const x1 = Math.min(api.coord([api.value(1), 0])[0], cs.x + cs.width);
                        if (x1 <= x0) return;
                        return {
                            type: 'group',
                            children: [
                                {
                                    type: 'rect', shape: { x: x0, y: cs.y, width: x1 - x0, height: cs.height, r: 4 },
                                    style: { fill: l.color },
                                    textContent: { style: { text: l.lote, fill: '#fff', fontWeight: 600, fontSize: 12 } },
                                    textConfig: { position: 'inside' }
                                },
                                {
                                    type: 'text', style: {
                                        text: l.producto, x: (x0 + x1) / 2, y: cs.y + cs.height + 30,
                                        align: 'center', verticalAlign: 'middle', fill: '#0f2540', fontSize: 11, fontWeight: 600
                                    }
                                }
                            ]
                        };
                    }
                };

                const visualMap = {
                    type: 'piecewise',
                    show: false,                 // cámbialo a true para ver los lotes como leyenda
                    dimension: 0,
                    seriesIndex: 0,
                    pieces: dataOriginal.lotePerfiles.map((l, i) => ({
                        gte: l.ini,
                        [i === dataOriginal.lotePerfiles.length - 1 ? 'lte' : 'lt']: l.fin,   // el último incluye el km final
                        color: l.color,
                        label: l.lote
                    })),
                    outOfRange: { color: '#999' }
                };

                const legend = {
                    orient: 'horizontal',
                    top: 20,
                    data: productosUnicos, selectedMode: false,
                    icon: 'roundRect', itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 }
                };

                const tooltip = {
                    trigger: 'axis', axisPointer: { type: 'line' },
                    formatter: ps => {
                        const p = ps.find(x => x.seriesName === 'Perfil');
                        if (!p) return '';
                        const km = p.data[0];
                        const l = dataOriginal.lotePerfiles.find(x => km >= x.ini && km <= x.fin);
                        return 'Km ' + km.toFixed(2) + '<br/>Altura: <b>' + p.data[1] + ' m</b>' +
                            (l ? '<br/>Lote: ' + l.lote : '');
                    }
                };


                //console.log(serieLotes);

                GraficarPerfil(eChart, dataOriginal.ductoPerfiles.longitud_ducto, seriePerfil, serieLeyenda, serieEstaciones, serieLotes, visualMap, legend, tooltip, titulo, subTitulo, unidadMedida);

                eChart.hideLoading();

                CHARTS.push(eChart);


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

        async function CargarDespachoCisternas(nombreDOM, tema, titulo, subTitulo, unidadMedida, fechaStr) {

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


        function GraficarTorta(objetoEcharts, datos, titulo, subTitulo, unidadMedida) {

            try {

                const option = {
                    title: [
                        {
                            text: titulo,
                            subtext: subTitulo,
                            left: 'left'
                        },
                        {
                            text: unidadMedida,
                            right: 7,
                            top: 3,
                            textStyle: {
                                fontSize: 12,
                                fontWeight: 'normal'
                                //color: '#3a7d8c'          // color del texto (ajústalo al de tu imagen)
                            },
                            backgroundColor: '#ffffff',
                            borderColor: '#d9d9d9',
                            borderWidth: 1,
                            borderRadius: 14,           // mayor valor = más redondeado
                            padding: [4, 14],
                            shadowColor: 'rgba(0, 0, 0, 0.08)',
                            shadowBlur: 4,
                            shadowOffsetY: 1
                        }
                    ],

                    tooltip: {
                        trigger: 'item',
                        formatter: '<b>{b}</b>: {d}% ({c} ' + unidadMedida + ')'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 15,
                        top: 60
                    },
                    series: [
                        {
                            name: 'Volumen',
                            type: 'pie',
                            radius: ['0%', '60%'],        // más pequeña para dejar espacio a las etiquetas
                            center: ['68%', '54%'],       // más a la derecha
                            label: {
                                formatter: '{d}%',
                                width: 120,
                                overflow: 'break',          // salta de línea en vez de cortar
                                fontSize: 12
                            },
                            labelLine: { length: 10, length2: 8 },
                            avoidLabelOverlap: true,
                            data: datos,
                            /*emphasis: {
                                scale: true,
                                scaleSize: 12,
                                itemStyle: {
                                    shadowBlur: 30,
                                    shadowOffsetY: 12,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },*/
                            itemStyle: {
                                borderColor: '#ffffff',
                                borderWidth: 2,
                                borderRadius: 6,
                                shadowBlur: 18,
                                shadowOffsetX: 4,
                                shadowOffsetY: 8,
                                shadowColor: 'rgba(0, 0, 0, 0.35)'
                            },
                            /*radius: ['0%', '68%'],          
                            center: ['50%', '48%'],
                            startAngle: 90,
                            avoidLabelOverlap: true*/
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };

                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }

        function GraficarBarrasVerticales(objetoEcharts, datos, series, titulo, subTitulo, unidadMedida) {

            try {

                const option = {
                    title: {
                        text: titulo,
                        subtext: subTitulo
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' }
                    },
                    legend: {
                        right: '5%',
                        top: '5%'
                    },
                    grid: {
                        top: '25%',
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: datos,
                        axisLabel: {
                            interval: 0,
                            rotate: 30
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Volumen'
                    },
                    series: series
                };

                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }

        function GraficarBarrasHorizontales(objetoEcharts, datos, series, titulo, subTitulo, unidadMedida) {

            try {

                const option = {
                    title: {
                        text: titulo,
                        subtext: subTitulo
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' }
                    },
                    legend: {
                        right: '5%',
                        top: '5%'
                    },
                    grid: {
                        top: '15%',
                        left: '3%',
                        right: '15%',
                        bottom: '3%',
                        containLabel: true
                    },
                    yAxis: {
                        type: 'category',
                        data: datos
                    },
                    xAxis: {
                        type: 'value',
                        name: 'Volumen'
                    },
                    series: series
                };

                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }

        function GraficarMapa(objetoEcharts, datos, nombreMapa, titulo, subTitulo, unidadMedida) {

            try {

                // Calcular min y max dinámicos para el gradiente de color
                const valores = datos.map(d => d.value);
                const maxVal = valores.length > 0 ? Math.max(...valores) : 100;
                const minVal = valores.length > 0 ? Math.min(...valores) : 0;

                const option = {
                    title: {
                        text: titulo,
                        subtext: subTitulo
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}:<br/>Volumen: <b>{c}</b>'
                    },
                    visualMap: {
                        show: false,
                        min: minVal,
                        max: maxVal,
                        left: 'left',
                        bottom: 'bottom',
                        text: ['Alto', 'Bajo'],
                        calculable: true,
                        inRange: {
                            color: [
                                '#fff',
                                colorDelTema(TEMA_DASHBOARD, 0)
                            ]
                        }
                    },
                    series: [
                        {
                            name: 'Volumen',
                            type: 'map',
                            map: nombreMapa,
                            roam: true, // Permite Zoom y Arrastrar con el mouse
                            aspectScale: 1,
                            layoutCenter: ['50%', '50%'],
                            layoutSize: '70%',

                            emphasis: {
                                label: { show: true },
                                itemStyle: { areaColor: '#ffe87c' }
                            },
                            label: {
                                show: true,
                                // Muestra el nombre del Departamento y su Volumen directamente sobre el mapa
                                //formatter: '{b}\n{c}',
                                formatter: '{b}',
                                fontSize: 10,
                                //fontWeight: 'bold',
                                color: '#222'
                            },
                            data: datos
                        }
                    ]
                };

                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }

        function GraficarLineasHorizontales(objetoEcharts, datos, series, titulo, subTitulo, unidadMedida) {

            try {

                const option = {
                    title: {
                        text: titulo,
                        subtext: subTitulo
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: series.map(function (s) { return s.name; })
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '15%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: datos
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: series
                };

                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }

        function GraficarSinDatos(objetoEcharts, titulo, subTitulo) {

            try {
                const option = {
                    title: {
                        text: titulo,
                        subtext: '📭 No hay información disponible',
                        left: 'center',
                        top: 'center',
                        textStyle: {
                            fontSize: 14,
                            fontWeight: 'normal',
                            // El color se adaptará automáticamente o puedes usar un gris neutral
                            //color: '#94a3b8'
                        }
                    },
                    // Ocultar ejes para que no luzca roto
                    xAxis: { show: false },
                    yAxis: { show: false },
                    series: []
                };


                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }


        function GraficarPerfil(objetoEcharts, longitud_ducto, seriesPerfil, seriesLeyenda, seriesEstaciones, seriesLotes, visualMap, legend, tooltip, titulo, subTitulo, unidadMedida) {

            try {

                const option = {
                    title: [
                        {
                            text: titulo,
                            subtext: subTitulo,
                            left: 'left'
                        },
                        {
                            text: unidadMedida,
                            right: 7,
                            top: 3,
                            textStyle: {
                                fontSize: 12,
                                fontWeight: 'normal'
                                //color: '#3a7d8c'          // color del texto (ajústalo al de tu imagen)
                            },
                            backgroundColor: '#ffffff',
                            borderColor: '#d9d9d9',
                            borderWidth: 1,
                            borderRadius: 14,           // mayor valor = más redondeado
                            padding: [4, 14],
                            shadowColor: 'rgba(0, 0, 0, 0.08)',
                            shadowBlur: 4,
                            shadowOffsetY: 1
                        }
                    ],
                    animation: false,
                    legend: legend,

                    // Una pieza por lote, generadas desde el arreglo "lotes".
                    // dimension 0 = km. seriesIndex 0 = solo afecta a la serie del perfil.
                    visualMap: visualMap,
                    tooltip: tooltip,
                    grid: [
                        { left: 55, right: 25, top: 190, height: 170 },
                        { left: 55, right: 25, top: 380, height: 28 }
                    ],
                    xAxis: [
                        {
                            gridIndex: 0, type: 'value', min: 0, max: longitud_ducto,
                            axisLabel: { show: false }, axisTick: { show: false }, axisLine: { show: false },
                            splitLine: { show: true, lineStyle: { type: 'dashed', color: '#e7eaee' } }
                        },
                        {
                            gridIndex: 1, type: 'value', min: 0, max: longitud_ducto, interval: 10,
                            axisLabel: { fontSize: 10, color: '#5b6b7d', hideOverlap: true },
                            axisLine: { show: false }, axisTick: { length: 3 }, splitLine: { show: false }
                        }
                    ],
                    yAxis: [
                        {
                            gridIndex: 0, type: 'value', min: 0, max: 4500, interval: 500,
                            axisLabel: { fontSize: 11, color: '#5b6b7d' },
                            splitLine: { lineStyle: { type: 'dashed', color: '#e7eaee' } }
                        },
                        { gridIndex: 1, type: 'value', min: 0, max: 1, show: false }
                    ],
                    dataZoom: [{ type: 'inside', xAxisIndex: [0, 1], filterMode: 'none' }],

                    // IMPORTANTE: seriePerfil debe ir primero (seriesIndex 0 del visualMap)
                    series: [seriesPerfil, seriesEstaciones, seriesLotes, ...seriesLeyenda]
                };

                objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }


        function GraficarTanques(objetoEcharts, datos, titulo, subTitulo, unidadMedida) {

            try {
                // Colores por producto (luz / medio / sombra para dar efecto cilíndrico)
                const paleta = {
                    CR: { luz: '#9aa4b5', medio: '#6b778c', sombra: '#4f5a6e' },
                    DO: { luz: '#ffd36b', medio: '#f0b323', sombra: '#d8960a' }
                };
                const COLOR_AGUA = '#3aa8c1', COLOR_ESPACIO = '#d5dbe6';

                const FUENTE = 'Consolas, Menlo, "Courier New", monospace';
                const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                const capMax = Math.max(...datos.map(t => t.capacidad));

                /* ================== 2. DIBUJO DE UN TANQUE ================== */
                // Gradiente horizontal que simula el volumen del cilindro
                const grad = p => new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: p.luz },
                    { offset: 0.18, color: p.medio },
                    { offset: 0.65, color: p.sombra },
                    { offset: 1, color: p.medio }
                ]);
                const gradVidrio = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#d3dbe8' },
                    { offset: 0.5, color: '#f1f4f9' },
                    { offset: 1, color: '#d3dbe8' }
                ]);

                function dibujaTanque(t, cx, yb, h, w) {
                    const rx = w / 2, ry = 5;
                    const yBot = yb - ry, yTop = yBot - h, x0 = cx - rx;
                    const pal = paleta[t.producto] || paleta.CR;
                    const hLiq = h * Math.min(t.sal_alm / t.capacidad, 1), yLiq = yBot - hLiq;
                    const hAgua = t.agua_libre > 0 ? Math.max(2, h * t.agua_libre / t.capacidad) : 0;
                    const ell = (cy, fill, stroke) => ({
                        type: 'ellipse', shape: { cx, cy, rx, ry },
                        style: { fill, stroke: stroke || 'none', lineWidth: 1 }
                    });
                    const hijos = [
                        // vidrio (parte vacía)
                        { type: 'rect', shape: { x: x0, y: yTop, width: w, height: h }, style: { fill: gradVidrio } },
                        ell(yBot, '#d3dbe8', '#b9c3d3'),
                        // líquido (saldo)
                        { type: 'rect', shape: { x: x0, y: yLiq, width: w, height: hLiq }, style: { fill: grad(pal) } },
                        ell(yBot, pal.medio),
                        // agua libre en el fondo
                        ...(hAgua ? [
                            {
                                type: 'rect', shape: { x: x0, y: yBot - hAgua, width: w, height: hAgua },
                                style: { fill: COLOR_AGUA }
                            },
                            ell(yBot, COLOR_AGUA)
                        ] : []),
                        // superficie del líquido
                        ell(yLiq, pal.luz),
                        // brillo lateral y borde del vidrio
                        { type: 'rect', shape: { x: x0 + 6, y: yTop, width: 6, height: h }, style: { fill: 'rgba(255,255,255,0.3)' } },
                        { type: 'line', shape: { x1: x0, y1: yTop, x2: x0, y2: yBot }, style: { stroke: '#b9c3d3' } },
                        { type: 'line', shape: { x1: x0 + w, y1: yTop, x2: x0 + w, y2: yBot }, style: { stroke: '#b9c3d3' } },
                        // borde superior (doble elipse, como en la imagen)
                        { type: 'ellipse', shape: { cx, cy: yTop - 2, rx, ry }, style: { fill: 'none', stroke: '#c5cedc' } },
                        ell(yTop, 'rgba(255,255,255,0.55)', '#b9c3d3')
                    ];
                    return hijos;
                }

                // Nombre + mini tabla (Espacio / Saldo / Agua)
                function dibujaTabla(t, cx, yb, ancho) {
                    const pal = paleta[t.producto] || paleta.CR;
                    const x0 = cx - ancho / 2, x1 = cx + ancho / 2;
                    const filas = [
                        { txt: 'Espacio', val: t.esp_disp, color: COLOR_ESPACIO },
                        { txt: 'Saldo', val: t.sal_alm, color: pal.medio },
                        { txt: 'Agua', val: t.agua_libre, color: COLOR_AGUA }
                    ];
                    const hijos = [{
                        type: 'text', style: {
                            text: t.tanque, x: cx, y: yb + 24, align: 'center',
                            verticalAlign: 'middle', fill: '#6b7585', font: '14px ' + FUENTE
                        }
                    }];
                    filas.forEach((f, j) => {
                        const y = yb + 52 + j * 19;
                        if (j > 0) hijos.push({ type: 'line', shape: { x1: x0, y1: y - 9.5, x2: x1, y2: y - 9.5 }, style: { stroke: '#e3e7ee' } });
                        hijos.push(
                            { type: 'circle', shape: { cx: x0 + 5, cy: y, r: 4.5 }, style: { fill: f.color } },
                            { type: 'text', style: { text: f.txt, x: x0 + 16, y, verticalAlign: 'middle', fill: '#3b4a5c', font: '12px ' + FUENTE } },
                            { type: 'text', style: { text: miles(f.val), x: x1, y, align: 'right', verticalAlign: 'middle', fill: '#0f2540', font: '12px ' + FUENTE } }
                        );
                    });
                    return hijos;
                }

                objetoEcharts.setOption({
                    animation: false,
                    tooltip: {
                        trigger: 'item',
                        formatter: p => {
                            const t = datos[p.dataIndex];
                            return '<b>' + t.tanque + '</b><br/>Capacidad: ' + miles(t.capacidad) +
                                '<br/>Espacio: ' + miles(t.esp_disp) + '<br/>Saldo: ' + miles(t.sal_alm) +
                                '<br/>Agua: ' + miles(t.agua_libre) +
                                '<br/>Ocupación: <b>' + (t.sal_alm / t.capacidad * 100).toFixed(1) + ' %</b>';
                        }
                    },
                    grid: { left: 50, right: 20, top: 50, height: 135 },
                    xAxis: { type: 'category', data: datos.map(t => t.tanque), show: false },
                    yAxis: { type: 'value', min: 0, max: capMax, show: false },
                    series: [{
                        type: 'custom',
                        data: datos.map((t, i) => [i, t.capacidad]),
                        encode: { x: 0, y: 1 },
                        renderItem: (params, api) => {
                            const t = datos[params.dataIndex], cs = params.coordSys;
                            const banda = api.size([1, 0])[0];
                            const cx = api.coord([params.dataIndex, 0])[0];
                            const yb = cs.y + cs.height;                         // línea base de los tanques
                            const h = Math.max(30, cs.height * t.capacidad / capMax);  // alto proporcional a la capacidad
                            const w = Math.min(80, banda * 0.6);
                            return {
                                type: 'group', children: [
                                    ...dibujaTanque(t, cx, yb, h, w),
                                    ...dibujaTabla(t, cx, yb, Math.min(150, banda - 16))
                                ]
                            };
                        }
                    }]
                });

                //objetoEcharts.setOption(option);

            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }
        }

        function CargarGraficos(fechaStr) {

            CHARTS.forEach((localChart, indice) => {
                if (localChart && !localChart.isDisposed()) {
                    localChart.dispose();
                }
            });

            CHARTS.length = 0;

            CargarGasEntregasPlantas('chartGasEntregasPlantas',
                TEMA_DASHBOARD,
                'Proceso y Consumo Plantas',
                'Participación Ejecutada por Planta', 'MMpc', fechaStr);

            CargarGasConsumoTermoelectricas('chartGasConsumoXTermoelectrica',
                TEMA_DASHBOARD,
                'Consumo Termoelectricas',
                'Por planta, ejecutado', 'MMpc', fechaStr);

            CargarGasExportacionMercadoInterno('chartGasEntregasDuctos',
                TEMA_DASHBOARD,
                'Exportación / Mercado Interno',
                'Por Mercado', 'MMpc', fechaStr);

            CargarGasTransitoResumen('chartGasTransitoResumen',
                TEMA_DASHBOARD,
                'Flujo Argentina → Bolivia → Brasil',
                'Ancho del flujo proporcional al volumen', 'MMmcd', fechaStr);

            CargarGasUsoDiario('chartGasCapacidad',
                TEMA_DASHBOARD,
                '% Uso Diario - Sistemas de Gas',
                'Capacidad utilizada por sistema', 'MMpc', fechaStr);

            CargarGasRecepcionesXCargador('chartGasRecepciones',
                TEMA_DASHBOARD,
                'Recepciones por Cargador',
                '', 'MMpc', fechaStr);

            CargarGasTransporteXSistema('chartGasTransporteXSistema',
                TEMA_DASHBOARD,
                'Transporte por Sistemas (MMPCD)',
                'Ejecutado, mayor a menor', 'MMpcd', fechaStr);

            chartGasParticipacionXCargador
            CargarGasParticipacionXCargador('chartGasParticipacionXCargador',
                TEMA_DASHBOARD,
                'Participación por Cargador',
                '% ejecutado, por empresa', 'MMpcd', fechaStr);


            CargarGasConsumoXDepartamento('chartGasConsumoXDepartamento',
                TEMA_DASHBOARD,
                'Volumen por Departamento',
                'Bolivia', 'MMpcd', fechaStr);

            CargarGasTransportadoMensual('chartGasTransportadoMensual',
                TEMA_DASHBOARD,
                'Gas Transportado - Evolución Mensual',
                '', 'MMpcd', fechaStr);

            CargarPerfil('chartOSSA1',
                TEMA_DASHBOARD,
                'OSSA-1',
                'Posición real (Km) por lote/interfase, sobre perfil de elevación', 'Km', fechaStr, 'OSSA-1');

            CargarPerfil('chartPVT',
                TEMA_DASHBOARD,
                'PVT',
                'Posición real (Km) por lote/interfase, sobre perfil de elevación', 'Km', fechaStr, 'PVT');

            CargarPerfil('chartPCOLP2',
                TEMA_DASHBOARD,
                'PCOLP-2',
                'Posición real (Km) por lote/interfase, sobre perfil de elevación', 'Km', fechaStr, 'PCOLP-2');

            CargarOleTanquesArica('chartOleTanquesArica',
                TEMA_DASHBOARD,
                'Tanques de Almacenaje',
                '', 'MMpcd', fechaStr);

            CargarDespachoCisternas('dcCards',
                TEMA_DASHBOARD,
                'Despacho de Cisternas',
                '', 'MMpcd', fechaStr);

            //chartOleResumenMensualCisternas
            CargarOleResumenMensualCisternas('chartOleResumenMensualCisternas',
                TEMA_DASHBOARD,
                'Resumen Mensual - Cisternas',
                'Evolución Mensual', 'Bbl', fechaStr);

            // //CargarGasTransporteXSistema(fechaStr);
            // //imgOleaje
            // CargarImagenOleaje('imgOleaje', fechaStr);


            GRID_PRINCIPAL.on('resizestop', function () {
                CHARTS.forEach((localChart, indice) => {
                    localChart.resize();
                });
            });
            window.addEventListener('resize', function () {
                CHARTS.forEach((localChart, indice) => {
                    localChart.resize();
                });
            });
        }



        document.addEventListener("DOMContentLoaded", async function () {

            const configGlobal = {
                margin: 3,
                cellHeight: '40px',
                animate: true
            };

            GRID_PRINCIPAL = GridStack.init(configGlobal, '#grid-principal');


            try {

                // 1) Restaurar layout
                restaurarLayout();

                // Guardar automáticamente cada vez que el usuario mueva o cambie de tamaño
                GRID_PRINCIPAL.on('change', function () {
                    guardarLayout();
                });


                Promise.all([
                    cargarTema('Bolivia', 'data/temas/bolivia.json'),
                    cargarTema('Santa Cruz', 'data/temas/santa-cruz.json'),
                    cargarTema('Default', 'data/temas/customized.json'),
                    cargarTema('Tema 2', 'data/temas/vintage.json'),
                    cargarTema('YPFBTR Claro', 'data/temas/ypfb-light.json'),
                    cargarTema('YPFBTR Oscuro', 'data/temas/ypfb-dark.json')
                ]).then(function () {

                    TEMA_DASHBOARD = localStorage.getItem('tema');


                    if (TEMA_DASHBOARD == null || TEMAS[TEMA_DASHBOARD] == null) {
                        TEMA_DASHBOARD = 'YPFBTR Claro';
                        localStorage.setItem('tema', TEMA_DASHBOARD);
                    }

                    //var inicial = Object.keys(temas)[0];   // o el tema guardado del usuario
                    crearSelectorTemas('selectorTemas', TEMA_DASHBOARD);
                    aplicarTema(TEMA_DASHBOARD);
                    InicializarBarraDias();

                });



            } catch (error) {
                console.error("Ocurrió un error: ", error);
                alert("Ocurrió un error: " + error);
            }


        });

        function restaurarApariencia() {
            localStorage.removeItem('layoutGrid');
            localStorage.removeItem('tema')
            location.reload();

        }

        function guardarLayout() {
            // save(false) = solo posiciones/tamaños (sin contenido HTML)
            var layout = GRID_PRINCIPAL.save(false);
            localStorage.setItem('layoutGrid', JSON.stringify(layout));
        }

        function restaurarLayout() {
            var json = localStorage.getItem('layoutGrid');
            if (!json) return;

            try {
                GRID_PRINCIPAL.load(JSON.parse(json), false);   // false = no crear ni eliminar widgets

            } catch (e) {
                console.warn('Layout guardado inválido', e);
            }
        }


        function aplicarTema(nombreTema) {
            // ... reinicializar gráfico como arriba ...

            document.documentElement.style.setProperty(
                '--tema-background-color', TEMAS[nombreTema].backgroundColor
            );
            document.documentElement.style.setProperty(
                '--tema-color-1', TEMAS[nombreTema].color[0]
            );
            document.documentElement.style.setProperty(
                '--tema-color-10', TEMAS[nombreTema].color[9]
            );
            document.documentElement.style.setProperty(
                '--tema-title-color', TEMAS[nombreTema].title.textStyle.color
            );
            document.documentElement.style.setProperty(
                '--tema-subtitle-color', TEMAS[nombreTema].title.subtextStyle.color
            );
        }

        function crearSelectorTemas(contenedorId, temaInicial) {
            var contenedor = document.getElementById(contenedorId);
            contenedor.innerHTML = '';

            Object.keys(TEMAS).sort().forEach(function (nombre) {
                var id = 'radioTema_' + nombre;

                var radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'temaEcharts';
                radio.id = id;
                radio.value = nombre;
                radio.checked = (nombre === temaInicial);

                var label = document.createElement('label');
                label.htmlFor = id;
                label.textContent = ' ' + nombre + ' ';

                var div = document.createElement('div');
                div.appendChild(radio);
                div.appendChild(label);
                contenedor.appendChild(div);
            });

            // Un solo listener para todo el grupo
            contenedor.onchange = function (e) {
                if (e.target && e.target.name === 'temaEcharts') {
                    TEMA_DASHBOARD = e.target.value;
                    localStorage.setItem('tema', TEMA_DASHBOARD);
                    aplicarTema(TEMA_DASHBOARD);
                    CargarGraficos(FECHA_DASHBOARD);
                    setMenu(false);
                }
            };
        }


        // ===== Menú flotante =====
        const pestana = document.getElementById("pestanaMenu");
        const menu = document.getElementById("menuFlotante");

        function setMenu(abierto) {
            menu.classList.toggle("abierto", abierto);
            pestana.setAttribute("aria-expanded", abierto);
            pestana.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
        }

        pestana.addEventListener("click", () => setMenu(!menu.classList.contains("abierto")));
        menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
        document.addEventListener("click", e => {
            if (!menu.contains(e.target) && !pestana.contains(e.target)) setMenu(false);
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && menu.classList.contains("abierto")) {
                setMenu(false);
                pestana.focus();
            }
        });
