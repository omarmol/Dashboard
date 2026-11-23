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

    
}
