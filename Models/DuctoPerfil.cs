namespace Dashboard.Models;

public class DuctoPerfil
{
    public double km { get; set; }
    public double elevacion { get; set; }
    public string descripcionPunto { get; set; }

    public DuctoPerfil(double km, double elevacion, string descripcionPunto)
    {
        this.km = km;
        this.elevacion = elevacion;
        this.descripcionPunto = descripcionPunto;
    }
}

