using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public class OleEntregasGlpService : IOleEntregasGlpService
{
    private readonly string _connectionString;

    public OleEntregasGlpService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
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
                FROM ole_entregas_glp 
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            campo.Add(lector.GetRequiredString("campo"));
            programado.Add(lector.GetRequiredDouble("programado"));
            ejecutado.Add(lector.GetRequiredDouble("ejecutado"));
            hoy.Add(lector.GetRequiredDouble("hoy"));
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
