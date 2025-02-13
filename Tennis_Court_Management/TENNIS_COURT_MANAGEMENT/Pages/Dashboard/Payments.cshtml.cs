using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.Dashboard
{
    public class PaymentsModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<AdminPaymentInfo> Payments { get; set; } = new List<AdminPaymentInfo>();
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public PaymentsModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            LoadPayments();
        }

        public IActionResult OnPost(int PaymentId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Get payment info
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

                            // Update payment status
                            string updatePaymentQuery = @"
                                UPDATE Payments 
                                SET status = 'Completed', 
                                    payment_date = GETDATE()
                                WHERE payment_id = @PaymentId";

                            using (SqlCommand command = new SqlCommand(updatePaymentQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@PaymentId", PaymentId);
                                command.ExecuteNonQuery();
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
                            SuccessMessage = "Payment marked as completed successfully!";
                        }
                        catch
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

            LoadPayments();
            return Page();
        }

        private void LoadPayments()
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = @"
                        SELECT p.payment_id, p.user_id, u.username as user_name,
                               p.payment_type, p.amount, p.payment_date, p.status,
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
                        JOIN Users u ON p.user_id = u.user_id
                        LEFT JOIN Booking b ON p.related_id = b.booking_id AND p.payment_type = 'Booking'
                        LEFT JOIN Menbership m ON p.related_id = m.menbership_id AND p.payment_type = 'Menbership'
                        LEFT JOIN CoachingSesion cs ON p.related_id = cs.SessionId AND p.payment_type = 'Coaching'
                        ORDER BY p.payment_date DESC";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            Payments.Clear();
                            while (reader.Read())
                            {
                                Payments.Add(new AdminPaymentInfo
                                {
                                    PaymentId = Convert.ToInt32(reader["payment_id"]),
                                    UserId = Convert.ToInt32(reader["user_id"]),
                                    UserName = reader["user_name"].ToString(),
                                    Type = reader["payment_type"].ToString(),
                                    Details = reader["details"].ToString(),
                                    Amount = Convert.ToDecimal(reader["amount"]),
                                    Date = reader["service_date"] == DBNull.Value ? 
                                          Convert.ToDateTime(reader["payment_date"]) : 
                                          Convert.ToDateTime(reader["service_date"]),
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

    public class AdminPaymentInfo
    {
        public int PaymentId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Type { get; set; }
        public string Details { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}
