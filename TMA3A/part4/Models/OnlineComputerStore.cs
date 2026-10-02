using Microsoft.EntityFrameworkCore;

namespace part4.Models
{
    public class OnlineComputerStore : DbContext
    {
        public OnlineComputerStore(DbContextOptions<OnlineComputerStore> options)
            : base(options)
        {
        }

        public DbSet<ComputerParts> ComputerParts { get; set; }
        public DbSet<PreBuilts> PreBuilts { get; set; }
        public DbSet<Orders> Orders { get; set; }
        public DbSet<Users> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Set the primary key for ComputerPart
            modelBuilder.Entity<ComputerParts>().HasKey(c => c.PartID);
            
            //Set precision and scale for Price
            modelBuilder.Entity<ComputerParts>()
                .Property(c => c.Price)
                .HasPrecision(18, 2); //Precision 18, scale 2 (123456789012345678.99)

            //Explicitly set the primary key for PreBuilts
            modelBuilder.Entity<PreBuilts>().HasKey(p => p.BuildID);
                        
            modelBuilder.Entity<PreBuilts>()
                .HasOne(p => p.CPU)
                .WithMany()
                .HasForeignKey(p => p.CPUID)
                .OnDelete(DeleteBehavior.Restrict); //No cascading delete

            modelBuilder.Entity<PreBuilts>()
                .HasOne(p => p.RAM)
                .WithMany()
                .HasForeignKey(p => p.RAMID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PreBuilts>()
                .HasOne(p => p.HardDrive)
                .WithMany()
                .HasForeignKey(p => p.HardDriveID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PreBuilts>()
                .HasOne(p => p.SoundCard)
                .WithMany()
                .HasForeignKey(p => p.SoundCardID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PreBuilts>()
                .HasOne(p => p.Display)
                .WithMany()
                .HasForeignKey(p => p.DisplayID)
                .OnDelete(DeleteBehavior.NoAction);

            //Explicitly set the primary key for Orders
            modelBuilder.Entity<Orders>()
                .HasKey(o => o.OrderID);

            modelBuilder.Entity<Orders>()
                .Property(o => o.TotalPrice)
                .HasPrecision(18, 2);  //Precision for TotalPrice property

            //Explicitly set the primary key for Users
            modelBuilder.Entity<Users>().HasKey(u => u.UserID);

            //Add seed data for ComputerParts table
            modelBuilder.Entity<ComputerParts>().HasData(
                //Operating Systems
                new ComputerParts { PartID = 1, PartName = "Windows 11 Home", PartType = "OS", Price = 199.99m, Description = "A user-friendly OS designed for personal and professional use. The refreshed design allows you to do a variety of things effortlessly." },
                new ComputerParts { PartID = 2, PartName = "Windows 11 Pro", PartType = "OS", Price = 299.99m, Description = "Offers advanced features like enhanced security and management tools for professionals and businesses. Great for smarter collaboration." },
                new ComputerParts { PartID = 3, PartName = "Ubuntu Linux", PartType = "OS", Price = 0.00m, Description = "A free open-source OS known for its stability and security, favored by developers and system administrators. Powers the work of engineers across the globe." },
                new ComputerParts { PartID = 4, PartName = "Windows 10 Home", PartType = "OS", Price = 115.99m, Description = "A versatile and reliable OS for personal use with a variety of built-in applications. One of the best experience for starting fast and getting things done." },

                //CPUs
                new ComputerParts { PartID = 5, PartName = "Intel Core i9-13900K", PartType = "CPU", Price = 699.99m, Description = "A high-performance CPU perfect for gaming and heavy workloads with advanced multitasking support. Has the power to provide you with advanced technologies." },
                new ComputerParts { PartID = 6, PartName = "AMD Ryzen 9 7950X 16-Core", PartType = "CPU", Price = 739.99m, Description = "Provides exceptional performance for gaming, content creation, and virtual machine workloads. Delivers game changing performance." },
                new ComputerParts { PartID = 7, PartName = "Intel Core i7-12700K", PartType = "CPU", Price = 469.99m, Description = "A high-performance processor for mid-level activities with impressive efficiency. Great for productivity, gaming, and content creation." },
                new ComputerParts { PartID = 8, PartName = "AMD Ryzen 7 5800XT 8-Core", PartType = "CPU", Price = 249.99m, Description = "Great for gamers and creators, with a solid performance in multi-threaded tasks and gaming. Allows you to enjoy multitasking, enhanced speed, and computing power." },

                //RAM
                new ComputerParts { PartID = 9, PartName = "G.SKILL TridentZ RGB Series 32GB", PartType = "RAM", Price = 89.99m, Description = "Ideal for gamers, offers fast response times and efficient multitasking performance while having a signature design." },
                new ComputerParts { PartID = 10, PartName = "CORSAIR Vengeance LPX 32GB", PartType = "RAM", Price = 79.99m, Description = "Designed for high-performance overclocking, great looks, performance, and compatibility." },
                new ComputerParts { PartID = 11, PartName = "CORSAIR Vengeance LPX 64GB", PartType = "RAM", Price = 132.99m, Description = "High-performance RAM for next level gaming, video editing, and professional-grade tasks." },
                new ComputerParts { PartID = 12, PartName = "CORSAIR Vengeance LPX 8GB", PartType = "RAM", Price = 59.99m, Description = "A budget-friendly option for light gaming, browsing, and basic tasks." },

                //Hard Drives
                new ComputerParts { PartID = 13, PartName = "Samsung 990 Pro 1TB NVMe PCI-e", PartType = "HardDrive", Price = 169.99m, Description = "A high-speed storage solution that reduces load times and ensures system stability with faster file access." },
                new ComputerParts { PartID = 14, PartName = "Seagate Barracuda 2TB", PartType = "HardDrive", Price = 89.99m, Description = "Provides ample storage for larger files and data, though slower than SSDs." },
                new ComputerParts { PartID = 15, PartName = "500GB SATA SSD", PartType = "HardDrive", Price = 89.99m, Description = "Great for upgrading your computer with faster load times, better system responsiveness, and enhanced security." },
                new ComputerParts { PartID = 16, PartName = "Seagate IronWolf 4TB", PartType = "HardDrive", Price = 144.99m, Description = "An improved data reliability option for storing large amounts of data, especially for media storage." },

                //Sound Cards
                new ComputerParts { PartID = 17, PartName = "Creative Sound BlasterX AE-5", PartType = "SoundCard", Price = 219.99m, Description = "High-end sound card with 32-bit/384kHz playback, customizable RGB lighting, and powerful amplification for headphones." },
                new ComputerParts { PartID = 18, PartName = "ASUS Xonar AE", PartType = "SoundCard", Price = 69.99m, Description = "Affordable PCIe sound card with 7.1 surround sound, perfect for gaming and media playback." },
                new ComputerParts { PartID = 19, PartName = "Creative Sound Blaster AE-9", PartType = "SoundCard", Price = 489.99m, Description = "All-new sound blaster delivers pure and pristine audio quality. Fantastic for professional music production and recording." },
                new ComputerParts { PartID = 20, PartName = "Creative High-performance PCI-e", PartType = "SoundCard", Price = 157.99m, Description = "Gaming-focused sound card with SBX Pro Studio technology, designed for immersive audio experiences." },

                //Displays
                new ComputerParts { PartID = 21, PartName = "Samsung Odyssey Neo G7 43\" 4K Ultra HD", PartType = "Display", Price = 849.99m, Description = "This 43-inch monitor features Quantum Matrix Technology and VESA Display HDR600 that delivers extraordinary and realistic pictures with deep, vivid, and crisp details." },
                new ComputerParts { PartID = 22, PartName = "LG UltraGear 27\" QHD 240Hz", PartType = "Display", Price = 799.99m, Description = "With a 16:9 aspect ratio and 240Hz refresh rate, this monitor delivers a sharp display and smooth motion ideal for competitive gaming." },
                new ComputerParts { PartID = 23, PartName = "Dell 27\" WQHD 100Hz 4ms IPS LED Monitor", PartType = "Display", Price = 239.99m, Description = "A 27-inch gaming monitor with USB-C connectivity. LED monitor features IPS panel and 2560 x 1440 resolution." },
                new ComputerParts { PartID = 24, PartName = "BenQ 27\" FHD 60Hz 5ms GTG IPS LCD Monitor", PartType = "Display", Price = 209.99m, Description = "Enjoy an almost frameless viewing experience with reduced bezel size at 27\". Great for gaming and multimedia consumption." },
            
                //Extra computer parts
                new ComputerParts { PartID = 25, PartName = "Fedora Linux", PartType = "OS", Price = 0.00m, Description = "A cutting-edge, free open-source Linux OS, popular among developers for its innovation and security. Great for workstation use." },
                new ComputerParts { PartID = 26, PartName = "Windows 10 Pro", PartType = "OS", Price = 149.99m, Description = "A robust OS offering business-oriented features and enhanced security, perfect for small businesses and power users." },

                new ComputerParts { PartID = 27, PartName = "Intel Core i5-13600K", PartType = "CPU", Price = 329.99m, Description = "A high-efficiency CPU offering a great balance of gaming and productivity at a more affordable price." },
                new ComputerParts { PartID = 28, PartName = "AMD Ryzen 5 7600X 6-Core", PartType = "CPU", Price = 249.99m, Description = "A strong mid-range processor ideal for gaming and everyday workloads with excellent single-threaded performance." },

                new ComputerParts { PartID = 29, PartName = "Kingston Fury Beast 16GB", PartType = "RAM", Price = 64.99m, Description = "High-performance memory with heat spreaders, great for gamers and system builders." },
                new ComputerParts { PartID = 30, PartName = "Crucial Ballistix 32GB", PartType = "RAM", Price = 84.99m, Description = "Designed for high-performance overclocking, perfect for gamers and performance enthusiasts." },

                new ComputerParts { PartID = 31, PartName = "Western Digital Blue 1TB SATA SSD", PartType = "HardDrive", Price = 99.99m, Description = "Reliable and fast solid-state drive for upgrading laptops and desktops for faster boot times." },
                new ComputerParts { PartID = 32, PartName = "Crucial MX500 2TB SATA SSD", PartType = "HardDrive", Price = 139.99m, Description = "Offers a perfect blend of speed, security, and reliability for daily computing and gaming." },

                new ComputerParts { PartID = 33, PartName = "EVGA NU Audio Pro", PartType = "SoundCard", Price = 299.99m, Description = "A premium sound card built for audiophiles, offering rich and detailed audio output with a stylish design." },
                new ComputerParts { PartID = 34, PartName = "ASUS Essence STX II", PartType = "SoundCard", Price = 249.99m, Description = "Delivers high-fidelity audio with ultra-low distortion, great for music production and critical listening." },

                new ComputerParts { PartID = 35, PartName = "Acer Predator XB283K 28\" 4K UHD 144Hz", PartType = "Display", Price = 699.99m, Description = "Premium gaming monitor featuring 4K resolution and 144Hz refresh rate for ultra-smooth visuals." },
                new ComputerParts { PartID = 36, PartName = "MSI Optix G273QF 27\" QHD 165Hz", PartType = "Display", Price = 399.99m, Description = "A great balance of high refresh rate and resolution, ideal for competitive gaming and content creation." }
            );

            //Add seed data for ComputerParts table
            modelBuilder.Entity<PreBuilts>().HasData(
                
                new PreBuilts {
                    BuildID = 1,
                    BuildName = "Mid Essentials",
                    OSID = 1,
                    CPUID = 5,
                    RAMID = 9,
                    HardDriveID = 13,
                    SoundCardID = 17,
                    DisplayID = 21,
                    BuildDescription = "Created for serious gamers and streamers, this build delivers ultra-fast load times, high frame rates, and immersive 4K visuals with powerful audio support."
                },
                new PreBuilts
                {
                    BuildID = 2,
                    BuildName = "Epic Studio",
                    OSID = 2,
                    CPUID = 6,
                    RAMID = 10,
                    HardDriveID = 14,
                    SoundCardID = 18,
                    DisplayID = 22,
                    BuildDescription = "Built for creators and professionals, this high-performance system excels at video editing, rendering, coding, and a multitasking workflow."
                },
                new PreBuilts
                {
                    BuildID = 3,
                    BuildName = "iTower",
                    OSID = 3,
                    CPUID = 7,
                    RAMID = 11,
                    HardDriveID = 15,
                    SoundCardID = 19,
                    DisplayID = 23,
                    BuildDescription = "Ideal for advanced multitasking, music production, or Linux-based development, this setup balances performance with ample memory and professional-grade audio."
                },
                new PreBuilts
                {
                    BuildID = 4,
                    BuildName = "SmartHome PC",
                    OSID = 4,
                    CPUID = 8,
                    RAMID = 12,
                    HardDriveID = 16,
                    SoundCardID = 20,
                    DisplayID = 24,
                    BuildDescription = "Designed for home and school use, this build offers reliable performance for web browsing, homework, media playback, and digital storage."
                }
            );
        }

    }
    public class ComputerParts
    {
        public int PartID { get; set; }
        public string PartName { get; set; }
        public string PartType { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
    }

    public class PreBuilts
    {
        public int BuildID { get; set; }
        public string BuildName { get; set; }
        public string BuildDescription { get; set; }

        public int OSID { get; set; }
        public int CPUID { get; set; }
        public int RAMID { get; set; }
        public int HardDriveID { get; set; }
        public int SoundCardID { get; set; }
        public int DisplayID { get; set; }

        public virtual ComputerParts OS { get; set; }
        public virtual ComputerParts CPU { get; set; }
        public virtual ComputerParts RAM { get; set; }
        public virtual ComputerParts HardDrive { get; set; }
        public virtual ComputerParts SoundCard { get; set; }
        public virtual ComputerParts Display { get; set; }
    }

    public class Orders
    {
        public int OrderID { get; set; }
        public int UserID { get; set; }
        public DateTime OrderDate { get; set; }
        public int OrderStatus { get; set; } = 0;
        public int BuildID { get; set; }
        public string BuildName { get; set; }
        public string? BuildDescription { get; set; }
        public int OSID { get; set; }
        public int CPUID { get; set; }
        public int RAMID { get; set; }
        public int HardDriveID { get; set; }
        public int SoundCardID { get; set; }
        public int DisplayID { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class Cart
    {
        public int? OrderID { get; set; }
        public DateTime? OrderDate { get; set; }
        public int? OrderStatus { get; set; } = 0;
        public string? OrderStatusMessage { get; set; }

        public int BuildID { get; set; }
        public string? BuildName { get; set; }
        public string? BuildDescription { get; set; }

        public int OSID { get; set; }
        public string? OSName { get; set; }
        public decimal OSPrice { get; set; }

        public int CPUID { get; set; }
        public string? CPUName { get; set; }
        public decimal CPUPrice { get; set; }

        public int RAMID { get; set; }
        public string? RAMName { get; set; }
        public decimal RAMPrice { get; set; }

        public int HardDriveID { get; set; }
        public string? HardDriveName { get; set; }
        public decimal HardDrivePrice { get; set; }

        public int SoundCardID { get; set; }
        public string? SoundCardName { get; set; }
        public decimal SoundCardPrice { get; set; }

        public int DisplayID { get; set; }
        public string? DisplayName { get; set; }
        public decimal DisplayPrice { get; set; }

        public decimal TotalPrice { get; set; }
    }

    public class Users
    {
        public int UserID { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string RecoveryToken { get; set; }
    }
}