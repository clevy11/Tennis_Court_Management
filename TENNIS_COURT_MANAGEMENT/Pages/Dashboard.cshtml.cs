using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class DashboardModel : PageModel
    {
        private readonly IConfiguration _configuration;
        public string? connectionString = null;
        public string AdminName { get; set; }
        public int TotalUsers { get; set; }
        public int TotalBookings { get; set; }
        public int TotalCourts { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ActiveBookings { get; set; }
        public int ActiveMembers { get; set; }
        public int ActiveCoaches { get; set; }
        public int PendingBookings { get; set; }
        public string ErrorMessage { get; set; }

        public DashboardModel(IConfiguration configuration)
        {
            _configuration = configuration;
            connectionString = _configuration.GetConnectionString("Monday");
        }

        public IActionResult OnGet()
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToPage("/Login");
            }

            // Get role and debug info
            string role = HttpContext.Session.GetString("Role")?.ToLower().Trim() ?? "";
            System.Diagnostics.Debug.WriteLine($"Dashboard - User Role: {role}");
            System.Diagnostics.Debug.WriteLine($"Dashboard - Username: {HttpContext.Session.GetString("Username")}");

            // Check if admin
            if (role != "admin")
            {
                System.Diagnostics.Debug.WriteLine("Non-admin user attempting to access dashboard");
                return RedirectToPage("/Login");
            }

            // Get admin name from session
            AdminName = HttpContext.Session.GetString("Username") ?? "Admin";
            System.Diagnostics.Debug.WriteLine($"Admin name set to: {AdminName}");

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    Console.WriteLine("Database connection opened successfully");

                    // Get total users (excluding admins)
                    try
                    {
                        string userQuery = "SELECT COUNT(*) FROM Users WHERE Role = 'user'";
                        using (SqlCommand command = new SqlCommand(userQuery, connection))
                        {
                            TotalUsers = (int)command.ExecuteScalar();
                            Console.WriteLine($"Total Users Query Result: {TotalUsers}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Total Users query: {ex.Message}");
                    }

                    // Get total bookings
                    try
                    {
                        string bookingQuery = "SELECT COUNT(*) FROM Booking WHERE status IS NOT NULL";
                        using (SqlCommand command = new SqlCommand(bookingQuery, connection))
                        {
                            TotalBookings = (int)command.ExecuteScalar();
                            Console.WriteLine($"Total Bookings Query Result: {TotalBookings}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Total Bookings query: {ex.Message}");
                    }

                    // Get total courts
                    try
                    {
                        string courtQuery = "SELECT COUNT(*) FROM Court WHERE court_id IS NOT NULL";
                        using (SqlCommand command = new SqlCommand(courtQuery, connection))
                        {
                            TotalCourts = (int)command.ExecuteScalar();
                            Console.WriteLine($"Total Courts Query Result: {TotalCourts}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Total Courts query: {ex.Message}");
                    }

                    // Get active bookings
                    try
                    {
                        string activeBookingQuery = @"
                            SELECT COUNT(*) FROM Booking 
                            WHERE status = 'Confirmed'";
                        using (SqlCommand command = new SqlCommand(activeBookingQuery, connection))
                        {
                            ActiveBookings = (int)command.ExecuteScalar();
                            Console.WriteLine($"Active Bookings Query Result: {ActiveBookings}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Active Bookings query: {ex.Message}");
                    }

                    // Get active members
                    try
                    {
                        string activeMemberQuery = @"
                            SELECT COUNT(DISTINCT m.user_id) 
                            FROM Membership m 
                            WHERE m.status = 'approved'";
                        using (SqlCommand command = new SqlCommand(activeMemberQuery, connection))
                        {
                            ActiveMembers = (int)command.ExecuteScalar();
                            Console.WriteLine($"Active Members Query Result: {ActiveMembers}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Active Members query: {ex.Message}");
                    }

                    // Get active coaches
                    try
                    {
                        string activeCoachQuery = @"SELECT COUNT(*) FROM coach
                            WHERE status = 'Active'";
                        using (SqlCommand command = new SqlCommand(activeCoachQuery, connection))
                        {
                            ActiveCoaches = (int)command.ExecuteScalar();
                            Console.WriteLine($"Active Coaches Query Result: {ActiveCoaches}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Active Coaches query: {ex.Message}");
                    }

                    // Get pending bookings
                    try
                    {
                        string pendingQuery = @"
                            SELECT COUNT(*) FROM Booking 
                            WHERE status = 'pending'";
                        using (SqlCommand command = new SqlCommand(pendingQuery, connection))
                        {
                            PendingBookings = (int)command.ExecuteScalar();
                            Console.WriteLine($"Pending Bookings Query Result: {PendingBookings}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Pending Bookings query: {ex.Message}");
                    }

                    // Get total revenue
                    try
                    {
                        string revenueQuery = @"
                            SELECT ISNULL(SUM(CAST(price AS decimal(10,2))), 0)
                            FROM Court c 
                            INNER JOIN Booking b ON c.court_id = b.court_id
                            WHERE b.status = 'Confirmed'";
                        using (SqlCommand command = new SqlCommand(revenueQuery, connection))
                        {
                            TotalRevenue = Convert.ToDecimal(command.ExecuteScalar());
                            Console.WriteLine($"Total Revenue Query Result: {TotalRevenue}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Total Revenue query: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                string error = $"Error loading dashboard data: {ex.Message}";
                Console.WriteLine(error);
                ErrorMessage = error;
                
                // Set default values if database access fails
                TotalUsers = 0;
                TotalBookings = 0;
                TotalCourts = 0;
                ActiveBookings = 0;
                ActiveMembers = 0;
                ActiveCoaches = 0;
                PendingBookings = 0;
                TotalRevenue = 0;
            }

            return Page();
        }

        public IActionResult OnPostLogout()
        {
            // Clear session
            HttpContext.Session.Clear();
            return RedirectToPage("/Login", new { logout = true });
        }
    }
}
