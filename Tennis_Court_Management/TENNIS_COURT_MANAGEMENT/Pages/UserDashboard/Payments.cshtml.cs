using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.UserDashboard
{
    public class PaymentsModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<PaymentInfo> PendingPayments { get; set; } = new List<PaymentInfo>();
        public List<PaymentInfo> PaymentHistory { get; set; } = new List<PaymentInfo>();
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public PaymentsModel(IConfiguration configuration)
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

            LoadPayments(userId);
        }

        public IActionResult OnPost(int PaymentId, decimal Amount)
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

                    // Start a transaction since we're updating multiple tables
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Update payment status
                            string updatePaymentQuery = @"
                                UPDATE Payments 
                                SET status = 'Completed', payment_date = GETDATE()
                                WHERE payment_id = @PaymentId AND user_id = @UserId";

                            using (SqlCommand command = new SqlCommand(updatePaymentQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@PaymentId", PaymentId);
                                command.Parameters.AddWithValue("@UserId", userId);
                                command.ExecuteNonQuery();
                            }

                            // Get payment type and related ID
                            string getPaymentInfoQuery = @"
                                SELECT payment_type, related_id
                                FROM Payments
                                WHERE payment_id = @PaymentId";

                            string paymentType = "";
                            int relatedId = 0;

                            using (SqlCommand command = new SqlCommand(getPaymentInfoQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@PaymentId", PaymentId);
                                using (SqlDataReader reader = command.ExecuteReader())
                                {
                                    if (reader.Read())
                                    {
                                        paymentType = reader["payment_type"].ToString();
                                        relatedId = Convert.ToInt32(reader["related_id"]);
                                    }
                                }
                            }

                            // Update related record based on payment type
                            string updateQuery = "";
                            if (paymentType == "Booking")
                            {
                                updateQuery = "UPDATE Booking SET Status = 'Confirmed' WHERE booking_id = @RelatedId";
                            }
                            else if (paymentType == "Menbership")
                            {
                                updateQuery = "UPDATE Menbership SET status = 'approved' WHERE menbership_id = @RelatedId";
                            }
                            else if (paymentType == "Coaching")
                            {
                                updateQuery = "UPDATE CoachingSesion SET Status = 'Confirmed' WHERE SessionId = @RelatedId";
                            }

                            if (!string.IsNullOrEmpty(updateQuery))
                            {
                                using (SqlCommand command = new SqlCommand(updateQuery, connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@RelatedId", relatedId);
                                    command.ExecuteNonQuery();
                                }
                            }

                            transaction.Commit();
                            SuccessMessage = "Payment processed successfully!";
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
                ErrorMessage = "Error processing payment: " + ex.Message;
            }

            LoadPayments(userId);
            return Page();
        }

        private void LoadPayments(string userId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Get pending payments
                    string pendingQuery = @"
                        SELECT p.payment_id, p.payment_type, p.amount, p.payment_date, p.status,
                               CASE 
                                   WHEN p.payment_type = 'Booking' THEN 'Court Booking'
                                   WHEN p.payment_type = 'Menbership' THEN 'Menbership Application'
                                   WHEN p.payment_type = 'Coaching' THEN 'Coaching Session'
                               END as details,
                               CASE
                                   WHEN p.payment_type = 'Booking' THEN b.date
                                   WHEN p.payment_type = 'Menbership' THEN m.start_date
                                   WHEN p.payment_type = 'Coaching' THEN cs.Date
                               END as service_date
                        FROM Payments p
                        LEFT JOIN Booking b ON p.related_id = b.booking_id AND p.payment_type = 'Booking'
                        LEFT JOIN Menbership m ON p.related_id = m.menbership_id AND p.payment_type = 'Menbership'
                        LEFT JOIN CoachingSesion cs ON p.related_id = cs.SessionId AND p.payment_type = 'Coaching'
                        WHERE p.user_id = @UserId AND p.status = 'Pending'
                        ORDER BY p.payment_date DESC";

                    using (SqlCommand command = new SqlCommand(pendingQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            PendingPayments.Clear();
                            while (reader.Read())
                            {
                                PendingPayments.Add(new PaymentInfo
                                {
                                    PaymentId = Convert.ToInt32(reader["payment_id"]),
                                    Type = reader["payment_type"].ToString(),
                                    Details = reader["details"].ToString(),
                                    Date = Convert.ToDateTime(reader["service_date"]),
                                    Amount = Convert.ToDecimal(reader["amount"]),
                                    Status = "Pending"
                                });
                            }
                        }
                    }

                    // Get payment history
                    string historyQuery = @"
                        SELECT p.payment_id, p.payment_type, p.amount, p.payment_date, p.status,
                               CASE 
                                   WHEN p.payment_type = 'Booking' THEN 'Court Booking'
                                   WHEN p.payment_type = 'Menbership' THEN 'Menbership Application'
                                   WHEN p.payment_type = 'Coaching' THEN 'Coaching Session'
                               END as details,
                               CASE
                                   WHEN p.payment_type = 'Booking' THEN b.date
                                   WHEN p.payment_type = 'Menbership' THEN m.start_date
                                   WHEN p.payment_type = 'Coaching' THEN cs.Date
                               END as service_date
                        FROM Payments p
                        LEFT JOIN Booking b ON p.related_id = b.booking_id AND p.payment_type = 'Booking'
                        LEFT JOIN Menbership m ON p.related_id = m.menbership_id AND p.payment_type = 'Menbership'
                        LEFT JOIN CoachingSesion cs ON p.related_id = cs.SessionId AND p.payment_type = 'Coaching'
                        WHERE p.user_id = @UserId AND p.status != 'Pending'
                        ORDER BY p.payment_date DESC";

                    using (SqlCommand command = new SqlCommand(historyQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            PaymentHistory.Clear();
                            while (reader.Read())
                            {
                                PaymentHistory.Add(new PaymentInfo
                                {
                                    PaymentId = Convert.ToInt32(reader["payment_id"]),
                                    Type = reader["payment_type"].ToString(),
                                    Details = reader["details"].ToString(),
                                    Date = Convert.ToDateTime(reader["service_date"]),
                                    Amount = Convert.ToDecimal(reader["amount"]),
                                    Status = reader["status"].ToString()
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading payments: " + ex.Message;
            }
        }
    }

    public class PaymentInfo
    {
        public int PaymentId { get; set; }
        public string Type { get; set; }
        public string Details { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
    }
}
