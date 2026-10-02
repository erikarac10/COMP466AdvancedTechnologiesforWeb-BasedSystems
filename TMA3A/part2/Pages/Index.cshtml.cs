using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;

namespace part2.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<IndexModel> _logger;

        //Put IWebHostEnvironment and ILogger into the constructor
        public IndexModel(IWebHostEnvironment env, ILogger<IndexModel> logger)
        {
            _env = env;
            _logger = logger;
        }

        public required List<SlideshowImage> Images { get; set; }

        public void OnGet()
        {
            string filePath = Path.Combine(_env.WebRootPath, "images", "descriptions.txt");

            //Log the file path using logger
            _logger.LogInformation("File path: {FilePath}", filePath);

            Images = new List<SlideshowImage>();

            if (System.IO.File.Exists(filePath))
            {
                var lines = System.IO.File.ReadAllLines(filePath);

                foreach (var line in lines)
                {
                    var parts = line.Split('|');
                    if (parts.Length == 2)
                    {
                        //Remove extra spaces or characters...
                        var source = parts[0].Trim();
                        var caption = parts[1].Trim();

                        Images.Add(new SlideshowImage
                        {
                            source = $"images/{source}",
                            //source = $"/images/{source}",
                            caption = caption
                        });
                    }
                }
            }
            
            //Serialize the Images list to JSON format
            var imagesJson = System.Text.Json.JsonSerializer.Serialize(Images);

            //Log the serialized JSON with logger
            _logger.LogInformation("Serialized images JSON: {ImagesJson}", imagesJson);
        }

        public class SlideshowImage
        {
            public required string source { get; set; }
            public required string caption { get; set; }
        }
    }
}
