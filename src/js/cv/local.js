const localizationData={current:"en-US"}

function T(a){function t(a,t){return t.forEach(function(t,o){a=a.replace("$"+(o+1),t)}),a}var o=localizationData.current.toLowerCase();if(localizationData[o]&&localizationData[o][a])return t(localizationData[o][a],Array.prototype.slice.call(arguments,1));return localizationData["en-us"]&&localizationData["en-us"][a]?t(localizationData["en-us"][a],Array.prototype.slice.call(arguments,1)):a}
function setLocale(o){localizationData[o]?localizationData.current=o:console.error("Language '"+o+"' is not supported.")}
function setLocalizationData(a){for(var t in a)if(a.hasOwnProperty(t)){localizationData[t]={};for(var i in a[t])a[t].hasOwnProperty(i)&&(localizationData[t][i]=a[t][i])}}

export {T,setLocale,setLocalizationData}