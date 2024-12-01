using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class BookingInfo
    {
        public string UserName { get; set; }
        public string CourtName { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }

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
        public List<BookingInfo> Bookings { get; set; } = new List<BookingInfo>();

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

                    // Get recent bookings
                    try
                    {
                        string recentBookingsQuery = @"
                            SELECT TOP 5 
                                u.username as UserName,
                                c.Court_Name as CourtName,
                                b.date as Date,
                                b.Status
                            FROM Booking b
                            JOIN Users u ON b.user_id = u.user_id
                            JOIN Court c ON b.court_id = c.court_id
                            ORDER BY b.date DESC, b.time DESC";

                        using (SqlCommand command = new SqlCommand(recentBookingsQuery, connection))
                        {
                            using (SqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    Bookings.Add(new BookingInfo
                                    {
                                        UserName = reader.GetString(0),
                                        CourtName = reader.GetString(1),
                                        Date = reader.GetDateTime(2),
                                        Status = reader.GetString(3)
                                    });
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error in Recent Bookings query: {ex.Message}");
                    }

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
                            FROM Menbership m 
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
                        string pendingBookingQuery = @"
                            SELECT COUNT(*) FROM Booking 
                            WHERE status = 'Pending'";
                        using (SqlCommand command = new SqlCommand(pendingBookingQuery, connection))
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
                            SELECT COALESCE(SUM(amount), 0)
                            FROM Payments
                            WHERE status = 'Completed'";
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
                ErrorMessage = ex.Message;
                Console.WriteLine($"General error in Dashboard: {ex.Message}");
            }

            return Page();
        }

        public IActionResult OnGetGenerateReport()
        {
            try
            {
                string connectionString = _configuration.GetConnectionString("Monday");
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Get all the statistics first
                    string statsQuery = @"
                        SELECT 
                            (SELECT COUNT(*) FROM Users WHERE Role = 'user') as TotalUsers,
                            (SELECT COUNT(*) FROM Booking WHERE status IS NOT NULL) as TotalBookings,
                            (SELECT COUNT(*) FROM Court) as TotalCourts,
                            (SELECT COUNT(*) FROM Booking WHERE status = 'Confirmed') as ActiveBookings,
                            (SELECT COUNT(DISTINCT user_id) FROM Menbership WHERE status = 'approved') as ActiveMembers,
                            (SELECT COUNT(*) FROM coach WHERE status = 'Active') as ActiveCoaches,
                            (SELECT COUNT(*) FROM Booking WHERE status = 'Pending') as PendingBookings,
                            (SELECT COALESCE(SUM(amount), 0) FROM Payments WHERE status = 'Completed') as TotalRevenue";

                    using (SqlCommand command = new SqlCommand(statsQuery, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                TotalUsers = reader.GetInt32(0);
                                TotalBookings = reader.GetInt32(1);
                                TotalCourts = reader.GetInt32(2);
                                ActiveBookings = reader.GetInt32(3);
                                ActiveMembers = reader.GetInt32(4);
                                ActiveCoaches = reader.GetInt32(5);
                                PendingBookings = reader.GetInt32(6);
                                TotalRevenue = reader.GetDecimal(7);
                            }
                        }
                    }

                    // Get recent bookings
                    string bookingsQuery = @"
                        SELECT TOP 10
                            u.username as UserName,
                            c.Court_Name as CourtName,
                            b.date as Date,
                            b.Status
                        FROM Booking b
                        JOIN Users u ON b.user_id = u.user_id
                        JOIN Court c ON b.court_id = c.court_id
                        ORDER BY b.date DESC, b.time DESC";

                    Bookings.Clear();
                    using (SqlCommand command = new SqlCommand(bookingsQuery, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Bookings.Add(new BookingInfo
                                {
                                    UserName = reader.GetString(0),
                                    CourtName = reader.GetString(1),
                                    Date = reader.GetDateTime(2),
                                    Status = reader.GetString(3)
                                });
                            }
                        }
                    }
                }

                // Generate PDF with the fresh data
                using (MemoryStream ms = new MemoryStream())
                {
                    Document document = new Document(PageSize.A4, 25, 25, 30, 30);
                    PdfWriter writer = PdfWriter.GetInstance(document, ms);

                    document.Open();

                    // Add title and header
                    Font titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
                    Font headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);
                    Font normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 12);

                    document.Add(new Paragraph("Tennis Court Management System Report", titleFont));
                    document.Add(new Paragraph($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm}", normalFont));
                    document.Add(new Paragraph("----------------------------------------"));

                    // Add statistics
                    document.Add(new Paragraph("\nSystem Statistics", headerFont));
                    document.Add(new Paragraph($"Total Users: {TotalUsers}", normalFont));
                    document.Add(new Paragraph($"Active Members: {ActiveMembers}", normalFont));
                    document.Add(new Paragraph($"Total Courts: {TotalCourts}", normalFont));
                    document.Add(new Paragraph($"Active Bookings: {ActiveBookings}", normalFont));
                    document.Add(new Paragraph($"Pending Bookings: {PendingBookings}", normalFont));
                    document.Add(new Paragraph($"Active Coaches: {ActiveCoaches}", normalFont));
                    document.Add(new Paragraph($"Total Revenue: ${TotalRevenue:F2}", normalFont));
                    document.Add(new Paragraph("----------------------------------------"));

                    // Add recent bookings table
                    document.Add(new Paragraph("\nRecent Bookings", headerFont));
                    PdfPTable table = new PdfPTable(4);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 2f, 2f, 2f, 1.5f });

                    // Add table headers
                    table.AddCell(new PdfPCell(new Phrase("User", headerFont)));
                    table.AddCell(new PdfPCell(new Phrase("Court", headerFont)));
                    table.AddCell(new PdfPCell(new Phrase("Date", headerFont)));
                    table.AddCell(new PdfPCell(new Phrase("Status", headerFont)));

                    // Add table data
                    foreach (var booking in Bookings)
                    {
                        table.AddCell(new Phrase(booking.UserName, normalFont));
                        table.AddCell(new Phrase(booking.CourtName, normalFont));
                        table.AddCell(new Phrase(booking.Date.ToString("yyyy-MM-dd"), normalFont));
                        table.AddCell(new Phrase(booking.Status, normalFont));
                    }

                    document.Add(table);

                    document.Close();
                    writer.Close();

                    var pdfBytes = ms.ToArray();
                    return File(pdfBytes, "application/pdf", $"TennisCourtReport_{DateTime.Now:yyyyMMdd}.pdf");
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Error generating report: {ex.Message}";
                Console.WriteLine($"Report generation error: {ex.Message}");
                return RedirectToPage();
            }
        }

        public IActionResult OnPostLogout()
        {
            // Clear session
            HttpContext.Session.Clear();
            return RedirectToPage("/Login", new { logout = true });
        }
    }
}
