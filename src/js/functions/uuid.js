export default function() {
  var a = (new Date).getTime();
  return window.performance && "function" == typeof window.performance.now && (a += performance.now()), "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(b) {
    var c = 0 | (a + 16 * Math.random()) % 16;
    return a = Math.floor(a / 16), ("x" == b ? c : 8 | 3 & c).toString(16)
  })
}