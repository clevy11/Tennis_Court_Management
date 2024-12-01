using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;

namespace TENNIS_COURT_MANAGEMENT.Pages.UserDashboard
{
    public class MessagesModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public List<MessageInfo> Messages { get; set; } = new List<MessageInfo>();
        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public MessagesModel(IConfiguration configuration)
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

            LoadMessages(userId);
        }

        public IActionResult OnPost(string Subject, string Content)
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

                    string insertQuery = @"
                        INSERT INTO Messages (user_id, subject, content, sent_date, is_read)
                        VALUES (@UserId, @Subject, @Content, GETDATE(), 0)";

                    using (SqlCommand command = new SqlCommand(insertQuery, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.Parameters.AddWithValue("@Subject", Subject);
                        command.Parameters.AddWithValue("@Content", Content);
                        command.ExecuteNonQuery();
                    }

                    SuccessMessage = "Message sent successfully!";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = "Error sending message: " + ex.Message;
            }

            LoadMessages(userId);
            return Page();
        }

        private void LoadMessages(string userId)
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    string query = @"
                        SELECT message_id, subject, content, sent_date, is_read, reply, reply_date
                        FROM Messages 
                        WHERE user_id = @UserId 
                        ORDER BY sent_date DESC";

                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            Messages.Clear();
                            while (reader.Read())
                            {
                                Messages.Add(new MessageInfo
                                {
                                    MessageId = Convert.ToInt32(reader["message_id"]),
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

    public class MessageInfo
    {
        public int MessageId { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }
        public DateTime SentDate { get; set; }
        public bool IsRead { get; set; }
        public string Reply { get; set; }
        public DateTime? ReplyDate { get; set; }
    }
}
