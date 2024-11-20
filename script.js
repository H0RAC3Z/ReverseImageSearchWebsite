document.addEventListener('DOMContentLoaded', () => {

    document.getElementById("searchForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default submission

        const urlInput = document.getElementById("urlInput").value.trim();

        console.log("URL Input:", urlInput);

        // Validate inputs
        if (!validateInputs()) return;

        const formData = new FormData();
        formData.append("url", urlInput);

        fetch("your-server-endpoint", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Server Response:", data);
                document.getElementById("output").textContent = JSON.stringify(data, null, 2);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });

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
});

// Thumbnail updates for drag-and-drop
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





// Below contains the javascript to get an mpn from mongodb
document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:27017';
  
  const fetchToolButton = document.getElementById('fetch-tool');
  const mpnInput = document.getElementById('mpn');
  const outputDiv = document.getElementById('output');


  // Fetch a tool by MPN
  fetchToolButton.addEventListener("click", async (event) => {
    event.preventDefault();
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
