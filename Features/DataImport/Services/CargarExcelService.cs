using ClosedXML.Excel;
using ClosedXML.Excel.Drawings;
using Dashboard.Features.DataImport.Models;
using Microsoft.Data.SqlClient;

namespace Dashboard.Features.DataImport.Services;

public class CargarExcelService : ICargarExcelService
{
    // Cada destino se actualiza una sola vez; sus fuentes comparten una transacción.
    // Para agregar una tabla Excel, configure aquí su destino y el mapeo de columnas.
    // La columna fecha se agrega automáticamente. Las filas con campos obligatorios vacíos se omiten.
    // Si una fuente no existe, no aporta filas; el destino igualmente se actualiza.
    private static readonly ConfiguracionTabla[] Tablas =
    [
        new("ole_recepciones_crudo", [Fuente("ole_recepciones_crudo", ColumnasFlujo(conCargador: true))]),
        new("ole_recepciones_glp", [Fuente("ole_recepciones_glp", ColumnasFlujo(conCargador: false))]),
        new("ole_entregas_crudo", [Fuente("ole_entregas_crudo", ColumnasFlujo(conCargador: false))]),
        new("ole_entregas_glp", [Fuente("ole_entregas_glp", ColumnasFlujo(conCargador: false))]),
        new("ole_cisternas_arica",
        [
            Fuente("ole_cisternas_arica",
            [
                Entero("nro_cisternas", "Nro CISTERNAS"),
                Texto("producto", "PRODUCTO"),
                Numero("barriles", "Bbls."),
                Numero("metros3", "m3")
            ])
        ]),
        new("ole_tanques_arica",
        [
            Fuente("ole_tanques_arica",
            [
                Texto("tanque", "Tanque"),
                Texto("producto", "Producto"),
                Numero("esp_disp", "ESP. DISP."),
                Numero("sal_alm", "SAL. ALM."),
                Numero("agua_libre", "AGUA LIBRE")
            ])
        ]),
        new("ole_capacidad", [Fuente("ole_capacidad", ColumnasCapacidad())]),
        new("ole_barcos_arica",
        [
            Fuente("ole_barcos_arica",
            [
                Texto("barco", "Barco"),
                Texto("producto", "Producto")
            ])
        ]),
        new("gas_recepciones", [Fuente("gas_recepciones", ColumnasFlujo(conCargador: true))]),
        new("gas_entregas_ductos", [Fuente("gas_entregas_ductos", ColumnasFlujo(conCargador: false))]),
        new("gas_entregas_plantas", [Fuente("gas_entregas_plantas", ColumnasFlujo(conCargador: false))]),
        new("gas_transito_resumen",
        [
            Fuente("gas_transito_resumen",
            [
                Texto("proveedor", "Proveedor"),
                Texto("cliente", "Cliente"),
                Numero("programado", "Programado"),
                Numero("porcentaje_participacion", "% Participación", obligatoria: false),
                Numero("ejecutado", "Ejecutado"),
                Numero("hoy", "Hoy"),
                Numero("entrega_mutun", "Entrega en Mutun", obligatoria: false)
            ])
        ]),
        new("gas_sistemas_transporte", [Fuente("gas_sistemas_transporte", ColumnasFlujoSistema())]),
        new("gas_transferencias", [Fuente("gas_transferencias", ColumnasFlujoSistema())]),
        new("gas_consumo_por_ciudad",
        [
            Fuente("gas_consumo_por_ciudad", [Texto("ciudad", "Ciudad"), Numero("ejecutado", "Ejecutado")])
        ]),
        new("gas_consumo_por_termoelectrica",
        [
            Fuente("gas_consumo_por_termoelectrica",
                [Texto("termoelectrica", "Termoelectrica"), Numero("ejecutado", "Ejecutado")])
        ]),
        new("gas_capacidad", [Fuente("gas_capacidad", ColumnasCapacidad())]),
        new("per_lotes",
        [
            Fuente("perfil_ossa1", ColumnasPerfil("OSSA-1")),
            Fuente("perfil_pvt", ColumnasPerfil("PVT", "TJA", 175)),
            Fuente("perfil_pcolpii", ColumnasPerfil("PCOLP-2", "EORU", 163))
        ]),
        new("imagenes",
        [
            FuenteImagenes(
            [
                ColumnaImagen("nombre_imagen", imagen => imagen.Name),
                ColumnaImagen("imagen_base64", imagen =>
                {
                    using var stream = new MemoryStream();
                    imagen.ImageStream.CopyTo(stream);
                    return Convert.ToBase64String(stream.ToArray());
                }),
                ColumnaImagen("formato", imagen => imagen.Format switch
                {
                    XLPictureFormat.Jpeg => "image/jpeg",
                    XLPictureFormat.Gif => "image/gif",
                    _ => "image/png"
                })
            ])
        ]),
        new("leyendas", [])
    ];

