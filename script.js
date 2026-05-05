// DOM elements
const tempInput = document.getElementById("tempValue");
const fromUnitSelect = document.getElementById("fromUnit");
const toUnitSelect = document.getElementById("toUnit");
const resultDisplay = document.getElementById("resultValue");
const conversionFlowSpan = document.getElementById("conversionFlowLabel");
const formulaTextSpan = document.getElementById("formulaText");
const errorArea = document.getElementById("errorArea");
const convertBtn = document.getElementById("convertAction");

// Helper: get unit symbol and full name
function getUnitInfo(unitCode) {
  const map = {
    celsius: { symbol: "°C", name: "Celsius", short: "℃" },
    fahrenheit: { symbol: "°F", name: "Fahrenheit", short: "℉" },
    kelvin: { symbol: "K", name: "Kelvin", short: "K" },
  };
  return map[unitCode] || map.celsius;
}

// Update conversion flow label and formula dynamically based on from/to
function updateFlowAndFormula() {
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  const fromInfo = getUnitInfo(fromUnit);
  const toInfo = getUnitInfo(toUnit);

  conversionFlowSpan.innerHTML = `${fromInfo.short} → ${toInfo.short}`;

  // Formula hints helper
  if (fromUnit === "celsius" && toUnit === "fahrenheit") {
    formulaTextSpan.innerText = `°C × 9/5 + 32 = °F`;
  } else if (fromUnit === "celsius" && toUnit === "kelvin") {
    formulaTextSpan.innerText = `°C + 273.15 = K`;
  } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
    formulaTextSpan.innerText = `(°F – 32) × 5/9 = °C`;
  } else if (fromUnit === "fahrenheit" && toUnit === "kelvin") {
    formulaTextSpan.innerText = `(°F – 32) × 5/9 + 273.15 = K`;
  } else if (fromUnit === "kelvin" && toUnit === "celsius") {
    formulaTextSpan.innerText = `K – 273.15 = °C`;
  } else if (fromUnit === "kelvin" && toUnit === "fahrenheit") {
    formulaTextSpan.innerText = `(K – 273.15) × 9/5 + 32 = °F`;
  } else if (fromUnit === toUnit) {
    formulaTextSpan.innerText = `Same unit — value remains unchanged`;
  } else {
    formulaTextSpan.innerText = `${fromInfo.name} → ${toInfo.name} conversion`;
  }
}

// Clear error function
function clearError() {
  errorArea.innerHTML = "";
}

