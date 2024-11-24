document.addEventListener('DOMContentLoaded', () => { 

    const fetchToolIMGButton = document.getElementById('searchForm');
  

    fetchToolIMGButton.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const urlInput = document.getElementById("urlInput").value.trim();
        console.log("URL Input:", urlInput);

        const formData = new FormData();
        formData.append("url", urlInput);

        try {
            // Fetch the image search result using GET request
            const response = await fetch(`http://localhost:5000/api/imgsearch?image_url=${urlInput}`);
            
            // Check if the response is OK
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json(); 

            console.log("Server Response:", data);

            // Display the data in the output div
            displayOutput(data)


        } catch (error) {
            console.error("Error:", error); // Log any error
            document.getElementById("output").textContent = `Error: ${error.message}`; 
        }
    });

    // MongoDB query handling for tool by MPN
    const fetchToolButton = document.getElementById('fetch-tool');

    const mpnInput = document.getElementById('mpn');
    const outputDiv = document.getElementById('output');

    // Event listener for fetching tool by MPN
    fetchToolButton.addEventListener("click", async (event) => {
        event.preventDefault(); // Prevent default form submission
        const mpn = mpnInput.value.trim();

        if (!mpn) {
            displayOutput('Please enter an MPN');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/search?MPN=${mpn}`); // Backend endpoint
            if (response.ok) {
                const tool = await response.json();
                displayOutput(tool); // Display tool data
            } else {
                displayOutput('Tool not found');
            }
        } catch (err) {
            displayOutput('Error fetching tool');
            console.error(err);
        }
    });

    function displayOutput(data) {
        outputDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        outputDiv.style.padding = "20px";
        outputDiv.style.color = "var(--raisin-black)";
    }

    // Drag-and-drop functionality
    document.querySelectorAll(".drop-zone").forEach((dropZoneElement) => {
        const inputElement = dropZoneElement.querySelector(".drop-zone__input");

        dropZoneElement.addEventListener("click", () => {
            inputElement.click();
        });

        inputElement.addEventListener("change", () => {
            console.log("File selected:", inputElement.files[0]?.name || "No file");
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, () => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZoneElement.classList.remove("drop-zone--over");

            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                console.log("File dropped:", e.dataTransfer.files[0].name);
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }
        });
    });

    
    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            };
            reader.readAsDataURL(file);
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }
});