    private readonly ILogger<CargarExcelService> _log;
    private readonly string _connectionString;

    public CargarExcelService(IConfiguration configuration, ILogger<CargarExcelService> log)
    {
        _log = log;
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    public async Task<RespuestaCargaDatos<DatosRecepcion>> CargarExcelAsync(DateOnly? fecha, IFormFile? archivo)
    {
        string? rutaTemporal = null;
        try
        {
            if (fecha is null)
                return RespuestaCargaDatos<DatosRecepcion>.Error("Debe indicar una fecha.");

            if (archivo is null || archivo.Length == 0)
                return RespuestaCargaDatos<DatosRecepcion>.Error("Debe adjuntar un archivo con contenido.");

            if (!Path.GetExtension(archivo.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return RespuestaCargaDatos<DatosRecepcion>.Error("Solo se permiten archivos Excel (.xlsx).");

            rutaTemporal = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.xlsx");
            await using (var destino = File.Create(rutaTemporal))
            {
                await archivo.CopyToAsync(destino);
            }

            _log.LogInformation("Archivo guardado temporalmente en {Ruta}", rutaTemporal);

            using var workbook = new XLWorkbook(rutaTemporal);
            var nombreHoja = fecha.Value.Day.ToString("D2");
            if (!workbook.Worksheets.Contains(nombreHoja))
                return RespuestaCargaDatos<DatosRecepcion>.Error(
                    $"No existe la Hoja {nombreHoja} en el archivo {rutaTemporal}");

            var hoja = workbook.Worksheet(nombreHoja);
            var fechaProceso = fecha.Value.ToDateTime(TimeOnly.MinValue);
            var tablasFallidas = new List<string>();

            await using var sqlDb = new SqlConnection(_connectionString);
            await sqlDb.OpenAsync();

            foreach (var tabla in Tablas)
            {
                ActualizarTabla(sqlDb, hoja, fechaProceso, tabla, tablasFallidas);
            }

            if (tablasFallidas.Count > 0)
            {
                return RespuestaCargaDatos<DatosRecepcion>.Error(
                    $"No se pudieron actualizar las tablas:{Environment.NewLine}" +
                    $"{string.Join(Environment.NewLine, tablasFallidas)}{Environment.NewLine}" +
                    "Las demás tablas se procesaron.");
            }

            var datos = new DatosRecepcion(archivo.FileName, archivo.Length, fecha.Value);
            return RespuestaCargaDatos<DatosRecepcion>.Ok(datos, "Archivo recibido correctamente.");
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error inesperado al recibir el archivo");
            return RespuestaCargaDatos<DatosRecepcion>.Error("Error: " + ex.Message);
        }
        finally
        {
            if (rutaTemporal is not null)
            {
                try
                {
                    File.Delete(rutaTemporal);
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "No se pudo eliminar el archivo temporal {Ruta}", rutaTemporal);
                }
            }
        }
    }

    private void ActualizarTabla(
        SqlConnection connection,
        IXLWorksheet hoja,
        DateTime fecha,
        ConfiguracionTabla tabla,
        List<string> tablasFallidas)
    {
        SqlTransaction? transaction = null;
        try
        {
            ValidarConfiguracion(tabla);
            transaction = connection.BeginTransaction();
            using (var delete = new SqlCommand(
                $"DELETE FROM {Identificador(tabla.Destino)} WHERE [fecha] = @fecha", connection, transaction))
            {
                delete.Parameters.AddWithValue("@fecha", fecha);
                delete.ExecuteNonQuery();
            }

            var filas = LeerFilas(hoja, tabla);
            if (tabla.Fuentes.Length > 0)
            {
                var columnas = tabla.Fuentes[0].Columnas;
                var nombres = string.Join(", ", columnas.Select(columna => Identificador(columna.Destino)));
                var parametros = string.Join(", ", columnas.Select((_, indice) => $"@p{indice}"));
                var sqlInsert = $"INSERT INTO {Identificador(tabla.Destino)} ({nombres}, [fecha]) VALUES ({parametros}, @fecha)";

                foreach (var valores in filas)
                {
                    using var insert = new SqlCommand(sqlInsert, connection, transaction);
                    for (var i = 0; i < valores.Length; i++)
                        insert.Parameters.AddWithValue($"@p{i}", valores[i]);

                    insert.Parameters.AddWithValue("@fecha", fecha);
                    insert.ExecuteNonQuery();
                }
            }

            transaction.Commit();
            _log.LogInformation("Tabla {Tabla} actualizada para {Fecha}", tabla.Destino, fecha);
        }
        catch (Exception ex)
        {
            var detalle = UnaLinea(ex.Message);
            if (transaction is not null)
            {
                try
                {
                    transaction.Rollback();
                }
                catch (Exception rollbackException)
                {
                    _log.LogError(rollbackException, "No se pudo revertir la transacción de {Tabla}", tabla.Destino);
                    detalle += $" No se pudo revertir la transacción: {UnaLinea(rollbackException.Message)}";
                }
            }

            _log.LogError(ex, "No se pudo actualizar la tabla {Tabla} para {Fecha}", tabla.Destino, fecha);
            tablasFallidas.Add($"{tabla.Destino}: {detalle}");
        }
        finally
        {
            transaction?.Dispose();
        }
    }

    private static string UnaLinea(string mensaje) =>
        string.Join(" ", mensaje.Split(["\r\n", "\r", "\n"], StringSplitOptions.RemoveEmptyEntries));

    private static List<object[]> LeerFilas(IXLWorksheet hoja, ConfiguracionTabla configuracion)
    {
        var resultado = new List<object[]>();
        foreach (var fuente in configuracion.Fuentes)
        {
            if (fuente.EsImagen)
            {
                var imagen = hoja.Pictures.FirstOrDefault();
                if (imagen is not null)
                    resultado.Add(fuente.Columnas.Select(columna => columna.Leer(null, imagen)).ToArray());

                continue;
            }

            var tabla = hoja.Tables.FirstOrDefault(
                item => item.Name.StartsWith(fuente.NombreExcel!, StringComparison.Ordinal));
            if (tabla is null)
                continue;

            foreach (var fila in tabla.DataRange.Rows())
            {
                if (fuente.Columnas.Any(columna =>
                    columna.Obligatoria && fila.Field(columna.NombreExcel!).IsEmpty()))
                    continue;

                resultado.Add(fuente.Columnas.Select(columna => columna.Leer(fila, null)).ToArray());
            }
        }

        return resultado;
    }

    private static void ValidarConfiguracion(ConfiguracionTabla tabla)
    {
        if (string.IsNullOrWhiteSpace(tabla.Destino))
            throw new InvalidOperationException("El destino de la tabla no puede estar vacío.");

        if (tabla.Fuentes.Length == 0)
            return;

        var nombres = tabla.Fuentes[0].Columnas.Select(columna => columna.Destino).ToArray();
        if (nombres.Length == 0
            || nombres.Any(string.IsNullOrWhiteSpace)
            || nombres.Contains("fecha", StringComparer.OrdinalIgnoreCase)
            || nombres.Distinct(StringComparer.OrdinalIgnoreCase).Count() != nombres.Length)
            throw new InvalidOperationException($"Las columnas de {tabla.Destino} no son válidas.");

        foreach (var fuente in tabla.Fuentes)
        {
            if ((!fuente.EsImagen && string.IsNullOrWhiteSpace(fuente.NombreExcel))
                || !fuente.Columnas.Select(columna => columna.Destino).SequenceEqual(nombres, StringComparer.OrdinalIgnoreCase))
                throw new InvalidOperationException($"Las fuentes de {tabla.Destino} deben tener las mismas columnas de destino y en el mismo orden.");
        }
    }

    private static string Identificador(string nombre) => $"[{nombre.Replace("]", "]]")}]";

    private static ConfiguracionFuente Fuente(string nombreExcel, ConfiguracionColumna[] columnas) =>
        new(nombreExcel, false, columnas);

    private static ConfiguracionFuente FuenteImagenes(ConfiguracionColumna[] columnas) =>
        new(null, true, columnas);

    private static ConfiguracionColumna Texto(string destino, string nombreExcel, bool obligatoria = true) =>
        new(destino, nombreExcel, obligatoria, (fila, _) => LeerTexto(fila!, nombreExcel));

    private static ConfiguracionColumna Entero(string destino, string nombreExcel, bool obligatoria = true) =>
        new(destino, nombreExcel, obligatoria, (fila, _) => LeerNumero<int>(fila!, nombreExcel, obligatoria));

    private static ConfiguracionColumna Numero(string destino, string nombreExcel, bool obligatoria = true) =>
        new(destino, nombreExcel, obligatoria, (fila, _) => LeerNumero<double>(fila!, nombreExcel, obligatoria));

    private static ConfiguracionColumna Constante(string destino, string valor) =>
        new(destino, null, false, (_, _) => valor);

    private static ConfiguracionColumna ColumnaImagen(string destino, Func<IXLPicture, string> leer) =>
        new(destino, null, false, (_, imagen) => leer(imagen!));

    private static ConfiguracionColumna Posicion(string? codigo, double valorCodigo) =>
        new("posicion", "Posicion", true, (fila, _) =>
        {
            var celda = fila!.Field("Posicion");
            if (celda.TryGetValue<double>(out var valor))
                return Math.Round(valor, 0);

            var texto = LeerTexto(fila, "Posicion");
            if (codigo is not null && texto.Equals(codigo, StringComparison.OrdinalIgnoreCase))
                return valorCodigo;

            throw new InvalidOperationException($"La posición '{texto}' no es válida en la celda {celda.Address}.");
        });

    private static ConfiguracionColumna[] ColumnasFlujo(bool conCargador) =>
    [
        conCargador ? Texto("cargador", "Cargador", obligatoria: false) : Constante("cargador", ""),
        Texto("campo", "Campo"),
        Numero("programado", "Programado"),
        Numero("ejecutado", "Ejecutado"),
        Numero("hoy", "Hoy")
    ];

    private static ConfiguracionColumna[] ColumnasFlujoSistema() =>
    [
        Texto("sistema", "Sistema"),
        Numero("programado", "Programado"),
        Numero("ejecutado", "Ejecutado"),
        Numero("hoy", "Hoy")
    ];

    private static ConfiguracionColumna[] ColumnasCapacidad() =>
    [
        Texto("sistema", "Sistema"),
        Numero("capacidad", "Capacidad"),
        Numero("porcentaje_uso", "% Uso x Dia")
    ];

    private static ConfiguracionColumna[] ColumnasPerfil(string ducto, string? codigo = null, double valorCodigo = 0) =>
    [
        Constante("ducto", ducto),
        Texto("lote", "Lote"),
        Texto("producto", "Producto"),
        Numero("volumen", "Volumen", obligatoria: false),
        Posicion(codigo, valorCodigo)
    ];

    private static string LeerTexto(IXLTableRow fila, string columna)
    {
        var celda = fila.Field(columna);
        if (celda.IsEmpty())
            return string.Empty;

        if (celda.TryGetValue<string>(out var valor))
            return valor;

        throw new InvalidOperationException($"El valor de la celda {celda.Address} de '{columna}' no es texto válido.");
    }

    private static T LeerNumero<T>(IXLTableRow fila, string columna, bool obligatoria) where T : struct
    {
        var celda = fila.Field(columna);
        if (!obligatoria && celda.IsEmpty())
            return default;

        if (celda.TryGetValue<T>(out var valor))
            return valor;

        throw new InvalidOperationException($"El valor de la celda {celda.Address} de '{columna}' no es un número válido.");
    }

    private sealed record ConfiguracionTabla(string Destino, ConfiguracionFuente[] Fuentes);
    private sealed record ConfiguracionFuente(string? NombreExcel, bool EsImagen, ConfiguracionColumna[] Columnas);
    private sealed record ConfiguracionColumna(
        string Destino,
        string? NombreExcel,
        bool Obligatoria,
        Func<IXLTableRow?, IXLPicture?, object> Leer);
}
