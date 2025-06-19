window._abb = {};

_abb.ref = document.referre;
_abb.loc = document.location.href;
_abb.hash = decodeURI(_abb.loc).split("#")[1];
_abb.pWin = window.parent.window;

_abb.id = val => document.getElementById(val);
_abb.class = val => document.getElementsByClassName(val);
_abb.tag = val => document.getElementsByTagName(val);
_abb.name = val => document.getElementsByName(val);
_abb.css = val => document.querySelectorAll(val);
_abb.creE = val => document.createElement(val);

_abb.makeAry = (start, end) => {
    var makeAryStart = start.charCodeAt(0);
    var makeAryEnd = end.charCodeAt(0);
    var makeAryNum = (makeAryEnd - makeAryStart) + 1;
    return Array.apply(null, new Array(makeAryNum)).map(function(v, i) {
        return String.fromCharCode(makeAryStart + i);
    });
}
_abb.aryNumSort = (ary) => {
    return ary.sort(function(a,b){
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
});
}

_abb.alphDictSort = (dict, name) => {
    return dict.sort((a,b) => {
        if(a[name] < b[name]) return -1;
        if(a[name] > b[name]) return 1;
        return 0;
    });
}

_abb.aryReg = (ary) => {
    var regForAryResult = [];
    for(i = 0; i < ary.length; i++) {
        regForAryResult.push(ary[i]);
    }
    return new RegExp("(" + regForAryResult.join("|") + ")", 'g');
}
_abb.time = (val) => {
    var tdyBsAry = val.split(/(%year|%month|%day|%hour|%min|%sec)/g);
    var tdyDt = new Date();
    for(var i = 0; i < tdyBsAry.length; i++) {
        if(tdyBsAry[i].match(/%year/g)) {tdyBsAry[i] = tdyDt.getFullYear();}
        else if(tdyBsAry[i].match(/%month/g)) {tdyBsAry[i] = tdyDt.getMonth()+1;}
        else if(tdyBsAry[i].match(/%day/g)) {tdyBsAry[i] = tdyDt.getDate();}
        else if(tdyBsAry[i].match(/%hour/g)) {
            if(tdyDt.getHours() > 9) {tdyBsAry[i] = tdyDt.getHours();}
            else {tdyBsAry[i] = "0" + tdyDt.getHours();}
        }
        else if(tdyBsAry[i].match(/%min/g)) {
            if(tdyDt.getMinutes() > 9) {tdyBsAry[i] = tdyDt.getMinutes();}
            else {tdyBsAry[i] = "0" + tdyDt.getMinutes();}
        }
        else if(tdyBsAry[i].match(/%sec/g)) {
            if(tdyDt.getSeconds() > 9) {tdyBsAry[i] = tdyDt.getSeconds();}
            else {tdyBsAry[i] = "0" + tdyDt.getSeconds();}
        }
    }
    return tdyBsAry.join("");
}
_abb.xhr = () => {
    if(window.XMLHttpRequest){return new XMLHttpRequest();}
    if(window.ActiveXObject){
        try{return new ActiveXObject("Msxml2.XMLHTTP.6.0");}catch(e){}
        try{return new ActiveXObject("Msxml2.XMLHTTP.3.0");}catch(e){}
        try{return new ActiveXObject("Microsoft.XMLHTTP");}catch(e){}
    }
    return false;
}
_abb.execCopy = (string) => {
    let tempExecCopy = _abb.creE('div');
    tempExecCopy.appendChild(_abb.creE('pre')).textContent = string;

    tempExecCopy.style.position = 'fixed';
    tempExecCopy.style.left = '-100%';

    document.body.appendChild(tempExecCopy);
    document.getSelection().selectAllChildren(tempExecCopy);

    let resultExecCopy = document.execCommand('copy');
    document.body.removeChild(tempExecCopy);

    return resultExecCopy;
};