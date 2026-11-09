using Microsoft.Data.SqlClient;
using Dashboard.Features.Profiles.Models;
using Dashboard.Features.Shared;

namespace Dashboard.Features.Profiles.Services;

public class PerfilesService : IPerfilesService
{
    private readonly string _connectionString;

    public PerfilesService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    public async Task<object> ObtenerPorFechaYDuctoAsync(DateOnly fecha, String ducto)
    {
        if (string.IsNullOrWhiteSpace(ducto))
        {
            throw new ArgumentException("Debe indicar un ducto.", nameof(ducto));
        }

        var ductoPerfiles = new List<DuctoPerfil>();
        var lotePerfiles = new List<LotePerfil>();

        var longitud_ducto = 0;

        const string sqlDucto = @"
            SELECT km, elevacion, descripcion_punto
            FROM per_ductos
            WHERE ducto = @ducto
            ORDER BY km";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comandoDucto = new SqlCommand(sqlDucto, conexion);
        comandoDucto.Parameters.Add("@ducto", System.Data.SqlDbType.VarChar).Value = ducto;

        await using var lectorDucto = await comandoDucto.ExecuteReaderAsync();

        while (await lectorDucto.ReadAsync())
        {
            var km = lectorDucto.GetRequiredDouble("km");
            ductoPerfiles.Add(
                new DuctoPerfil(
                    km,
                    lectorDucto.GetRequiredDouble("elevacion"),
                    Convert.ToString(lectorDucto["descripcion_punto"]) ?? string.Empty));
            longitud_ducto = Convert.ToInt32(km);
        }

        const string sqlLote = @"
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

        await using var comandoLote = new SqlCommand(sqlLote, conexionLote);
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
                    lectorLote.GetRequiredDouble("volumen"),
                    lectorLote.GetRequiredDouble("posicion"),
                    lectorLote.GetRequiredDouble("ini"),
                    lectorLote.GetRequiredDouble("fin")));
        }

        var resultado = new
        {
            ductoPerfiles,
            cantidad_ductos = ductoPerfiles.Count,
            lotePerfiles,
            cantidad_lotes = lotePerfiles.Count,
            longitud_ducto
        };

        return resultado;
    }
}
