using Microsoft.Data.SqlClient;
//using ProductosApp.Models;

namespace Dashboard.Services;

public class GasConsumoXTermoelectricaService : IGasConsumoXTermoelectricaService
{
    private readonly string _connectionString;

    public GasConsumoXTermoelectricaService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var lista = new List<object>();
        var cantidad_datos = 0;

        const string sql = @"
                SELECT termoelectrica, ejecutado 
                FROM gas_consumo_por_termoelectrica 
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            lista.Add(new {
                name = lector.GetString(0).Trim(),
                value = double.Round(lector.GetDouble(1), 2)
            });
            cantidad_datos++;
        }

        var resultado = new
        {
            lista,
            cantidad_datos
        };

        return resultado;
    }
}
