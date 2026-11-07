using Microsoft.Data.SqlClient;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasConsumoXCiudad : IGasConsumoXCiudad
{
    private readonly string _connectionString;

    public GasConsumoXCiudad(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var lista = new List<object>();
        var cantidad_datos = 0;


        const string sql = @"
                SELECT ciudad, ejecutado 
                FROM gas_consumo_por_ciudad 
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

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
                name = Convert.ToString(lector["ciudad"]),
                value = decimal.Round(Convert.ToDecimal(lector["ejecutado"]), 2)
            });
            cantidad_datos = cantidad_datos + 1;

        }

        var resultado = new
        {
            lista,
            cantidad_datos
        };


        return resultado;
    }
}
