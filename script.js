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
        if(!isNaN(Number(splitArray[i]))) {
            finalizedArray.push(Number(splitArray[i]));
        } else {
            let isComment = false;
            let currentIndex = splitArray[i].split(" ").join("");
            if(currentIndex.startsWith("//")) isComment = true;
            if(!isComment) finalizedArray.push(splitArray[i]);
        }
    }

    narrator[part] = finalizedArray;
}
httpGetAsync("./narrator/beginning.txt", loadNarrator, "beginning");

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

let narratorBox
function main() {
    $m("div", "main-counter", document.body).innerText = "0";
    narratorBox = $m("div", "narrator", document.body);

    setInterval(() => counter.count++, 1000);   
}

function stateChange() {
    if(document.readyState == "complete") main();
}
document.addEventListener("readystatechange", stateChange);