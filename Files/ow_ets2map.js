
var clockUpdateId; // JS update job Id

function dragResize(edge) {
    overwolf.windows.getCurrentWindow(function (result) {
        if (result.status == "success") {
            overwolf.windows.dragResize(result.window.id, edge);
        }
    });
}
function dragMove() {
    overwolf.windows.getCurrentWindow(function (result) {
        if (result.status == "success") {
            overwolf.windows.dragMove(result.window.id);
        }
    });
}
function openWindow(openwindow) {
    overwolf.windows.obtainDeclaredWindow(openwindow, function (result) {
        if (result.status == "success") {
            overwolf.windows.restore(result.window.id, function (result) {
                console.log(result);
            });
        }
        else {
            alert("" + result.status);
        }
    });
}
function closeWindow() {
    overwolf.windows.getCurrentWindow(function (result) {
        if (result.status == "success") {
            overwolf.windows.close(result.window.id);
        }
    });
}
function refresh() {
    location.reload();
}
function save() {
    localStorage.setItem("mpid", document.getElementById("mpid").value);
    localStorage.setItem("server", document.getElementById("server").value);
    localStorage.setItem("truck_vis_range", document.getElementById("truck_vis_range").value);
    localStorage.setItem("name_show", document.getElementById("name_show").value);
    localStorage.setItem("name_show_id", document.getElementById("name_show_id").value);
    closeWindow();
}
function onload() {
    document.getElementById("mpid").value = localStorage.getItem("mpid");
    document.getElementById("server").value = localStorage.getItem("server");
    document.getElementById("truck_vis_range").value = localStorage.getItem("truck_vis_range");
    document.getElementById("name_show").value = localStorage.getItem("name_show");
    document.getElementById("name_show_id").value = localStorage.getItem("name_show_id");
}
function startMap() {
    clock();
    if (clockUpdateId)window.clearInterval(clockUpdateId);
    clockUpdateId = window.setInterval("clock()", 10000);

    if (localStorage.getItem("mpid") == 0) {
        localStorage.setItem("mpid", null);
    }
    if (localStorage.getItem("truck_vis_range") == null) {
        localStorage.setItem("truck_vis_range", 1.25);
    }
    if (localStorage.getItem("server") == null) {
        localStorage.setItem("server", 0);
    }
    if (localStorage.getItem("name_show") == null) {
        localStorage.setItem("name_show", true);
    }
    if (localStorage.getItem("name_show_id") == null) {
        localStorage.setItem("name_show_id", true);
    }

}
function clock() {
    var time =  new Date();
    document.getElementById("clock").innerHTML =time.getHours()+":"+ time.getMinutes();
}
/*
window.addEventListener('storage',
    function (storageEvent) {
        //alert("Any change in localStorage call to this funtion");
    }, false);
*/
