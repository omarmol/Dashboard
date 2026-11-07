using Microsoft.Data.SqlClient;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasRecepcionesService : IGasRecepcionesService
{
    private readonly string _connectionString;

    public GasRecepcionesService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var campo = new List<string>();
        var programado = new List<double>();
        var ejecutado = new List<double>();
        var hoy = new List<double>();

        var cantidad_datos = 0;


        const string sql = @"
                SELECT 
                    campo,
                    ROUND(ISNULL(programado, 0), 2) AS programado,
                    ROUND(ISNULL(ejecutado, 0), 2) AS ejecutado,
                    ROUND(ISNULL(hoy, 0), 2) AS hoy
                FROM gas_recepciones
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            campo.Add(lector.GetString(0));
            programado.Add(lector.GetDouble(1));
            ejecutado.Add(lector.GetDouble(2));
            hoy.Add(lector.GetDouble(3));
            cantidad_datos++;
        }

        var resultado = new
            {
                campo,
                programado,
                ejecutado,
                hoy,
                cantidad_datos
            };

        return resultado;
    }
}
