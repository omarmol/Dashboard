        // Ajusta las rutas si los .ashx están en otra carpeta
        const SERVICIOS = {
            dia: "api/cargar-datos/cargar-excel",
            mes: "servicios/CargarDatosMensual.ashx"
        };

        const fecha = document.getElementById("fecha");
        const btn = document.getElementById("btnCargar");
        const btnTexto = document.getElementById("btnTexto");
        const resultado = document.getElementById("resultado");
        const archivo = document.getElementById("archivo");
        const zonaArchivo = document.getElementById("zonaArchivo");
        const nombreArchivo = document.getElementById("nombreArchivo");
        const dlg = document.getElementById("dlgAdvertencia");
        const dlgMensaje = document.getElementById("dlgMensaje");

        // Fecha de hoy por defecto (en hora local, formato yyyy-MM-dd)
        const hoy = new Date();
        fecha.value = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

        function mostrar(tipo, titulo, detalle) {
            resultado.className = tipo;
            resultado.innerHTML = "";
            const t = document.createElement("strong");
            t.textContent = titulo;
            resultado.appendChild(t);
            if (detalle) resultado.appendChild(document.createTextNode(detalle));
        }

        function setCargando(on) {
            btn.disabled = on;
            btn.classList.toggle("loading", on);
            btnTexto.textContent = on ? "Cargando…" : "Cargar datos";
        }

        // Convierte el valor del control (yyyy-MM-dd) a dd-MM-yyyy
        function fechaParaServicio() {
            const [y, m, d] = fecha.value.split("-");
            //return `${d}-${m}-${y}`;
            return `${y}-${m}-${d}`;
        }

        archivo.addEventListener("change", () => {
            const f = archivo.files[0];
            nombreArchivo.textContent = f ? f.name : "Ningún archivo seleccionado";
            zonaArchivo.classList.toggle("tiene", !!f);
        });

        // Nombre del archivo elegido (solo para mostrarlo en los mensajes)
        function nombreDelArchivo() {
            return archivo.files[0].name;
        }

        function modoSeleccionado() {
            //return document.querySelector('input[name="modo"]:checked').value;
            return "dia";
        }

        function mensajeAdvertencia(modo) {
            const [y, m, d] = fecha.value.split("-").map(Number);
            const f = new Date(y, m - 1, d);
            if (modo === "mes") {
                const mes = f.toLocaleDateString("es", { month: "long", year: "numeric" });
                return `Se cargarán los datos de todo el mes de ${mes}. El proceso puede tardar varios minutos.`;
            }
            const dia = f.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
            return `Se cargarán los datos del ${dia}.<br/>`;
        }

        function pedirConfirmacion(modo) {
            return new Promise(resolve => {
                dlgMensaje.innerHTML = `${mensajeAdvertencia(modo)} Archivo: ${nombreDelArchivo()}.`;
                const cerrar = ok => { dlg.close(); resolve(ok); };
                document.getElementById("dlgContinuar").onclick = () => cerrar(true);
                document.getElementById("dlgCancelar").onclick = () => cerrar(false);
                dlg.oncancel = () => resolve(false); // tecla Esc
                dlg.showModal();
            });
        }

        async function cargarDatos() {
            if (!fecha.value) {
                mostrar("err", "Falta la fecha", "Selecciona una fecha antes de cargar los datos.");
                fecha.focus();
                return;
            }

            if (!archivo.files.length) {
                mostrar("err", "Falta el archivo", "Selecciona un archivo de Excel antes de cargar los datos.");
                archivo.focus();
                return;
            }
            if (!/\.(xlsx|xlsm|xls)$/i.test(archivo.files[0].name)) {
                mostrar("err", "Archivo no válido", "El archivo debe ser de Excel (.xls, .xlsx o .xlsm).");
                return;
            }

            const modo = modoSeleccionado();
            if (!(await pedirConfirmacion(modo))) return;

            setCargando(true);
            mostrar("", "Subiendo y procesando el archivo…", modo === "mes" ? "La carga mensual puede tardar varios minutos." : "Esto puede tardar unos segundos.");

            try {
                // Se envía por POST (multipart/form-data): el archivo viaja junto con la fecha
                const datos = new FormData();
                datos.append("fecha", fechaParaServicio());
                datos.append("archivo", archivo.files[0], archivo.files[0].name);

                console.log(SERVICIOS[modo]);

                const resp = await fetch(SERVICIOS[modo], { method: "POST", body: datos });
                const texto = await resp.text();

                console.log(texto);

                let data;
                try {
                    data = JSON.parse(texto);
                    console.log(data);
                } catch {
                    // El servidor no devolvió JSON válido (p. ej. error HTTP o mensaje con comillas sin escapar)
                    mostrar("err", "Respuesta inesperada del servicio", texto.slice(0, 300));
                    return;
                }

                if (data.exito) {
                    mostrar("ok", "Carga completada", mensajeExito(modo));
                } else {
                    mostrar("err", "No se pudo completar la carga", data.mensaje || "El servicio no indicó el motivo.");
                }
            } catch (e) {
                mostrar("err", "No se pudo conectar con el servicio", e.message);
            } finally {
                setCargando(false);
            }
        }

        function mensajeExito(modo) {
            if (modo === "mes") {
                const [y, m, d] = fecha.value.split("-").map(Number);
                const mes = new Date(y, m - 1, d).toLocaleDateString("es", { month: "long", year: "numeric" });
                return `Los datos de ${mes} se cargaron correctamente.`;
            }
            return `Los datos del ${fechaParaServicio()} se cargaron correctamente.`;
        }

        //// ===== Tema claro / oscuro =====
        //const radiosTema = document.querySelectorAll('input[name="tema"]');
        //const sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)");

        //function temaActual() {
        //    return document.documentElement.getAttribute("data-theme") || (sistemaOscuro.matches ? "dark" : "light");
        //}
        //function sincronizarRadios() {
        //    const t = temaActual();
        //    radiosTema.forEach(r => { r.checked = r.value === t; });
        //}
        //radiosTema.forEach(r => r.addEventListener("change", () => {
        //    document.documentElement.setAttribute("data-theme", r.value);
        //    try { localStorage.setItem("tema", r.value); } catch (e) { }
        //}));
        //sistemaOscuro.addEventListener("change", sincronizarRadios);
        //sincronizarRadios();

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

        btn.addEventListener("click", cargarDatos);
