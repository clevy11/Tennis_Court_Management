using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class SignupModel : PageModel
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SignupModel> _logger;
        public string? connString = null;

        public SignupModel(IConfiguration configuration, ILogger<SignupModel> logger)
        {
            _configuration = configuration;
            _logger = logger;
            connString = _configuration.GetConnectionString("Monday");
            _logger.LogInformation($"Connection string configured: {!string.IsNullOrEmpty(connString)}");
        }

        [BindProperty]
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        public string Username { get; set; }
        
        [BindProperty]
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }
        
        [BindProperty]
        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; }
        
        [BindProperty]
        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string Phone_number { get; set; }
        
        [BindProperty]
        [Required(ErrorMessage = "Gender is required")]
        public string Gender { get; set; }
        
        [BindProperty]
        public string Role { get; set; } = "user";

        public string ErrorMessage { get; set; }
        public string SuccessMessage { get; set; }

        public void OnGet()
        {
            ErrorMessage = "";
            SuccessMessage = "";
        }

        public IActionResult OnPost()
        {
            try
            {
                _logger.LogInformation("Starting signup process...");
                
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    ErrorMessage = string.Join(" ", errors);
                    _logger.LogWarning($"Model validation failed: {ErrorMessage}");
                    return Page();
                }

                if (string.IsNullOrEmpty(connString))
                {
                    ErrorMessage = "Database connection string is not configured.";
                    _logger.LogError("Connection string is null or empty");
                    return Page();
                }

                using (SqlConnection connection = new SqlConnection(connString))
                {
                    _logger.LogInformation("Opening database connection...");
                    connection.Open();
                    _logger.LogInformation("Database connection opened successfully");

                    // Check if email already exists
                    string checkEmailQuery = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
                    using (SqlCommand checkCmd = new SqlCommand(checkEmailQuery, connection))
                    {
                        checkCmd.Parameters.AddWithValue("@Email", Email?.Trim().ToLower());
                        int emailCount = (int)checkCmd.ExecuteScalar();
                        if (emailCount > 0)
                        {
                            ErrorMessage = "This email is already registered. Please use a different email.";
                            _logger.LogWarning($"Duplicate email attempt: {Email}");
                            return Page();
                        }
                    }

                    // Check if username already exists
                    string checkUsernameQuery = "SELECT COUNT(*) FROM Users WHERE username = @Username";
                    using (SqlCommand checkCmd = new SqlCommand(checkUsernameQuery, connection))
                    {
                        checkCmd.Parameters.AddWithValue("@Username", Username?.Trim());
                        int usernameCount = (int)checkCmd.ExecuteScalar();
                        if (usernameCount > 0)
                        {
                            ErrorMessage = "This username is already taken. Please choose a different username.";
                            _logger.LogWarning($"Duplicate username attempt: {Username}");
                            return Page();
                        }
                    }

                    // Insert new user
                    string sql = @"
                        INSERT INTO Users (username, Email, Password, Phone_number, Gender, Role)
                        VALUES (@Username, @Email, @Password, @Phone_number, @Gender, @Role)";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@Username", Username?.Trim());
                        command.Parameters.AddWithValue("@Email", Email?.Trim().ToLower());
                        command.Parameters.AddWithValue("@Password", Password);
                        command.Parameters.AddWithValue("@Phone_number", Phone_number?.Trim());
                        command.Parameters.AddWithValue("@Gender", Gender);
                        command.Parameters.AddWithValue("@Role", Role);

                        _logger.LogInformation("Executing insert command...");
                        command.ExecuteNonQuery();
                        _logger.LogInformation("User created successfully");
                        
                        // Set success message and redirect to login
                        TempData["SuccessMessage"] = "Account created successfully! Please login.";
                        return RedirectToPage("/Login");
                    }
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError($"Database error during signup: {ex.Message}");
                ErrorMessage = $"Database error: {ex.Message}";
                return Page();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error during signup: {ex.Message}");
                ErrorMessage = $"An unexpected error occurred: {ex.Message}";
                return Page();
            }
        }
    }
}