// Show error with animation
function displayError(message) {
  errorArea.innerHTML = `<div class="error-modern shake-modern"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
  setTimeout(() => {
    const errDiv = errorArea.querySelector(".error-modern");
    if (errDiv) errDiv.classList.remove("shake-modern");
  }, 300);
}

// Core conversion logic: fromUnit, toUnit, value (number)
function performConversion() {
  clearError();

  // Get input
  const rawInput = tempInput.value.trim();
  if (rawInput === "") {
    displayError("Please enter a temperature value");
    return;
  }

  const numericValue = parseFloat(rawInput);
  if (isNaN(numericValue)) {
    displayError("Please enter a valid number (e.g., 32, -5.5, 100.3)");
    return;
  }

  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;

  // If same unit, just return the same value
  if (fromUnit === toUnit) {
    const unitSym = getUnitInfo(toUnit).symbol;
    let formatted = numericValue.toFixed(4);
    formatted = parseFloat(formatted).toString();
    if (!formatted.includes(".")) formatted += ".0";
    else formatted = formatted.replace(/\.?0+$/, "");
    if (formatted.endsWith(".")) formatted += "0";

    resultDisplay.classList.remove("result-animate");
    void resultDisplay.offsetWidth;
    resultDisplay.innerHTML = `${formatted} <span style="font-size: 1rem; font-weight: 500;">${unitSym}</span>`;
    resultDisplay.classList.add("result-animate");
    updateFlowAndFormula();
    return;
  }

  // Step 1: Convert from source unit to Celsius (intermediate)
  let celsiusValue;
  if (fromUnit === "celsius") {
    celsiusValue = numericValue;
  } else if (fromUnit === "fahrenheit") {
    celsiusValue = ((numericValue - 32) * 5) / 9;
  } else if (fromUnit === "kelvin") {
    celsiusValue = numericValue - 273.15;
  } else {
    displayError("Invalid source unit");
    return;
  }

  // Step 2: Convert from Celsius to target unit
  let finalValue;
  let targetSymbol;
  if (toUnit === "celsius") {
    finalValue = celsiusValue;
    targetSymbol = "°C";
  } else if (toUnit === "fahrenheit") {
    finalValue = (celsiusValue * 9) / 5 + 32;
    targetSymbol = "°F";
  } else if (toUnit === "kelvin") {
    finalValue = celsiusValue + 273.15;
    targetSymbol = "K";
  } else {
    displayError("Invalid target unit");
    return;
  }

  // Format output: 4 decimals max, remove trailing zeros
  let formattedResult = finalValue.toFixed(4);
  formattedResult = parseFloat(formattedResult).toString();
  if (!formattedResult.includes(".")) formattedResult += ".0";
  else formattedResult = formattedResult.replace(/\.?0+$/, "");
  if (formattedResult.endsWith(".")) formattedResult += "0";

  // Animate result update
  resultDisplay.classList.remove("result-animate");
  void resultDisplay.offsetWidth;
  resultDisplay.innerHTML = `${formattedResult} <span style="font-size: 1rem; font-weight: 500;">${targetSymbol}</span>`;
  resultDisplay.classList.add("result-animate");

  // Update dynamic flow & formula labels
  updateFlowAndFormula();
}

// Handle Enter key press
function handleEnterKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    performConversion();
    // Button ripple Vibe
    convertBtn.style.transform = "scale(0.98)";
    setTimeout(() => {
      convertBtn.style.transform = "";
    }, 120);
  }
}

// When fromUnit or toUnit changes: update labels only, NO auto-convert
// But we update flow hint and also optionally remind user to click convert.
function onUnitChange() {
  updateFlowAndFormula();
  // Gentle reminder if result exists already but not same as new units
  if (resultDisplay.innerHTML !== "— —") {
    // show non-intrusive tooltip-like reminder
    const reminderId = "reminderToast";
    if (!document.getElementById(reminderId)) {
      const reminder = document.createElement("div");
      reminder.id = reminderId;
      reminder.className = "error-modern";
      reminder.style.background = "rgba(99, 102, 241, 0.15)";
      reminder.style.borderLeftColor = "#818cf8";
      reminder.style.color = "#c7d2fe";
      reminder.style.fontSize = "0.7rem";
      reminder.style.padding = "0.5rem 1rem";
      reminder.innerHTML =
        '<i class="fas fa-info-circle"></i> Units changed · Press "Convert Now" for new result';
      errorArea.appendChild(reminder);
      setTimeout(() => {
        if (reminder && reminder.remove) reminder.remove();
      }, 2000);
    }
  }
}

// When user types in input: only clear errors, no conversion
function onInputModify() {
  clearError();
}

// Attach event listeners
convertBtn.addEventListener("click", (e) => {
  e.preventDefault();
  performConversion();
  // button subtle animation
  convertBtn.style.transform = "scale(0.97)";
  setTimeout(() => {
    convertBtn.style.transform = "";
  }, 100);
});

tempInput.addEventListener("keypress", handleEnterKey);
tempInput.addEventListener("input", onInputModify);
fromUnitSelect.addEventListener("change", onUnitChange);
toUnitSelect.addEventListener("change", onUnitChange);

// Live Clock
function updateLiveClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const timeString = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  const clockSpan = document.getElementById("liveClock");
  if (clockSpan) clockSpan.textContent = timeString;
}

// Initialize everything: set default values, result blank, no auto-convert
function initialize() {
  // Set defaults: From = Fahrenheit, To = Celsius, Value = 32
  fromUnitSelect.value = "fahrenheit";
  toUnitSelect.value = "celsius";
  tempInput.value = "32";
  updateFlowAndFormula();
  resultDisplay.innerHTML = "— —";
  clearError();
  updateLiveClock();
  setInterval(updateLiveClock, 60000);
}

initialize();
