function $(qry){return document.querySelector(qry)}
function $m(typ, id = false, app = false) {
    let returnElement = document.createElement(typ);
    if(id) returnElement.id = id;
    if(app) app.append(returnElement);

    return returnElement;
}

function httpGetAsync(theUrl, callback, label) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, label);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

// narrator functions

let narrator = {
    "currentPart": "beginning"
}
function loadNarrator(text, part) {
    let splitArray = text.split("\n")
    let finalizedArray = [];
    for(let i = 0; i < splitArray.length; i++) {
        if(splitArray[i] == "") continue;
        if(!isNaN(Number(splitArray[i]))) {
            finalizedArray.push(Number(splitArray[i]));
        } else {
            let isComment = false;
            let currentIndex = splitArray[i].split(" ").join("");
            let currentLine = splitArray[i];
            if(currentIndex.startsWith("//")) isComment = true;
            if(currentIndex.startsWith("\"")) currentLine = currentLine.substring(1);
            if(currentIndex.startsWith("~")) currentLine = "__nodisplay";
            if(currentIndex.startsWith("<")) currentLine = "__gobk " + currentIndex.substring(1);
            if(currentIndex.startsWith("!")) currentLine = "__func " + currentIndex.substring(1);
            if(!isComment) finalizedArray.push(currentLine);
        }
    }
    console.log(finalizedArray)

    narrator[part] = finalizedArray;
}
httpGetAsync("./narrator/beginning.txt", loadNarrator, "beginning");

let storyFunctions = {
    "makeReset": function(){
        let resetButton = $m("button", "part2", $("#begin-div"));
        resetButton.innerText = "Reset";
        resetButton.addEventListener("click", () => {
            clearInterval(interval);
            resetButton.remove();
            $("#begin-div").classList.add("fizzle");
            $("#narrator").innerText = "Wait, what??";
            setTimeout(() => {
                $("#narrator").innerText = "I wasn't expecting that!";
                setTimeout(() => {
                    $("#narrator").innerText = "AAAHHHHHHHHHHH";
                    $("#begin-div").addEventListener("animationend", () => {
                        $("#begin-div").remove();
                        loadPart("recursion");
                    })
                }, 1000);
            }, 500);
        })
    }
}

let currentPartIndex = 0;
function speakPart(part) {
    let partSpeaking = narrator[part];
    if(typeof partSpeaking[currentPartIndex] == "number") {
        if(counter.count >= partSpeaking[currentPartIndex]) {
            currentPartIndex++;
        }
    } if(typeof partSpeaking[currentPartIndex] == "string"){
        if(partSpeaking[currentPartIndex] == "__nodisplay") {
            narratorBox.innerText = "";
        } else if(partSpeaking[currentPartIndex].startsWith("__func")) {
            let callback = partSpeaking[currentPartIndex].substring(7);
            console.log(partSpeaking[currentPartIndex]);
            if(storyFunctions[callback]) storyFunctions[callback]();
            currentPartIndex++;
            return;
        } else if(partSpeaking[currentPartIndex].startsWith("__gobk")) {
            let gobkAmount = partSpeaking[currentPartIndex].substring(7)
            currentPartIndex -= gobkAmount;
            narratorBox.innerText = partSpeaking[currentPartIndex];
            currentPartIndex++;
            return;
        } else narratorBox.innerText = partSpeaking[currentPartIndex];
        currentPartIndex++;
    }
}

function __jumpTo(count, index) {
    counter.count = count;
    currentPartIndex = index;
    if(currentPartIndex > narrator[narrator.currentPart].length) currentPartIndex = narrator[narrator.currentPart].length
    tick(); 
}

// counter

var counter = {}
{
    let ct = 0;
    Object.defineProperty(counter, "count", {
        "enumerable": false,
        get() {
            return ct;
        },
        set(v) {
            ct = v;
            $("#main-counter").innerText = v;
        }
    })
}

// make everything

function tick() {
    counter.count++;
    speakPart(narrator.currentPart);
}

let narratorBox
let interval = 0;
function loadPart(part) {
    switch(part) {
        case "recursion":
            let introDiv = $m("div", "intro-div", document.body);
            let title = $m("div", false, introDiv);
            title.className = "intro-title";
            title.innerText = "Chapter 1";

            let subtitle = $m("div", false, introDiv);
            subtitle.className = "intro-subtitle";
            subtitle.innerText = "Recursion";
            break;
    }
}

function begin() {
    let beginningDiv = $m("div", "begin-div", document.body);
    $m("div", "main-counter", beginningDiv).innerText = "0";
    $m("br", false, beginningDiv);
    narratorBox = $m("div", "narrator", beginningDiv);

    interval = setInterval(tick, 1000);   
}

function stateChange() {
    if(document.readyState == "complete") begin();
}
document.addEventListener("readystatechange", stateChange);