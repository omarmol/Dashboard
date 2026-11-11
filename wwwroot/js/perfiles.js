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


