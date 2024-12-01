using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.UserDashboard
{
    public class IndexModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<BookingInfo> RecentBookings { get; set; } = new List<BookingInfo>();
        public List<CoachingSessionInfo> RecentCoachingSessions { get; set; } = new List<CoachingSessionInfo>();
        public bool HasActiveMembership { get; set; }
        public DateTime? MembershipEndDate { get; set; }
        public bool HasUnreadMessages { get; set; }
        public int PendingPaymentsCount { get; set; }

        public IndexModel(IConfiguration configuration)
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

            ViewData["UserName"] = HttpContext.Session.GetString("UserName");

            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Get recent bookings
                    string bookingQuery = @"
                        SELECT TOP 3 b.*, c.Court_Name 
                        FROM Booking b
                        JOIN Court c ON b.court_id = c.court_id
                        WHERE b.user_id = @UserId AND b.type = 'Day'
                        ORDER BY b.date DESC";
                    using (SqlCommand command = new SqlCommand(bookingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                RecentBookings.Add(new BookingInfo
                                {
                                    CourtId = reader["Court_Name"].ToString(),
                                    Date = Convert.ToDateTime(reader["date"]),
                                    Time = reader["time"].ToString(),
                                    Status = reader["status"].ToString()
                                });
                            }
                        }
                    }

                    // Get coaching sessions
                    string coachingQuery = @"
                        SELECT TOP 3 cs.*, c.Coach_name as coach_name
                        FROM CoachingSession cs-id
                        JOIN Coach c ON cs.CoachId = c.CoachId
                        WHERE cs.UserId= @UserId
                        ORDER BY cs.Date DESC";
                    using (SqlCommand command = new SqlCommand(coachingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                RecentCoachingSessions.Add(new CoachingSessionInfo
                                {
                                    CoachName = reader["coach_name"].ToString(),
                                    Date = Convert.ToDateTime(reader["Date"]),
                                    Time = reader["time"].ToString(),
                                    Status = reader["Status"].ToString()
                                });
                            }
                        }
                    }

                    // Check membership status
                    string membershipQuery = @"
                        SELECT TOP 1 end_date 
                        FROM Menbership 
                        WHERE user_id = @UserId AND status = 'approved'
                        ORDER BY end_date DESC";
                    using (SqlCommand command = new SqlCommand(membershipQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        var result = command.ExecuteScalar();
                        if (result != null)
                        {
                            MembershipEndDate = Convert.ToDateTime(result);
                            HasActiveMembership = MembershipEndDate > DateTime.Now;
                        }
                    }

                    // Count pending payments (this is a placeholder - implement actual payment logic)
                    string paymentQuery = @"
                        SELECT COUNT(*) 
                        FROM Booking 
                        WHERE user_id = @UserId AND status = 'Confirmed' AND payment_status = 'Pending'";
                    using (SqlCommand command = new SqlCommand(paymentQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        PendingPaymentsCount = (int)command.ExecuteScalar();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading dashboard data: {ex.Message}");
            }
        }

        public IActionResult OnPostLogout()
        {
            HttpContext.Session.Clear();
            return RedirectToPage("/Login");
        }
    }

    public class BookingInfo
    {
        public string CourtId { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; }
        public string Status { get; set; }
    }

    public class CoachingSessionInfo
    {
        public string CoachName { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; }
        public string Status { get; set; }
    }
}
