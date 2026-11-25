namespace Dashboard.Features.Ole.Models;

public class OleBarcoArica
{
    public string barco { get; set; }
    public string producto { get; set; }
    
    public OleBarcoArica(string barco, string producto)
    {
        this.barco = barco;
        this.producto = producto;
    }
}
