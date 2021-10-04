const calculatorButtons = document.querySelector('.calculator__buttons');
const currentView = document.querySelector('#currentResult');
const operatorView = document.querySelector('#currentOperation');
const previousView = document.querySelector('#prevResult');
const MAXRESULTLENGTH = 8;
const MAXDECIMALLENGTH = 3;

const wholeToDecimal = (num, length = 0) => (num / (10 ** length)).toFixed(length);
const getNumberLength = (x) => Math.ceil(Math.log10(x + 1));

const calculator = {
  inputs: [{
    integer: 0,
    decimal: 0,
    decimalLength: 0,
  }],
  decimalMode: false,
  queuedOperation: undefined,
  lastAction: undefined,
  getFormatted(index) {
    const [current, previous] = this.inputs;
    let result = 0;
    if (index === 'current') {
      result = (current.decimalLength)
        ? (current.integer
          + Number(wholeToDecimal(current.decimal, current.decimalLength))
        ).toFixed(current.decimalLength)
        : current.integer;
    } else if (index === 'previous') {
      result = (previous.decimalLength)
        ? (previous.integer
          + Number(wholeToDecimal(previous.decimal, previous.decimalLength))
        ).toFixed(previous.decimalLength)
        : previous.integer;
    }
    return result;
  },
  getValue(index) {
    const [current, previous] = this.inputs;
    let result = 0;
    if (index === 'current') {
      result = current.integer + Number(wholeToDecimal(current.decimal, current.decimalLength));
    } else if (index === 'previous') {
      result = previous.integer + Number(wholeToDecimal(previous.decimal, previous.decimalLength));
    }
    return result;
  },
  checkValidLength() {
    const [current] = this.inputs;
    const result = (
      (getNumberLength(current.integer) < MAXRESULTLENGTH && !calculator.decimalMode)
      || (current.decimalLength < MAXDECIMALLENGTH && calculator.decimalMode)
    );

    return result;
  },
  resetCurrent() {
    const [current] = this.inputs;
    current.integer = 0;
    current.decimal = 0;
    current.decimalLength = 0;
  },
  removePrevious() {
    return this.inputs.length > 1 ? this.inputs.pop() : null;
  },
};

const inverse = (x) => x * -1;
const concatenateNumbers = (x, y) => x * 10 + y;
const add = (x, y) => x + y;
const subtract = (x, y) => x - y;
const division = (x, y) => x / y;

const operations = new Map([
  ['+', add],
  ['-', subtract],
  ['/', division],
]);
const doOperation = (x, y, op) => operations.get(op)(x, y);

const calculatorActions = {
  clearAll() {
    calculator.removePrevious();
    calculator.resetCurrent();
    calculator.decimalMode = false;
    currentView.textContent = 0;
    previousView.textContent = '';
    operatorView.textContent = '';

    calculator.queuedOperation = undefined;
  },
  clear() {
    if (calculator.queuedOperation) {
      const [current] = calculator.inputs;
      const previous = calculator.removePrevious();
      current.integer = previous.integer ? previous.integer : 0;
      current.decimal = previous.decimal ? previous.decimal : 0;
      current.decimalLength = previous.decimalLength ? previous.decimalLength : 0;
      calculator.queuedOperation = undefined;
      calculator.decimalMode = Boolean(previous.decimal);

      operatorView.textContent = '';
      previousView.textContent = '';
      currentView.textContent = calculator.getFormatted('current');
    } else {
      this.clearAll();
    }
  },
  inverse() {
    const [current] = calculator.inputs;
    current.integer = inverse(current.integer);
    current.decimal = inverse(current.decimal);
    currentView.textContent = calculator.getFormatted('current');
  },
  decimal() {
    calculator.decimalMode = true;
    const [current] = calculator.inputs;
    currentView.textContent = `${current.integer}.`;
  },
  evaluate() {
    const [current, previous] = calculator.inputs;
    const decimalLength = Math.max(current.decimalLength, previous.decimalLength);

    const evaluated = doOperation(
      calculator.getValue('previous'),
      calculator.getValue('current'),
      calculator.queuedOperation,
    );
    const evaluatedDecimal = evaluated.toString().split('.')[1] ? evaluated.toString().split('.')[1].length : 0;
    const result = decimalLength
      ? evaluated.toFixed(decimalLength)
      : evaluated.toFixed(evaluatedDecimal);

    calculator.inputs.pop(); // remove previous
    const [integer, decimal] = result.toString().split('.');
    current.integer = Number(integer);
    current.decimal = decimal ? Number(decimal) : 0;

    // if integer is a negative then decimal must be one too
    if (Object.is(Number(integer), -0) || Number(integer) < 0) {
      current.decimal *= -1;
    }
    current.decimalLength = decimal ? decimal.length : 0;
    calculator.queuedOperation = undefined;
    calculator.lastAction = 'evaluate';

    currentView.textContent = calculator.getValue('current');
    operatorView.textContent = '';
    previousView.textContent = '';
  },
};

const performCalculatorAction = (action) => calculatorActions[action]();

const queueCalculatorOperation = (operation) => {
  if (calculator.queuedOperation) {
    performCalculatorAction('evaluate');
  }
  const [current] = calculator.inputs;
  calculator.queuedOperation = operation;
  calculator.inputs.push({
    integer: current.integer,
    decimal: current.decimal,
    decimalLength: current.decimalLength,
  });
  calculator.resetCurrent();
  calculator.decimalMode = false;

  currentView.textContent = 0;
  operatorView.textContent = operation;
  previousView.textContent = calculator.getFormatted('previous');
};

const updateCalculatorInput = (val) => {
  const [current] = calculator.inputs;
  let newVal = 0;
  if (calculator.decimalMode) {
    newVal = concatenateNumbers(current.decimal, val);
    current.decimal = newVal;
    current.decimalLength += 1;
  } else {
    if (calculator.lastAction === 'evaluate') { // resets input if no operations after evaluation
      current.integer = 0;
      calculator.lastAction = undefined;
    }

    newVal = concatenateNumbers(current.integer, val);
    current.integer = newVal;
  }
  currentView.textContent = calculator.getFormatted('current');
};

const handleClickedCalcButton = (e) => {
  const target = e.target.closest('button');
  if (!target) return;

  const { action, operation } = target.dataset;
  if (action) {
    performCalculatorAction(action);
  } else if (operation) {
    queueCalculatorOperation(operation);
  } else {
    if (!calculator.checkValidLength()) return;

    const val = Number(target.textContent);
    updateCalculatorInput(val);
  }
};
calculatorButtons.addEventListener('click', handleClickedCalcButton);
