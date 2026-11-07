using Microsoft.Data.SqlClient;
using Dashboard.Models;

namespace Dashboard.Services;

public class OleMensualCisternasService : IOleMensualCisternasService
{
    private readonly string _connectionString;

    public OleMensualCisternasService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
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
                producto = lector["producto"].ToString(),
                dia = Convert.ToInt32(lector["dia"]),
                barriles = lector["barriles"] == DBNull.Value ? 0 : Convert.ToDouble(lector["barriles"])

            });

            cantidad_datos = cantidad_datos + 1;
        }

        return lista;
    }
}
