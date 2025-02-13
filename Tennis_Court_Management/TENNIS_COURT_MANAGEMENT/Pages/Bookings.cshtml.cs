using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class BookingViewModel
    {
        public int BookingId { get; set; }
        public string Username { get; set; }
        public string CourtType { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; }
    }

    public class BookingsModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<BookingViewModel> Bookings { get; set; } = new List<BookingViewModel>();
        public string SuccessMessage { get; set; }

        public BookingsModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            LoadBookings();
        }

        public IActionResult OnPostConfirm(int bookingId)
        {
            UpdateBookingStatus(bookingId, "Confirmed");
            SuccessMessage = "Booking confirmed successfully.";
            LoadBookings();
            return Page();
        }

        public IActionResult OnPostRefuse(int bookingId)
        {
            UpdateBookingStatus(bookingId, "Refused");
            SuccessMessage = "Booking refused successfully.";
            LoadBookings();
            return Page();
        }

        private void LoadBookings()
        {
            string connectionString = _configuration.GetConnectionString("Monday");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string sql = @"
                    SELECT b.booking_id, u.username, c.Court_Type, b.start_time, b.end_time, b.status
                    FROM Booking b
                    JOIN Users u ON b.user_id = u.user_id
                    JOIN Court c ON b.court_id = c.court_id
                    ORDER BY b.start_time DESC";

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Bookings.Add(new BookingViewModel
                            {
                                BookingId = reader.GetInt32(0),
                                Username = reader.GetString(1),
                                CourtType = reader.GetString(2),
                                StartTime = reader.GetDateTime(3),
                                EndTime = reader.GetDateTime(4),
                                Status = reader.GetString(5)
                            });
                        }
                    }
                }
            }
        }

        private void UpdateBookingStatus(int bookingId, string status)
        {
            string connectionString = _configuration.GetConnectionString("Monday");
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string sql = "UPDATE Booking SET status = @status WHERE booking_id = @bookingId";

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@status", status);
                    command.Parameters.AddWithValue("@bookingId", bookingId);
                    command.ExecuteNonQuery();
                }
            }
        }
    }
}
