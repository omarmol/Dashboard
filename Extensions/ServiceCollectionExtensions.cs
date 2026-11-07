using Dashboard.Features.DataImport.Services;
using Dashboard.Features.Gas.Services;
using Dashboard.Features.Ole.Services;
using Dashboard.Features.Profiles.Services;

namespace Dashboard.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDashboardServices(this IServiceCollection services)
    {
        services.AddScoped<IGasEntregasPlantasService, GasEntregasPlantasService>();
        services.AddScoped<IGasEntregasDuctosService, GasEntregasDuctosService>();
        services.AddScoped<IGasConsumoXTermoelectricaService, GasConsumoXTermoelectricaService>();
        services.AddScoped<IGasCapacidadService, GasCapacidadService>();
        services.AddScoped<IGasRecepcionesService, GasRecepcionesService>();
        services.AddScoped<IGasParticipacionXCargadorService, GasParticipacionXCargadorService>();
        services.AddScoped<IGasTransporteXSistemaService, GasTransporteXSistemaService>();
        services.AddScoped<IGasConsumoXCiudadService, GasConsumoXCiudadService>();
        services.AddScoped<IGasTransportadoMensualService, GasTransportadoMensualService>();
        services.AddScoped<IPerfilesService, PerfilesService>();
        services.AddScoped<IOleTanquesAricaService, OleTanquesAricaService>();
        services.AddScoped<IOleCisternasAricaService, OleCisternasAricaService>();
        services.AddScoped<IOleMensualCisternasService, OleMensualCisternasService>();
        services.AddScoped<ICargarExcelService, CargarExcelService>();

        return services;
    }
}
