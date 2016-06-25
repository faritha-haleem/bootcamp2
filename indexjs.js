var turn = 0;//for player 1 its 0 and for player 2 its 1
var arrX = [0,0,0,0,0,0,0,0,0];
var arrO = [0,0,0,0,0,0,0,0,0];
var count = 0;

function change(id){
if(turn == 0)
{
		document.getElementById(id).innerHTML = 'x';
    count += 1;
    arrX[id] = Math.pow(2,id);
		checkWin(arrX,'X wins');
    checkDraw();
    turn = 1;
}
else{
 		document.getElementById(id).innerHTML = 'o';
    count += 1;
    arrO[id] = Math.pow(2,id);
		checkWin(arrO, 'O wins');
    checkDraw();
    turn = 0;
} 
}

function setAll(a, v) {
    var i, n = a.length;
    for (i = 0; i < n; ++i) {
        a[i] = v;
    }
}
function newGame()
{
		document.getElementById("0").innerHTML = '';
    document.getElementById("1").innerHTML = '';
    document.getElementById("2").innerHTML = '';
    document.getElementById("3").innerHTML = '';
    document.getElementById("4").innerHTML = '';
    document.getElementById("5").innerHTML = '';
    document.getElementById("6").innerHTML = '';
    document.getElementById("7").innerHTML = '';
    document.getElementById("8").innerHTML = '';
    turn = 0;
		setAll(arrX,0);
    setAll(arrO,0);
    count = 0;
}

function checkWin(arr,str)
{
		var winCombinations = [7,56,448,73,146,292,273,84];
    if((arr[0] + arr[1] + arr[2] == 7) || (arr[3] + arr[4] + arr[5] == 56) ||
    (arr[6] + arr[7] + arr[8] == 448) || (arr[0] + arr[3] + arr[6] == 73) ||
    (arr[1] + arr[4] + arr[7] == 146) || (arr[2] + arr[5] + arr[8] == 292) ||
    (arr[0] + arr[4] + arr[8] == 273) || (arr[2] + arr[4] + arr[6] == 84))
    {
    		alert (str);
        newGame();
    }
}

function checkDraw()
{
		if (count == 9)
    {
    		window.alert ("It's a tie!!");
        newGame();
    }
}











