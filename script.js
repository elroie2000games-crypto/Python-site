window.onload = function(){

let projects = JSON.parse(localStorage.getItem("pythonProjects")) || {};

let currentProject = null;
let editor = null;
let pyodide = null;


/* =========================
   Monaco Editor
========================= */

require.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"
	}
});


require(["vs/editor/editor.main"], function () {

	editor = monaco.editor.create(
		document.getElementById("editor"),
		{
			value:
`# כתוב כאן קוד Python

print("Hello Python!")
`,
			language: "python",
			theme: "vs-dark",
			automaticLayout: true,
			fontSize: 16
		}
	);


	loadProjects();

});



/* =========================
   שמירת פרויקטים
========================= */

function saveProjects(){

	localStorage.setItem(
		"pythonProjects",
		JSON.stringify(projects)
	);

	loadProjects();

}



/* =========================
   טעינת רשימת פרויקטים
========================= */

function loadProjects(){

	let list = document.getElementById("projectList");

	list.innerHTML = "";


	for(let name in projects){

		let div = document.createElement("div");

		div.className = "project";

		div.innerHTML = "🐍 " + name;


		div.onclick = function(){

			openProject(name);

		};


		list.appendChild(div);

	}

}



/* =========================
   פרויקט חדש
========================= */

document.getElementById("newProject").onclick = function(){

	let name = prompt("שם הפרויקט:");

	if(!name) return;


	projects[name] =
`print("Hello from ${name}!")
`;


	saveProjects();

	openProject(name);

};




/* =========================
   פתיחת פרויקט
========================= */

function openProject(name){

	currentProject = name;


	document.getElementById("projectName").value = name;


	editor.setValue(
		projects[name]
	);

}



/* =========================
   שמירה
========================= */

document.getElementById("saveBtn").onclick = function(){

	if(!currentProject){

		alert("אין פרויקט פתוח");

		return;

	}


	projects[currentProject] =
	editor.getValue();


	saveProjects();


	alert("נשמר!");

};




/* =========================
   מחיקה
========================= */

document.getElementById("deleteBtn").onclick = function(){

	if(!currentProject){

		alert("אין פרויקט פתוח");

		return;

	}



	if(confirm("למחוק את הפרויקט?")){


		delete projects[currentProject];


		saveProjects();


		currentProject = null;


		editor.setValue("");


		document.getElementById("projectName").value = "";

	}

};




/* =========================
   חיפוש
========================= */

document.getElementById("search").oninput = function(){

	let text = this.value.toLowerCase();


	let items =
	document.querySelectorAll(".project");



	items.forEach(function(item){


		if(
			item.innerText
			.toLowerCase()
			.includes(text)
		){

			item.style.display = "block";

		}
		else{

			item.style.display = "none";

		}


	});


};

/* =========================
   העלאת קובץ Python
========================= */

document.getElementById("uploadProject").onclick = function(){

	document.getElementById("fileInput").click();

};



document.getElementById("fileInput").onchange = function(e){

	let file = e.target.files[0];


	if(!file) return;



	let reader = new FileReader();



	reader.onload = function(){


		let name = file.name.replace(".py","");


		projects[name] = reader.result;


		saveProjects();


		openProject(name);


	};



	reader.readAsText(file);

};




/* =========================
   הורדת פרויקט
========================= */

document.getElementById("downloadBtn").onclick = function(){


	if(!currentProject){

		alert("אין פרויקט פתוח");

		return;

	}



	let code = editor.getValue();



	let blob = new Blob(
		[code],
		{
			type:"text/python"
		}
	);



	let link = document.createElement("a");


	link.href =
	URL.createObjectURL(blob);



	link.download =
	currentProject + ".py";



	link.click();


};





/* =========================
   הרצת Python
========================= */

document.getElementById("runBtn").onclick = async function(){

	if(!pyodide){

		return;

	}


	let code = editor.getValue();

	let output =
	document.getElementById("output");


	output.innerHTML = "";


	try{


		let result =
        await pyodide.runPythonAsync(code);


        if(result !== undefined){

	        output.innerHTML += result;
        }
}

	catch(error){

		output.innerHTML =
		"❌ שגיאה:\n" + error;

	}


};






/* =========================
   טעינת Pyodide
========================= */



let turtleCtx =
document.getElementById("turtleCanvas").getContext("2d");



let turtle = {

	x:400,
	y:300,
	angle:0,
	color:"black",
	size:2,
	pen:true

};




