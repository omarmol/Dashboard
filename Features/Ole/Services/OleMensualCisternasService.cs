using Microsoft.Data.SqlClient;
using Dashboard.Features.Ole.Models;
using Dashboard.Features.Shared;

namespace Dashboard.Features.Ole.Services;

public class OleMensualCisternasService : IOleMensualCisternasService
{
    private readonly string _connectionString;

    public OleMensualCisternasService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        DateTime fechaInicio = new DateTime(fecha.Year, fecha.Month, 1);

        var lista = new List<object>();
        var cantidad_datos = 0;

        const string sql_ducto = @"
                SELECT 
                    producto,
                    DAY(fecha) AS dia,
                    ROUND(barriles, 1) AS barriles
                FROM ole_cisternas_arica
                WHERE CAST(fecha AS DATE) >= @fechaInicio AND CAST(fecha AS DATE) <= @fechaFin
                ORDER BY fecha";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql_ducto, conexion);
        comando.Parameters.Add("@fechaInicio", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);
        comando.Parameters.Add("@fechaFin", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            lista.Add(new
            {
                producto = lector.GetStringOrEmpty("producto"),
                dia = lector.GetRequiredInt32("dia"),
                barriles = lector.GetDoubleOrDefault("barriles", 0)

            });

            cantidad_datos = cantidad_datos + 1;
        }

        return lista;
    }
}
