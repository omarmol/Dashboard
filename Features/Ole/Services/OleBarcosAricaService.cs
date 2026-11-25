using Microsoft.Data.SqlClient;
using Dashboard.Features.Ole.Models;
using Dashboard.Features.Shared;

namespace Dashboard.Features.Ole.Services;

public class OleBarcosAricaService : IOleBarcosAricaService
{
    private readonly string _connectionString;

    public OleBarcosAricaService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var oleBarcosArica = new List<OleBarcoArica>();

        var cantidad_barcos = 0;

        const string sql_ducto = @"
                SELECT
                    barco,
                    producto
                FROM ole_barcos_arica
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql_ducto, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            oleBarcosArica.Add(
                new OleBarcoArica(
                    lector.GetStringOrEmpty("barco"),
                    lector.GetStringOrEmpty("producto")));
            cantidad_barcos = cantidad_barcos + 1;
        }

        var resultado = new
        {
            oleBarcosArica,
            cantidad_barcos
        };

        return resultado;
    }
}
