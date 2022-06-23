// jshint esversion:6
/*
/   developed initial look & functioning
/   in oldishBaker codepen account as
/   CalcTube,
/   ported over to this codepen 
/   account for completion as PunkCalc
/   
*/


/* ====================================

    OVERVIEW

---------------------------------------
    Helper Functions
    Declarations, Definitions
        - UX & Calculation
    Initialization
    Workflow Processing
    Digit Display Handlers
    Crankshaft Setup 
    Decimal Shuttle Setup & Handling 
    Entry
==================================== */

/* ====================================

    Helper Functions

---------------------------------------
- not using jquery so use $, $$ as
convenience querySelector* functions
- return an array for querySelectorAll
ref: https://developer.mozilla.org/en-US/Add-ons/Code_snippets/QuerySelector
=====================================*/

function $(selector, el) {
    if (!el) {
        el = this.document;
    }

    return el.querySelector(selector);
}

function $all(selector, el) {
    if (!el) {
        el = this.document;
    }

    return Array.prototype.slice.call(el.querySelectorAll(selector));
}

function $create(selector, el) {
    if (!el) {
        el = this.document;
    }

    return el.createElement(selector);
}

/* ====================================

    Definitions - UX Needs

---------------------------------------
- keys: all keys for event listeners 
- row_[1-5]: keyPositions by rows for position & arm lengths
- diagnosticBulbs: dashes to flash
- allBulbs: all bulb elements to flash
==================================== */

const keys = $all(".ki");

const row_1 = $all(".rowLevel_1"),
    row_2 = $all(".rowLevel_2"),
    row_3 = $all(".rowLevel_3"),
    row_4 = $all(".rowLevel_4"),
    row_5 = $all(".rowLevel_5");

const diagnosticBulbs = $all(".mid .bulb"),
    allBulbs = $all(".strip .bulb");

const shaft = $('.crankshaft');

/* ====================================

    Declarations, Definitions 
        - Calculation Needs

=======================================    
- displayQueue: 
works with placeMatchArray,
to ensure association with place, 
numbers are added left to right as entered 
ie. latest input is at the ones unit place, 
shifting prior entries to higher digit places,

- digitStack: 
captures individual digit input,
when operators called contents converted to a number

- decimalStack:
capture digits destined to form a decimal number,
when isDecimal is true

- runningSub: 
numbers and subsequent results captured here,
should only ever be zero or one in length

- currentOperation: 
retain the operation to apply until next operation,
runningSub is calculated before change 
default set to non-operator -1

- isResultDisplay:
flag that a result is displayed in order
to facilitate new calculation logic

- rollOverTotal:
temporarily hold the result in order 
to create a new calcuation with the result
as the lhs operand

- isDecimal:
set up a state for forming decimal number

- placeMatchArray: 
identifies the 'symbolic place' element id for digit displays, 
synchronized to displayQueue index
==================================== */

let displayQueue = [],
    digitStack = [],
    runningSub = [],
    currentOperation = -1,
    decimalStack = [],
    isResultDisplay = false,
    rollOverTotal = 0,
    isDecimal = false;

const placeMatchArray = [
    "#ones",
    "#tens",
    "#hundreds",
    "#thousands",
    "#tenThousands",
    "#hundredThousands",
    "#millions",
    "#tenMillions"
];

/* ====================================

    Initialization - Input - Keys

==================================== */

function initializeKeys() {
    // initialize event listeners on keys only
    keys.forEach(key => key.addEventListener('click', handleKeyDown));
    var charList = 'efghijklmnopqrstuv'.split('').sort( () => .5 - Math.random() );
    keys.forEach(function(key, index) {
        char = charList[index];
        key.innerText = char;
    });

    // initialize positions by row, adjusting 
    // with offset on every other row;
    let i = 0,
        j = 0.5,
        spread = 5;

    row_1.forEach(pos => {
        pos.style.left = `${spread*i++}em`;
    });

    row_2.forEach(pos => {
        pos.style.left = `${spread*j}em`;
        j += 1;
    });

    i = 0;
    row_3.forEach(pos => {
        pos.style.left = `${spread*i++}em`;
    });

    j = 0.5;
    row_4.forEach(pos => {
        pos.style.left = `${spread*j}em`;
        j += 1;
    });

    i = 0;
    row_5.forEach(pos => {
        pos.style.left = `${spread*i++}em`;
    });
}

