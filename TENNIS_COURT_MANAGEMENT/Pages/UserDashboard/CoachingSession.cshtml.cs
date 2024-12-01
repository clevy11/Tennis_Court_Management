using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.UserDashboard
{
    public class CoachingSessionModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<CoachInfo> AvailableCoaches { get; set; } = new List<CoachInfo>();
        public List<UserSession> UserSessions { get; set; } = new List<UserSession>();
        public bool HasActiveMembership { get; set; }
        public DateTime? SearchDate { get; set; }
        public string SearchTime { get; set; }
        public bool IsTimeSlotAvailable { get; set; }
        public CoachInfo SelectedCoach { get; set; }
        public string ErrorMessage { get; set; }

        public CoachingSessionModel(IConfiguration configuration)
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

            CheckMembershipStatus(userId);
            LoadCoaches();
            LoadUserSessions(userId);
        }

        private void CheckMembershipStatus(string userId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    
                    // Debug: Print the user ID being checked
                    Console.WriteLine($"Checking membership for user ID: {userId}");

                    // First query to see all memberships for this user
                    string allMembershipsQuery = @"
                        SELECT * FROM Menbership 
                        WHERE user_id = @UserId";

                    using (SqlCommand debugCmd = new SqlCommand(allMembershipsQuery, connection))
                    {
                        debugCmd.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = debugCmd.ExecuteReader())
                        {
                            if (!reader.HasRows)
                            {
                                Console.WriteLine("No membership records found at all");
                            }
                            while (reader.Read())
                            {
                                Console.WriteLine($"Found membership record:");
                                Console.WriteLine($"- Status: {reader["Status"]}");
                                Console.WriteLine($"- Start Date: {reader["start_date"]}");
                                Console.WriteLine($"- End Date: {reader["end_date"]}");
                            }
                        }
                    }

                    // Now check for active membership with a case-insensitive query
                    string query = @"
                        SELECT COUNT(*) 
                        FROM Menbership 
                        WHERE user_id = @UserId 
                        AND LOWER(Status) = 'approved'
                        AND CONVERT(date, GETDATE()) BETWEEN CONVERT(date, start_date) AND CONVERT(date, end_date)";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        int count = (int)command.ExecuteScalar();
                        HasActiveMembership = count > 0;
                        Console.WriteLine($"Active membership check result: {count} (HasActiveMembership: {HasActiveMembership})");
                        
                        if (!HasActiveMembership)
                        {
                            // If no active membership, let's see what's wrong
                            string debugQuery = @"
                                SELECT Status, start_date, end_date,
                                       CONVERT(date, GETDATE()) as CurrentDate,
                                       CASE 
                                           WHEN LOWER(Status) != 'approved' THEN 'Status not approved'
                                           WHEN CONVERT(date, GETDATE()) < CONVERT(date, start_date) THEN 'Membership not started'
                                           WHEN CONVERT(date, GETDATE()) > CONVERT(date, end_date) THEN 'Membership expired'
                                           ELSE 'Unknown reason'
                                       END as Reason
                                FROM Menbership 
                                WHERE user_id = @UserId";

                            using (SqlCommand debugCommand = new SqlCommand(debugQuery, connection))
                            {
                                debugCommand.Parameters.AddWithValue("@UserId", userId);
                                using (SqlDataReader reader = debugCommand.ExecuteReader())
                                {
                                    while (reader.Read())
                                    {
                                        Console.WriteLine($"Membership check failed because: {reader["Reason"]}");
                                        Console.WriteLine($"Status: {reader["Status"]}");
                                        Console.WriteLine($"Start Date: {reader["start_date"]}");
                                        Console.WriteLine($"End Date: {reader["end_date"]}");
                                        Console.WriteLine($"Current Date: {reader["CurrentDate"]}");
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error checking membership status: " + ex.Message;
                Console.WriteLine($"Membership check error: {ex.Message}");
                HasActiveMembership = false;
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
            string query = @"
                SELECT 
                    CoachId,
                    Coach_name,
                    status
                FROM coach 
                WHERE status = 'Active'";

            using (SqlCommand command = new SqlCommand(query, connection))
            {
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    AvailableCoaches.Clear();
                    while (reader.Read())
                    {
                        AvailableCoaches.Add(new CoachInfo
                        {
                            CoachId = reader["CoachId"].ToString(),
                            Name = reader["Coach_name"].ToString(),
                            Price = 0 // Set a default price or remove this property if not needed
                        });
                    }
                }
            }
        }
    }
    catch (Exception ex)
    {
        ErrorMessage = "Error loading coaches: " + ex.Message;
        Console.WriteLine($"Coach loading error: {ex.Message}");
    }
}
        public IActionResult OnPostSearch(string CoachId, DateTime Date, string Time)
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToPage("/Login");
            }

            SearchDate = Date;
            SearchTime = Time;
            CheckMembershipStatus(userId);
            LoadCoaches();

            if (!HasActiveMembership)
            {
                ErrorMessage = "Active membership required for booking coaching sessions.";
                LoadUserSessions(userId);
                return Page();
            }

            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Check if coach is available
                    string availabilityQuery = @"
                        SELECT COUNT(*) 
                        FROM CoachingSesion 
                        WHERE CoachId = @CoachId 
                        AND Date = @Date 
                        AND Time = @Time 
                        AND Status != 'Cancelled'";

                    using (SqlCommand command = new SqlCommand(availabilityQuery, connection))
                    {
                        command.Parameters.AddWithValue("@CoachId", CoachId);
                        command.Parameters.AddWithValue("@Date", Date);
                        command.Parameters.AddWithValue("@Time", Time);

                        int bookingCount = (int)command.ExecuteScalar();
                        IsTimeSlotAvailable = bookingCount == 0;

                        if (IsTimeSlotAvailable)
                        {
                            SelectedCoach = AvailableCoaches.FirstOrDefault(c => c.CoachId == CoachId);
                        }
                        else
                        {
                            ErrorMessage = "Selected time slot is not available.";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error checking availability: " + ex.Message;
            }

            LoadUserSessions(userId);
            return Page();
        }

        public IActionResult OnPostBook(string CoachId, DateTime Date, string Time)
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

                    // Insert coaching session
                    string insertSessionQuery = @"
                        INSERT INTO CoachingSesion (CoachId, UserId, Date, Time, Status)
                        VALUES (@CoachId, @UserId, @Date, @Time, 'Pending')";

                    using (SqlCommand command = new SqlCommand(insertSessionQuery, connection))
                    {
                        command.Parameters.AddWithValue("@CoachId", CoachId);
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.Parameters.AddWithValue("@Date", Date);
                        command.Parameters.AddWithValue("@Time", Time);
                        command.ExecuteNonQuery();
                    }

                    // Create booking record for the coaching session
                    string insertBookingQuery = @"
                        INSERT INTO Booking (court_id, user_id, date, time, status, type)
                        SELECT TOP 1 court_id, @UserId, @Date, @Time, 'Pending', 'Coaching'
                        FROM Court
                        WHERE Court_Type = 'grass'
                        AND NOT EXISTS (
                            SELECT 1 FROM Booking
                            WHERE court_id = Court.court_id
                            AND date = @Date
                            AND time = @Time
                            AND status != 'Cancelled'
                        )";

                    using (SqlCommand command = new SqlCommand(insertBookingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.Parameters.AddWithValue("@Date", Date);
                        command.Parameters.AddWithValue("@Time", Time);
                        command.ExecuteNonQuery();
                    }
                }

                return RedirectToPage("/UserDashboard/Payments");
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error booking session: " + ex.Message;
                CheckMembershipStatus(userId);
                LoadCoaches();
                LoadUserSessions(userId);
                return Page();
            }
        }

        public IActionResult OnPostCancel(int SessionId)
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

                    // Cancel coaching session
                    string updateSessionQuery = @"
                        UPDATE CoachingSesion 
                        SET Status = 'Cancelled'
                        WHERE SessionId = @SessionId AND UserId = @UserId";

                    using (SqlCommand command = new SqlCommand(updateSessionQuery, connection))
                    {
                        command.Parameters.AddWithValue("@SessionId", SessionId);
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.ExecuteNonQuery();
                    }

                    // Cancel related booking
                    string updateBookingQuery = @"
                        UPDATE Booking 
                        SET status = 'Cancelled'
                        WHERE user_id = @UserId 
                        AND date = (SELECT Date FROM CoachingSesion WHERE SessionId = @SessionId)
                        AND time = (SELECT Time FROM CoachingSesion WHERE SessionId = @SessionId)
                        AND type = 'Coaching'";

                    using (SqlCommand command = new SqlCommand(updateBookingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@SessionId", SessionId);
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error cancelling session: " + ex.Message;
            }

            CheckMembershipStatus(userId);
            LoadCoaches();
            LoadUserSessions(userId);
            return Page();
        }

        public IActionResult OnGetDebugMembership()
        {
            string userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return Content("No user ID found in session");
            }

            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string query = @"
                        SELECT m.*, GETDATE() as CurrentDate
                        FROM Menbership m
                        WHERE m.user_id = @UserId";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (!reader.HasRows)
                            {
                                return Content("No membership records found for user");
                            }

                            var details = new System.Text.StringBuilder();
                            while (reader.Read())
                            {
                                details.AppendLine($"Membership Details:");
                                details.AppendLine($"- Status: {reader["status"]}");
                                details.AppendLine($"- Start Date: {reader["start_date"]}");
                                details.AppendLine($"- End Date: {reader["end_date"]}");
                                details.AppendLine($"- Current Date: {reader["CurrentDate"]}");
                                details.AppendLine();
                            }
                            return Content(details.ToString());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return Content($"Error: {ex.Message}");
            }
        }

        private void LoadUserSessions(string userId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = @"
                        SELECT cs.SessionId, u.Coach_name as CoachName, cs.Date, cs.Time, cs.Status
                        FROM CoachingSesion cs
                        JOIN coach u ON cs.CoachId = u.coachId
                        WHERE cs.UserId = @UserId
                        ORDER BY cs.Date DESC, cs.Time DESC";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            UserSessions.Clear();
                            while (reader.Read())
                            {
                                UserSessions.Add(new UserSession
                                {
                                    SessionId = Convert.ToInt32(reader["SessionId"]),
                                    CoachName = reader["CoachName"].ToString(),
                                    Date = Convert.ToDateTime(reader["Date"]),
                                    Time = reader["Time"].ToString(),
                                    Status = reader["Status"].ToString()
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading sessions: " + ex.Message;
            }
        }
    }

   public class CoachInfo
{
    public string CoachId { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; } = 0; // Set default value to 0
}

    public class UserSession
    {
        public int SessionId { get; set; }
        public string CoachName { get; set; }
        public DateTime Date { get; set; }
        public string Time { get; set; }
        public string Status { get; set; }
    }
}
