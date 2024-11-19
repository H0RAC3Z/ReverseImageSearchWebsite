document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", () => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
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
    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
    dropZoneElement.classList.remove("drop-zone--over");
  });
});

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

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
// Below contains the javascript to get an sku from data.js
document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:3000';
  
  const fetchToolButton = document.getElementById('fetch-tool');
  const mpnInput = document.getElementById('mpn');
  const outputDiv = document.getElementById('output');


  // Fetch a tool by SKU
  fetchToolButton.addEventListener('click', async () => {
    const mpn = skuInput.value.trim();
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