/* ====================================

    Initialization - Output - Display
    
==================================== */
function clearDecimalBuild() {
    isDecimal = false;
    decimalStack.length = 0;
    styleDecimalKey(false);
}

function clearDisplay() {
    allBulbs.forEach(el => el.classList.remove("lit"));
    displayQueue.length = 0;
    lightUpZero();
    spinDecimal(placeMatchArray[1], "right");
}

function runAllBulbsDiagnostic() {
    allBulbs.forEach(el => el.classList.add("lit"));

    setTimeout(() => {
        clearDisplay();
    }, 500);
}

function runDisplayDiagnostic() {
    diagnosticBulbs.forEach(el => el.classList.add("lit"));

    // turn off bulbs after half second 
    setTimeout(() => {
        diagnosticBulbs.forEach(el => el.classList.remove("lit"));
        runAllBulbsDiagnostic();
    }, 500);
}

function initializeDisplay() {
    runDisplayDiagnostic();
    document.addEventListener('contextmenu', event => event.preventDefault());

    window.bg = new Howl({
        src: ['Sounds/digicode-bg.mp3'],
        autoplay: true,
        loop: true,
      });
      window.bg.play();

    document.querySelector('#signature').addEventListener('click', function() {
        document.querySelector('#note').classList.remove('hide');
    })    

    // Note
    document.querySelector('#note').addEventListener('click', 
        function handleNote (event) {
            document.querySelector('#note img.fire').classList.remove('hide');
            var fire = new Howl({
                src: ['Sounds/fire.mp3'],
            });
            fire.play();
            document.querySelector('#note img.paper').classList.add('hot');
            setTimeout(() => {
                document.querySelector('#note img.paper').classList.add('hide');
                setTimeout(() => {
                    document.querySelector('#text-note').classList.remove('hide');
                    setTimeout(() => {
                        document.querySelector('#note img.fire').remove();
                        document.querySelector('#note img.paper').remove();
                        fire.stop();
                        // show camera
                        document.querySelector('#cinema').classList.remove('hide');
                    }, 1000);
                }, 0);
            }, 2000);
    })
    
    // Note - mouseover add class hover
    document.querySelector('#note').addEventListener('mouseover', function(event) {
        document.querySelector('#note').classList.add('hover');
    })

    // Note - mouseout remove hover class
    document.querySelector('#note').addEventListener('mouseout', function(event) {
        document.querySelector('#note').classList.remove('hover');
    })

    // Machine
    document.querySelector('#typewriter').addEventListener('mouseover', function(event) {
        document.querySelector('#typewriter img').classList.add('hover');
    })
    // remove hover class on mouseout  of machine
    document.querySelector('#typewriter').addEventListener('mouseout', function(event) {
        document.querySelector('#typewriter img').classList.remove('hover');
    })
    // Display entryPad on click of machine
    document.querySelector('#typewriter').addEventListener('click', function(event) {
        document.querySelector('#poster').classList.add('hide');
        document.querySelector('#entryPad').style.display = 'block';
        document.querySelector('#entryPad').style.top = '0';
        // hide machine
        document.querySelector('#typewriter').style.display = 'none';
    })

    // Camera
    // camera click
    document.querySelector('#camera').addEventListener('click', function(event) {
        // show poster
        document.getElementById('bones').style.display = 'none';
        document.querySelector('#camera').classList.add('hide');
        document.querySelector('#poster').classList.toggle('hide');
        document.querySelector('#poster video').load();
        document.querySelector('#poster video').volume = 0.87;
        // hide prison when video is done
        document.querySelector('#poster video').addEventListener('ended', function(event) {
            document.querySelector('#poster video').remove();
            document.querySelector('#prison').classList.add('hide');
        })
    })
    
    document.querySelector('#poster').addEventListener('mouseover', function(event) {
        document.querySelector('#poster video').play();
    })

    // cinema - mouseover add class hover
    document.querySelector('#cinema').addEventListener('mouseover', function(event) {
        document.querySelector('#cinema').classList.add('hover');
    })

    // cinema - mouseout remove hover class
    document.querySelector('#cinema').addEventListener('mouseout', function(event) {
        document.querySelector('#cinema').classList.remove('hover');
    })
    
    // click on cinema to show camera
    document.querySelector('#cinema').addEventListener('click', function(event) {
        document.querySelector('#camera').classList.toggle('hide');
    })
}

/* ====================================

    Main Workflow Management

---------------------------------------    
- handleKeyDown: event listener
- processInput: dispatch based on input type
- updateNumbers: handle numbers
- updateResult: handle fresh calculation
- refreshDisplay: provide output
- this is bound to the element acted on
==================================== */

