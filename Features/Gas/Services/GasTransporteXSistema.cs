using Microsoft.Data.SqlClient;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasTransporteXSistema : IGasTransporteXSistema
{
    private readonly string _connectionString;

    public GasTransporteXSistema(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
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
                FROM gas_sistemas_transporte
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
            sistema.Add(Convert.ToString(lector["sistema"]) ?? string.Empty);
            programado.Add(Convert.ToDouble(lector["programado"]));
            ejecutado.Add(Convert.ToDouble(lector["ejecutado"]));
            hoy.Add(Convert.ToDouble(lector["hoy"]));
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
