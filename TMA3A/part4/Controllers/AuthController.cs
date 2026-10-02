using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using part4.Models;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace part4.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly OnlineComputerStore _context;

        public AuthController(OnlineComputerStore context)
        {
            _context = context;
        }

        //---------- Register ----------
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromForm] string email, [FromForm] string password)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return Ok(new { success = false, message = "Email and password are required." });

            if (!IsValidEmail(email))
                return Ok(new { success = false, message = "Invalid email format." });

            if (password.Length < 3)
                return Ok(new { success = false, message = "Password must be at least 3 characters long." });

            bool userExists = await _context.Users.AnyAsync(u => u.Email == email);
            if (userExists)
                return Ok(new { success = false, message = "Email is already registered." });

            string hashedPassword = HashPassword(password);

            var newUser = new Users
            {
                Email = email,
                Password = hashedPassword,
                RecoveryToken = Guid.NewGuid().ToString()
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            HttpContext.Session.SetInt32("UserID", newUser.UserID);
            return Ok(new { success = true, message = "Registration successful.", newUser.UserID });
        }

        //---------- Login ----------
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromForm] string email, [FromForm] string password, [FromForm] string? recoveryToken)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return Ok(new { success = false, message = "Email and password are required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Ok(new { success = false, message = "Account not found." });

            if (!string.IsNullOrWhiteSpace(recoveryToken))
            {
                if (user.RecoveryToken != recoveryToken)
                    return Ok(new { success = false, message = "Invalid recovery token." });

                user.Password = HashPassword(password);
                user.RecoveryToken = Guid.NewGuid().ToString();
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Password reset successful. Please log in with your new password.", user.UserID });
            }

            string hashedPassword = HashPassword(password);
            if (user.Password != hashedPassword)
                return Ok(new { success = false, message = "Incorrect password." });

            HttpContext.Session.SetInt32("UserID", user.UserID);
            return Ok(new { success = true, message = "Login successful.", user.UserID });
        }

        //---------- Recovery ----------
        [HttpPost("Recovery")]
        public async Task<IActionResult> Recover([FromForm] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return Ok(new { success = false, message = "Email is required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Ok(new { success = false, message = "No account with that email exists." });

            string token = Guid.NewGuid().ToString();
            user.RecoveryToken = token;
            await _context.SaveChangesAsync();

            try
            {
                SendRecoveryEmail(email, token);
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = "Error sending email: " + ex.Message });
            }

            return Ok(new { success = true, message = "Recovery token sent to your email." });
        }

        //---------- Email Helper ----------
        private void SendRecoveryEmail(string toEmail, string token)
        {
            var fromAddress = new MailAddress("builtdifferentpcsstore@gmail.com", "BuildDifferentPcs");
            var toAddress = new MailAddress(toEmail);
            const string fromPassword = "replace_with_email_app_password";
            const string subject = "Password Recovery";

            string baseUrl = "http://localhost:5188";
            string recoveryLink = $"{baseUrl}?token={token}";

            string body = $@"
                Hi,

                You requested a password reset.

                Steps:
                1. Click on this link: {recoveryLink}
                2. Enter your registered email and choose a new password.
                3. Click Reset Password.
                4. Once your password has been updated, you can log in here or return to the main TMA3A website and log in using your new password.


                If you didn't request this, you can ignore the email.

                Thank you,
                BuildDifferentPCs Team";

            var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
            };

            using var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body
            };

            smtp.Send(message);
        }

        //---------- Hash Helper ----------
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        //---------- Validation Helper ----------
        private bool IsValidEmail(string email)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(email);
        }
    }
}