function handleKeyDown() {
    // animation =====================
    document.getElementById('padOutput').value += this.innerText;

    // pressdown on key and arm
    this.classList.add("roundKiDown");
    this.previousElementSibling.classList.add("armDown");

    // ===================== animation
    if ('femur'.startsWith(document.getElementById('padOutput').value) == false) {
        document.getElementById('padOutput').value = '';
        setTimeout(() => {
            document.querySelectorAll('.roundKiDown').forEach(function(e) {
                e.classList.remove("roundKiDown");
                e.previousElementSibling.classList.remove("armDown");
                document.getElementById('bones').style.display = 'block';
                var skel = new Howl({
                    src: ['Sounds/squelette.mp3'],
                    autoplay: false
                  });
                  window.bg.stop();
                  skel.play();
                document.querySelector('#poster').classList.add('hide');
            })
            initializeKeys();
        }, 500);
    }
    if (document.getElementById('padOutput').value == 'femur') {
        setTimeout(() => {
            document.querySelector('#entryPad').style.display = 'none';
            setTimeout(() => {
                document.location = 'puzzle.html';
            }, 2000);    
        }, 1000);
    }
}

function getPadCharacter() {

}

/* ===================================

    processInput

--------------------------------------
breaks down input into 2 major blocks:
numbers and operations (funcKi)

certain operation keys are styled,
keyup and unstyled when a number
or alternate operation keyup

numbers
0 - 9
will remove operation key highlight

operations breakdown into 2 blocks:
arithmetic and others
arithmetic operations are in one case block
100 - 199
100 division
101 multiplication
102 addition
103 subtraction
arithmetics ops will highlight key

others separate out into
200 - 299 
200 clear entry, 
201 clear all, 
202 set decimal,
203 get result
decimal (202) will highlight on keyup
others will remove highlights

numbers are processed in updateNumbers()
operators are processed here, 
see case blocks
=================================== */

function processInput(input) {

    if (input < 10) {
        styleCurrentCalc(currentOperation, false);
        // disregard leading 0 for now, 
        if (input === 0 && displayQueue.length === 0) {
            return;
        }
        if (isResultDisplay) {
            updateResultFlag(false);
            clearDisplay();
        }
        updateNumbers(input);
    } else {
        switch (input) {
            case 200:
                clearDisplay();
                digitStack.length = 0;
                clearDecimalBuild();
                styleCurrentCalc(currentOperation, true);
                break;
            case 201:
                styleCurrentCalc(currentOperation, false);
                clearDisplay();
                digitStack.length = 0;
                runningSub.length = 0;
                currentOperation = -1;
                clearRollOverState();
                clearDecimalBuild();
                break;
            case 202:
                // don't allow multiple decimals
                if (!isDecimal) {
                    setDecimalState();
                }
                break;
            case 203:
                updateResultFlag(true);
                displayResult();
                break;
            case 100:
            case 101:
            case 102:
            case 103:
                if (isResultDisplay) {
                    rollOverResult();
                    clearRollOverState();
                }
                updateArithmetics(input);
                break;
            default:
                lightUpErrors();
        }
    }
}

function styleCurrentCalc(input, on) {
    if (input < 10 || input > 199 && input !== 202) {
        return;
    }

    let elem = $(`[data-input='${input}']`);

    if (on) {
        elem.classList.add('currentCalc');
        elem.classList.remove('funcKi');
    } else {
        elem.classList.remove('currentCalc');
        elem.classList.add('funcKi');
    }
}

/* ====================================

    prepareResult

---------------------------------------
form number and total when appropriate
==================================== */
function prepareResult() {
    if (digitStack.length || decimalStack.length) {
        makeNumber();
        tallySubTotal();
    }
}

/* ====================================

    displayResult

---------------------------------------
process for result and display
- sliceTo is the number of places (8)
==================================== */
function displayResult() {
    let sliceTo = 8,
        subTotal = 0;

    // prepare answer ==========================
    prepareResult();
    subTotal = runningSub.pop();


    clearDisplay();

    // negative number -------------------------
    if (subTotal < 0) {
        displayQueue.unshift(-1);
        sliceTo -= 1;
    }

    // multi-digit number ----------------------
    processMultiDigit(subTotal, sliceTo);

    // retain for rollover ---------------------
    rollOverTotal = subTotal;

    // display & reset =========================
    refreshDisplay();
    runningSub.length = 0;
    currentOperation = -1;

    // reset the displayQueue, so
    // the result won't display on next input
    displayQueue.length = 0;
}

