using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasTransporteXEmpresaService : IGasTransporteXEmpresaService
{
    private readonly string _connectionString;

    public GasTransporteXEmpresaService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var sistema = new List<string>();
        var programado = new List<double>();
        var ejecutado = new List<double>();
        var hoy = new List<double>();

        var cantidad_datos = 0;



        const string sql = @"
                SELECT 
                    sistema,
                    ROUND(ISNULL(programado, 0), 2) AS programado,
                    ROUND(ISNULL(ejecutado, 0), 2) AS ejecutado,
                    ROUND(ISNULL(hoy, 0), 2) AS hoy
                FROM gas_transporte_empresas
                WHERE CAST(fecha AS DATE) = @fechaFiltro
                ORDER BY ejecutado ASC";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            sistema.Add(lector.GetStringOrEmpty("sistema"));
            programado.Add(lector.GetRequiredDouble("programado"));
            ejecutado.Add(lector.GetRequiredDouble("ejecutado"));
            hoy.Add(lector.GetRequiredDouble("hoy"));
            cantidad_datos = cantidad_datos + 1;

        }

        var resultado = new
            {
                sistema,
                programado,
                ejecutado,
                hoy,
                cantidad_datos
            };

        return resultado;
    }
}
