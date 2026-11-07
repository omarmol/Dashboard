using Microsoft.Data.SqlClient;
using Dashboard.Models;

namespace Dashboard.Services;

public class OleCisternasAricaService : IOleCisternasAricaService
{
    private readonly string _connectionString;

    public OleCisternasAricaService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var cisternas = new List<object>();
        var cantidad_datos = 0;

        const string sql_ducto = @"
                select 
                    producto,
                    nro_cisternas,
                    ROUND(barriles, 1) as barriles
                from ole_cisternas_arica
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql_ducto, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            cisternas.Add(new
            {
                producto = Convert.ToString(lector["producto"]),
                nro_cisternas = Convert.ToInt32(lector["nro_cisternas"]),
                barriles = Convert.ToDouble(lector["barriles"]),
                color = ""
            });
            cantidad_datos = cantidad_datos + 1;
        }

        var resultado = new
        {
            cisternas,
            cantidad_datos
        };

        return resultado;
    }
}
