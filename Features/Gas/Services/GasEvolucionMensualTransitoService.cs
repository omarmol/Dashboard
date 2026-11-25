using Microsoft.Data.SqlClient;
using Dashboard.Features.Shared;
//using ProductosApp.Models;

namespace Dashboard.Features.Gas.Services;

public class GasEvolucionMensualTransitoService : IGasEvolucionMensualTransitoService
{
    private readonly string _connectionString;

    public GasEvolucionMensualTransitoService(IConfiguration configuration)
    {
        _connectionString = SqlDataAccess.GetRequiredConnectionString(configuration);
    }

    
    public async Task<object> ObtenerPorFechaAsync(DateOnly fecha)
    {

        DateTime fechaInicio = new DateTime(fecha.Year, fecha.Month, 1);

        var lista_proveedores = new List<object>();
        var cantidad_datos = 0;

        const string sql_proveedores = @"
                SELECT 
                    proveedor,
                    DAY(fecha) AS dia,
                    ROUND(SUM(ejecutado), 2) AS ejecutado
                FROM gas_transito_resumen 
                WHERE CAST(fecha AS DATE) >= @fechaInicio AND CAST(fecha AS DATE) <= @fechaFin
                GROUP BY proveedor, DAY(fecha)
                ORDER BY proveedor, DAY(fecha)";

        await using var conexion_proveedores = new SqlConnection(_connectionString);
        await conexion_proveedores.OpenAsync();

        await using var comando_proveedores = new SqlCommand(sql_proveedores, conexion_proveedores);
        comando_proveedores.Parameters.Add("@fechaInicio", System.Data.SqlDbType.Date).Value =
            fechaInicio;
        
        comando_proveedores.Parameters.Add("@fechaFin", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector_proveedores = await comando_proveedores.ExecuteReaderAsync();

        while (await lector_proveedores.ReadAsync())
        {
            lista_proveedores.Add(new
            {
                proveedor = lector_proveedores.GetStringOrEmpty("proveedor"),
                dia = lector_proveedores.GetRequiredInt32("dia"),
                ejecutado = lector_proveedores.GetDoubleOrDefault("ejecutado", 0)

            });
            

            cantidad_datos = cantidad_datos + 1;

        }

        var lista_clientes = new List<object>();

        const string sql_clientes = @"
                SELECT 
                    cliente,
                    DAY(fecha) AS dia,
                    ROUND(SUM(ejecutado), 2) AS ejecutado
                FROM gas_transito_resumen 
                WHERE CAST(fecha AS DATE) >= @fechaInicio AND CAST(fecha AS DATE) <= @fechaFin
                GROUP BY cliente, DAY(fecha)
                ORDER BY cliente, DAY(fecha)";

        await using var conexion_clientes = new SqlConnection(_connectionString);
        await conexion_clientes.OpenAsync();
    
        await using var comando_clientes = new SqlCommand(sql_clientes, conexion_clientes);
        comando_clientes.Parameters.Add("@fechaInicio", System.Data.SqlDbType.Date).Value =
            fechaInicio;
        
        comando_clientes.Parameters.Add("@fechaFin", System.Data.SqlDbType.Date).Value =
            fecha.ToDateTime(TimeOnly.MinValue);

        await using var lector_clientes = await comando_clientes.ExecuteReaderAsync();

        while (await lector_clientes.ReadAsync())
        {
            lista_clientes.Add(new
            {
                cliente = lector_clientes.GetStringOrEmpty("cliente"),
                dia = lector_clientes.GetRequiredInt32("dia"),
                ejecutado = lector_clientes.GetDoubleOrDefault("ejecutado", 0)

            });

            cantidad_datos = cantidad_datos + 1;

        }



        return new { proveedores = lista_proveedores, clientes = lista_clientes };
    }
}
