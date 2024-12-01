using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.Dashboard
{
    public class BookingsModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<AdminBookingInfo> Bookings { get; set; } = new List<AdminBookingInfo>();
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public BookingsModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            LoadBookings();
        }

        public IActionResult OnPost(int BookingId, string action)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string newStatus = action == "confirm" ? "Confirmed" : "Cancelled";
                    string updateQuery = @"
                        UPDATE Booking 
                        SET status = @Status
                        WHERE booking_id = @BookingId";

                    using (SqlCommand command = new SqlCommand(updateQuery, connection))
                    {
                        command.Parameters.AddWithValue("@BookingId", BookingId);
                        command.Parameters.AddWithValue("@Status", newStatus);
                        command.ExecuteNonQuery();
                    }

                    SuccessMessage = $"Booking {newStatus.ToLower()} successfully!";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error updating booking: " + ex.Message;
            }

            LoadBookings();
            return Page();
        }

        private void LoadBookings()
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = @"
                        SELECT b.booking_id, b.user_id, u.username as user_name,
                               b.court_id, c.Court_Name as court_name,
                               b.date, b.time, b.Status, b.Type,
                               b.CoachId, COALESCE(coach.Coach_name, 'No Coach') as coach_name
                        FROM Booking b
                        JOIN Users u ON b.user_id = u.user_id
                        JOIN Court c ON b.court_id = c.court_id
                        LEFT JOIN Coach coach ON b.CoachId = coach.CoachId
                        ORDER BY b.date DESC, b.time DESC";



                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            Bookings.Clear();
                            while (reader.Read())
                            {
                                Bookings.Add(new AdminBookingInfo
                                {
                                    BookingId = Convert.ToInt32(reader["booking_id"]),
                                    UserId = Convert.ToInt32(reader["user_id"]),
                                    UserName = reader["user_name"].ToString(),
                                    CourtId = Convert.ToInt32(reader["court_id"]),
                                    CourtName = reader["court_name"].ToString(),
                                    Date = Convert.ToDateTime(reader["date"]),
                                    Time = reader["time"].ToString(),
                                    Status = reader["Status"].ToString(),
                                    Type = reader["Type"].ToString(),
                                    CoachId = reader["CoachId"] != DBNull.Value ? Convert.ToInt32(reader["CoachId"]) : (int?)null,
                                    CoachName = reader["coach_name"].ToString()
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading bookings: " + ex.Message;
            }
        }
    }

    public class AdminBookingInfo
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int CourtId { get; set; }
        public string CourtName { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public int? CoachId { get; set; }
        public string CoachName { get; set; }
    }
}
