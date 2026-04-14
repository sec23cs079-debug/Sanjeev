// ===== DOM ELEMENTS =====
const unitBtns       = document.querySelectorAll('.unit-btn');
const tempInput      = document.getElementById('tempInput');
const inputUnitEl    = document.getElementById('inputUnit');
const errorMsg       = document.getElementById('errorMsg');
const resultArea     = document.getElementById('resultArea');
const convertBtn     = document.getElementById('convertBtn');
const formulaNote    = document.getElementById('formulaNote');

// ===== STATE =====
let selectedUnit = 'C';

// Unit display symbols
const symbols = { C: '°C', F: '°F', K: 'K' };
const labels  = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' };

// ===== UNIT TAB SWITCHING =====
unitBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Deactivate all, activate clicked
    unitBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    selectedUnit = btn.dataset.unit;

    // Update the symbol shown inside the input field
    inputUnitEl.textContent = symbols[selectedUnit];
    inputUnitEl.className   = 'input-unit ' + selectedUnit;

    // Clear any previous result and errors
    clearResult();
    clearError();
  });
});

// ===== VALIDATION =====
function validate(value) {
  if (value === '' || value === null) {
    return 'Please enter a temperature value.';
  }
  if (isNaN(Number(value))) {
    return 'Please enter a valid number.';
  }

  const num = Number(value);

  // Physical lower bound checks (absolute zero)
  if (selectedUnit === 'C' && num < -273.15) {
    return 'Below absolute zero (−273.15 °C).';
  }
  if (selectedUnit === 'F' && num < -459.67) {
    return 'Below absolute zero (−459.67 °F).';
  }
  if (selectedUnit === 'K' && num < 0) {
    return 'Kelvin cannot be negative.';
  }

  return null; // No error
}

// ===== CONVERSION MATH =====
function convertToAll(value, fromUnit) {
  const v = Number(value);
  let C, F, K;

  if (fromUnit === 'C') {
    C = v;
    F = (v * 9 / 5) + 32;
    K = v + 273.15;

  } else if (fromUnit === 'F') {
    C = (v - 32) * 5 / 9;
    F = v;
    K = (v - 32) * 5 / 9 + 273.15;

  } else { // Kelvin
    C = v - 273.15;
    F = (v - 273.15) * 9 / 5 + 32;
    K = v;
  }

  return { C, F, K };
}

// Format number: up to 4 decimal places, no trailing zeros
function fmt(num) {
  return parseFloat(num.toFixed(4)).toString();
}

// ===== MAIN CONVERT FUNCTION =====
function convert() {
  const value = tempInput.value;

  // 1. Validate
  const error = validate(value);
  if (error) {
    showError(error);
    clearResult();
    return;
  }

  // 2. Clear errors, run conversion
  clearError();
  const results = convertToAll(value, selectedUnit);

  // 3. Build result cards HTML
  let html = '<div class="result-cards" id="resultCards">';

  ['C', 'F', 'K'].forEach((unit, index) => {
    const isInputUnit = unit === selectedUnit;
    html += `
      <div class="result-card rc-${unit}${isInputUnit ? ' input-card' : ''}"
           style="animation-delay: ${index * 0.07}s">
        <div class="r-unit">${labels[unit]}</div>
        <div class="r-value">${fmt(results[unit])} ${symbols[unit]}</div>
      </div>`;
  });

  html += '</div>';

  resultArea.innerHTML = html;
  resultArea.classList.add('has-result');

  // 4. Show formula used
  const formulas = {
    C: '°F = (°C × 9/5) + 32   |   K = °C + 273.15',
    F: '°C = (°F − 32) × 5/9   |   K = (°F − 32) × 5/9 + 273.15',
    K: '°C = K − 273.15   |   °F = (K − 273.15) × 9/5 + 32'
  };

  formulaNote.innerHTML = `Formulas used: <span>${formulas[selectedUnit]}</span>`;
  formulaNote.style.display = 'block';
}

// ===== HELPERS =====
function showError(message) {
  errorMsg.textContent = message;
  tempInput.classList.add('error');
}

function clearError() {
  errorMsg.textContent = '';
  tempInput.classList.remove('error');
}

function clearResult() {
  resultArea.innerHTML = `
    <div class="result-placeholder">
      <span class="arrow">↕</span>
      Enter a value and hit Convert
    </div>`;
  resultArea.classList.remove('has-result');
  formulaNote.style.display = 'none';
}

// ===== EVENT LISTENERS =====

// Convert button click
convertBtn.addEventListener('click', convert);

// Allow Enter key to trigger conversion
tempInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') convert();
});

// Clear error as user types
tempInput.addEventListener('input', clearError);