/* ====================================

    processMultiDigit

---------------------------------------
process displayQueue for all digits
of result
==================================== */
function processMultiDigit(subTotal, sliceTo) {
    let result = Math.abs(subTotal);

    result = result.toString().
    slice(0, sliceTo).
    split('');
    result.forEach(digt => {
        if (digt === ".") {
            displayQueue.unshift(-2);
        } else {
            displayQueue.unshift(parseInt(digt, 10));
        }
    });
}

/* ====================================

    setDecimalState

---------------------------------------
flag, prep decimal forming state
==================================== */
function setDecimalState() {
    isDecimal = true;
    decimalStack.length = 0;
    if (!digitStack.length) {
        displayQueue.unshift(0);
    }
    displayQueue.unshift(-2);
    styleDecimalKey(true);
}

function styleDecimalKey(onOff) {
    styleCurrentCalc(202, onOff);
}

/* ====================================

    updateArithmetics

---------------------------------------
arithmetic operation state signals that
a number s/b made,
if 2 numbers result then prep subtotal

highlight arithmetic keys between
number inputs

runningSub.length s/b 1 after this
==================================== */
function updateArithmetics(input) {
    styleCurrentCalc(currentOperation, false);

    if (digitStack.length || decimalStack.length) {
        makeNumber();

        if (runningSub.length > 0) {
            tallySubTotal();
        }

        currentOperation = input;
    } else {
        currentOperation = input;
    }

    styleCurrentCalc(input, true);
    clearDisplay();
}

/* ====================================

    updateNumbers

---------------------------------------
- considers decimal state
- synchronizes display
- refreshes display
==================================== */
function updateNumbers(input) {
    if (isDecimal) {
        // decimal building state
        decimalStack.push(input);
    } else {
        digitStack.push(input);
    }

    displayQueue.unshift(input);

    refreshDisplay();
}

function tallySubTotal() {
    let rhs = runningSub.pop(),
        lhs = runningSub.pop();

    runningSub.push(getSubTotal(lhs, rhs));
}

/* ====================================
    makeNumber
---------------------------------------
- build number
- start with whole number
- add decimal when applicable
- add to runningSub stack
- go to whole number state
==================================== */

function makeNumber() {
    let num = null;

    if (digitStack.length) {
        num = parseInt([...digitStack].join(''), 10);
    }

    // decimal building state
    if (isDecimal && decimalStack.length) {
        num += parseFloat([...decimalStack].join('') /
            Math.pow(10, decimalStack.length));
    }

    if (num !== null) {
        runningSub.push(num);
    }

    // clean slate === clear digitStack
    digitStack.length = 0;

    // clear decimal state
    clearDecimalBuild();
}

function getSubTotal(lhs, rhs) {
    let retVal = null;

    switch (currentOperation) {
        case 100:
            retVal = lhs / rhs;
            break;
        case 101:
            retVal = lhs * rhs;
            break;
        case 102:
            retVal = lhs + rhs;
            break;
        case 103:
            retVal = lhs - rhs;
            break;
        default:
            retVal = rhs;
    }

    return retVal;
}

/* ====================================
    updateResultFlag()
---------------------------------------
- flag that display is a result
- next input should clear display
 TODO: have the result rollover into
 the new calculation
==================================== */
function updateResultFlag(flag = true) {
    isResultDisplay = flag;
}

function rollOverResult() {
    runningSub.push(rollOverTotal);
}

function clearRollOverState() {
    updateResultFlag(false);
    rollOverTotal = 0;
}

function refreshDisplay() {
    displayQueue.forEach((num, ndx) => {
        let place = placeMatchArray[ndx],
            result = num;

        if (place === undefined) {
            lightUpErrors();

            return false;
        }

        if (result < 1 && result > 0) {
            result *= 10;
        }

        switch (result) {
            case 1:
                lightUpOne(place);
                break;
            case 2:
                lightUpTwo(place);
                break;
            case 3:
                lightUpThree(place);
                break;
            case 4:
                lightUpFour(place);
                break;
            case 5:
                lightUpFive(place);
                break;
            case 6:
                lightUpSix(place);
                break;
            case 7:
                lightUpSeven(place);
                break;
            case 8:
                lightUpEight(place);
                break;
            case 9:
                lightUpNine(place);
                break;
            case 0:
                lightUpZero(place);
                break;
            case -1:
                lightUpMinus(place);
                break;
            case -2:
                lightUpDecimal(place);
                break;
            case -3:
                lightUpComma(place);
                break;
            default:
                lightUpErrors();
        }

        return result;
    });
}


