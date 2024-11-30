using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class CourtViewModel
    {
        public int CourtId { get; set; }
        public string CourtType { get; set; }
        public decimal Price { get; set; }
    }

    public class CourtsModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<CourtViewModel> Courts { get; set; } = new List<CourtViewModel>();
        public string SuccessMessage { get; set; }
        public string ErrorMessage { get; set; }

        public CourtsModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            LoadCourts();
        }

        public IActionResult OnPostAdd(string courtType, decimal price)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "INSERT INTO Court (Court_Type, price) VALUES (@courtType, @price)";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@courtType", courtType);
                        command.Parameters.AddWithValue("@price", price);
                        command.ExecuteNonQuery();
                    }
                }

                SuccessMessage = "Court added successfully.";
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error adding court: " + ex.Message;
            }

            LoadCourts();
            return Page();
        }

        public IActionResult OnPostEdit(int courtId, string courtType, decimal price)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "UPDATE Court SET Court_Type = @courtType, price = @price WHERE court_id = @courtId";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@courtId", courtId);
                        command.Parameters.AddWithValue("@courtType", courtType);
                        command.Parameters.AddWithValue("@price", price);
                        command.ExecuteNonQuery();
                    }
                }

                SuccessMessage = "Court updated successfully.";
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error updating court: " + ex.Message;
            }

            LoadCourts();
            return Page();
        }

        public IActionResult OnPostDelete(int courtId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    
                    // Check for existing bookings
                    string checkSql = "SELECT COUNT(*) FROM Booking WHERE court_id = @courtId";
                    using (SqlCommand checkCommand = new SqlCommand(checkSql, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@courtId", courtId);
                        int bookingCount = (int)checkCommand.ExecuteScalar();
                        
                        if (bookingCount > 0)
                        {
                            ErrorMessage = "Cannot delete court as it has existing bookings.";
                            LoadCourts();
                            return Page();
                        }
                    }

                    // If no bookings exist, proceed with deletion
                    string deleteSql = "DELETE FROM Court WHERE court_id = @courtId";
                    using (SqlCommand deleteCommand = new SqlCommand(deleteSql, connection))
                    {
                        deleteCommand.Parameters.AddWithValue("@courtId", courtId);
                        deleteCommand.ExecuteNonQuery();
                    }
                }

                SuccessMessage = "Court deleted successfully.";
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error deleting court: " + ex.Message;
            }

            LoadCourts();
            return Page();
        }

        private void LoadCourts()
        {
            Courts.Clear();
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "SELECT court_id, Court_Type, CAST(price AS decimal(10,2)) FROM Court ORDER BY court_id";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var price = reader.IsDBNull(2) ? 0m : reader.GetDecimal(2);
                                Courts.Add(new CourtViewModel
                                {
                                    CourtId = reader.GetInt32(0),
                                    CourtType = reader.GetString(1),
                                    Price = price
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading courts: " + ex.Message;
            }
        }
    }
}
