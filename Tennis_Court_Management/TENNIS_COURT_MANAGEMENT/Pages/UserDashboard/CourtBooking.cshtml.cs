using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.UserDashboard
{
    public class CourtBookingModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<CourtInfo> AvailableCourts { get; set; } = new List<CourtInfo>();
        public List<UserBooking> UserBookings { get; set; } = new List<UserBooking>();
        public DateTime? SearchDate { get; set; }
        public string SearchTime { get; set; }
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }
        public List<Court> Courts { get; set; } = new List<Court>();
        public List<Coach> Coaches { get; set; } = new List<Coach>();

        public CourtBookingModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                Response.Redirect("/Login");
                return;
            }

            LoadUserBookings(userId);
            LoadCourts();
            LoadCoaches();
        }

        public IActionResult OnPostSearch(DateTime Date, string Time, string CourtType)
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToPage("/Login");
            }

            SearchDate = Date;
            SearchTime = Time;

            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Find available courts
                    string courtQuery = @"
                        SELECT c.court_id, c.Court_Name as court_name, c.Court_Type as type, c.price
                        FROM Court c
                        WHERE (@CourtType = '' OR c.Court_Type = @CourtType)
                        AND NOT EXISTS (
                            SELECT 1 FROM Booking b
                            WHERE b.court_id = c.court_id
                            AND b.date = @Date
                            AND b.time = @Time
                            AND b.Status != 'Cancelled'
                        )";

                    using (SqlCommand command = new SqlCommand(courtQuery, connection))
                    {
                        command.Parameters.AddWithValue("@Date", Date);
                        command.Parameters.AddWithValue("@Time", Time);
                        command.Parameters.AddWithValue("@CourtType", CourtType);

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                AvailableCourts.Add(new CourtInfo
                                {
                                    CourtId = reader["court_id"].ToString(),
                                    CourtName = reader["court_name"].ToString(),
                                    Type = reader["type"].ToString(),
                                    Price = Convert.ToDecimal(reader["price"])
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error searching for courts: " + ex.Message;
            }

            LoadUserBookings(userId);
            return Page();
        }

        public IActionResult OnPostBook(int CourtId, DateTime Date, string Time, int? CoachId, string Type)
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToPage("/Login");
            }

            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Start a transaction since we're making multiple changes
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Check if the court is already booked for the selected time
                            string checkBookingQuery = @"
                                SELECT COUNT(*) 
                                FROM Booking 
                                WHERE court_id = @CourtId 
                                AND date = @Date 
                                AND time = @Time
                                AND Status != 'Cancelled'";

                            using (SqlCommand command = new SqlCommand(checkBookingQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@CourtId", CourtId);
                                command.Parameters.AddWithValue("@Date", Date);
                                command.Parameters.AddWithValue("@Time", Time);

                                int existingBookings = (int)command.ExecuteScalar();
                                if (existingBookings > 0)
                                {
                                    ErrorMessage = "This court is already booked for the selected time.";
                                    LoadUserBookings(userId);
                                    LoadCourts();
                                    LoadCoaches();
                                    return Page();
                                }
                            }

                            // Get court price
                            decimal courtPrice = 0;
                            string getPriceQuery = "SELECT price FROM Court WHERE court_id = @CourtId";
                            using (SqlCommand command = new SqlCommand(getPriceQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@CourtId", CourtId);
                                courtPrice = Convert.ToDecimal(command.ExecuteScalar());
                            }

                            // Insert booking record
                            int bookingId;
                            string insertBookingQuery = @"
                                INSERT INTO Booking (user_id, court_id, date, time, Status, CoachId, Type)
                                OUTPUT INSERTED.booking_id
                                VALUES (@UserId, @CourtId, @Date, @Time, 'Pending', @CoachId, @Type)";

                            using (SqlCommand command = new SqlCommand(insertBookingQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@CourtId", CourtId);
                                command.Parameters.AddWithValue("@UserId", int.Parse(userId));
                                command.Parameters.AddWithValue("@Date", Date);
                                command.Parameters.AddWithValue("@Time", Time);
                                command.Parameters.AddWithValue("@Type", Type);
                                command.Parameters.AddWithValue("@CoachId", CoachId.HasValue ? (object)CoachId.Value : DBNull.Value);
                                bookingId = (int)command.ExecuteScalar();
                            }

                            // Create payment record
                            string insertPaymentQuery = @"
                                INSERT INTO Payments (user_id, payment_type, related_id, amount, status, payment_date)
                                VALUES (@UserId, 'Booking', @BookingId, @Amount, 'Pending', GETDATE())";

                            using (SqlCommand command = new SqlCommand(insertPaymentQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@UserId", int.Parse(userId));
                                command.Parameters.AddWithValue("@BookingId", bookingId);
                                command.Parameters.AddWithValue("@Amount", courtPrice);
                                command.ExecuteNonQuery();
                            }

                            transaction.Commit();
                            SuccessMessage = "Booking request submitted successfully!";
                        }
                        catch (Exception)
                        {
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = ex.Message;
                LoadUserBookings(userId);
                LoadCourts();
                LoadCoaches();
                return Page();
            }

            return RedirectToPage("/UserDashboard/Payments");
        }

        public IActionResult OnPostCancel(int BookingId)
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToPage("/Login");
            }

            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string updateQuery = @"
                        UPDATE Booking 
                        SET status = 'Cancelled'
                        WHERE booking_id = @BookingId AND user_id = @UserId";

                    using (SqlCommand command = new SqlCommand(updateQuery, connection))
                    {
                        command.Parameters.AddWithValue("@BookingId", BookingId);
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error cancelling booking: " + ex.Message;
            }

            LoadUserBookings(userId);
            return Page();
        }

        private void LoadUserBookings(string userId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string bookingQuery = @"
                        SELECT b.booking_id, c.Court_Name, b.date, b.time, b.status
                        FROM Booking b
                        JOIN Court c ON b.court_id = c.court_id
                        WHERE b.user_id = @UserId AND b.type = 'Day'
                        ORDER BY b.date DESC, b.time DESC";

                    using (SqlCommand command = new SqlCommand(bookingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            UserBookings.Clear();
                            while (reader.Read())
                            {
                                UserBookings.Add(new UserBooking
                                {
                                    BookingId = Convert.ToInt32(reader["booking_id"]),
                                    CourtName = reader["Court_Name"].ToString(),
                                    Date = Convert.ToDateTime(reader["date"]),
                                    Time = reader["time"].ToString(),
                                    Status = reader["status"].ToString()
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

        private void LoadCourts()
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "SELECT court_id,Court_Name,Court_Type,price FROM Court";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Courts.Add(new Court
                                {
                                    CourtId = reader.GetInt32(0),
                                    Court_Name = reader.GetString(1),
                                    Court_Type = reader.GetString(2),
                                    price = reader.GetInt32(3),

                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = ex.Message;
            }
        }

        private void LoadCoaches()
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "SELECT coachId, Coach_name FROM coach WHERE Status = 'Active'";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Coaches.Add(new Coach
                                {
                                    CoachId = reader.GetInt32(0),
                                    Name = reader.GetString(1)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = ex.Message;
            }
        }
    }

    public class CourtInfo
    {
        public string CourtId { get; set; }
        public string CourtName { get; set; }
        public string Type { get; set; }
        public decimal Price { get; set; }
    }

    public class UserBooking
    {
        public int BookingId { get; set; }
        public string CourtName { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; }
        public string Status { get; set; }
    }

    public class Court
    {
        public int CourtId { get; set; }
        public string Court_Name { get; set; }
        public string Court_Type { get; set; }
        public int price { get; set; }
    }

    public class Coach
    {
        public int CoachId { get; set; }
        public string Name { get; set; }
    }
}
