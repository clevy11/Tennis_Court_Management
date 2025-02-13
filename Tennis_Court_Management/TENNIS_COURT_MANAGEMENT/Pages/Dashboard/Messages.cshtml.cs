using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.Dashboard
{
    public class MessagesModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<AdminMessageInfo> Messages { get; set; } = new List<AdminMessageInfo>();
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public MessagesModel(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnGet()
        {
            LoadMessages();
        }

        public IActionResult OnPost(int MessageId, string Reply)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string updateQuery = @"
                        UPDATE Messages 
                        SET reply = @Reply, 
                            reply_date = GETDATE(),
                            is_read = 1
                        WHERE message_id = @MessageId";

                    using (SqlCommand command = new SqlCommand(updateQuery, connection))
                    {
                        command.Parameters.AddWithValue("@MessageId", MessageId);
                        command.Parameters.AddWithValue("@Reply", Reply);
                        command.ExecuteNonQuery();
                    }

                    SuccessMessage = "Reply sent successfully!";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error sending reply: " + ex.Message;
            }

            LoadMessages();
            return Page();
        }

        private void LoadMessages()
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = @"
                        SELECT m.message_id, m.user_id, u.username as user_name, 
                               m.subject, m.content, m.sent_date, 
                               m.is_read, m.reply, m.reply_date
                        FROM Messages m
                        JOIN Users u ON m.user_id = u.user_id
                        ORDER BY m.sent_date DESC";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            Messages.Clear();
                            while (reader.Read())
                            {
                                Messages.Add(new AdminMessageInfo
                                {
                                    MessageId = Convert.ToInt32(reader["message_id"]),
                                    UserId = Convert.ToInt32(reader["user_id"]),
                                    UserName = reader["user_name"].ToString(),
                                    Subject = reader["subject"].ToString(),
                                    Content = reader["content"].ToString(),
                                    SentDate = Convert.ToDateTime(reader["sent_date"]),
                                    IsRead = Convert.ToBoolean(reader["is_read"]),
                                    Reply = reader["reply"] == DBNull.Value ? null : reader["reply"].ToString(),
                                    ReplyDate = reader["reply_date"] == DBNull.Value ? null : Convert.ToDateTime(reader["reply_date"])
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error loading messages: " + ex.Message;
            }
        }
    }

    public class AdminMessageInfo
    {
        public int MessageId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public DateTime SentDate { get; set; }
        public bool IsRead { get; set; }
        public string Reply { get; set; }
        public DateTime? ReplyDate { get; set; }
    }
}
