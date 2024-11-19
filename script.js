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

// Below contains the javascript to get an sku from data.js
document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:27017';
  
  const fetchToolButton = document.getElementById('fetch-tool');
  const mpnInput = document.getElementById('mpn');
  const outputDiv = document.getElementById('output');


  // Fetch a tool by SKU
  fetchToolButton.addEventListener('click', async () => {
    const mpn = mpnInput.value.trim();
    if (!mpn) {
      displayOutput('Please enter an MPN');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/tools/${mpn}`);
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
