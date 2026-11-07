namespace Dashboard.Features.DataImport.Models;

public class RespuestaCargaDatos<T>
{
    public bool Exito { get; set; }
    public string? Mensaje { get; set; }
    public T? Datos { get; set; }

    public static RespuestaCargaDatos<T> Ok(T datos, string? mensaje = null) =>
        new() { Exito = true, Mensaje = mensaje, Datos = datos };

    public static RespuestaCargaDatos<T> Error(string mensaje) =>
        new() { Exito = false, Mensaje = mensaje };
}