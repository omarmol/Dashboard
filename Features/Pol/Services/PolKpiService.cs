using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public class PolKpiService : IPolKpiService
{
    private readonly string _connectionString;

    public PolKpiService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerCumplimientoAsync(DateOnly fecha)
    {

        var cantidad_datos = 0; 
        var cumplimiento = 0.0;


        const string sql = @"
                select round(avg(ent.uso), 1) as cumplimiento
                from (
                select poliducto, programado, ejecutado, 
                    case when programado <= 0 then 100 
                    else (ejecutado / programado) * 100
                    end as uso
                from pol_entregas
                where fecha = @fechaFiltro
                and programado > 0 and ejecutado > 0) as ent";

        await using var conexion_hoy = new SqlConnection(_connectionString);
        await conexion_hoy.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion_hoy);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        Console.WriteLine($"Fecha filtro: {fecha}");

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            cumplimiento = lector.GetDoubleOrDefault("cumplimiento", 0);
            //Console.WriteLine($"Cumplimiento hoy: {cumplimiento_hoy}");
            cantidad_datos++;
        }


        var resultado = new
        {
            cumplimiento,
            cantidad_datos
        };

        return resultado;
    }


    public async Task<object> ObtenerCumplimientoRecepcionesAsync(DateOnly fecha)
    {

        var cantidad_datos = 0; 
        var total_recepciones = 0;
        var recepciones_mayor_a = 0;


        const string sql = @"
                SELECT COUNT(*) AS total_recepciones,
                    SUM(CASE WHEN ejecutado * 100.0 / programado >= 100 THEN 1 ELSE 0 END) AS recepciones_mayor_a
                FROM pol_recepciones
                WHERE fecha = @fechaFiltro
                AND programado > 0 AND ejecutado > 0";

        await using var conexion_hoy = new SqlConnection(_connectionString);
        await conexion_hoy.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion_hoy);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        Console.WriteLine($"Fecha filtro: {fecha}");

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            total_recepciones = lector.GetRequiredInt32("total_recepciones");
            recepciones_mayor_a = lector.GetRequiredInt32("recepciones_mayor_a");
            cantidad_datos++;
        }


        var resultado = new
        {
            total_recepciones,
            recepciones_mayor_a,
            cantidad_datos
        };

        return resultado;
    }


    public async Task<object> ObtenerCumplimientoEntregasAsync(DateOnly fecha)
    {

        var cantidad_datos = 0; 
        var total_entregas = 0;
        var entregas_mayor_a = 0;


        const string sql = @"
                SELECT COUNT(*) AS total_entregas,
                    SUM(CASE WHEN ejecutado * 100.0 / programado >= 100 THEN 1 ELSE 0 END) AS entregas_mayor_a
                FROM pol_entregas
                WHERE fecha = @fechaFiltro
                AND programado > 0 AND ejecutado > 0";

        await using var conexion_hoy = new SqlConnection(_connectionString);
        await conexion_hoy.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion_hoy);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        Console.WriteLine($"Fecha filtro: {fecha}");

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            total_entregas = lector.GetRequiredInt32("total_entregas");
            entregas_mayor_a = lector.GetRequiredInt32("entregas_mayor_a");
            cantidad_datos++;
        }


        var resultado = new
        {
            total_entregas,
            entregas_mayor_a,
            cantidad_datos
        };

        return resultado;
    }


    public async Task<object> ObtenerCumplimientoAyerAsync(DateOnly fecha)
    {

        var cantidad_datos = 0; 
        var ejecutado_hoy = 0.0;
        var ejecutado_ayer = 0.0;
        var cumplimiento_ayer = 0.0;


        const string sql = @"
                select (
                select sum(ejecutado) as ejecutado_hoy
                from pol_entregas
                where fecha = @fechaFiltro) as ejecutado_hoy
                ,(
                select sum(ejecutado) as ejecutado_ayer
                from pol_entregas
                where fecha = DATEADD(day, -1, @fechaFiltro)) as ejecutado_ayer";

        await using var conexion_hoy = new SqlConnection(_connectionString);
        await conexion_hoy.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion_hoy);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            ejecutado_ayer = lector.GetDoubleOrDefault("ejecutado_ayer", 0);
            ejecutado_hoy = lector.GetDoubleOrDefault("ejecutado_hoy", 0);
            //cumplimiento_hoy = programado_hoy == 0 ? 0 : Math.Round(ejecutado_hoy / programado_hoy * 100, 1);
            cumplimiento_ayer = ejecutado_ayer == 0 ? 0 : Math.Round((ejecutado_hoy - ejecutado_ayer) / ejecutado_ayer * 100, 1);
            Console.WriteLine($"Ejecutado ayer: {ejecutado_ayer}, Ejecutado hoy: {ejecutado_hoy}, Cumplimiento ayer: {cumplimiento_ayer}");
            cantidad_datos++;
        }


        var resultado = new
        {
            ejecutado_hoy,
            ejecutado_ayer,
            cumplimiento_ayer,
            cantidad_datos
        };

        return resultado;
    }

    
}
