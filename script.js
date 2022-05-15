function $(qry){return document.querySelector(qry)}
function $m(typ, id = false, app = false) {
    let returnElement = document.createElement(typ);
    if(id) returnElement.id = id;
    if(app) app.append(returnElement);

    return returnElement;
}
function $a(em, to=document.body) {
    to.append(em);
}

function httpGetAsync(theUrl, callback, label) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, label);
    }
    xmlHttp.open("GET", theUrl, true);
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
    narrator[part] = finalizedArray;
}
httpGetAsync("./narrator/beginning.txt", loadNarrator, "beginning");
httpGetAsync("./narrator/recursion.txt", loadNarrator, "recursion");
httpGetAsync("./narrator/recursion2.txt", loadNarrator, "recursion2");

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
    },
    "getName": function() {
        clearInterval(interval);
        let rd = $("#recursion-div");
        $m("br", false, rd);
        $m("input", "name-input", rd).type = "text";
        $a(" ", rd);
        $m("button", "name-submit", rd).innerText = "is my name.";
        $("#name-submit").setAttribute("disabled", true);

        $("#name-input").addEventListener("input", () => {
            if(!($("#name-input").value.split(" ").join("") == "")) {
                $("#name-submit").removeAttribute("disabled", true);
            } else {
                $("#name-submit").setAttribute("disabled", true);
            }
        })

        $("#name-submit").addEventListener("click", () => {
            if($("#name-submit").getAttribute("disabled")) return;
            narrator.playerName = $("#name-input").value;
            $("#name-submit").remove(); $("#name-input").remove();
            loadPart("recursion2");
        })
    }
}

let currentPartIndex = 0;
function replaceName(str) {
    return str.replace(/\$(.*?[^\S]*\$)/g, narrator.playerName);
}

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
            if(storyFunctions[callback]) storyFunctions[callback]();
            currentPartIndex++;
            return;
        } else if(partSpeaking[currentPartIndex].startsWith("__gobk")) {
            let gobkAmount = partSpeaking[currentPartIndex].substring(7)
            currentPartIndex -= gobkAmount;
            narratorBox.innerText = partSpeaking[currentPartIndex];
            currentPartIndex++;
            return;
        } else if(partSpeaking[currentPartIndex].match(/\$(.*?[^\S]*\$)/g)) {
            narratorBox.innerText = replaceName(partSpeaking[currentPartIndex]);
        } else narratorBox.innerText = partSpeaking[currentPartIndex];
        currentPartIndex++;
    }
}

let debug = {}
debug.jumpTo = function(count, index) {
    counter.count = count;
    currentPartIndex = index;
    if(currentPartIndex > narrator[narrator.currentPart].length) currentPartIndex = narrator[narrator.currentPart].length
    tick(); 
}

debug.enableStep = function() {
    $m("button", "debug-step", document.body).innerText = "Debug: STEP";
    $("#debug-step").addEventListener("click", tick);
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
    if(document.visibilityState == "hidden") return;
    counter.count++;
    speakPart(narrator.currentPart);
}

let narratorBox
let interval = 0;
function loadPart(part) {
    currentPartIndex = 0;
    switch(part) {
        case "recursion":
            narrator.currentPart = "recursion";
            let introDiv = $m("div", "intro-div", document.body);
            let title = $m("div", false, introDiv);
            title.className = "intro-title";
            title.innerText = "Chapter 1";

            let subtitle = $m("div", false, introDiv);
            subtitle.className = "intro-subtitle";
            subtitle.innerText = "Recursion";
            introDiv.addEventListener("animationend", ({animationName: an}) => {
                if(an == "slideout") {
                    introDiv.remove();
                    let recursionDiv = $m("div", "recursion-div", document.body);
                    $m("div", "main-counter", recursionDiv).innerText = "0";
                    $m("br", false, recursionDiv);
                    counter.count = 0;
                    narratorBox = $m("div", "narrator", recursionDiv);

                    interval = setInterval(tick, 1000);  
                }
            })
            break;
        case "recursion2":
            narrator.currentPart = "recursion2";
            interval = setInterval(tick, 1000);  
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