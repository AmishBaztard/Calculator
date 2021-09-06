'use strict';
const calculatorResultCurrent = document.querySelector('.calculator__result__current');
const calculatorResultPrev = document.querySelector('.calculator__result__prev');
const buttons = document.querySelector(".calculator__buttons");
const clearAll = document.querySelector("[data-action='clearAll']");
let current = 0;
let inputStack = [];
let currentOperation = false;
let prevText;

const operations = {
  AC: (el) => clearContent(el),
  plus: function (...args) {
    let sum = 0;
    for (let x of args) {
      sum = +sum + +x;
    }

    return sum;
  },
  minus: function (...args) {
    let sum = args[0];
    for (let i = 1; i < args.length; i++) {
      sum -= +args[i];
    }

    return sum;
  },
  division: function (...args) {
    let sum = args[0];
    for (let i = 1; i < args.length; i++) {
      sum /= +args[i];
    }

    return sum;
  },
  sum: (input, op) => {
    if (!op) return 0;

    let sum = +op(...input);
    let currentSplit = sum.toString().split('.');
    if (currentSplit[0].length > 8) {
      sum = "ERR";
    } else if (currentSplit[1] && currentSplit[1].length > 3) {
      sum = +sum.toFixed(3);
    }

    return sum;
  }
};
buttons.addEventListener('click', (e) => {
  if (e.target.tagName !== "BUTTON") return;

  let action = e.target.dataset.action ? e.target.dataset.action : null;
  let textVal;

  if (current == "ERR" && action != "clearAll") {
    clearAll.classList.add('calculator__button--border');
    return;
  } else {
    clearAll.classList.remove('calculator__button--border');
  }

  if (action == "clearAll") {
    inputStack = [];
    current = 0;
    prevText = "";
    textVal = 0;
  } else if (action == "clear") {
    if (current === 0 && currentOperation) {
      currentOperation = null;
      current = inputStack.pop();
      prevText = "";
      textVal = current;
    } else {
      current = 0;
      textVal = current;
    }
  }
  else if (action == "decimal") {
    if (current.toString().indexOf(".") > -1) return;

    current = current + ".";
    textVal = current;
  }
  else if (action == "inverse") {
    current -= current * 2;
    textVal = current;
  }
  else if (action === "sum") {
    if (current === 0) {
      current = inputStack[0];
    }

    inputStack.push(current);
    current = operations.sum(inputStack, currentOperation);
    inputStack = [];
    prevText = "";
    textVal = current;
  }
  else if (action) {
    if (inputStack.length >= 1) {
      if (current === 0) {
        current = inputStack[0];
      }

      inputStack.push(current);
      current = operations.sum(inputStack, currentOperation);
      inputStack = [];
    }

    if (current == "ERR") {
      inputStack = [];
      prevText = '';
      textVal = "ERR";
    } else {

      prevText = current + e.target.textContent
      currentOperation = operations[action];
      inputStack.push(current);
      current = 0;
      textVal = '';

    }
  }
  else {
    let currentSplit = current.toString().split('.');
    if (currentSplit[0].length < 8) {
      let val = +e.target.textContent;
      if (current.toString().indexOf(".") !== -1) {
        let num = current + val;
        if (currentSplit[1].length < 3) {
          current = current + val;
        }

      }
      else if (current < 0) {
        current *= 10;
        current -= val;
      }
      else {
        current *= 10;
        current += val;
      }
    }
    textVal = current;
  }
  calculatorResultPrev.textContent = prevText;
  calculatorResultCurrent.textContent = textVal;
});