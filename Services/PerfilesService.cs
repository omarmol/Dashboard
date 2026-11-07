using Microsoft.Data.SqlClient;
using Dashboard.Models;

namespace Dashboard.Services;

public class PerfilesService : IPerfilesService
{
    private readonly string _connectionString;

    public PerfilesService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");
    }

    
    public async Task<object> ObtenerPorFechaYDuctoAsync(DateOnly fecha, String ducto)
    {

        var ductoPerfiles = new List<DuctoPerfil>();
        var lotePerfiles = new List<LotePerfil>();

        var cantidad_ductos = 0;
        var longitud_ducto = 0;

        const string sql_ducto = @"
                SELECT km, elevacion, descripcion_punto
                FROM per_ductos
                WHERE ducto = @ducto
                ORDER BY km";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comandoDucto = new SqlCommand(sql_ducto, conexion);
        comandoDucto.Parameters.Add("@ducto", System.Data.SqlDbType.VarChar).Value = ducto;
        // comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
        //     fecha.ToDateTime(TimeOnly.MinValue);

        await using var lectorDucto = await comandoDucto.ExecuteReaderAsync();

        while (await lectorDucto.ReadAsync())
        {
            ductoPerfiles.Add(
                new DuctoPerfil(
                    Convert.ToDouble(lectorDucto["km"]), 
                    Convert.ToDouble(lectorDucto["elevacion"]), 
                    Convert.ToString(lectorDucto["descripcion_punto"]) ?? string.Empty));
            cantidad_ductos = cantidad_ductos + 1;
            longitud_ducto = Convert.ToInt32(lectorDucto["km"]);

        }

        var cantidad_lotes = 0;
        const string sql_lote = @"
            WITH numericos AS (
                SELECT lote, producto, volumen, posicion, TRY_CAST(posicion AS DECIMAL(12,4)) AS num
                FROM per_lotes
                WHERE ducto = @ducto
                AND CAST(fecha AS DATE) = @fechaFiltro
                AND TRY_CAST(posicion AS DECIMAL(12,4)) IS NOT NULL
            )
            SELECT lote, producto, volumen, posicion,
                LAG(num, 1, 0) OVER (ORDER BY num) AS ini,
                num AS fin
            FROM numericos
            ORDER BY num;";
        
        await using var conexionLote = new SqlConnection(_connectionString);
        await conexionLote.OpenAsync();

        await using var comandoLote = new SqlCommand(sql_lote, conexionLote);
        comandoLote.Parameters.Add("@ducto", System.Data.SqlDbType.VarChar).Value = ducto;
        comandoLote.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);
        

        await using var lectorLote = await comandoLote.ExecuteReaderAsync();

        while (await lectorLote.ReadAsync())
        {
             lotePerfiles.Add(
                new LotePerfil(
                    Convert.ToString(lectorLote["lote"]) ?? string.Empty,
                    Convert.ToString(lectorLote["producto"]) ?? string.Empty,
                    Convert.ToDouble(lectorLote["volumen"]),
                    Convert.ToDouble(lectorLote["posicion"]),
                    Convert.ToDouble(lectorLote["ini"]),
                    Convert.ToDouble(lectorLote["fin"])));
            cantidad_lotes = cantidad_lotes + 1;

        }


        var resultado = new
        {
            ductoPerfiles,
            cantidad_ductos,
            lotePerfiles,
            cantidad_lotes,
            longitud_ducto
        };

        return resultado;
    }
}
