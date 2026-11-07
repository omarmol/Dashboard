using Dashboard.Services;

namespace Dashboard.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDashboardServices(this IServiceCollection services)
    {
        services.AddScoped<IGasEntregasPlantasService, GasEntregasPlantasService>();
        services.AddScoped<IGasEntregasDuctosService, GasEntregasDuctosService>();
        services.AddScoped<IGasConsumoXTermoelectricaService, GasConsumoXTermoelectricaService>();
        services.AddScoped<IGasCapacidadService, GasCapacidadService>();
        services.AddScoped<IGasRecepciones, GasRecepciones>();
        services.AddScoped<IGasParticipacionXCargador, GasParticipacionXCargador>();
        services.AddScoped<IGasTransporteXSistema, GasTransporteXSistema>();
        services.AddScoped<IGasConsumoXCiudad, GasConsumoXCiudad>();
        services.AddScoped<IGasTransportadoMensual, GasTransportadoMensual>();
        services.AddScoped<IPerfilesService, PerfilesService>();
        services.AddScoped<IOleTanquesAricaService, OleTanquesAricaService>();
        services.AddScoped<IOleCisternasAricaService, OleCisternasAricaService>();
        services.AddScoped<IOleMensualCisternasService, OleMensualCisternasService>();
        services.AddScoped<ICargarExcelService, CargarExcelService>();

        return services;
    }
}
