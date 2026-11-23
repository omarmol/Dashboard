using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Ole.Services;

public class OleKpiService : IOleKpiService
{
    private readonly string _connectionString;

    public OleKpiService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    public async Task<object> ObtenerCumplimientoAsync(DateOnly fecha)
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
    
    public async Task<object> ObtenerEntregaCrudoTotalAsync(DateOnly fecha)
    {

        var cumplimiento_hoy = 0.0;
        var cantidad_datos = 0; 

        var programado_hoy = 0.0;
        var ejecutado_hoy = 0.0;

        var ejecutado_ayer = 0.0;
        var cumplimiento_ayer = 0.0;


        const string sql = @"
                SELECT sum(programado) as programado, sum(ejecutado) as ejecutado
                FROM ole_entregas_crudo
                WHERE 1=1
                AND fecha = @fechaFiltro";

        await using var conexion_hoy = new SqlConnection(_connectionString);
        await conexion_hoy.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion_hoy);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            programado_hoy = lector.GetDoubleOrDefault("programado", 0);
            ejecutado_hoy = lector.GetDoubleOrDefault("ejecutado", 0);
            //cumplimiento_hoy = programado_hoy == 0 ? 0 : Math.Round(ejecutado_hoy / programado_hoy * 100, 1);
            cumplimiento_hoy = programado_hoy == 0 ? 0 : Math.Round((ejecutado_hoy - programado_hoy) / programado_hoy * 100, 1);
            Console.WriteLine($"Programado hoy: {programado_hoy}, Ejecutado hoy: {ejecutado_hoy}, Cumplimiento hoy: {cumplimiento_hoy}");
            cantidad_datos++;
        }


        fecha = fecha.AddDays(-1);

        const string sql2 = @"
                SELECT sum(ejecutado) as ejecutado
                FROM ole_entregas_crudo
                WHERE 1=1
                AND fecha = @fechaFiltro";
                
        await using var conexion_ayer = new SqlConnection(_connectionString);
        await conexion_ayer.OpenAsync();

        await using var comando2 = new SqlCommand(sql2, conexion_ayer);
        comando2.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector2 = await comando2.ExecuteReaderAsync();

        while (await lector2.ReadAsync())
        {
            ejecutado_ayer = lector2.GetDoubleOrDefault("ejecutado", 0);
            cumplimiento_ayer = ejecutado_ayer == 0 ? 0 : Math.Round((ejecutado_hoy - ejecutado_ayer) / ejecutado_ayer * 100, 1);
            Console.WriteLine($"Ejecutado ayer: {ejecutado_ayer}, Ejecutado hoy: {ejecutado_hoy}, Cumplimiento ayer: {cumplimiento_ayer}");
            cantidad_datos++;
        }


        var resultado = new
        {
            ejecutado_hoy,
            cumplimiento_hoy,
            cumplimiento_ayer,
            cantidad_datos
        };

        return resultado;
    }

    public async Task<object> ObtenerEntregaGlpTotalAsync(DateOnly fecha)
    {

        var cumplimiento_hoy = 0.0;
        var cantidad_datos = 0; 

        var programado_hoy = 0.0;
        var ejecutado_hoy = 0.0;

        const string sql = @"
                SELECT sum(programado) as programado, sum(ejecutado) as ejecutado
                FROM ole_entregas_glp
                WHERE 1=1
                AND fecha = @fechaFiltro";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            programado_hoy = lector.GetDoubleOrDefault("programado", 0);
            ejecutado_hoy = lector.GetDoubleOrDefault("ejecutado", 0);
            cumplimiento_hoy = programado_hoy == 0 ? 0 : Math.Round((ejecutado_hoy - programado_hoy) / programado_hoy * 100, 1);
            cantidad_datos++;
        }

        var resultado = new
        {
            ejecutado_hoy,
            cumplimiento_hoy,
            cantidad_datos
        };

        return resultado;
    }
}
