using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public class PolEntregasService : IPolEntregasService
{
    private readonly string _connectionString;

    public PolEntregasService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var poliducto = new List<string>();
        var programado = new List<double>();
        var ejecutado = new List<double>();
        var hoy = new List<double>();

        var cantidad_datos = 0;


        const string sql = @"
                SELECT 
                    poliducto,
                    ROUND(ISNULL(programado, 0), 2) AS programado,
                    ROUND(ISNULL(ejecutado, 0), 2) AS ejecutado,
                    ROUND(ISNULL(hoy, 0), 2) AS hoy
                FROM pol_entregas 
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            poliducto.Add(lector.GetRequiredString("poliducto"));
            programado.Add(lector.GetRequiredDouble("programado"));
            ejecutado.Add(lector.GetRequiredDouble("ejecutado"));
            hoy.Add(lector.GetRequiredDouble("hoy"));
            cantidad_datos++;
        }

        var resultado = new
        {
            poliducto,
            programado,
            ejecutado,
            hoy,
            cantidad_datos
        };

        return resultado;
    }
}