/* =====================================

    Manage Digit Display

========================================
- number specific handlers display 
at the digit located by a place parameter

- display strategy is to mask by 
lighting all bulbs (add lit class)
then dim relevant strip (remove lit class)
or vice-versa considering least number of class changes

- digits are vertical or horizontal,
vertical are left or right AND above or below,
horizontal are top, mid or bottom
===================================== */

// dry helpers

function lightUpAll(elPlace) {
    let all = $all(`${elPlace} .bulb`);

    all.forEach(el => el.classList.add("lit"));
}

function dimAll(elPlace) {
    let all = $all(`${elPlace} .bulb`);

    all.forEach(el => el.classList.remove("lit"));
}

// zero 0
// uses default for cleared display case
// ------------------------------------
function lightUpZero(elPlace = "#ones") {
    let mid = $(`${elPlace} .mid .bulb`);

    lightUpAll(elPlace);
    mid.classList.remove("lit");
}

// one 1
// ------------------------------------
function lightUpOne(elPlace) {
    let vert = $all(`${elPlace} .vertical .bulb`),
        left = $all(`${elPlace} .left .bulb`);

    dimAll(elPlace);
    vert.forEach(el => el.classList.add("lit"));
    left.forEach(el => el.classList.remove("lit"));
}

// two 2
// ------------------------------------
function lightUpTwo(elPlace) {
    let left = $(`${elPlace} .above.left .bulb`),
        right = $(`${elPlace} .below.right .bulb`);

    lightUpAll(elPlace);
    right.classList.remove("lit");
    left.classList.remove("lit");
}

// three 3
// ------------------------------------
function lightUpThree(elPlace) {
    let left = $all(`${elPlace} .left .bulb`);

    lightUpAll(elPlace);
    left.forEach(el => el.classList.remove("lit"));
}

// four 4
// ------------------------------------
function lightUpFour(elPlace) {
    let top = $(`${elPlace} .top .bulb`),
        left = $(`${elPlace} .left.below .bulb`),
        bottom = $(`${elPlace} .bottom .bulb`);

    lightUpAll(elPlace);
    top.classList.remove("lit");
    bottom.classList.remove("lit");
    left.classList.remove("lit");
}

// five 5
// ------------------------------------
function lightUpFive(elPlace) {
    let right = $(`${elPlace} .right.above .bulb`),
        left = $(`${elPlace} .left.below .bulb`);

    lightUpAll(elPlace);
    right.classList.remove("lit");
    left.classList.remove("lit");
}

// six 6
// ------------------------------------
function lightUpSix(elPlace) {
    let right = $(`${elPlace} .right.above .bulb`);

    lightUpAll(elPlace);
    right.classList.remove("lit");
}

// seven 7
// ------------------------------------
function lightUpSeven(elPlace) {
    let mid = $(`${elPlace} .mid .bulb`),
        bottom = $(`${elPlace} .bottom .bulb`),
        left = $all(`${elPlace} .left .bulb`);

    lightUpAll(elPlace);
    mid.classList.remove("lit");
    bottom.classList.remove("lit");
    left.forEach(el => el.classList.remove("lit"));
}

// eight 8
// ------------------------------------
function lightUpEight(elPlace) {
    lightUpAll(elPlace);
}

// nine 9
// ------------------------------------
function lightUpNine(elPlace) {
    let left = $(`${elPlace} .left.below .bulb`);

    lightUpAll(elPlace);
    left.classList.remove("lit");
}

// negative/minus -
// ------------------------------------
function lightUpMinus(elPlace) {
    let mid = $(`${elPlace} .mid .bulb`);

    dimAll(elPlace);
    mid.classList.add('lit');
}

// dot/period .
// ------------------------------------
function lightUpDecimal(elPlace) {
    dimAll(elPlace);
    spinDecimal(elPlace, "left");
}

// comma ,
// ------------------------------------
function lightUpComma(elPlace) {
    let right = $(`${elPlace} .right.below .bulb`);

    dimAll(elPlace);
    right.classList.add('lit');
}

