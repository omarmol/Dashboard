using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public class OleImagenOleajeService : IOleImagenOleajeService
{
    private readonly string _connectionString;

    public OleImagenOleajeService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var nombre_imagen = "";
        var imagen_base64 = "";
        var formato = "";

        var cantidad_datos = 0;


        const string sql = @"
                SELECT TOP 1 nombre_imagen, imagen_base64, formato 
                FROM imagenes 
                WHERE CAST(fecha AS DATE) = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            nombre_imagen = lector.GetRequiredString("nombre_imagen");
            imagen_base64 = lector.GetRequiredString("imagen_base64");
            formato = lector.GetRequiredString("formato");
            cantidad_datos++;
        }

        var resultado = new
        {
            nombre_imagen,
            imagen_base64,
            formato,
            cantidad_datos
        };

        return resultado;
    }
}
