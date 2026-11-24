using System.Data;
using Dashboard.Features.Shared;
using Microsoft.Data.SqlClient;

namespace Dashboard.Features.Generic.Services;

public class LeyendasService : ILeyendasService
{
    private readonly string _connectionString;

    public LeyendasService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    public async Task<object> ObtenerPorFechaAsync(
        DateOnly fecha, string tipo_leyenda)
    {
        var contenido = "";
        var cantidad_datos = 0;

        const string sql = @"
            SELECT TOP 1 contenido
            FROM leyendas
            WHERE CAST(fecha AS DATE) = @fechaFiltro
              AND tipo_leyenda = @tipoLeyenda";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();


        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);
        //comando.Parameters.AddWithValue("@tipoLeyenda", tipo_leyenda);
        comando.Parameters.Add("@tipoLeyenda", SqlDbType.VarChar).Value = tipo_leyenda;
        

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            contenido = lector.GetRequiredString("contenido");
            cantidad_datos++;
        }

        return new { contenido, cantidad_datos };
    }
}
