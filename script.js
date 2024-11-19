// Handle form submission
document.getElementById("searchForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission (page reload)

    // Retrieve the input values
    const urlInput = document.getElementById("urlInput").value.trim();
    const fileInput = document.getElementById("fileInput").files[0];

    // Validate inputs
    if (!validateInputs()) {
        return; // Stop if validation fails
    }

    if (urlInput) {
        console.log("URL submitted:", urlInput);
        // Handle URL submission
    }

    if (fileInput) {
        console.log("File submitted:", fileInput.name);
        // Handle file submission
    }

    // Send data using Fetch API
    const formData = new FormData();
    formData.append("url", urlInput);
    if (fileInput) {
        formData.append("file", fileInput);
    }

    fetch("your-server-endpoint", {
        method: "POST",
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Server Response:", data);
            // Display results or feedback to the user
            document.getElementById("output").textContent = JSON.stringify(data, null, 2);
        })
        .catch((error) => {
            console.error("Error submitting:", error);
        });
});

// Add drag-and-drop functionality
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", () => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            validateInputs();
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
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            validateInputs();
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }
        dropZoneElement.classList.remove("drop-zone--over");
    });
});

// Input validation
function validateInputs() {
    const urlInput = document.getElementById("urlInput");
    const fileInput = document.getElementById("fileInput");

    const urlValue = urlInput?.value.trim();
    const fileValue = fileInput?.files.length > 0;

    if (!urlValue && !fileValue) {
        alert("You must provide a URL or upload a file.");
        return false;
    } else if (urlValue && fileValue) {
        alert("Please fill out only one field at a time.");
        return false;
    }

    return true;
}

// Update file thumbnail (if required for drag-and-drop UI)
function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // Remove prompt text if it exists
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }

    // Create thumbnail if it doesn't exist
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show a preview for image files
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}




// Below contains the javascript to get an mpn from mongodb
document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:27017';
  
  const fetchToolButton = document.getElementById('fetch-tool');
  const mpnInput = document.getElementById('mpn');
  const outputDiv = document.getElementById('output');


  // Fetch a tool by MPN
  fetchToolButton.addEventListener('click', async () => {
    const mpn = mpnInput.value.trim();
    if (!mpn) {
      displayOutput('Please enter an MPN');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/ToolsDB/ToolsDB/${mpn}`);
      if (response.status === 404) {
        displayOutput('Tool not found');
        return;
      }

      const tool = await response.json();
      displayOutput(tool);
    } catch (err) {
      displayOutput('Error fetching tool');
      console.error(err);
    }
  });

  function displayOutput(data) {
    outputDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }
});
