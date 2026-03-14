/**
 * TI-36X Scientific Calculator Engine
 * Full implementation of scientific calculator functionality
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  const state = {
    display: '0',
    expression: '',
    currentValue: 0,
    pendingOperator: null,
    operandStack: [],
    operatorStack: [],
    parenDepth: 0,
    memory: 0,
    lastAnswer: 0,
    secondMode: false,
    hypMode: false,
    angleMode: 'DEG',   // DEG, RAD, GRAD
    displayMode: 'NORM', // NORM, FIX, SCI, ENG
    fixDigits: 10,
    newNumber: true,
    hasDecimal: false,
    eeMode: false,
    errorState: false,
  };

  // ── DOM refs ───────────────────────────────────────────────
  const displayEl = document.getElementById('display');
  const expressionEl = document.getElementById('expression');
  const indSecond = document.getElementById('ind-2nd');
  const indHyp = document.getElementById('ind-hyp');
  const indMemory = document.getElementById('ind-memory');
  const indDeg = document.getElementById('ind-deg');
  const indRad = document.getElementById('ind-rad');
  const indGrad = document.getElementById('ind-grad');
  const indFix = document.getElementById('ind-fix');
  const indSci = document.getElementById('ind-sci');
  const indEng = document.getElementById('ind-eng');
  const indParen = document.getElementById('ind-paren');

  // ── Helpers ────────────────────────────────────────────────
  function toRadians(value) {
    switch (state.angleMode) {
      case 'DEG': return value * Math.PI / 180;
      case 'RAD': return value;
      case 'GRAD': return value * Math.PI / 200;
    }
  }

  function fromRadians(value) {
    switch (state.angleMode) {
      case 'DEG': return value * 180 / Math.PI;
      case 'RAD': return value;
      case 'GRAD': return value * 200 / Math.PI;
    }
  }

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    if (!Number.isInteger(n)) {
      // Gamma function approximation for non-integers
      return gamma(n + 1);
    }
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  // Lanczos approximation of Gamma function
  function gamma(z) {
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }
    z -= 1;
    const g = 7;
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  function nPr(n, r) {
    if (r > n || r < 0 || n < 0) return NaN;
    return factorial(n) / factorial(n - r);
  }

  function nCr(n, r) {
    if (r > n || r < 0 || n < 0) return NaN;
    return factorial(n) / (factorial(r) * factorial(n - r));
  }

  function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    switch (state.displayMode) {
      case 'FIX':
        return num.toFixed(state.fixDigits);
      case 'SCI':
        return num.toExponential(state.fixDigits);
      case 'ENG': {
        if (num === 0) return '0';
        const exp = Math.floor(Math.log10(Math.abs(num)));
        const engExp = exp - ((exp % 3) + 3) % 3 + (exp >= 0 ? 0 : 3);
        const adjExp = 3 * Math.floor(exp / 3);
        const mantissa = num / Math.pow(10, adjExp);
        return mantissa.toPrecision(state.fixDigits + 1) + 'e' + adjExp;
      }
      default: {
        // Normal mode: show up to 10 significant digits
        let str = toPrecision(num, 10);
        // Remove trailing zeros after decimal for normal mode
        if (str.includes('.') && !str.includes('e')) {
          str = str.replace(/\.?0+$/, '');
        }
        // If the number is too long, switch to scientific
        if (str.replace('-', '').replace('.', '').length > 12) {
          str = num.toExponential(8);
        }
        return str;
      }
    }
  }

  function toPrecision(num, digits) {
    if (num === 0) return '0';
    const d = Math.ceil(Math.log10(Math.abs(num)));
    const power = digits - d;
    const magnitude = Math.pow(10, power);
    const shifted = Math.round(num * magnitude);
    return String(shifted / magnitude);
  }

  function getCurrentNumber() {
    return parseFloat(state.display);
  }

  function setDisplay(value) {
    if (typeof value === 'number') {
      state.display = formatNumber(value);
      state.currentValue = value;
    } else {
      state.display = value;
      state.currentValue = parseFloat(value) || 0;
    }
    updateDisplay();
  }

  function showError(msg) {
    state.errorState = true;
    state.display = msg || 'Error';
    displayEl.textContent = state.display;
    displayEl.classList.add('error');
  }

  function clearError() {
    state.errorState = false;
    displayEl.classList.remove('error');
  }

  // ── Operator precedence ────────────────────────────────────
  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'pow': 3,
    'nPr': 3,
    'nCr': 3,
    'mod': 2,
  };

  function applyOperator(op, a, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/':
        if (b === 0) return NaN;
        return a / b;
      case 'pow': return Math.pow(a, b);
      case 'nPr': return nPr(a, b);
      case 'nCr': return nCr(a, b);
      case 'mod': return a % b;
      default: return b;
    }
  }

  function pushOperator(op) {
    while (
      state.operatorStack.length > 0 &&
      state.operatorStack[state.operatorStack.length - 1] !== '(' &&
      (precedence[state.operatorStack[state.operatorStack.length - 1]] || 0) >= (precedence[op] || 0)
    ) {
      const operator = state.operatorStack.pop();
      const b = state.operandStack.pop();
      const a = state.operandStack.pop();
      if (a === undefined || b === undefined) {
        showError('Error');
        return;
      }
      state.operandStack.push(applyOperator(operator, a, b));
    }
    state.operatorStack.push(op);
  }

  function evaluateAll() {
    while (state.operatorStack.length > 0) {
      const op = state.operatorStack.pop();
      if (op === '(') continue;
      const b = state.operandStack.pop();
      const a = state.operandStack.pop();
      if (a === undefined || b === undefined) {
        return getCurrentNumber();
      }
      state.operandStack.push(applyOperator(op, a, b));
    }
    return state.operandStack.length > 0 ? state.operandStack.pop() : getCurrentNumber();
  }

  // ── Update UI ──────────────────────────────────────────────
  function updateDisplay() {
    displayEl.textContent = state.display;
    expressionEl.textContent = state.expression;
    updateIndicators();
  }

  function updateIndicators() {
    indSecond.classList.toggle('active', state.secondMode);
    indHyp.classList.toggle('active', state.hypMode);
    indMemory.classList.toggle('active', state.memory !== 0);
    indDeg.classList.toggle('active', state.angleMode === 'DEG');
    indRad.classList.toggle('active', state.angleMode === 'RAD');
    indGrad.classList.toggle('active', state.angleMode === 'GRAD');
    indFix.classList.toggle('active', state.displayMode === 'FIX');
    indSci.classList.toggle('active', state.displayMode === 'SCI');
    indEng.classList.toggle('active', state.displayMode === 'ENG');
    indParen.textContent = state.parenDepth > 0 ? '(' + state.parenDepth : '';
    indParen.classList.toggle('active', state.parenDepth > 0);
  }

  // ── Input handling ─────────────────────────────────────────
  function inputNumber(digit) {
    if (state.errorState) {
      clearAll();
      clearError();
    }
    if (state.newNumber) {
      state.display = digit;
      state.newNumber = false;
      state.hasDecimal = false;
    } else {
      if (state.display === '0' && digit === '0') return;
      if (state.display === '0' && digit !== '.') {
        state.display = digit;
      } else {
        state.display += digit;
      }
    }
    state.currentValue = parseFloat(state.display);
    updateDisplay();
  }

  function inputDecimal() {
    if (state.errorState) {
      clearAll();
      clearError();
    }
    if (state.newNumber) {
      state.display = '0.';
      state.newNumber = false;
      state.hasDecimal = true;
    } else if (!state.hasDecimal && !state.display.includes('.')) {
      state.display += '.';
      state.hasDecimal = true;
    }
    updateDisplay();
  }

  function inputOperator(op, symbol) {
    if (state.errorState) return;

    const val = getCurrentNumber();
    state.operandStack.push(val);
    pushOperator(op);

    state.expression += state.display + ' ' + symbol + ' ';
    state.newNumber = true;
    state.hasDecimal = false;
    updateDisplay();
  }

  function inputEquals() {
    if (state.errorState) return;

    const val = getCurrentNumber();
    state.operandStack.push(val);
    state.expression += state.display;

    const result = evaluateAll();
    if (isNaN(result)) {
      showError('Error');
      state.operandStack = [];
      state.operatorStack = [];
      state.expression = '';
      return;
    }

    state.lastAnswer = result;
    state.operandStack = [];
    state.operatorStack = [];
    state.parenDepth = 0;

    setDisplay(result);
    state.expression = '';
    state.newNumber = true;
    state.hasDecimal = false;
  }

  // ── Unary operations ───────────────────────────────────────
  function applyUnary(fn, label) {
    if (state.errorState) return;
    const val = getCurrentNumber();
    const result = fn(val);
    if (isNaN(result) || !isFinite(result)) {
      showError('Error');
      return;
    }
    setDisplay(result);
    state.newNumber = true;
  }

  // ── Action handlers ────────────────────────────────────────
  const actions = {
    // Numbers
    number(btn) {
      inputNumber(btn.dataset.value);
    },

    decimal() {
      inputDecimal();
    },

    // Basic operations
    add() { inputOperator('+', '+'); },
    subtract() { inputOperator('-', '-'); },
    multiply() { inputOperator('*', '\u00D7'); },
    div() { inputOperator('/', '\u00F7'); },
    equals() { inputEquals(); },

    // Power
    pow() {
      if (state.secondMode) {
        // x root y: x^(1/y) ... handle as pow with reciprocal
        inputOperator('pow', '^(1/');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      inputOperator('pow', '^');
    },

    // Trig functions
    sin() {
      if (state.secondMode) {
        // asin
        applyUnary(v => {
          if (v < -1 || v > 1) return NaN;
          return fromRadians(Math.asin(v));
        }, 'asin');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      if (state.hypMode) {
        applyUnary(v => Math.sinh(v), 'sinh');
        state.hypMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => {
        const rad = toRadians(v);
        const result = Math.sin(rad);
        return Math.abs(result) < 1e-15 ? 0 : result;
      }, 'sin');
    },

    cos() {
      if (state.secondMode) {
        applyUnary(v => {
          if (v < -1 || v > 1) return NaN;
          return fromRadians(Math.acos(v));
        }, 'acos');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      if (state.hypMode) {
        applyUnary(v => Math.cosh(v), 'cosh');
        state.hypMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => {
        const rad = toRadians(v);
        const result = Math.cos(rad);
        return Math.abs(result) < 1e-15 ? 0 : result;
      }, 'cos');
    },

    tan() {
      if (state.secondMode) {
        applyUnary(v => fromRadians(Math.atan(v)), 'atan');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      if (state.hypMode) {
        applyUnary(v => Math.tanh(v), 'tanh');
        state.hypMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => {
        const rad = toRadians(v);
        // Check for undefined values (90, 270 in degrees)
        if (Math.abs(Math.cos(rad)) < 1e-15) return NaN;
        const result = Math.tan(rad);
        return Math.abs(result) < 1e-15 ? 0 : result;
      }, 'tan');
    },

    // Inverse trig (also reachable via 2nd)
    asin() {
      applyUnary(v => {
        if (v < -1 || v > 1) return NaN;
        return fromRadians(Math.asin(v));
      }, 'asin');
    },
    acos() {
      applyUnary(v => {
        if (v < -1 || v > 1) return NaN;
        return fromRadians(Math.acos(v));
      }, 'acos');
    },
    atan() {
      applyUnary(v => fromRadians(Math.atan(v)), 'atan');
    },

    // HYP mode toggle via 2nd + sin (the 2nd label says HYP)
    hyp() {
      state.hypMode = !state.hypMode;
      updateIndicators();
    },

    // Log / Ln
    log() {
      if (state.secondMode) {
        // 10^x
        applyUnary(v => Math.pow(10, v), '10^x');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => {
        if (v <= 0) return NaN;
        return Math.log10(v);
      }, 'log');
    },

    ln() {
      if (state.secondMode) {
        // e^x
        applyUnary(v => Math.exp(v), 'e^x');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => {
        if (v <= 0) return NaN;
        return Math.log(v);
      }, 'ln');
    },

    // Square, cube, etc.
    square() {
      if (state.secondMode) {
        applyUnary(v => v * v * v, 'x^3');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => v * v, 'x^2');
    },

    sqrt() {
      if (state.secondMode) {
        applyUnary(v => {
          if (v < 0) return NaN;
          return Math.cbrt(v);
        }, 'cbrt');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      applyUnary(v => {
        if (v < 0) return NaN;
        return Math.sqrt(v);
      }, 'sqrt');
    },

    recip() {
      applyUnary(v => {
        if (v === 0) return NaN;
        return 1 / v;
      }, '1/x');
    },

    // 10^x and e^x
    tenx() {
      applyUnary(v => Math.pow(10, v), '10^x');
    },

    ex() {
      applyUnary(v => Math.exp(v), 'e^x');
    },

    // Pi
    pi() {
      if (state.secondMode) {
        // ANS - recall last answer
        setDisplay(state.lastAnswer);
        state.newNumber = true;
        state.secondMode = false;
        updateIndicators();
        return;
      }
      setDisplay(Math.PI);
      state.newNumber = true;
    },

    // Sign change
    sign() {
      if (state.errorState) return;
      const val = getCurrentNumber();
      setDisplay(-val);
      if (state.newNumber) state.newNumber = true;
    },

    // Factorial
    factorial() {
      if (state.secondMode) {
        // x! is the 2nd label, but primary is n!
        state.secondMode = false;
        updateIndicators();
      }
      applyUnary(v => {
        if (v < 0 && Number.isInteger(v)) return NaN;
        return factorial(v);
      }, 'n!');
    },

    // Parentheses
    lparen() {
      if (state.errorState) return;
      if (state.secondMode) {
        // atan
        applyUnary(v => fromRadians(Math.atan(v)), 'atan');
        state.secondMode = false;
        updateIndicators();
        return;
      }
      // Push the current operator context
      state.operatorStack.push('(');
      state.parenDepth++;
      state.expression += '( ';
      state.newNumber = true;
      updateDisplay();
    },

    rparen() {
      if (state.errorState) return;
      if (state.parenDepth <= 0) return;

      if (state.secondMode) {
        // DRG> : cycle angle modes
        actions.drg();
        state.secondMode = false;
        updateIndicators();
        return;
      }

      const val = getCurrentNumber();
      state.operandStack.push(val);
      state.expression += state.display + ' ) ';

      // Evaluate back to the matching '('
      while (state.operatorStack.length > 0) {
        const op = state.operatorStack.pop();
        if (op === '(') break;
        const b = state.operandStack.pop();
        const a = state.operandStack.pop();
        if (a === undefined || b === undefined) {
          showError('Error');
          return;
        }
        state.operandStack.push(applyOperator(op, a, b));
      }
      state.parenDepth--;

      const result = state.operandStack[state.operandStack.length - 1];
      setDisplay(result);
      state.newNumber = true;
      // Pop the result so it stays on top of operand stack for next op
    },

    // EE (scientific notation entry)
    ee() {
      if (state.errorState) return;
      state.display += 'e';
      state.eeMode = true;
      updateDisplay();
    },

    // DMS (Degrees Minutes Seconds)
    dms() {
      applyUnary(v => {
        // Convert decimal degrees to DMS format
        const sign = v < 0 ? -1 : 1;
        v = Math.abs(v);
        const deg = Math.floor(v);
        const minFloat = (v - deg) * 60;
        const min = Math.floor(minFloat);
        const sec = (minFloat - min) * 60;
        return sign * (deg + min / 100 + sec / 10000);
      }, 'DMS');
    },

    // D/D (DMS to Decimal Degrees)
    dd() {
      applyUnary(v => {
        // Convert DMS format to decimal degrees
        const sign = v < 0 ? -1 : 1;
        v = Math.abs(v);
        const deg = Math.floor(v);
        const min = Math.floor((v - deg) * 100);
        const sec = ((v - deg) * 100 - min) * 100;
        return sign * (deg + min / 60 + sec / 3600);
      }, 'DD');
    },

    // Angle mode
    drg() {
      // Cycle: DEG -> RAD -> GRAD -> DEG
      if (state.angleMode === 'DEG') state.angleMode = 'RAD';
      else if (state.angleMode === 'RAD') state.angleMode = 'GRAD';
      else state.angleMode = 'DEG';
      updateIndicators();
    },

    // Random
    rand() {
      setDisplay(Math.random());
      state.newNumber = true;
    },

    // Memory
    sto() {
      if (state.secondMode) {
        // RCL
        setDisplay(state.memory);
        state.newNumber = true;
        state.secondMode = false;
        updateIndicators();
        return;
      }
      state.memory = getCurrentNumber();
      updateIndicators();
    },

    rcl() {
      setDisplay(state.memory);
      state.newNumber = true;
    },

    mplus() {
      if (state.secondMode) {
        // Exchange display and memory
        const tmp = state.memory;
        state.memory = getCurrentNumber();
        setDisplay(tmp);
        state.newNumber = true;
        state.secondMode = false;
        updateIndicators();
        return;
      }
      state.memory += getCurrentNumber();
      state.newNumber = true;
      updateIndicators();
    },

    xchgm() {
      const tmp = state.memory;
      state.memory = getCurrentNumber();
      setDisplay(tmp);
      state.newNumber = true;
    },

    // nPr
    nPr() {
      inputOperator('nPr', 'nPr');
    },

    // nCr
    ncr() {
      inputOperator('nCr', 'nCr');
      state.secondMode = false;
      updateIndicators();
    },

    // Percent
    percent() {
      if (state.errorState) return;
      const val = getCurrentNumber();
      // percent of the first operand
      if (state.operandStack.length > 0) {
        const base = state.operandStack[state.operandStack.length - 1];
        setDisplay(base * val / 100);
      } else {
        setDisplay(val / 100);
      }
      state.newNumber = true;
      state.secondMode = false;
      updateIndicators();
    },

    // Absolute value (2nd function)
    abs() {
      applyUnary(v => Math.abs(v), 'abs');
      state.secondMode = false;
      updateIndicators();
    },

    // EXP (2nd function of log)
    exp() {
      applyUnary(v => Math.exp(v), 'e^x');
      state.secondMode = false;
      updateIndicators();
    },

    // Cube root (2nd function of 1/x)
    cbrt() {
      applyUnary(v => Math.cbrt(v), 'cbrt');
      state.secondMode = false;
      updateIndicators();
    },

    // Cube (2nd function of x^2)
    cube() {
      applyUnary(v => v * v * v, 'x^3');
      state.secondMode = false;
      updateIndicators();
    },

    // Fraction: a b/c input
    fraca() {
      // Simple fraction mode - append space for mixed number entry
      if (state.errorState) return;
      state.display += '_';
      updateDisplay();
    },

    // d/c - convert to improper fraction
    fracd() {
      // Toggle fraction display
      if (state.errorState) return;
      // No-op for basic implementation
    },

    // FIX mode
    fix() {
      if (state.displayMode === 'FIX') {
        state.displayMode = 'NORM';
        state.fixDigits = 10;
      } else {
        state.displayMode = 'FIX';
        state.fixDigits = 4;
      }
      // Re-display current value
      setDisplay(state.currentValue);
      state.secondMode = false;
      updateIndicators();
    },

    // 2nd mode toggle
    '2nd'() {
      state.secondMode = !state.secondMode;
      updateIndicators();
      const btn2nd = document.querySelector('.btn-2nd');
      btn2nd.classList.toggle('active', state.secondMode);
    },

    // ON/C - All clear
    'on-c'() {
      clearAll();
    },

    // CE/C - Clear entry / All clear
    clear() {
      if (state.newNumber || state.display === '0') {
        // Second press: clear all
        clearAll();
      } else {
        // First press: clear entry
        state.display = '0';
        state.currentValue = 0;
        state.newNumber = true;
        state.hasDecimal = false;
        clearError();
        updateDisplay();
      }
    },

    // 2nd + specific actions
    ins() { /* insert mode - not applicable for basic display */ },
    del() {
      // Backspace
      if (state.errorState) return;
      if (state.display.length > 1) {
        if (state.display[state.display.length - 1] === '.') {
          state.hasDecimal = false;
        }
        state.display = state.display.slice(0, -1);
      } else {
        state.display = '0';
        state.newNumber = true;
      }
      state.currentValue = parseFloat(state.display) || 0;
      state.secondMode = false;
      updateIndicators();
      updateDisplay();
    },

    off() {
      // Turn off - just clear display
      state.display = '';
      displayEl.textContent = '';
      expressionEl.textContent = '';
    },

    ans() {
      setDisplay(state.lastAnswer);
      state.newNumber = true;
      state.secondMode = false;
      updateIndicators();
    },
  };

  function clearAll() {
    state.display = '0';
    state.expression = '';
    state.currentValue = 0;
    state.pendingOperator = null;
    state.operandStack = [];
    state.operatorStack = [];
    state.parenDepth = 0;
    state.secondMode = false;
    state.hypMode = false;
    state.newNumber = true;
    state.hasDecimal = false;
    state.eeMode = false;
    state.errorState = false;
    clearError();

    const btn2nd = document.querySelector('.btn-2nd');
    btn2nd.classList.remove('active');

    updateDisplay();
  }

  // ── Button click handler ───────────────────────────────────
  function handleButton(btn) {
    let action = btn.dataset.action;
    if (!action) return;

    // If in 2nd mode, check for second function
    if (state.secondMode && btn.dataset.second) {
      const secondAction = btn.dataset.second;
      // Some second actions override the primary
      if (actions[secondAction]) {
        actions[secondAction](btn);
        return;
      }
    }

    if (actions[action]) {
      actions[action](btn);
    }
  }

  // ── Event binding ──────────────────────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => handleButton(btn));
  });

  // ── Keyboard support ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key >= '0' && key <= '9') {
      inputNumber(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+') {
      inputOperator('+', '+');
    } else if (key === '-') {
      inputOperator('-', '-');
    } else if (key === '*') {
      inputOperator('*', '\u00D7');
    } else if (key === '/') {
      e.preventDefault();
      inputOperator('/', '\u00F7');
    } else if (key === 'Enter' || key === '=') {
      inputEquals();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      clearAll();
    } else if (key === 'Backspace') {
      actions.del();
    } else if (key === '(') {
      actions.lparen();
    } else if (key === ')') {
      actions.rparen();
    } else if (key === '^') {
      inputOperator('pow', '^');
    } else if (key === '!') {
      actions.factorial();
    } else if (key === 'p') {
      actions.pi();
    } else if (key === 's') {
      actions.sin();
    } else if (key === 'o') {
      actions.cos();
    } else if (key === 't') {
      actions.tan();
    } else if (key === 'l') {
      actions.log();
    } else if (key === 'n') {
      actions.ln();
    } else if (key === 'r') {
      actions.sqrt();
    }
  });

  // Initial display
  updateDisplay();
})();
