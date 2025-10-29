// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
  inputs: {
    bill: document.getElementById("bill"),
    tipCustom: document.getElementById("tip-custom"),
    people: document.getElementById("people"),
  },
  outputs: {
    tipAmount: document.getElementById("tip-amount"),
    totalAmount: document.getElementById("total-amount"),
  },
  errors: {
    bill: document.getElementById("bill-error"),
    tip: document.getElementById("tip-custom-error"),
    people: document.getElementById("people-error"),
  },
  buttons: {
    tips: document.querySelectorAll(".btn--tip"),
    reset: document.getElementById("reset-btn"),
  },
};

// ============================================
// CONSTANTS
// ============================================
const DEFAULTS = {
  TIP_PERCENT: 0,
  PEOPLE_COUNT: 1,
  CURRENCY_DISPLAY: "$0.00",
};

const VALIDATION_RULES = {
  TIP_MAX: 100,
  DECIMAL_PLACES: 2,
};

const ERROR_MESSAGES = {
  NEGATIVE: "Can't be negative",
  ZERO: "Can't be zero",
  MAX_TIP: "Max 100%",
  NO_DECIMALS: "No decimals allowed",
  MAX_DECIMALS: "Max two decimals",
};

// ============================================
// STATE
// ============================================
const state = {
  bill: null,
  tipPercent: DEFAULTS.TIP_PERCENT,
  people: DEFAULTS.PEOPLE_COUNT,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = value => `$${value.toFixed(VALIDATION_RULES.DECIMAL_PLACES)}`;

const hasMoreThanTwoDecimals = value => {
  if (!Number.isFinite(value)) return false;
  return Number.parseFloat(value.toFixed(VALIDATION_RULES.DECIMAL_PLACES)) !== value;
};

const preventDecimalInput = input => {
  input?.addEventListener("keydown", e => {
    if ([".", ","].includes(e.key)) {
      e.preventDefault();
    }
  });
};

// ============================================
// VALIDATION
// ============================================
const validateFields = ({ bill, tipPercent, people }) => {
  const errors = { bill: null, tip: null, people: null };

  // Validate bill
  if (Number.isFinite(bill)) {
    if (bill < 0) {
      errors.bill = ERROR_MESSAGES.NEGATIVE;
    } else if (hasMoreThanTwoDecimals(bill)) {
      errors.bill = ERROR_MESSAGES.MAX_DECIMALS;
    }
  }

  // Validate tip percent
  if (Number.isFinite(tipPercent)) {
    if (tipPercent < 0) {
      errors.tip = ERROR_MESSAGES.NEGATIVE;
    } else if (tipPercent > VALIDATION_RULES.TIP_MAX) {
      errors.tip = ERROR_MESSAGES.MAX_TIP;
    } else if (!Number.isInteger(tipPercent)) {
      errors.tip = ERROR_MESSAGES.NO_DECIMALS;
    }
  }

  // Validate people count
  if (Number.isFinite(people)) {
    if (people < 0) {
      errors.people = ERROR_MESSAGES.NEGATIVE;
    } else if (people === 0) {
      errors.people = ERROR_MESSAGES.ZERO;
    } else if (!Number.isInteger(people)) {
      errors.people = ERROR_MESSAGES.NO_DECIMALS;
    }
  }

  return errors;
};

// ============================================
// CALCULATIONS
// ============================================
const calculateTipPerPerson = (bill, tipPercent, people) => {
  return (bill * (tipPercent / 100)) / people;
};

const calculateTotalPerPerson = (bill, tipPercent, people) => {
  return bill / people + calculateTipPerPerson(bill, tipPercent, people);
};

const canCalculate = ({ bill, tipPercent, people }) => {
  return (
    Number.isFinite(bill) &&
    bill > 0 &&
    Number.isFinite(tipPercent) &&
    tipPercent >= 0 &&
    Number.isFinite(people) &&
    people >= 1
  );
};

// ============================================
// UI UPDATES
// ============================================
const showError = (errorElement, errorMessage) => {
  if (!errorElement) return;
  errorElement.style.display = errorMessage ? "block" : "none";
  if (errorMessage) {
    errorElement.textContent = errorMessage;
  }
};

const clearAllErrors = () => {
  Object.values(DOM.errors).forEach(error => showError(error, null));
};

const setActiveTipButton = tipPercent => {
  DOM.buttons.tips.forEach(button => {
    const isActive = Number(button.dataset.tip) === tipPercent;
    button.classList.toggle("active", isActive);
  });
};

const updateResults = () => {
  if (!canCalculate(state)) {
    DOM.outputs.tipAmount.textContent = DEFAULTS.CURRENCY_DISPLAY;
    DOM.outputs.totalAmount.textContent = DEFAULTS.CURRENCY_DISPLAY;
    return;
  }

  const { bill, tipPercent, people } = state;
  const tipPerPerson = calculateTipPerPerson(bill, tipPercent, people);
  const totalPerPerson = calculateTotalPerPerson(bill, tipPercent, people);

  DOM.outputs.tipAmount.textContent = formatCurrency(tipPerPerson);
  DOM.outputs.totalAmount.textContent = formatCurrency(totalPerPerson);
};

const updateResetState = () => {
  const isDefaultState =
    DOM.inputs.bill.value === "" &&
    DOM.inputs.tipCustom.value === "" &&
    state.bill === null &&
    state.tipPercent === DEFAULTS.TIP_PERCENT &&
    state.people === DEFAULTS.PEOPLE_COUNT;

  DOM.buttons.reset.disabled = isDefaultState;
};

const updateUI = () => {
  updateResults();
  updateResetState();
};

// ============================================
// STATE MANAGEMENT
// ============================================
const updateState = (field, value, errorElement, errorKey) => {
  const errors = validateFields({ ...state, [field]: value });
  state[field] = value;
  showError(errorElement, errors[errorKey]);
  updateUI();
};

// ============================================
// EVENT HANDLERS
// ============================================
const handleBillInput = () => {
  const value = Number.parseFloat(DOM.inputs.bill.value);
  updateState("bill", value, DOM.errors.bill, "bill");
};

const handleTipCustomInput = () => {
  DOM.buttons.tips.forEach(button => button.classList.remove("active"));
  const value = Number.parseInt(DOM.inputs.tipCustom.value);
  updateState("tipPercent", value, DOM.errors.tip, "tip");
};

const handlePeopleInput = () => {
  const value = Number.parseInt(DOM.inputs.people.value, 10);
  updateState("people", value, DOM.errors.people, "people");
};

const handleTipButtonClick = event => {
  const tipValue = Number(event.currentTarget.dataset.tip);
  state.tipPercent = tipValue;
  DOM.inputs.tipCustom.value = "";

  const errors = validateFields(state);
  showError(DOM.errors.tip, errors.tip);
  setActiveTipButton(tipValue);
  updateUI();
};

const handleReset = () => {
  // Reset inputs
  DOM.inputs.bill.value = "";
  DOM.inputs.tipCustom.value = "";
  DOM.inputs.people.value = String(DEFAULTS.PEOPLE_COUNT);

  // Reset state
  state.bill = null;
  state.tipPercent = DEFAULTS.TIP_PERCENT;
  state.people = DEFAULTS.PEOPLE_COUNT;

  // Reset UI
  clearAllErrors();
  setActiveTipButton(DEFAULTS.TIP_PERCENT);
  updateUI();
};

// ============================================
// INITIALIZATION
// ============================================
const initEventListeners = () => {
  // Input listeners
  DOM.inputs.bill.addEventListener("input", handleBillInput);
  DOM.inputs.tipCustom.addEventListener("input", handleTipCustomInput);
  DOM.inputs.people.addEventListener("input", handlePeopleInput);

  // Tip button listeners
  DOM.buttons.tips.forEach(button => {
    button.addEventListener("click", handleTipButtonClick);
  });

  // Reset button listener
  DOM.buttons.reset.addEventListener("click", handleReset);

  // Prevent decimal input
  preventDecimalInput(DOM.inputs.tipCustom);
  preventDecimalInput(DOM.inputs.people);
};

const init = () => {
  initEventListeners();
  setActiveTipButton(DEFAULTS.TIP_PERCENT);
  updateUI();
};

// Start the application
init();
