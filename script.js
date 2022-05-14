function $(qry){return document.querySelector(qry)}
function $m(typ, id = false, app = false) {
    let returnElement = document.createElement(typ);
    console.log({type: typ, id: id, append: app}, returnElement);
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

let narrator = {}
function loadNarrator(text, part) {
    narrator[part] = text;
}
httpGetAsync("./narrator/beginning.txt", loadNarrator, "beginning");

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

function main() {
    $m("div", "main-counter", document.body).innerText = "0";

    setInterval(() => counter.count++, 1000);   
}

function stateChange() {
    if(document.readyState == "complete") main();
}
document.addEventListener("readystatechange", stateChange);