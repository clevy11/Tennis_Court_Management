using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Data.SqlClient; // Updated namespace

namespace TENNIS_COURT_MANAGEMENT.Pages
{
    public class BookingModel : PageModel
    {
        public List<Court> Courts { get; set; } = new();
        public List<Coach> Coaches { get; set; } = new();

        [BindProperty]
        public string? SelectedDate { get; set; }
        [BindProperty]
        public string? SelectedTime { get; set; }
        [BindProperty]
        public int? SelectedCourtId { get; set; }
        [BindProperty]
        public int? SelectedCoachId { get; set; }

        public void OnGet()
        {
            LoadCourtsAndCoaches();
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                TempData["Message"] = "Please correct the errors.";
                return Page();
            }

            // Save booking
            SaveBooking();
            TempData["Message"] = "Booking successful!";
            return RedirectToPage();
        }

        private void LoadCourtsAndCoaches()
        {
            // Mocked data; replace with database query
            Courts = new List<Court>
            {
                new Court { CourtId = 1, CourtName = "Court A" },
                new Court { CourtId = 2, CourtName = "Court B" }
            };

            Coaches = new List<Coach>
            {
                new Coach { CoachId = 1, CoachName = "Coach John" },
                new Coach { CoachId = 2, CoachName = "Coach Jane" }
            };
        }

        private void SaveBooking()
        {
            string connectionString = "YourConnectionStringHere";

            // Using Microsoft.Data.SqlClient.SqlConnection
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                string query = "INSERT INTO Booking (Date, Time, CourtId, CoachId) VALUES (@Date, @Time, @CourtId, @CoachId)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Date", SelectedDate ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@Time", SelectedTime ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@CourtId", SelectedCourtId ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@CoachId", SelectedCoachId ?? (object)DBNull.Value);

                    cmd.ExecuteNonQuery();
                }
            }
        }
    }

    public class Court
    {
        public int CourtId { get; set; }
        public string CourtName { get; set; } = string.Empty;
    }

    public class Coach
    {
        public int CoachId { get; set; }
        public string CoachName { get; set; } = string.Empty;
    }
}
