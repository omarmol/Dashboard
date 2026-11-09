using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasCapacidadService : IGasCapacidadService
{
    private readonly string _connectionString;

    public GasCapacidadService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var sistema = new List<string>();
        var capacidad = new List<double>();
        var porcentaje_uso = new List<double>();

        var cantidad_datos = 0;


        const string sql = @"
                SELECT 
                    sistema,
                    ROUND(ISNULL(capacidad, 0), 2) AS capacidad,
                    ROUND(ISNULL(porcentaje_uso, 0) * 100, 2) AS porcentaje_uso
                FROM gas_capacidad
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            sistema.Add(lector.GetRequiredString("sistema"));
            capacidad.Add(lector.GetRequiredDouble("capacidad"));
            porcentaje_uso.Add(lector.GetRequiredDouble("porcentaje_uso"));
            cantidad_datos++;
        }

        var resultado = new
        {
            sistema,
            capacidad,
            porcentaje_uso,
            cantidad_datos
        };

        return resultado;
    }
}
