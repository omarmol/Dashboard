using Microsoft.Data.SqlClient;
using Dashboard.Models;

namespace Dashboard.Services;

public class OleTanquesAricaService : IOleTanquesAricaService
{
    private readonly string _connectionString;

    public OleTanquesAricaService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var oleTanquesArica = new List<OleTanqueArica>();

        var cantidad_tanques = 0;

        const string sql_ducto = @"
                SELECT
                    tanque,
                    producto,
                    ROUND(esp_disp, 0) as esp_disp,
                    ROUND(sal_alm, 0) as sal_alm,
                    ROUND(agua_libre, 0) as agua_libre
                FROM ole_tanques_arica
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql_ducto, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            oleTanquesArica.Add(
                new OleTanqueArica(
                    Convert.ToString(lector["tanque"]) ?? string.Empty,
                    Convert.ToString(lector["producto"]) ?? string.Empty,
                    Convert.ToDouble(lector["esp_disp"]),
                    Convert.ToDouble(lector["sal_alm"]),
                    Convert.ToDouble(lector["agua_libre"])));
            cantidad_tanques = cantidad_tanques + 1;
        }

        var resultado = new
        {
            oleTanquesArica,
            cantidad_tanques
        };

        return resultado;
    }
}
