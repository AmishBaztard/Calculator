'use strict';
const calculatorResultCurrent = document.querySelector('.calculator__result__current');
const calculatorResultPrev = document.querySelector('.calculator__result__prev');
const buttons = document.querySelector(".calculator__buttons");
const clearAll = document.querySelector("[data-action='clearAll']");
const limit = 99999999;

let current = 0;
let inputStack = [];
let currentOperation;
let textVal;
let prevText;

const calcFunctions = {
  evaluate(operation, inputs) {
    if (!operation) return 0;

    let result = inputs[0]; //result starts as first entered value
    inputs.shift(); //remove first entered value

    for (let x of inputs) {
      result = this.execute(result, x, operation);
    }

    //Error if it passes the limit
    if (result > limit) {
      return "ERR";
    }

    return result;
  },
  execute(a, b, operation) {
    switch (operation) {
      case "plus":
        return a + b;
      case "minus":
        return a - b;
      case "division":
        return a / b;
    }
  },
};

const buttonActions = {
  clearAll() {
    inputStack = [];
    current = 0;
    prevText = "";
    textVal = 0;
  },
  clear() {
    if (current === 0 && currentOperation) {
      currentOperation = null;
      current = inputStack.pop();
      prevText = "";
      textVal = current;
    } else {
      current = 0;
      textVal = current;
    }
  },
  decimal() {
    if (current.toString().includes('.')) return;
    current = current + ".";
    textVal = current;
  },
  inverse() {
    current *= -1;
    textVal = current;
  }
};

buttons.addEventListener('click', (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const action = e.target.dataset.action;
  if (current == "ERR" && action !== "clearAll") {
    clearAll.classList.add('calculator__button--border');
    return;
  } else {
    clearAll.classList.remove('calculator__button--border');
  }
  // ^ put this in a separate function

  switch(action) {
    case "clearAll":
      buttonActions.clearAll();
      break;

    case "clear":
      buttonActions.clear();
      break;

    case "decimal":
      buttonActions.decimal();
      break;
      
    case "inverse":
      buttonActions.inverse();
      break;

    case "evaluate":
      if (current === 0) {
        current = inputStack[0];
      }

      inputStack.push(current);
      current = calcFunctions.evaluate(currentOperation, inputStack);

      inputStack = [];
      prevText = "";
      textVal = current;
      break;

    case undefined:
      if (current > limit) return;

      let val = +e.target.textContent;
      current *= 10;
      current = current < 0 ? current -= val : current += val; //add for negative or positive numbers

      textVal = current;
      break;
    
    default: 
      if (inputStack.length >= 1) {
        current = current === 0 ? inputStack[0] : current;
        inputStack.push(current);
        current = calcFunctions.evaluate(currentOperation, inputStack);
        inputStack = [];
      }
      if (current === "ERR") {
        inputStack = [];
        prevText = '';
        textVal = "ERR";
      } else {
        prevText = current + e.target.textContent
        currentOperation = action;
        inputStack.push(current);
        current = 0;
        textVal = '';
      }
  }

  calculatorResultPrev.textContent = prevText;
  calculatorResultCurrent.textContent = textVal;
});
