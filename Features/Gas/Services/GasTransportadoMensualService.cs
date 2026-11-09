using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasTransportadoMensualService : IGasTransportadoMensualService
{
    private readonly string _connectionString;

    public GasTransportadoMensualService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        DateTime fechaInicio = new DateTime(fecha.Year, fecha.Month, 1);

        var lista = new List<object>();
        var cantidad_datos = 0;

        const string sql = @"
                SELECT 
                    campo,
                    DAY(fecha) AS dia,
                    ROUND(SUM(ejecutado), 2) AS ejecutado
                FROM gas_entregas_ductos 
                WHERE CAST(fecha AS DATE) >= @fechaInicio AND CAST(fecha AS DATE) <= @fechaFin
                GROUP BY campo, DAY(fecha)
                ORDER BY campo, DAY(fecha)";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaInicio", System.Data.SqlDbType.Date).Value =
            fechaInicio;
        
        comando.Parameters.Add("@fechaFin", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            lista.Add(new
            {
                campo = lector.GetStringOrEmpty("campo"),
                dia = lector.GetRequiredInt32("dia"),
                ejecutado = lector.GetDoubleOrDefault("ejecutado", 0)

            });
            

            cantidad_datos = cantidad_datos + 1;

        }

        return lista;
    }
}
