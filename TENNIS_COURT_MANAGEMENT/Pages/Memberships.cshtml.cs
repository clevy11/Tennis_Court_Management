using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class MembershipViewModel
    {
        public int MembershipId { get; set; }
        public string Username { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; }
    }

    public class MembershipsModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<MembershipViewModel> Memberships { get; set; } = new List<MembershipViewModel>();
        public string SuccessMessage { get; set; }
        public string ErrorMessage { get; set; }

        public MembershipsModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            LoadMemberships();
        }

        public IActionResult OnPostApprove(int membershipId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "UPDATE Menbership SET status = 'approved' WHERE menbership_id = @membershipId";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@membershipId", membershipId);
                        command.ExecuteNonQuery();
                    }
                }

                SuccessMessage = "Membership approved successfully.";
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error approving membership: " + ex.Message;
            }

            LoadMemberships();
            return Page();
        }

        public IActionResult OnPostReject(int membershipId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "UPDATE Menbership SET status = 'refused' WHERE menbership_id = @membershipId";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@membershipId", membershipId);
                        command.ExecuteNonQuery();
                    }
                }

                SuccessMessage = "Membership rejected successfully.";
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error rejecting membership: " + ex.Message;
            }

            LoadMemberships();
            return Page();
        }

        private void LoadMemberships()
        {
            Memberships.Clear();
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = @"
                        SELECT m.menbership_id, u.username, m.StartDate, m.EndDate, 
                               CAST(m.Price AS decimal(10,2)) as Price, m.status
                        FROM Menbership m
                        JOIN Users u ON m.user_id = u.user_id
                        ORDER BY m.menbership_id DESC";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var price = reader.IsDBNull(4) ? 0m : reader.GetDecimal(4);
                                Memberships.Add(new MembershipViewModel
                                {
                                    MembershipId = reader.GetInt32(0),
                                    Username = reader.GetString(1),
                                    StartDate = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                    EndDate = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                    Price = price,
                                    Status = reader.GetString(5)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading memberships: " + ex.Message;
            }
        }
    }
}
