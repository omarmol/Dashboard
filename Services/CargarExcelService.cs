using System.Data;
using ClosedXML.Excel;
using Microsoft.Data.SqlClient;
using Dashboard.Models;

namespace Dashboard.Services;

public class CargarExcelService : ICargarExcelService
{
    private static readonly string[] ExtensionesPermitidas = { ".xlsx", ".xls" };
    private readonly ILogger<CargarExcelService> _log;
    private readonly string _connectionString;

    public CargarExcelService(IConfiguration configuration,ILogger<CargarExcelService> log)
    {
        _log = log;
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    public async Task<RespuestaCargaDatos<DatosRecepcion>> CargarExcelAsync(DateOnly? fecha, IFormFile? archivo)
    {
        string? rutaTemporal = null;
        string nombreTabla;
        try
        {
// 1. Validaciones básicas
            if (fecha is null)
                return RespuestaCargaDatos<DatosRecepcion>.Error("Debe indicar una fecha.");

            if (archivo is null || archivo.Length == 0)
                return RespuestaCargaDatos<DatosRecepcion>.Error("Debe adjuntar un archivo con contenido.");

            if (!Path.GetExtension(archivo.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return RespuestaCargaDatos<DatosRecepcion>.Error("Solo se permiten archivos Excel (.xlsx).");

            // 2. Guardar en carpeta temporal (con nombre propio, nunca el del usuario)
            rutaTemporal = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.xlsx");
            await using (var destino = File.Create(rutaTemporal))
            {
                await archivo.CopyToAsync(destino);
            }
            _log.LogInformation("Archivo guardado temporalmente en {Ruta}", rutaTemporal);

            await using (SqlConnection sqlDb = new SqlConnection(_connectionString))
            {
                sqlDb.Open();

                // Limpiar todas las tablas
                using (SqlCommand cmdLimpiar = new SqlCommand("DELETE FROM ole_recepciones_crudo WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_recepciones_glp WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_entregas_crudo WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_entregas_glp WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_cisternas_arica WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_tanques_arica WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_capacidad WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM ole_barcos_arica WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_recepciones WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_entregas_ductos WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_entregas_plantas WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_sistemas_transporte WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_transferencias WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_consumo_por_ciudad WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_consumo_por_termoelectrica WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM gas_capacidad WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM leyendas WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM imagenes WHERE fecha = @fecha_proceso; " +
                                            "DELETE FROM per_lotes WHERE fecha = @fecha_proceso; " +
                                            "", sqlDb))
                {
                    cmdLimpiar.Parameters.AddWithValue("@fecha_proceso", fecha.Value.ToDateTime(TimeOnly.MinValue));
                    cmdLimpiar.ExecuteNonQuery();
                }

                string nombreHoja = FormatearDia(fecha.Value.Day);

                // 2. Abrir el archivo Excel con ClosedXML
                using (var workbook = new XLWorkbook(rutaTemporal))
                {
                    if (workbook.Worksheets.Contains(nombreHoja))
                    {
                        var wsHoja = workbook.Worksheet(nombreHoja);

                        // tabla: ole_recepciones_crudo
                        nombreTabla = "ole_recepciones_crudo";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string cargador = "";
                                        row.Field("Cargador").TryGetValue<string>(out cargador);

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_recepciones_crudo (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", cargador);
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }



                        // tabla: ole_recepciones_glp
                        nombreTabla = "ole_recepciones_glp";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_recepciones_glp (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", "");
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: ole_entregas_crudo
                        nombreTabla = "ole_entregas_crudo";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_entregas_crudo (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", "");
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: ole_entregas_glp
                        nombreTabla = "ole_entregas_glp";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_entregas_glp (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", "");
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: ole_cisternas_arica
                        nombreTabla = "ole_cisternas_arica";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Nro CISTERNAS").IsEmpty() && !row.Field("PRODUCTO").IsEmpty() && !row.Field("Bbls.").IsEmpty() && !row.Field("m3").IsEmpty())
                                    {

                                        int nro_cisternas = 0;
                                        row.Field("Nro CISTERNAS").TryGetValue<int>(out nro_cisternas);

                                        string producto = "";
                                        row.Field("PRODUCTO").TryGetValue<string>(out producto);

                                        double bbls = 0;
                                        row.Field("Bbls.").TryGetValue<double>(out bbls);

                                        double metros3 = 0;
                                        row.Field("m3").TryGetValue<double>(out metros3);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_cisternas_arica (nro_cisternas, producto, barriles, metros3, fecha) VALUES (@nro_cisternas, @producto, @barriles, @metros3, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", "");
                                            cmdInsert.Parameters.AddWithValue("@nro_cisternas", nro_cisternas);
                                            cmdInsert.Parameters.AddWithValue("@producto", producto);
                                            cmdInsert.Parameters.AddWithValue("@barriles", bbls);
                                            cmdInsert.Parameters.AddWithValue("@metros3", metros3);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: ole_tanques_arica
                        nombreTabla = "ole_tanques_arica";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Tanque").IsEmpty() && !row.Field("Producto").IsEmpty() && !row.Field("ESP. DISP.").IsEmpty() && !row.Field("SAL. ALM.").IsEmpty() && !row.Field("AGUA LIBRE").IsEmpty())
                                    {
                                        string tanque = "";
                                        row.Field("Tanque").TryGetValue<string>(out tanque);

                                        string producto = "";
                                        row.Field("Producto").TryGetValue<string>(out producto);

                                        double esp_disp = 0;
                                        row.Field("ESP. DISP.").TryGetValue<double>(out esp_disp);

                                        double sal_alm = 0;
                                        row.Field("SAL. ALM.").TryGetValue<double>(out sal_alm);

                                        double agua_libre = 0;
                                        row.Field("AGUA LIBRE").TryGetValue<double>(out agua_libre);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_tanques_arica (tanque, producto, esp_disp, sal_alm, agua_libre, fecha) VALUES (@tanque, @producto, @esp_disp, @sal_alm, @agua_libre, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@tanque", tanque);
                                            cmdInsert.Parameters.AddWithValue("@producto", producto);
                                            cmdInsert.Parameters.AddWithValue("@esp_disp", esp_disp);
                                            cmdInsert.Parameters.AddWithValue("@sal_alm", sal_alm);
                                            cmdInsert.Parameters.AddWithValue("@agua_libre", agua_libre);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: ole_capacidad
                        nombreTabla = "ole_capacidad";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Sistema").IsEmpty() && !row.Field("Capacidad").IsEmpty() && !row.Field("% Uso x Dia").IsEmpty())
                                    {
                                        string sistema = "";
                                        row.Field("Sistema").TryGetValue<string>(out sistema);

                                        double capacidad = 0;
                                        row.Field("Capacidad").TryGetValue<double>(out capacidad);

                                        double porcentaje_uso = 0;
                                        row.Field("% Uso x Dia").TryGetValue<double>(out porcentaje_uso);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_capacidad (sistema, capacidad, porcentaje_uso, fecha) VALUES (@sistema, @capacidad, @porcentaje_uso, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@sistema", sistema);
                                            cmdInsert.Parameters.AddWithValue("@capacidad", capacidad);
                                            cmdInsert.Parameters.AddWithValue("@porcentaje_uso", porcentaje_uso);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: ole_barcos_arica
                        nombreTabla = "ole_barcos_arica";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Barco").IsEmpty() && !row.Field("Producto").IsEmpty())
                                    {
                                        string barco = "";
                                        row.Field("Barco").TryGetValue<string>(out barco);

                                        string producto = "";
                                        row.Field("Producto").TryGetValue<string>(out producto);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO ole_barcos_arica (barco, producto, fecha) VALUES (@barco, @producto, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@barco", barco);
                                            cmdInsert.Parameters.AddWithValue("@producto", producto);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }


                        // tabla: gas_recepciones
                        nombreTabla = "gas_recepciones";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string cargador = "";
                                        row.Field("Cargador").TryGetValue<string>(out cargador);

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_recepciones (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", cargador);
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }


                        // tabla: gas_entregas_ductos
                        nombreTabla = "gas_entregas_ductos";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_entregas_ductos (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", "");
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }

                        // tabla: gas_entregas_plantas
                        nombreTabla = "gas_entregas_plantas";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Campo").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string campo = "";
                                        row.Field("Campo").TryGetValue<string>(out campo);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_entregas_plantas (cargador, campo, programado, ejecutado, hoy, fecha) VALUES (@cargador, @campo, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@cargador", "");
                                            cmdInsert.Parameters.AddWithValue("@campo", campo);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }

                        // tabla: gas_sistemas_transporte
                        nombreTabla = "gas_sistemas_transporte";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Sistema").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string sistema = "";
                                        row.Field("Sistema").TryGetValue<string>(out sistema);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_sistemas_transporte (sistema, programado, ejecutado, hoy, fecha) VALUES (@sistema, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@sistema", sistema);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }

                        // tabla: gas_transferencias
                        nombreTabla = "gas_transferencias";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Sistema").IsEmpty() && !row.Field("Programado").IsEmpty() && !row.Field("Ejecutado").IsEmpty() && !row.Field("Hoy").IsEmpty())
                                    {

                                        string sistema = "";
                                        row.Field("Sistema").TryGetValue<string>(out sistema);

                                        double programado = 0;
                                        row.Field("Programado").TryGetValue<double>(out programado);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        double hoy = 0;
                                        row.Field("Hoy").TryGetValue<double>(out hoy);


                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_transferencias (sistema, programado, ejecutado, hoy, fecha) VALUES (@sistema, @programado, @ejecutado, @hoy, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@sistema", sistema);
                                            cmdInsert.Parameters.AddWithValue("@programado", programado);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@hoy", hoy);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }

                        // tabla: gas_consumo_por_ciudad
                        nombreTabla = "gas_consumo_por_ciudad";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Ciudad").IsEmpty() && !row.Field("Ejecutado").IsEmpty())
                                    {

                                        string ciudad = "";
                                        row.Field("Ciudad").TryGetValue<string>(out ciudad);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_consumo_por_ciudad (ciudad, ejecutado, fecha) VALUES (@ciudad, @ejecutado, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@ciudad", ciudad);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }

                        // tabla: gas_consumo_por_termoelectrica
                        nombreTabla = "gas_consumo_por_termoelectrica";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Termoelectrica").IsEmpty() && !row.Field("Ejecutado").IsEmpty())
                                    {

                                        string termoelectrica = "";
                                        row.Field("Termoelectrica").TryGetValue<string>(out termoelectrica);

                                        double ejecutado = 0;
                                        row.Field("Ejecutado").TryGetValue<double>(out ejecutado);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_consumo_por_termoelectrica (termoelectrica, ejecutado, fecha) VALUES (@termoelectrica, @ejecutado, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@termoelectrica", termoelectrica);
                                            cmdInsert.Parameters.AddWithValue("@ejecutado", ejecutado);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }

                                }

                                break;
                            }
                        }

                        // tabla: gas_capacidad
                        nombreTabla = "gas_capacidad";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Sistema").IsEmpty() && !row.Field("Capacidad").IsEmpty() && !row.Field("% Uso x Dia").IsEmpty())
                                    {
                                        string sistema = "";
                                        row.Field("Sistema").TryGetValue<string>(out sistema);

                                        double capacidad = 0;
                                        row.Field("Capacidad").TryGetValue<double>(out capacidad);

                                        double porcentaje_uso = 0;
                                        row.Field("% Uso x Dia").TryGetValue<double>(out porcentaje_uso);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO gas_capacidad (sistema, capacidad, porcentaje_uso, fecha) VALUES (@sistema, @capacidad, @porcentaje_uso, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@sistema", sistema);
                                            cmdInsert.Parameters.AddWithValue("@capacidad", capacidad);
                                            cmdInsert.Parameters.AddWithValue("@porcentaje_uso", porcentaje_uso);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        // tabla: perfil_ossa1
                        nombreTabla = "perfil_ossa1";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Lote").IsEmpty() && !row.Field("Producto").IsEmpty() && !row.Field("Posicion").IsEmpty())
                                    {
                                        string lote = "";
                                        row.Field("Lote").TryGetValue<string>(out lote);

                                        string producto = "";
                                        row.Field("Producto").TryGetValue<string>(out producto);

                                        double volumen = 0;
                                        row.Field("Volumen").TryGetValue<double>(out volumen);

                                        double posicion = 0;
                                        row.Field("Posicion").TryGetValue<double>(out posicion);

                                        posicion = Math.Round(posicion, 0);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO per_lotes (ducto, lote, producto, volumen, posicion, fecha) VALUES (@ducto, @lote, @producto, @volumen, @posicion, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@ducto", "OSSA-1");
                                            cmdInsert.Parameters.AddWithValue("@lote", lote);
                                            cmdInsert.Parameters.AddWithValue("@producto", producto);
                                            cmdInsert.Parameters.AddWithValue("@volumen", volumen);
                                            cmdInsert.Parameters.AddWithValue("@posicion", posicion);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        nombreTabla = "perfil_pvt";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Lote").IsEmpty() && !row.Field("Producto").IsEmpty() && !row.Field("Posicion").IsEmpty())
                                    {
                                        string lote = "";
                                        row.Field("Lote").TryGetValue<string>(out lote);

                                        string producto = "";
                                        row.Field("Producto").TryGetValue<string>(out producto);

                                        double volumen = 0;
                                        row.Field("Volumen").TryGetValue<double>(out volumen);

                                        string strPosicion = "";
                                        double posicion = 0;
                                        row.Field("Posicion").TryGetValue<string>(out strPosicion);

                                        if (!double.TryParse(strPosicion, out posicion)){
                                            switch (strPosicion.ToUpper())
                                            {
                                                case "TJA":
                                                    posicion = 175;
                                                    break;
                                                default:
                                                    posicion = 0;
                                                    break;
                                            }
                                        }
                                        posicion = Math.Round(posicion, 0);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO per_lotes (ducto, lote, producto, volumen, posicion, fecha) VALUES (@ducto, @lote, @producto, @volumen, @posicion, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@ducto", "PVT");
                                            cmdInsert.Parameters.AddWithValue("@lote", lote);
                                            cmdInsert.Parameters.AddWithValue("@producto", producto);
                                            cmdInsert.Parameters.AddWithValue("@volumen", volumen);
                                            cmdInsert.Parameters.AddWithValue("@posicion", posicion);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }

                        nombreTabla = "perfil_pcolpii";
                        foreach (var tablaDatos in wsHoja.Tables)
                        {
                            if (tablaDatos.Name.StartsWith(nombreTabla))
                            {

                                foreach (var row in tablaDatos.DataRange.Rows())
                                {
                                    // Accedemos a los campos por el nombre de la columna en la tabla

                                    if (!row.Field("Lote").IsEmpty() && !row.Field("Producto").IsEmpty() && !row.Field("Posicion").IsEmpty())
                                    {
                                        string lote = "";
                                        row.Field("Lote").TryGetValue<string>(out lote);

                                        string producto = "";
                                        row.Field("Producto").TryGetValue<string>(out producto);

                                        double volumen = 0;
                                        row.Field("Volumen").TryGetValue<double>(out volumen);

                                        string strPosicion = "";
                                        double posicion = 0;
                                        row.Field("Posicion").TryGetValue<string>(out strPosicion);

                                        if (!double.TryParse(strPosicion, out posicion))
                                        {
                                            switch (strPosicion.ToUpper())
                                            {
                                                case "EORU":
                                                    posicion = 163;
                                                    break;
                                                default:
                                                    posicion = 0;
                                                    break;
                                            }
                                        }
                                        posicion = Math.Round(posicion, 0);

                                        using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO per_lotes (ducto, lote, producto, volumen, posicion, fecha) VALUES (@ducto, @lote, @producto, @volumen, @posicion, @fecha)", sqlDb))
                                        {
                                            cmdInsert.Parameters.AddWithValue("@ducto", "PCOLP-2");
                                            cmdInsert.Parameters.AddWithValue("@lote", lote);
                                            cmdInsert.Parameters.AddWithValue("@producto", producto);
                                            cmdInsert.Parameters.AddWithValue("@volumen", volumen);
                                            cmdInsert.Parameters.AddWithValue("@posicion", posicion);
                                            cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                            cmdInsert.ExecuteNonQuery();
                                        }

                                    }
                                }

                                break;
                            }
                        }


                        if (wsHoja.Pictures.Any())
                        {
                            //string nombre_imagen = "img_oleaje";

                            foreach (var picture in wsHoja.Pictures)
                            {

                                using (var ms = new System.IO.MemoryStream())
                                {
                                    // Copiamos el stream de la imagen de ClosedXML
                                    picture.ImageStream.CopyTo(ms);
                                    byte[] imageBytes = ms.ToArray();
                                    string base64String = Convert.ToBase64String(imageBytes);

                                    // Determinamos el tipo MIME adecuado
                                    string mimeType = "image/png";
                                    if (picture.Format == ClosedXML.Excel.Drawings.XLPictureFormat.Jpeg)
                                    {
                                        mimeType = "image/jpeg";
                                    }
                                    else if (picture.Format == ClosedXML.Excel.Drawings.XLPictureFormat.Gif)
                                    {
                                        mimeType = "image/gif";
                                    }

                                    // Insertamos la imagen procesada en SQL Server
                                    using (SqlCommand cmdInsert = new SqlCommand("INSERT INTO imagenes (nombre_imagen, imagen_base64, formato, fecha) VALUES (@nombre_imagen, @imagen_base64, @formato, @fecha)", sqlDb))
                                    {
                                        cmdInsert.Parameters.AddWithValue("@nombre_imagen", picture.Name);
                                        cmdInsert.Parameters.AddWithValue("@imagen_base64", base64String);
                                        cmdInsert.Parameters.AddWithValue("@formato", mimeType);
                                        cmdInsert.Parameters.AddWithValue("@fecha", fecha.Value.ToDateTime(TimeOnly.MinValue));
                                        cmdInsert.ExecuteNonQuery();
                                    }
                                }
                                break;
                            }

                        }


                    }
                    else
                    {
                        //return Task.FromResult(RespuestaCargaDatos<DatosRecepcion>.Error("Debe adjuntar un archivo con contenido."));
                        return RespuestaCargaDatos<DatosRecepcion>.Error("No existe la Hoja {nombreHoja} en el archivo {rutaTemporal}");
                        //context.Response.Write($"{{\"success\": false, \"message\": \"No existe la Hoja {nombreHoja} en el archivo {rutaTemporal} \"}}");
                    }
                    
                }

            }

            var datos = new DatosRecepcion(archivo.FileName, archivo.Length, fecha.Value);
            return RespuestaCargaDatos<DatosRecepcion>.Ok(datos, "Archivo recibido correctamente.");

        }
        catch (Exception ex)
        {
            // Error inesperado: se registra el detalle y al cliente se le envía un mensaje genérico
            _log.LogError(ex, "Error inesperado al recibir el archivo");
            return RespuestaCargaDatos<DatosRecepcion>.Error("Error: " + ex.Message);
        }
    }

    private string FormatearDia(int dia)
    {
        return dia.ToString("D2");
    }
}