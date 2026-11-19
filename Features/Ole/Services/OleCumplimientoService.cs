using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public class OleCumplimientoService : IOleCumplimientoService
{
    private readonly string _connectionString;

    public OleCumplimientoService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var cumplimiento = 0.0;
        var cantidad_datos = 0; 


        const string sql = @"
                select CASE 
                        WHEN SUM(programado) IS NULL OR SUM(programado) = 0 THEN 0
                        ELSE ROUND(SUM(ejecutado) / SUM(programado) * 100, 1)
                    END AS cumplimiento
                from ole_entregas_crudo
                where fecha = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            cumplimiento = lector.GetRequiredDouble("cumplimiento");
            cantidad_datos++;
        }

        var resultado = new
        {
            cumplimiento,
            cantidad_datos
        };

        return resultado;
    }
}
