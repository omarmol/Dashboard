using Microsoft.Data.SqlClient;

namespace Dashboard.Features.Shared;

internal static class SqlDataAccess
{
    public static string GetRequiredConnectionString(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Falta la cadena de conexión 'DefaultConnection' o está vacía.");
        }

        return connectionString;
    }

    public static string GetRequiredString(this SqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        if (reader.IsDBNull(ordinal))
        {
            throw new InvalidOperationException($"La columna '{columnName}' contiene un valor nulo.");
        }

        return reader.GetString(ordinal);
    }

    public static string GetStringOrEmpty(this SqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal)
            ? string.Empty
            : Convert.ToString(reader.GetValue(ordinal)) ?? string.Empty;
    }

    public static double GetRequiredDouble(this SqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        if (reader.IsDBNull(ordinal))
        {
            throw new InvalidOperationException($"La columna '{columnName}' contiene un valor nulo.");
        }

        return Convert.ToDouble(reader.GetValue(ordinal));
    }

    public static double GetDoubleOrDefault(this SqlDataReader reader, string columnName, double defaultValue)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal)
            ? defaultValue
            : Convert.ToDouble(reader.GetValue(ordinal));
    }

    public static decimal GetRequiredDecimal(this SqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        if (reader.IsDBNull(ordinal))
        {
            throw new InvalidOperationException($"La columna '{columnName}' contiene un valor nulo.");
        }

        return Convert.ToDecimal(reader.GetValue(ordinal));
    }

    public static int GetRequiredInt32(this SqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        if (reader.IsDBNull(ordinal))
        {
            throw new InvalidOperationException($"La columna '{columnName}' contiene un valor nulo.");
        }

        return Convert.ToInt32(reader.GetValue(ordinal));
    }
}
