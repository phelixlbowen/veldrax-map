const overlay = document.getElementById("hexOverlay");
const mapImage = document.getElementById("mapImage");

const hexName = document.getElementById("hexName");
const hexDescription = document.getElementById("hexDescription");

const dmToggle = document.getElementById("dmToggle");

let dmMode = false;
let hexData = {};

const rows = 22;
const cols = 28;

dmToggle.addEventListener("click", () => {
  dmMode = !dmMode;

  dmToggle.textContent = `DM Mode: ${dmMode ? "ON" : "OFF"}`;

  document.querySelectorAll(".hex").forEach(updateHexStyle);
});

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    hexData = data;

    const saved = localStorage.getItem("hexData");

    if (saved) {
      hexData = JSON.parse(saved);
    }

    mapImage.onload = drawGrid;

    if (mapImage.complete) {
      drawGrid();
    }
  });

function saveData() {
  localStorage.setItem("hexData", JSON.stringify(hexData));
}

function drawGrid() {

  const width = mapImage.clientWidth;
  const height = mapImage.clientHeight;

  overlay.setAttribute("width", width);
  overlay.setAttribute("height", height);

  overlay.innerHTML = "";

  const hexHeight = height / rows;
  const hexRadius = hexHeight / 2;

  const hexWidth = Math.sqrt(3) * hexRadius;

  for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

      const x = col * hexWidth + (row % 2) * (hexWidth / 2);
      const y = row * (hexHeight * 0.75);

      const points = getHexPoints(x, y, hexRadius);

      const hex = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );

      hex.setAttribute("points", points);

      const key = `${col}-${row}`;

      hex.dataset.key = key;

      updateHexStyle(hex);

      hex.addEventListener("click", () => handleHexClick(key, hex));

      overlay.appendChild(hex);
    }
  }
}

function updateHexStyle(hex) {

  const key = hex.dataset.key;
  const data = hexData[key];

  hex.classList.remove("revealed", "dm");

  if (data?.revealed) {
    hex.classList.add("revealed");
  } else if (dmMode) {
    hex.classList.add("dm");
  }
}

function handleHexClick(key, hex) {

  if (!hexData[key]) {
    hexData[key] = {
      name: `Sector ${key}`,
      description: "Nothing recorded.",
      revealed: false
    };
  }

  const data = hexData[key];

  if (dmMode) {

    data.revealed = !data.revealed;

    saveData();
    updateHexStyle(hex);

    return;
  }

  if (!data.revealed) {

    hexName.textContent = "Unknown Space";
    hexDescription.textContent =
      "This sector has not been explored.";

    return;
  }

  hexName.textContent = data.name;
  hexDescription.textContent = data.description;
}

function getHexPoints(cx, cy, r) {

  const points = [];

  for (let i = 0; i < 6; i++) {

    const angle = (Math.PI / 180) * (60 * i - 30);

    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    points.push(`${x},${y}`);
  }

  return points.join(" ");
}

window.addEventListener("resize", drawGrid);
