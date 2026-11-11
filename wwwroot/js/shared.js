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
                const mes = fechaActual.getMonth();
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
        
        function CargarGraficos(fechaStr) {

            CHARTS.forEach((localChart, indice) => {
                if (localChart && !localChart.isDisposed()) {
                    localChart.dispose();
                }
            });

            CHARTS.length = 0;

            // GAS
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

            // OLE
            CargarOleTanquesArica('chartOleTanquesArica',
                TEMA_DASHBOARD,
                'Tanques de Almacenaje',
                '', 'MMpcd', fechaStr);

            CargarOleDespachoCisternas('dcCards',
                TEMA_DASHBOARD,
                'Despacho de Cisternas',
                '', 'MMpcd', fechaStr);

            CargarOleResumenMensualCisternas('chartOleResumenMensualCisternas',
                TEMA_DASHBOARD,
                'Resumen Mensual - Cisternas',
                'Evolución Mensual', 'Bbl', fechaStr);
            
            CargarOleEntregasCrudo('chartOleEntregasCrudo',
                TEMA_DASHBOARD,
                'Entregas Crudo',
                'RGV-OSSA 1 y 2, RGEB y total', 'MMm3', fechaStr);

            CargarOleEntregasGlp('chartOleEntregasGlp',
                TEMA_DASHBOARD,
                'Entregas GLP',
                'Chorety, RGV, Palmasola 1-2 y total', 'MMm3', fechaStr);

            CargarOleCapacidad('chartOleCapacidad',
                TEMA_DASHBOARD,
                '% Uso Diario - Sistemas Oleoductos',
                'Capacidad utilizada', 'MMm3', fechaStr);

            // PERFILES
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

            

            // //CargarGasTransporteXSistema(fechaStr);
            // //imgOleaje
            //CargarImagenOleaje('imgOleaje', fechaStr);


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
