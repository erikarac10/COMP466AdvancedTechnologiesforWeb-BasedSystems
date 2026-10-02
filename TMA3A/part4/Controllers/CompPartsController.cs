using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using part4.Models;
using System.Net;
using System.Net.Mail;

namespace part4.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompPartsController : ControllerBase
    {
        private readonly OnlineComputerStore _context;

        public CompPartsController(OnlineComputerStore context)
        {
            _context = context;
        }

        //---------- Get All Component Parts ----------
        [HttpGet("GetAllCompParts")]
        public IActionResult GetAllParts()
        {
            var computerParts = _context.ComputerParts
                .Select(cp => new
                {
                    ID = cp.PartID,
                    Name = cp.PartName,
                    Type = cp.PartType,
                    Price = cp.Price.ToString("F2"),
                    cp.Description
                }).ToList();

            var prebuilds = _context.PreBuilts
                .Select(p => new
                {
                    ID = p.BuildID,
                    Name = p.BuildName,
                    Description = p.BuildDescription,
                    Type = "Build",
                    p.OSID,
                    OSName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.OSID).PartName,
                    OSPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.OSID).Price.ToString("F2"),
                    p.CPUID,
                    CPUName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.CPUID).PartName,
                    CPUPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.CPUID).Price.ToString("F2"),
                    p.RAMID,
                    RAMName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.RAMID).PartName,
                    RAMPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.RAMID).Price.ToString("F2"),
                    p.HardDriveID,
                    HardDriveName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.HardDriveID).PartName,
                    HardDrivePrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.HardDriveID).Price.ToString("F2"),
                    p.SoundCardID,
                    SoundCardName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.SoundCardID).PartName,
                    SoundCardPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.SoundCardID).Price.ToString("F2"),
                    p.DisplayID,
                    DisplayName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.DisplayID).PartName,
                    DisplayPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.DisplayID).Price.ToString("F2"),
                    Price = (
                        _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.OSID).Price +
                        _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.CPUID).Price +
                        _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.RAMID).Price +
                        _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.HardDriveID).Price +
                        _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.SoundCardID).Price +
                        _context.ComputerParts.FirstOrDefault(cp => cp.PartID == p.DisplayID).Price
                    ).ToString("F2")
                }).ToList();

            var success = computerParts.Any() && prebuilds.Any();
            return Ok(new
            {
                success,
                message = success ? "All parts fetched successfully" : "Could not retrieve comp parts",
                array1 = computerParts,
                array2 = prebuilds
            });
        }

        //---------- Get User Orders ----------
        [HttpGet("GetUserOrders")]
        public IActionResult GetUserOrders()
        {
            try
            {
                var UserID = HttpContext.Session.GetInt32("UserID");
                if (UserID == null)
                    return Ok(new { success = true, message = "Not authorized" });

                var userOrders = _context.Orders
                    .Where(order => order.UserID == UserID)
                    .Select(order => new
                    {
                        order.OrderID,
                        OrderDate = order.OrderDate.ToString("yyyy-MM-dd"),
                        order.OrderStatus,
                        OrderStatusMessage = GetOrderStatusMessage(order.OrderStatus),
                        order.BuildName,
                        order.BuildDescription,
                        Type = "Order",
                        order.OSID,
                        OSName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.OSID).PartName,
                        OSPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.OSID).Price,
                        order.CPUID,
                        CPUName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.CPUID).PartName,
                        CPUPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.CPUID).Price,
                        order.RAMID,
                        RAMName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.RAMID).PartName,
                        RAMPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.RAMID).Price,
                        order.HardDriveID,
                        HardDriveName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.HardDriveID).PartName,
                        HardDrivePrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.HardDriveID).Price,
                        order.SoundCardID,
                        SoundCardName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.SoundCardID).PartName,
                        SoundCardPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.SoundCardID).Price,
                        order.DisplayID,
                        DisplayName = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.DisplayID).PartName,
                        DisplayPrice = _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.DisplayID).Price,
                        TotalPrice = (
                            _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.OSID).Price +
                            _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.CPUID).Price +
                            _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.RAMID).Price +
                            _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.HardDriveID).Price +
                            _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.SoundCardID).Price +
                            _context.ComputerParts.FirstOrDefault(cp => cp.PartID == order.DisplayID).Price
                        )
                    }).ToList();

                if (userOrders.Any())
                {
                    return Ok(new { success = true, message = "User orders fetched successfully", array = userOrders });
                }
                else
                {
                    return Ok(new { success = true, message = "No orders yet!" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching user orders: " + ex.Message });
            }
        }

        private static string GetOrderStatusMessage(int status)
        {
            if (status == 0) return "Awaiting In-Person Payment";
            if (status == 1) return "Payment Received, Currently Being Assembled";
            if (status == 3) return "Order Successfully Completed and Fulfilled";
            return "Unknown Status";
        }

        //---------- Submit Order ----------
        [HttpPost("SubmitOrder")]
        public async Task<IActionResult> SubmitOrder([FromBody] Cart cart)
        {
            var UserID = HttpContext.Session.GetInt32("UserID") ?? -1;

            Orders order;

            if (cart.OrderID == null || cart.OrderID == 0)
            {
                order = new Orders
                {
                    UserID = UserID,
                    OrderDate = DateTime.Now,
                    OrderStatus = 0,
                    BuildID = cart.BuildID,
                    BuildName = cart.BuildName,
                    BuildDescription = cart.BuildDescription,
                    OSID = cart.OSID,
                    CPUID = cart.CPUID,
                    RAMID = cart.RAMID,
                    HardDriveID = cart.HardDriveID,
                    SoundCardID = cart.SoundCardID,
                    DisplayID = cart.DisplayID,
                    TotalPrice = cart.TotalPrice
                };

                _context.Orders.Add(order);
            }
            else
            {
                order = await _context.Orders.FindAsync(cart.OrderID);
                if (order == null) return BadRequest(new { success = false, message = "Order not found." });

                order.UserID = UserID;
                order.OrderDate = DateTime.Now;
                order.BuildID = cart.BuildID;
                order.BuildName = cart.BuildName;
                order.BuildDescription = cart.BuildDescription;
                order.OSID = cart.OSID;
                order.CPUID = cart.CPUID;
                order.RAMID = cart.RAMID;
                order.HardDriveID = cart.HardDriveID;
                order.SoundCardID = cart.SoundCardID;
                order.DisplayID = cart.DisplayID;
                order.TotalPrice = cart.TotalPrice;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = cart.OrderID == null ? "Order successfully placed." : "Order successfully updated.",
                order.OrderID,
                OrderDate = order.OrderDate.ToString("yyyy-MM-dd"),
                order.TotalPrice
            });
        }

        //---------- Delete Order ----------
        [HttpPost("DeleteOrder")]
        public async Task<IActionResult> DeleteOrder([FromBody] int OrderID)
        {
            try
            {
                var UserID = HttpContext.Session.GetInt32("UserID");
                if (UserID == null) return Ok(new { success = false, message = "Not authorized. Please log in." });

                var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderID == OrderID && o.UserID == UserID);
                if (order == null) return Ok(new { success = false, message = "Order not found" });

                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Order deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error deleting order: " + ex.Message });
            }
        }
    }
}
