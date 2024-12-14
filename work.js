import {toOrdinal, toWordsOrdinal} from './numberToWords.js';

console.log("test");
console.warn("warning");
console.error("get fucked");
setInterval(addCosts, 100);

//vars
const debug = true;
const totalSpentElement = document.querySelector('#totalSpent');
const difficulty = document.querySelector('#difficulty');
const coinsInput = document.querySelector('#coins');
const testButton = document.querySelector("#test");
const updateButton = document.querySelector("#update");
const section = document.querySelector('section');
const input = document.querySelector('#form');
const costAt100percent = [180, 310, 530, 910, 1560, 2690, 4610, 7900];
//cost for higher difficulty
//=((100-difficulty) / 2) + 100
const actualCosts = [];
let numRows = 1;

//main
input.setAttribute('value', costAt100percent[0])
difficulty.addEventListener('input', updateInputValue);
addNewRowButton.addEventListener('click', addNewRow);
testButton.addEventListener('click', test2);
input.addEventListener('keyup', pressEnter)

//functions
function pressEnter(e){
    log(e)
    if (e.key == 'Enter'){
        addNewRow();
    }
}

function addNewRow(){
    const newLine = document.createElement('p');
    let cost = document.querySelector('#form').value;
    
    if (cost == '' || cost == null || cost == NaN){
        alert("Please enter a value greater than 1");
        return;
    }

    let maxCoins = parseInt(coinsInput.value) || 60; // fallback to 60 if no value entered
    console.log(`maxCoins: ${maxCoins}`);
    let buyTime = determineBuyTime(numRows, cost, maxCoins);
    newLine.innerHTML = `${toOrdinal(numRows)}(cost: ${cost}) buy at <b>${buyTime}</b> coins. ${wavesToRepay(cost)}`;
    section.appendChild(newLine);

    //change input string
    numRows++;
    const inputSpan = document.querySelector('#order');
    inputSpan.innerText = toWordsOrdinal(numRows);

    //store actual cost and update total
    actualCosts.push(cost);
    updateTotalSpent();

    //populate new price guess
    updateInputValue();
}

function addCosts(){
    let i = 1;
    let keepGoing = true;
    let totalSpent = 0;
    while(keepGoing){
        let currentValue;
        try{
            currentValue = document.querySelector(`#${toWordsOrdinal(i)}`).value;
        }catch{
            keepGoing = false;
            continue;
        }
        i++;
        totalSpent += parseInt(currentValue)
        let newString = totalSpent.toString().padStart(5, '0')
        document.querySelector("#totalSpent").innerText = newString;
    }
}

function determineBuyTime(buyingN, cost, maxCoinReturn){
    if (buyingN == 1){
        return cost;
    }
    
    //solve linear system of equations to estimate buy time
    //current situation
    //y = ax
    //y = (buyingN - 1)x

    //upgrade situation
    //y = (a+1)(x-c)
    //y = buyingN(x - cost)

    //want where output (y) is the same for each so set equal to eachother
    //buyingN(x - cost) = (buyingN - 1)x
    //--------------------------------
    //simplifies to x = cost * buyingN
    //--------------------------------
    // let rawGuess = cost * buyingN;
    // let guess = rawGuess * 0.9;
    // warn(guess)



    //guess and check near by time
    let currCoins = cost;
    let coinsForMaxBonus = maxCoinReturn / 0.02
    log(`Coins for max bonus: ${coinsForMaxBonus}`);
    log(`Max coin return: ${maxCoinReturn}`);
    log(`Coins | ${buyingN - 1} modifier | ${buyingN} modifier`)
    
    while(true){
        let currentGenerated = (buyingN - 1) * coinsGenerated(currCoins, maxCoinReturn, coinsForMaxBonus);
        let newGenerated = buyingN * coinsGenerated(currCoins-cost, maxCoinReturn, coinsForMaxBonus);
        
        // log(`   ${buyingN-1}: ${currentGenerated} coins`);
        // log(`   ${buyingN}: ${newGenerated} coins`);
        // log('------------------------------------------------------')

        log(`${currCoins}   | ${currentGenerated}         | ${newGenerated}`)

        if (newGenerated > currentGenerated){
            return currCoins;
        }
        currCoins++;
    }

}

function wavesToRepay(costOfEnhancer){
    let numWaves = Math.ceil(costOfEnhancer/60)
    
    if (numWaves >= 10)
        return `Pay for self in ${numWaves} waves`
    return ""
}

function coinsGenerated(currentCoins, maxCoinReturn, coinsForMaxBonus){
    if (currentCoins < 0){
        currentCoins = 0
    }
    if (currentCoins > coinsForMaxBonus){
        currentCoins = coinsForMaxBonus
    }

    let rawEfficiency = currentCoins / coinsForMaxBonus * 100;
    // log(`Raw efficiency: ${rawEfficiency}`);
    
    let efficiencyAsPercent = Math.floor(rawEfficiency);
    // log(`Efficiency as percent: ${efficiencyAsPercent}`);
    
    let efficiency = efficiencyAsPercent * 0.01
    // log(`Final efficiency: ${efficiency}`);

    let rawCoinsGenerated = maxCoinReturn * efficiency;
    // log(`Raw coins generated: ${maxCoinReturn} * ${efficiency} = ${rawCoinsGenerated}`);
    
    let coinsGenerated = Math.floor(rawCoinsGenerated);
    // log(`Final coins generated: ${coinsGenerated}`);
    // log(``)

    return coinsGenerated
}

function updateInputValue(){

    if (numRows > costAt100percent.length){
        input.value = "";
        return;
    }
    let currentPriceBase = costAt100percent[numRows - 1]
    let currentMultiplier = (((difficulty.value - 100) / 2) + 100) / 100

    if (currentMultiplier < 1){
        currentMultiplier = 1;
    }

    let priceGuess = currentPriceBase * currentMultiplier;
    input.setAttribute('value', priceGuess);
}

function updateTotalSpent(){
    let totalSpent = 0;
    for (let i of actualCosts){
        totalSpent += parseInt(i);
    }
    totalSpentElement.innerText = totalSpent;
}

function test2(){
    console.error(determineBuyTime(5, 1560, 60))
}

function log(input){
    if (debug){
        console.log(input);
    }
}

function warn(input){
    if (debug){
        console.warn(input);
    }
}

function error(input){
    if (debug){
        console.error(input);
    }
}
