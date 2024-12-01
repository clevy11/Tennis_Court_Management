using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.UserDashboard
{
    public class MembershipModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<MembershipInfo> MembershipHistory { get; set; } = new List<MembershipInfo>();
        public MembershipInfo CurrentMembership { get; set; }
        public bool HasActiveMembership { get; set; }
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public MembershipModel(IConfiguration configuration)
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

            LoadMembershipData(userId);
        }

        public IActionResult OnPost(DateTime StartDate, int DurationMonths)
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

                    // Check if user already has an active membership
                    string checkQuery = @"
                        SELECT TOP 1 1 
                        FROM Menbership 
                        WHERE user_id = @UserId 
                        AND status = 'approved' 
                        AND GETDATE() BETWEEN start_date AND end_date";

                    using (SqlCommand command = new SqlCommand(checkQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        var hasActiveMembership = command.ExecuteScalar() != null;

                        if (hasActiveMembership)
                        {
                            ErrorMessage = "You already have an active membership.";
                            LoadMembershipData(userId);
                            return Page();
                        }
                    }

                    // Check if there's a pending application
                    string pendingQuery = @"
                        SELECT TOP 1 1 
                        FROM Menbership 
                        WHERE user_id = @UserId 
                        AND status = 'pending'";

                    using (SqlCommand command = new SqlCommand(pendingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        var hasPendingApplication = command.ExecuteScalar() != null;

                        if (hasPendingApplication)
                        {
                            ErrorMessage = "You already have a pending membership application.";
                            LoadMembershipData(userId);
                            return Page();
                        }
                    }

                    // Insert new membership application
                    string insertQuery = @"
                        INSERT INTO Menbership (user_id, start_date, end_date, status)
                        VALUES (@UserId, @StartDate, @EndDate, 'pending')";

                    using (SqlCommand command = new SqlCommand(insertQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.Parameters.AddWithValue("@StartDate", StartDate);
                        command.Parameters.AddWithValue("@EndDate", StartDate.AddMonths(DurationMonths));
                        command.ExecuteNonQuery();
                    }

                    SuccessMessage = "Membership application submitted successfully! Please wait for admin approval.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error applying for membership: " + ex.Message;
            }

            LoadMembershipData(userId);
            return Page();
        }

        private void LoadMembershipData(string userId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Get current active membership
                    string currentQuery = @"
                        SELECT TOP 1 *
                        FROM Menbership 
                        WHERE user_id = @UserId 
                        AND status = 'approved' 
                        AND GETDATE() BETWEEN start_date AND end_date
                        ORDER BY end_date DESC";

                    using (SqlCommand command = new SqlCommand(currentQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                HasActiveMembership = true;
                                CurrentMembership = new MembershipInfo
                                {
                                    StartDate = Convert.ToDateTime(reader["start_date"]),
                                    EndDate = Convert.ToDateTime(reader["end_date"]),
                                    Status = reader["status"].ToString(),
                                    DurationMonths = (Convert.ToDateTime(reader["end_date"]) - Convert.ToDateTime(reader["start_date"])).Days / 30
                                };
                            }
                        }
                    }

                    // Get membership history
                    string historyQuery = @"
                        SELECT * 
                        FROM Menbership 
                        WHERE user_id = @UserId 
                        ORDER BY start_date DESC";

                    using (SqlCommand command = new SqlCommand(historyQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            MembershipHistory.Clear();
                            while (reader.Read())
                            {
                                MembershipHistory.Add(new MembershipInfo
                                {
                                    StartDate = Convert.ToDateTime(reader["start_date"]),
                                    EndDate = Convert.ToDateTime(reader["end_date"]),
                                    Status = reader["status"].ToString(),
                                    DurationMonths = (Convert.ToDateTime(reader["end_date"]) - Convert.ToDateTime(reader["start_date"])).Days / 30
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading membership data: " + ex.Message;
            }
        }
    }

    public class MembershipInfo
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public int DurationMonths { get; set; }
    }
}
