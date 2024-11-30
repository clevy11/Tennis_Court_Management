using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;
using System.ComponentModel.DataAnnotations;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class LoginModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public string? connString = null;

        public LoginModel(IConfiguration configuration)
        {
            _configuration = configuration;
            connString = _configuration.GetConnectionString("Monday");
        }

        [BindProperty]
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; }

        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public void OnGet()
        {
            // Clear any messages
            ErrorMessage = "";
            SuccessMessage = "";

            // Clear session on get (logout)
            if (Request.Query["logout"].ToString() == "true")
            {
                HttpContext.Session.Clear();
            }
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                ErrorMessage = string.Join(", ", errors);
                return Page();
            }

            if (string.IsNullOrEmpty(connString))
            {
                ErrorMessage = "Database connection string is not configured properly.";
                return Page();
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(connString))
                {
                    try
                    {
                        connection.Open();
                    }
                    catch (SqlException ex)
                    {
                        ErrorMessage = $"Could not connect to database. Error: {ex.Message}";
                        return Page();
                    }

                    try
                    {
                        string sql = @"
                            SELECT user_id, username, Email, Role, Phone_number, Gender 
                            FROM Users 
                            WHERE Email = @Email AND Password = @Password";

                        using (SqlCommand command = new SqlCommand(sql, connection))
                        {
                            command.Parameters.AddWithValue("@Email", Email?.Trim().ToLower());
                            command.Parameters.AddWithValue("@Password", Password); 

                            try
                            {
                                using (SqlDataReader reader = command.ExecuteReader())
                                {
                                    if (reader.Read())
                                    {
                                        // User found, create session
                                        HttpContext.Session.SetString("UserId", reader["user_id"].ToString());
                                        HttpContext.Session.SetString("Username", reader["username"].ToString());
                                        HttpContext.Session.SetString("Email", reader["Email"].ToString());
                                        string userRole = reader["Role"].ToString();
                                        HttpContext.Session.SetString("Role", userRole);
                                        HttpContext.Session.SetString("Phone", reader["Phone_number"].ToString());
                                        HttpContext.Session.SetString("Gender", reader["Gender"].ToString());

                                        System.Diagnostics.Debug.WriteLine($"User Role: {userRole}");
                                        System.Diagnostics.Debug.WriteLine($"Username: {reader["username"]}");

                                        // Simple role check and redirect
                                        if (userRole.ToLower().Trim() == "admin")
                                        {
                                            System.Diagnostics.Debug.WriteLine("Redirecting to admin dashboard");
                                            return RedirectToPage("/Dashboard");
                                        }
                                        else
                                        {
                                            System.Diagnostics.Debug.WriteLine($"Redirecting to user dashboard. Role: {userRole}");
                                            return RedirectToPage("/Dshboard");
                                        }
                                    }
                                    else
                                    {
                                        ErrorMessage = "Invalid email or password";
                                        return Page();
                                    }
                                }
                            }
                            catch (SqlException ex)
                            {
                                ErrorMessage = $"Error reading user data: {ex.Message}";
                                return Page();
                            }
                        }
                    }
                    catch (SqlException ex)
                    {
                        ErrorMessage = $"Database query error: {ex.Message}";
                        return Page();
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Unexpected error: {ex.Message}";
                return Page();
            }
        }
    }
}
