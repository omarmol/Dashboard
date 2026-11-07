using Microsoft.Data.SqlClient;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasParticipacionXCargador : IGasParticipacionXCargador
{
    private readonly string _connectionString;

    public GasParticipacionXCargador(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var lista = new List<object>();

        var cantidad_datos = 0;

        const string sql = @"
                SELECT 
                    cargador,
	                ROUND(ISNULL(SUM(programado), 0), 2) AS programado,
	                ROUND(ISNULL(SUM(ejecutado), 0), 2) AS ejecutado,
	                ROUND(ISNULL(SUM(hoy), 0), 2) AS hoy
                FROM gas_recepciones
                WHERE CAST(fecha AS DATE) = @fechaFiltro
                GROUP BY cargador";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            lista.Add(new
            {
                name = lector["cargador"].ToString(),
                value = Convert.ToDouble(lector["ejecutado"])
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
