namespace Dashboard.Features.Ole.Models;

public class OleTanqueArica
{
    public string tanque { get; set; }
    public string producto { get; set; }
    public double esp_disp { get; set; }
    public double sal_alm { get; set; }
    public double agua_libre { get; set; }
    public double capacidad { get; set; }

    public OleTanqueArica(string tanque, string producto, double esp_disp, double sal_alm, double agua_libre)
    {
        this.tanque = tanque;
        this.producto = producto;
        this.esp_disp = esp_disp;
        this.sal_alm = sal_alm;
        this.agua_libre = agua_libre;
        this.capacidad = esp_disp + sal_alm + agua_libre;

    }
}