// error E
// ------------------------------------
function lightUpErrors() {
    function lightUpE(elPlace) {
        let right = $all(`${elPlace} .right .bulb`);

        lightUpAll(elPlace);
        right.forEach(el => el.classList.remove("lit"));
    }
    placeMatchArray.forEach(place => lightUpE(place));
}

/* ====================================

  Manage crankshaft

------------------------------------ */

// these constants for building the shaft help
// work through the ambiguity in development
// don't confuse toothWidth with the css variable
// this is an approximation accounting for skew & margin
// as well as width
const toothCount = 50,
    toothWidth = 6;

function initializeShaft() {
    buildShaft();
    handleDecimalAnimation();
}

/* ===============================================
    
    Programmatic Build: buildShaft()

--------------------------------------------------
- build the shaft programmatically
- the shaft's bar is already in place in a wrapper
- add a wrapping div (spinnerSection) to populate
    the gear teeth with position needs
- each tooth div has a front & behind span
    to suggest the wrap around
----------------------------------------------- */

function prepLimit(primaryClass) {
    let el = $create('div');

    el.classList.add(primaryClass, "limit");

    return el;
}

function setUpTeeth(section) {
    let leftEdge = section.offsetLeft;

    // use a high upper limit (ie. toothCount = 50) on the outer loop
    // use a conditional break set on edge limits
    for (let i = 0; i < toothCount; i++) {
        let tooth = $create('div'),
            front = $create('span'),
            behind = $create('span'),
            lft = leftEdge + parseFloat(i * toothWidth);

        // the last tooth can slip behind the limit bar
        // so remove the last one and break out too,
        // we have enough teeth for effect  
        if (lft > section.offsetWidth + leftEdge - toothWidth) {
            let last = section.lastChild;

            last.removeChild(last.lastChild);
            break;
        }

        front.classList.add('tooth', 'anim');
        behind.classList.add('behind', 'anim');

        tooth.style.left = `${lft}px`;
        tooth.dataset.number = i;

        tooth.appendChild(front);
        tooth.appendChild(behind);

        section.appendChild(tooth);
    }
}

function buildShaft() {
    let spinnerSection = $create('div'),

        // set up the shaft constraints: limits
        // these help the illusion by hiding the return   
        leftLim = prepLimit("leftLimit"),
        rightLim = prepLimit("rightLimit");

    spinnerSection.classList.add('spinnerSection');
    spinnerSection.appendChild(leftLim);
    shaft.appendChild(spinnerSection);

    setUpTeeth(spinnerSection);

    spinnerSection.appendChild(rightLim);
}


/* ===============================================
    
    Handle Decimal Animation
    
----------------------------------------------- */
function handleDecimalAnimation(moveState = "stop") {
    let els = $all('.anim');

    switch (moveState) {
        case "stop":
            for (let i = 0; i < els.length; i++) {
                els[i].style.animationPlayState = "paused";
            }
            break;
        case "right":
            for (let i = 0; i < els.length; i++) {
                els[i].style.animationDirection = "normal";
                els[i].style.animationPlayState = "running";
            }
            break;
        case "left":
            for (let i = 0; i < els.length; i++) {
                els[i].style.animationDirection = "reverse";
                els[i].style.animationPlayState = "running";
            }
            break;
    }
}


/* ====================================

  Manage decimal shuttle effects

------------------------------------ */
function spinDecimal(elPlace, direction = "left") {
    let decimal = $('#decimalGear'),
        digit = $(`${elPlace}`),
        shftClass = $("#shaftWrap").classList;

    shftClass.add("shaftWrapLit");
    handleDecimalAnimation(direction);
    decimal.style.left = `${digit.offsetLeft + 22 - 60}px`;
    setTimeout(() => {
        handleDecimalAnimation("stop");
        raiseDecimal(decimal, direction);
        shftClass.remove("shaftWrapLit");
    }, 950);
}

// raiseDecimal -----------------------
// direction tests 'right' when
// decimal shuttle is resetting
// ------------------------------------
function raiseDecimal(decimal, direction = "left") {
    let dotClass = decimal.children[0].classList,
        decStyle = decimal.style;

    if (direction === "left") {
        dotClass.remove("decimalDim");
        dotClass.add("decimalLit");
        decStyle.transform = "rotate(0deg)";
    } else {
        decStyle.transform = "rotate(-90deg)";
        if (dotClass.contains("decimalLit")) {
            dotClass.remove("decimalLit");
            dotClass.add("decimalDim");
        }
    }
}

/* ====================================
    ENTRY
==================================== */
initializeKeys();

initializeDisplay();

initializeShaft();

