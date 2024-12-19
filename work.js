import {toOrdinal, toWordsOrdinal} from './numberToWords.js';

console.log("test");
console.warn("warning");
console.error("get fucked");
setInterval(addCosts, 100);

//vars
const debug = true;
const difficulty = document.querySelector('#difficulty');
const coinsInput = document.querySelector('#coins');
const testButton = document.querySelector("#test");
const updateButton = document.querySelector("#update");
const bountySection = document.querySelector('#bounty-modifiers');
const miningSection = document.querySelector('#mining-modifiers');
const bountyCostAt100percent = [180, 310, 530, 910, 1560, 2690, 4610, 7900, 13600, 23350, 40050, 68750];
const miningModifierBaseCost = [120, 195, 320, 530, 860, 1420, 2320, 3800, 6200, 10200, 16700, 27350];
const scalar = [120, 192, 307, 491, 786, 1258, 2013, 3221, 5153, 8246];
const vector = [140, 224, 358, 573, 917, 1468, 2348, 3758, 6012, 9620];
const matrix = [170, 272, 435, 696, 1114, 1782, 2852, 4563, 7301, 11682];
const tensor = [185, 296, 473, 757, 1212, 1939, 3103, 4966, 7945, 12713];
const infiar = [200, 320, 512, 819, 1310, 2097, 3355, 5368, 8589, 13743];

// Add this to your existing constants
const constantArrays = {
    'Scalar': scalar,
    'Vector': vector,
    'Matrix': matrix,
    'Tensor': tensor,
    'Infiar': infiar
};

//main
window.addEventListener('load', () => {
    initializeRows();
    createMinersTable();
    createCumulativeTable();
});
updateButton.addEventListener('click', updateAllRows);
testButton.addEventListener('click', test2);
difficulty.addEventListener('input', updateAllRows);

function initializeRows() {
    // Create all 8 rows initially for bounty costs
    for(let i = 0; i < bountyCostAt100percent.length; i++) {
        const newLine = document.createElement('p');
        let cost = bountyCostAt100percent[i];
        
        // Apply difficulty multiplier
        let currentMultiplier = (((difficulty.value - 100) / 2) + 100) / 100;
        if (currentMultiplier < 1) currentMultiplier = 1;
        cost = Math.round(cost * currentMultiplier);
        
        let maxCoins = parseInt(coinsInput.value) || 60;
        let buyTime = determineBuyTime(i + 1, cost, maxCoins);
        
        newLine.innerHTML = `${toOrdinal(i + 1)}(cost: ${cost}) buy at <b>${buyTime}</b> coins. ${wavesToRepay(cost)}`;
        bountySection.appendChild(newLine);
    }

    // Create rows for mining modifier base costs
    let cumulativeCost = 0;
    for(let i = 0; i < miningModifierBaseCost.length; i++) {
        const newLine = document.createElement('p');
        let cost = miningModifierBaseCost[i];
        
        // Apply difficulty multiplier
        let currentMultiplier = (((difficulty.value - 100) / 2) + 100) / 100;
        if (currentMultiplier < 1) currentMultiplier = 1;
        cost = Math.round(cost * currentMultiplier);
        
        let maxCoins = parseInt(coinsInput.value) || 60;
        let buyTime = determineBuyTime(i + 1, cost, maxCoins);
        
        cumulativeCost += cost;
        newLine.innerHTML = `Mining Modifier ${toOrdinal(i + 1)}(cost: ${cost}) (cumulative cost: ${cumulativeCost})`;
        miningSection.appendChild(newLine);
    }
}

function addCosts(){
    let i = 1;
    let keepGoing = true;
    while(keepGoing){
        let currentValue;
        try{
            currentValue = document.querySelector(`#${toWordsOrdinal(i)}`).value;
        }catch{
            keepGoing = false;
            continue;
        }
        i++;
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
    let coinsForMaxBonus = (document.querySelector('#max-bonus').value / 100);
    log(`Coins for max bonus: ${coinsForMaxBonus}`);
    log(`Max coin return: ${maxCoinReturn}`);
    log(`Coins | ${buyingN - 1} modifier | ${buyingN} modifier`)
    
    while(true){
        let currentGenerated = (buyingN - 1) * coinsGenerated(currCoins, maxCoinReturn, coinsForMaxBonus);
        let newGenerated = buyingN * coinsGenerated(currCoins-cost, maxCoinReturn, coinsForMaxBonus);
        

        log(`${currCoins}   | ${currentGenerated}         | ${newGenerated}`)

        if (newGenerated > currentGenerated){
            return currCoins;
        }
        currCoins++;
    }

}

function wavesToRepay(costOfEnhancer){
    let numWaves = Math.ceil(costOfEnhancer/coinsInput.value)
    log(`costOfEnhancer: ${costOfEnhancer}`)
    log(`coinsInput: ${coinsInput.value}`)

    return `Pay for self in ${numWaves} full return waves`
}

function coinsGenerated(currentCoins, maxCoinReturn, coinsForMaxBonus){
    if (currentCoins < 0){
        currentCoins = 0
    }
    if (currentCoins > coinsForMaxBonus){
        currentCoins = coinsForMaxBonus
    }

    let rawEfficiency = currentCoins / coinsForMaxBonus * 100;
    
    let efficiencyAsPercent = Math.floor(rawEfficiency);
    
    let efficiency = efficiencyAsPercent * 0.01

    let rawCoinsGenerated = maxCoinReturn * efficiency;
    
    let coinsGenerated = Math.floor(rawCoinsGenerated);

    return coinsGenerated
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

function createMinersTable() {
    const table = document.querySelector('#miners-table');
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty first cell
    
    // Add number headers (1-10)
    for (let i = 1; i <= 10; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    
    // Create rows for each constant array
    for (let [name, array] of Object.entries(constantArrays)) {
        const row = document.createElement('tr');
        
        // Add name as first cell
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        // Add values
        array.forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });
        
        table.appendChild(row);
    }
}

function createCumulativeTable() {
    const table = document.querySelector('#cumulative-table');
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty first cell
    
    // Add number headers (1-10)
    for (let i = 1; i <= 10; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    
    // Create rows for each constant array
    for (let [name, array] of Object.entries(constantArrays)) {
        const row = document.createElement('tr');
        
        // Add name as first cell
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);
        
        // Add cumulative values
        let sum = 0;
        array.forEach(value => {
            sum += value;
            const td = document.createElement('td');
            td.textContent = sum;
            row.appendChild(td);
        });
        
        table.appendChild(row);
    }
}

function updateAllRows() {
    // Clear existing rows
    bountySection.innerHTML = '';
    miningSection.innerHTML = '';
    
    // Recreate all rows and tables with new values
    initializeRows();
}

const userInputField = document.getElementById('user-input');
const maxBonusField = document.getElementById('max-bonus');

userInputField.addEventListener('input', function() {
    const userInput = parseFloat(userInputField.value);
    const maxBonus = parseFloat(maxBonusField.value);
    const result = userInput + maxBonus; // Add user input to max coins needed for max efficiency
    document.getElementById('result').textContent = ` + ${maxBonus} = ${result}`;
});


/*

can't stand on end, must lay flast
bubbles
light
does it have an ozonator
cover condition?


*/