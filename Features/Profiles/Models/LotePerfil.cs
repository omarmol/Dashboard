namespace Dashboard.Features.Profiles.Models;
public class LotePerfil
{
    public string lote { get; set; }
    public string producto { get; set; }
    public double volumen { get; set; }
    public double posicion { get; set; }
    public double ini { get; set; }
    public double fin { get; set; }
    public string color { get; set; }

    public LotePerfil(string lote, string producto, double volumen, double posicion, double ini, double fin)
    {
        this.lote = lote;
        this.producto = producto;
        this.volumen = volumen;
        this.posicion = posicion;
        this.ini = ini;
        this.fin = fin;
        this.color = "";
    }
}

