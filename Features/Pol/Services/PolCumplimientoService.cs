using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Pol.Services;

public class PolCumplimientoService : IPolCumplimientoService
{
    private readonly string _connectionString;

    public PolCumplimientoService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        var poliducto = new List<string>();
        var programado = new List<double>();
        var ejecutado = new List<double>();
        var cumplimiento = new List<double>();

        var cantidad_datos = 0;


        const string sql = @"
                select poliducto, programado, ejecutado, 
                    case when programado <= 0 then 100 
                    else ROUND((ejecutado / programado) * 100, 2)
                    end as cumplimiento
                from pol_entregas
                where fecha = @fechaFiltro
                and programado > 0 and ejecutado > 0 
                order by cumplimiento desc ";

        await using var conexion = new SqlConnection(_connectionString);
        await conexion.OpenAsync();

        await using var comando = new SqlCommand(sql, conexion);
        comando.Parameters.Add("@fechaFiltro", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector = await comando.ExecuteReaderAsync();

        while (await lector.ReadAsync())
        {
            poliducto.Add(lector.GetRequiredString("poliducto"));
            programado.Add(lector.GetRequiredDouble("programado"));
            ejecutado.Add(lector.GetRequiredDouble("ejecutado"));
            cumplimiento.Add(lector.GetRequiredDouble("cumplimiento"));
            cantidad_datos++;
        }

        var resultado = new
        {
            poliducto,
            programado,
            ejecutado,
            cumplimiento,
            cantidad_datos
        };

        return resultado;
    }
}
