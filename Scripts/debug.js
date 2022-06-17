showSolution = function() {
    document.getElementById('game').classList.remove("swipe-in");
    document.getElementById('recompense').classList.remove("swipe-out");
    document.getElementById('game').classList.add("swipe-in-left");
    document.getElementById('recompense').classList.add("swipe-out-right");
}
