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