/* =========================
   ניקוי מסך
========================= */

function clearTurtle(){

	turtleCtx.clearRect(
		0,
		0,
		800,
		600
	);

}




/* =========================
   תנועה
========================= */

function moveTurtle(distance){


	let oldX = turtle.x;
	let oldY = turtle.y;



	let rad =
	turtle.angle * Math.PI / 180;



	turtle.x +=
	Math.cos(rad) * distance;



	turtle.y +=
	Math.sin(rad) * distance;



	if(turtle.pen){


		turtleCtx.beginPath();


		turtleCtx.moveTo(
			oldX,
			oldY
		);


		turtleCtx.lineTo(
			turtle.x,
			turtle.y
		);



		turtleCtx.strokeStyle =
		turtle.color;



		turtleCtx.lineWidth =
		turtle.size;



		turtleCtx.stroke();


	}


}





/* =========================
   סיבוב
========================= */

function turnTurtle(angle){

	turtle.angle += angle;

}






/* =========================
   עיגול
========================= */

function turtleCircle(radius){


	turtleCtx.beginPath();


	turtleCtx.arc(

		turtle.x,
		turtle.y,
		radius,
		0,
		Math.PI * 2

	);



	turtleCtx.strokeStyle =
	turtle.color;



	turtleCtx.lineWidth =
	turtle.size;



	turtleCtx.stroke();


}





/* =========================
   צבע
========================= */

function setTurtleColor(color){

	turtle.color = color;

}




/* =========================
   עט
========================= */

function penUp(){

	turtle.pen = false;

}



function penDown(){

	turtle.pen = true;

}




/* =========================
   מעבר מקום
========================= */

function turtleGoto(x,y){

	turtle.x = x;

	turtle.y = y;

}




/* =========================
   עובי
========================= */

function turtleWidth(size){

	turtle.size = size;

}




/* =========================
   חיבור Python
========================= */

async function upgradeTurtle(){


	await pyodide.runPythonAsync(`

from js import moveTurtle
from js import turnTurtle
from js import turtleCircle
from js import clearTurtle
from js import setTurtleColor
from js import penUp
from js import penDown
from js import turtleGoto
from js import turtleWidth



class Turtle:


	def forward(self,x):

		moveTurtle(x)



	def backward(self,x):

		moveTurtle(-x)



	def right(self,x):

		turnTurtle(x)



	def left(self,x):

		turnTurtle(-x)



	def circle(self,x):

		turtleCircle(x)



	def color(self,x):

		setTurtleColor(x)



	def penup(self):

		penUp()



	def pendown(self):

		penDown()



	def goto(self,x,y):

		turtleGoto(x,y)



	def width(self,x):

		turtleWidth(x)



	def clear(self):

		clearTurtle()



turtle = Turtle()


`);

	console.log("🐢 Turtle מוכן!");

}
/* =========================
   סטטוס טעינת Python
========================= */

let pythonStatusElement = document.getElementById("pythonStatus");

if (pythonStatusElement) {

	pythonStatusElement.innerHTML = "⏳ טוען Python...";

}
/* =========================
   עדכון כפתור הרצה
========================= */

let runButton = document.getElementById("runBtn");

if(runButton){

	runButton.disabled = true;

}




/* =========================
   טעינת Python משופרת
========================= */

let status =
document.getElementById("pythonStatus");

async function startPython(){

	console.log("🚀 startPython התחילה");

	try{

		if(status){

			status.innerHTML =
			"⏳ טוען Python...";

		}


		console.log("מתחיל Pyodide");


		pyodide = await loadPyodide({

			indexURL:
			"https://cdn.jsdelivr.net/pyodide/v0.28.2/full/"

		});


		console.log("Pyodide נטען בהצלחה");


		await upgradeTurtle();


		console.log("🐢 Turtle מוכן");


		if(status){

			status.innerHTML =
			"✅ Python מוכן!";

		}


		if(runButton){

			runButton.disabled = false;

		}


		console.log("Python מוכן!");

	}


	catch(error){

		console.error(
			"❌ שגיאה בטעינת Python:",
			error
		);


		if(status){

			status.innerHTML =
			"❌ שגיאה בטעינת Python";

		}


		if(runButton){

			runButton.disabled = true;

		}

	}

}


require(["vs/editor/editor.main"], function () {

	console.log("📌 Monaco מוכן");

	startPython();

});}
