var screenWidth = 500;
var screenHeight = 500;
var zoom = 1.0;
var tileSize = 250;
var imageCoords = 1000;
var cameraX = -22207;
var cameraY = -9028;

var tiles;
var trucks;
var stats;
var pois;
var poitypes;
var ctx;
var c;
var isClicking = [];
isClicking[0] = false;
isClicking[1] = false;
var mXOld = [];
var mYOld = [];
var mouseX;
var mouseY;
var xVel = 0;
var yVel = 0;
var lastJSONPullTime = new Date().getTime();
var lastJSONStatPullTime = new Date().getTime();
var lastUpdateTime = new Date().getTime();
var truckClicked;
var poiClicked;
var currentZoomLevel = 1;
var isDragging = false;
var xmlHttp = [];
var intervalId; // JS update job Id

function getCurrentZoomLevel() {
  var zoomLevel = 1;
  if (screenWidth / ((tileSize * Math.pow(3, zoomLevel - 1)) * zoom) > 10) zoomLevel++;
  if (screenWidth / ((tileSize * Math.pow(3, zoomLevel - 1)) * zoom) > 10) zoomLevel++;
  if (screenWidth / ((tileSize * Math.pow(3, zoomLevel - 1)) * zoom) > 10) zoomLevel++;
  return zoomLevel;
}

function Tile(x, y, path, zoomlevel) {
  this.set = function(x, y, imagedata) {
    if (x != null && y != null) {
      this.x = x;
      this.y = y;
    }
    if (path) {
      this.path = path;
    }
    if (zoomlevel) {
      this.zoomlevel = zoomlevel;
    }
    this.imagedata = null;
  };
  this.set(x, y, path);

  // Tile.draw(Context ctx)
  this.draw = function(ctx) {
    var d = coordToScreen(this.x, this.y, 0, 0, false);
    var xDraw = d.x;
    var yDraw = d.y;

    // Only draw if we're on-screen
    if ((xDraw + tileSize * zoom * Math.pow(3, this.zoomlevel - 1) > 0) && (xDraw - tileSize * zoom * Math.pow(3, this.zoomlevel - 1) < screenWidth) &&
      (yDraw + tileSize * zoom * Math.pow(3, this.zoomlevel - 1) > 0) && (yDraw - tileSize * zoom * Math.pow(3, this.zoomlevel - 1) < screenHeight)) {
      if (currentZoomLevel == this.zoomlevel) {
        // If we haven't loaded this image yet, load it
        if (!this.imagedata) {
          img = new Image();
          img.src = path;
          this.imagedata = img;
        }
      }
      try {
        // If the image is loaded, draw it
        if (this.imagedata != null) {
          var d = coordToScreen(this.x, this.y + 13, tileSize * Math.pow(3, this.zoomlevel - 1), tileSize * Math.pow(3, this.zoomlevel - 1), false);
          ctx.drawImage(this.imagedata, d.x, d.y, tileSize * zoom * Math.pow(3, this.zoomlevel - 1), tileSize * zoom * Math.pow(3, this.zoomlevel - 1)) //this.imagedata.width, this.imagedata.height);
        };
      } catch (e) {
        delete this.imagedata;
        this.imagedata = null;
      }
    } else {
      // If we're off-screen, unload the image so we aren't so fat
      delete this.imagedata;
      this.imagedata = null;
    }
  }
}

function Poi(x, y, name, type) {
  this.set = function(x, y, name, type) {
    this.size = 1;
    this.distance = 1;
    if (x != null && y != null) {
      this.x = x;
      this.y = y;
    }
    if (name != null) {
      this.name = name;
    }
    if (type != null) {
      this.type = type;
      //console.log(document.getElementById('icon_roads_scale').value) ;
      if (this.type == "garage") {
        this.distance = 1;
        this.distance = 1;
        this.fillStyle = "#B07119";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/garage_large_ico.png';
        this.yscale = 1;
        this.xscale = 1;
      } else if (this.type == "service_station") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/service_ico.png';
        this.yscale = 1;
        this.xscale = 1
      } else if (this.type == "Fuel") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/gas_ico.png';
        this.xscale = 1.5;
        this.yscale = 1.5;
      } else if (this.type == "Recruitment_Agency") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/recruitment_ico.png';
      } else if (this.type == "Hotel") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/parking_ico.png';
        this.yscale = 1;
        this.xscale = 1
      } else if (this.type == "parking") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/parking_ico.png';
        this.xscale = 1.5;
        this.yscale = 1.5;
      } else if (this.type == "business_agronord") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/agronord.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_aria_fd_albg") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/aria_food.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_aria_fd_esbj") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/aria_food.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_aria_fd_jnpg") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/aria_food.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_aria_fd_trbg") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/aria_food.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_bcp") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/bcp.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_bhv") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/bhv.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_bjork") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/bjork.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_cont_port") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/cont_port.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_drekkar") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/drekkar.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_euroacres") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/euroacres.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_eurogoodies") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/eurogoodies.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_fcp") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/fcp.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_gnt") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/gnt.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_ika_bohag") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/ika_bohag.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_itcc") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/itcc.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_kaarfor") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/kaarfor.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_konstnr") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/konstnr.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_konstnr_br") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/konstnr.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_konstnr_hs") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/konstnr.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_konstnr_wind") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/konstnr.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_lkwlog") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/lkwlog.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_marina") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/marina.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_ms_stein") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/ms_stein.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_nbfc") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/nbfc.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_nord_crown") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/nord_crown.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_nord_sten") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/nord_sten.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_norr_food") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/nord_food.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_norrsken") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/norrsken.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_ns_chem") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/ns_chem.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_ns_oil") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/ns_oil.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_polar_fish") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/polar_fish.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_polarislines") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/polarislines.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_posped") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/posped.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_quarry") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/quarry.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_renar") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/renar.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_sag_tre") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/sag_tre.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_sanbuilders") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/sanbuilders.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_scania_dlr") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/scania.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_scania_fac") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/scania.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_sellplan") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/scania.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_skoda") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/skoda.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_stokes") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/stokes.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_tradeaux") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/tradeaux.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_trameri") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/trameri.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_transinet") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/transinet.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_tree_et") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/tree_et.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_vitas_pwr") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/volvo.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_volvo_dlr") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/volvo.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_volvo_fac") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/volvo.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_vpc") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/vpc.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "business_wgcc") {
        this.distance = 1;
        this.fillstyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/Companies/wgcc.png';
        this.xscale = 4;
        this.yscale = 1;
      } else if (this.type == "Scania_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "DAF_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "MAN_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "Renault_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "Iveco_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "Volvo_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
        this.yscale = 1;
        this.xscale = 1
      } else if (this.type == "Magestic_Dealer") {
        this.distance = 1;
        this.fillStyle = "#96201A";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/dealer_ico.png';
      } else if (this.type == "Road") {
        this.distance = 1;
        this.fillStyle = "#f0f0f0";
        this.shape = "squaresign";
      } else if (this.type == "Troll_Booth") {
        this.distance = 1;
        this.fillStyle = "#f0f0f0";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/road_toll_ico.png';
      } else if (this.type == "Quarry") {
        this.distance = 1;
        this.fillStyle = "#f0f0f0";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/road_quarry_ico.png';
      } else if (this.type == "Port") {
        this.distance = 1;
        this.fillStyle = "#f0f0f0";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/road_port_overlay.png';
      } else if (this.type == "Station") {
        this.distance = 1;
        this.fillStyle = "#f0f0f0";
        this.shape = "image";
        this.src = 'http://ets2map.com/mapicons/road_train_ico.png';
      } else if (this.type == "camera") {
        this.distance = 1;
        this.fillStyle = "#FFFF00";
        this.shape = "speed";
        this.src = 'http://ets2map.com/mapicons/speed.png';
        this.xscale = 1;
        this.yscale = 1;
      } else if (this.type.search("road") != -1) {
        this.distance = 1;
        this.fillStyle = "#ffffff";
        this.shape = "road";
        this.src = 'http://ets2map.com/mapicons/Roads/' + this.type + '.png';
        this.xscale = 2;
        this.yscale = 2;
      }
      //else if(this.type=="City") 								{this.distance=2;	this.fillStyle = "#f0f0f0";	this.shape="citytext";this.size=2;}
      //ctx.fillStyle = document.getElementById('map_color').value
      else if (this.type == "City") {
        this.distance = 2;
        this.fillStyle = "#f0f0f0" /*document.getElementById('city_name_color').value*/ ;
        this.shape = "citytext";
        this.size = 2;
      } else if (this.type == "Country") {
        this.distance = 3;
        this.fillStyle = "#f0f0f0";
        this.shape = "text";
        this.size = 3;
      } else {
        this.distance = 1;
        this.fillStyle = "#FF0000";
      }
    } else {
      this.fillStyle = null;
      this.shape = null;
      this.yscale = 1;
      this.xscale = 1;
      this.type = null;
    }
  };
  this.set(x, y, name, type);

  // Poi.draw(Context ctx)
  this.draw = function(ctx) {
    var shouldDraw = false;

    if (this.distance == 3 && zoom > .03) {
      shouldDraw = true;
    } else if (this.distance == 2 && zoom > .05) {
      shouldDraw = true;
    } else if (this.distance == 1 && zoom > .5) {
      shouldDraw = true;
    }

    if (shouldDraw) {
      var d = coordToScreen(this.x, this.y, 0, 0);
      var xDraw = d.x;
      var yDraw = d.y;
      var size = 10 * zoom;
      var src = 'http://ets2map.com/mapicons/garage_large_ico.png';

      ctx.fillStyle = this.fillStyle;

      if ((xDraw > 0) && (xDraw < screenWidth) &&
        (yDraw > 0) && (yDraw < screenHeight)) {
        if (this.shape == "circle") {
          ctx.beginPath();
          ctx.arc(xDraw, yDraw, size / 1, 0, 2 * Math.PI);
          ctx.fill();
        } else if (this.shape == "square") {
          ctx.beginPath();
          ctx.rect(xDraw - size / 2, yDraw - size / 2, size, size);
          ctx.fill();
        } else if (this.shape == "image") {
          poimg = new Image();
          poimg.src = this.src;
          ctx.drawImage(poimg, xDraw - size * this.xscale / 2, yDraw - size / 2, size * this.xscale, size * this.yscale);
        } else if (this.shape == "speed") {
          ctx.beginPath();
          ctx.arc(xDraw, yDraw, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          poimg = new Image();
          poimg.src = this.src;
          ctx.drawImage(poimg, xDraw - size * this.xscale / 2, yDraw - size * this.yscale / 2, size * this.xscale, size * this.yscale);
        } else if (this.shape == "road") {
          //ctx.beginPath();
          //ctx.arc(xDraw, yDraw,size/2,0,2*Math.PI);
          //ctx.fill();
          poimg = new Image();
          poimg.src = this.src;
          ctx.drawImage(poimg, xDraw - size * this.xscale / 2, yDraw - size * this.yscale / 2, size * this.xscale, size * this.yscale);
        } else if (this.shape == "squaresign") {
          ctx.beginPath();
          ctx.rect(xDraw - size / 2, yDraw - size / 2, size, size);

          var fontsize = (size * zoom);
          ctx.font = fontsize + "px Verdana";
          var textwidth = ctx.measureText(this.name).width;
          ctx.textBaseline = "middle";
          ctx.fillText(this.name, d.x - Math.floor(textwidth / 2), d.y);
          ctx.textBaseline = "alphabetic";

          ctx.fill();
        } else if (this.shape == "citytext") {
          ctx.globalAlpha = 1 * zoom * 2;
          var fontsize = size * this.size / zoom + Math.floor(size * this.size);
          ctx.font = fontsize + "px Verdana";
          var textwidth = ctx.measureText(this.name).width;
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#f0f0f0"; // document.getElementById('city_name_color').value;
          ctx.fillText(this.name, d.x - Math.floor(textwidth / 2), d.y);
          ctx.textBaseline = "alphabetic";
          ctx.globalAlpha = 1.0;
        } else if (this.shape == "text") {
          ctx.globalAlpha = 1 / zoom / 2;
          var fontsize = size * this.size / zoom + Math.floor(size * this.size);
          ctx.font = fontsize + "px Verdana";
          var textwidth = ctx.measureText(this.name).width;
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#f0f0f0"; //document.getElementById('country_name_color').value;
          ctx.fillText(this.name, d.x - Math.floor(textwidth / 2), d.y);
          ctx.textBaseline = "alphabetic";
          ctx.globalAlpha = 1.0;
        }
      }
    }
  };

  // boolean Poi.isClicked(float x, float y)
  // checks if given screen x, y coordinates are close enough to the Poi to be counted as a click
  this.isClicked = function(x, y) {
    var ret = false;
    var screen = coordToScreen(this.x, this.y, 0, 0);
    var screenX = screen.x;
    var screenY = screen.y;

    var dx = x - screenX;
    var dy = y - screenY;

    if (dx * dx + dy * dy < 100) {
      ret = true;
    }

    return ret;
  }
}

function Truck(x, y, name, s, r, etsname, mp_id, p_id) {

  this.set = function(x, y) {
    if (x != null && y != null) {
      this.x = x;
      this.y = y;
    }
    if (name != null) {
      this.name = name;
    }

    this.direction = 90;
    this.speed = 0;
    this.xvel = 0;
    this.yvel = 0;
    this.lastx = this.x;
    this.lasty = this.y;
    this.drawx = this.x;
    this.drawy = this.y;
    this.rot = 0;
    this.rotvel = 0;
    this.oldrot = 0;
    this.drawrot = 0;
    this.TS = null;
    this.prevTS = null;
    this.initialTS = null;
    this.initialTSTime = null;
    this.TSTime = null;
    this.hauling = null;

    if (r != null) {
      this.r = r;
    }
    if (s != null) {
      this.s = s;
    }
  };
  this.set(x, y, name);
  this.etsname = etsname;
  this.mp_id = mp_id;
  this.p_id = p_id;
  this.lastTimeUpdated = (new Date().getTime());
  this.prevTimeUpdated = (new Date().getTime());
  this.isActive = true;
  // Truck.draw(Context ctx)
  this.draw = function(ctx) {
    if (this.isActive) {
      //truck_vis_range

      //if((zoom > .25) || (truckClicked==this.name)) {
      if ((zoom > .25) || (truckClicked == this.name)) {
        var timePrevious = (this.prevTS - this.initialTS) * 1000 + this.initialTSTime;
        var timeCurrent = (this.TS - this.initialTS) * 1000 + this.initialTSTime;

        var timeElapsedSinceLastUpdate = (new Date().getTime()) - timeCurrent;
        var timeBetweenPriorUpdates = timeCurrent - timePrevious;
        if (timeBetweenPriorUpdates == 0) {
          timeBetweenPriorUpdates = 1;
        }

        var drawx = this.lastx + this.xvel * timeElapsedSinceLastUpdate / timeBetweenPriorUpdates;
        var drawy = this.lasty + this.yvel * timeElapsedSinceLastUpdate / timeBetweenPriorUpdates;

        this.drawx = this.drawx * .95 + drawx * .05;
        this.drawy = this.drawy * .95 + drawy * .05;


        this.drawrot = this.oldrot + this.rotvel * timeElapsedSinceLastUpdate / timeBetweenPriorUpdates;
        //this.drawrot = this.drawrot*.9+drawrot*.1;
        //this.drawrot = this.direction;

        var d = coordToScreen(this.drawx, this.drawy - 15, 0, 0);
        var xDraw = d.x;
        var yDraw = d.y;

        var size = 6 * zoom;

        // Only draw if truck is in current view window
        //
        if ((xDraw > 0) && (xDraw < screenWidth) && (yDraw > 0) && (yDraw < screenHeight) && timeElapsedSinceLastUpdate < 10000) {
          trkimg = new Image();
          if (truckClicked == this.name) {
            trkimg.src = "http://anotherfoxguy.com/images/OW_ETS2Map/icon_truck_activated.png";

          } else {

            trkimg.src = "http://anotherfoxguy.com/images/OW_ETS2Map/icon_truck_networked.png";
          }
          ctx.fillStyle = "rgba(0, 0, 0, 0)";

          ctx.save();
          ctx.translate(xDraw, yDraw);
          ctx.rotate(this.drawrot + 3 * 3.1415 / 2.0);
          //ctx.rotate(this.drawrot);
          ctx.translate(-size / 2, -size / 2);


          ctx.beginPath();
          ctx.rect(0, -size, size, size * 2);
          ctx.fill();

          //trkimg.src = "http://ets2map.com/mapicons/truck.png";


          ctx.drawImage(trkimg, -size / 2, -size / 2, size * 2, size * 2);
          ctx.restore();


          // If we are zoomed in, or the Truck is clicked, display detailed information
          if ((zoom > localStorage.getItem("truck_vis_range")) || (truckClicked == this.name)) {
            ctx.font = "18px Verdana";
            ctx.fillStyle = "#ffffff";
            //ctx.fillStyle = document.getElementById('player_name_color').value;

            if (localStorage.getItem("name_show_id")) {
              text_id_num = "(" + this.p_id + ")"
            } else {
              text_id_num = ""
            }
            if (localStorage.getItem("name_show")) {
              text_id_name = this.etsname
            } else {
              text_id_name = ""
            }

            if (this.s == 1) {
              text_id_stats = ' S'
            } else {
              text_id_stats = ""
            }

            ctx.fillText(text_id_name + text_id_num + text_id_stats, d.x, d.y - 20);
            //ctx.fillText(this.lastx +" @ "+this.lasty , d.x, d.y - 20);


            if (this.r == 1) {
              rdrimg = new Image();
              ctx.save();
              rdrimg.src = "http://ets2map.com/mapicons/radar.png";
              ctx.translate(d.x, d.y);
              ctx.drawImage(rdrimg, 45, -37, 20, 20);
              ctx.restore();
            }
            //if (this.s == 1) {
            //		rdrimg = new Image();
            //		ctx.save();
            //		rdrimg.src = "http://ets2map.com/mapicons/stats.png";
            //		ctx.translate(d.x,d.y);
            //		ctx.drawImage(rdrimg, 60, -37, 30,20);
            //		ctx.restore();
            //}
          }
        }
      }
    }
  };

  // Truck.update(long time)
  this.update = function(time) {

    // If over 15 seconds
    if ((new Date().getTime()) - this.lastTimeUpdated > 15000) {
      this.isActive = false;
    }
  };

  // Truck.isClicked(float x, float y)
  // given screen x and y - checks if coords are close enough to be considered a 'click'
  this.isClicked = function(x, y) {
    var ret = false;

    if (this.isActive) {
      var screen = coordToScreen(this.drawx, this.drawy, 0, 0);
      var screenX = screen.x;
      var screenY = screen.y;

      var dx = x - screenX;
      var dy = y - screenY;

      if (dx * dx + dy * dy < 100) {
        ret = true;
      }
    }
    return ret;
  }
}

function init() {
  c = document.getElementById("mpmap");
  elemLeft = c.offsetLeft;
  elemTop = c.offsetTop;
  ctx = c.getContext("2d");

  trucks = [];
  pois = [];
  stats = [];

  resize();

  c.addEventListener('mousedown', mouseDown);
  c.addEventListener('mouseup', mouseUp);
  c.addEventListener('mousemove', mouseOver);
  c.addEventListener("mousewheel", mouseWheel, false);

  c.addEventListener("wheel", mouseWheel, false);
  c.addEventListener("DOMMouseScroll", mouseWheel, false);
  c.addEventListener("touchstart", touchHandler, true);
  c.addEventListener("touchmove", touchHandler, true);
  c.addEventListener("touchend", touchHandler, true);
  c.addEventListener("touchcancel", touchHandler, true);
  //document.getElementById("search").addEventListener("keyup", buildPois);

  tiles = [];

  for (var i = -60; i <= 45; i += 27) {
    for (var j = -58; j <= 45; j += 27) {
      tiles[tiles.length] = new Tile(i * 1000, j * 1000, "http://tiles.ets2map.com/tiles/" + i + "_" + j + "_4.png", 4);
    }
  }

  for (var i = -60; i <= 60; i += 9) {
    for (var j = -58; j <= 45; j += 9) {
      tiles[tiles.length] = new Tile(i * 1000, j * 1000, "http://tiles.ets2map.com/tiles/" + i + "_" + j + "_3.png", 3);
    }
  }

  for (var i = -60; i <= 45; i += 3) {
    for (var j = -58; j <= 45; j += 3) {
      tiles[tiles.length] = new Tile(i * 1000, j * 1000, "http://tiles.ets2map.com/tiles/" + i + "_" + j + "_2.png", 2);
    }
  }

  for (var i = -60; i <= 45; i++) {
    for (var j = -58; j <= 45; j++) {
      var x = i * 1000;
      var y = j * 1000;
      tiles[tiles.length] = new Tile(x, y, "http://tiles.ets2map.com/tiles/" + i + "_" + j + ".png", 1);
    }
  }

  getTruckData();
  getPoIData();

}

function run() {
  currentZoomLevel = getCurrentZoomLevel();

  if (!isClicking[1] && !isClicking[0]) {
    xVel *= .75;
    yVel *= .75;
    cameraX -= xVel;
    cameraY -= yVel;
  }
  ctx.fillStyle = " rgba(0, 0, 0, 0)";
  var bg = new Image();
  bg.src = "http://anotherfoxguy.com/images/OW_ETS2Map/bcg1R.png";

  ctx.drawImage(bg, 0, 0, screenWidth, screenHeight);
  // Clear Screen
  //ctx.fillStyle = "#939393";
  //ctx.fillStyle = " rgba(0, 0, 0, 0.9)";

  //ctx.fillStyle = "#939393";
  //ctx.fillStyle = "#D1C7AA";
  //ctx.fillStyle = document.getElementById('map_color').value
  ctx.globalAlpha = 1.00;
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  // pull new truck data every 1 seconds
  if (zoom > .25) {
    if ((new Date().getTime()) - lastJSONPullTime > 1000) {
      getTruckData();
      lastJSONPullTime = new Date().getTime();
      if (truckClicked != null) {
        if (trucks[truckClicked].s == 1) {
          console.log("Begin Stat Pull for " + trucks[truckClicked].mp_id);
          getTruckStats(trucks[truckClicked].mp_id);
          //console.log("After Stats");
        }
      }
    }
  }

  // Update trucks
  if (trucks != null) {
    myforeach(trucks, function(key) {
      trucks[key].update((new Date().getTime()) - lastUpdateTime);
    });
  }

  if (poiClicked != null) {
    cameraX = cameraX * .9 + pois[poiClicked].x * .1;
    cameraY = cameraY * .9 + pois[poiClicked].y * .1;
  }

  // If we are clicked on a truck, follow it
  if (truckClicked != null) {
    cameraX = cameraX * 0.9 + trucks[truckClicked].drawx * 0.1;
    cameraY = cameraY * 0.9 + trucks[truckClicked].drawy * 0.1;
    //console.log(trucks[truckClicked].drawx+"\n"+trucks[truckClicked].drawy);
    ctx.fillStyle = "#f0f0f0";
    ctx.font = "12px Verdana";
  }


  // Draw tiles
  for (var i = 0; i < tiles.length; i++) {
    tiles[i].draw(ctx);
    //tiles[(i-1)].draw(ctx);

  }

  // Draw trucks
  if (trucks != null) {
    myforeach(trucks, function(key) {
      trucks[key].draw(ctx);
    });
  }

  // Draw pois
  if (pois != null) {
    myforeach(pois, function(key) {
      pois[key].draw(ctx);
    });
  }

  // Draw clicked truck info
  if (truckClicked != null) {
    if (trucks[truckClicked].s == 1) {
      ctx.font = "20px Georgia";
      ctx.fillStyle = "#000000";
      ctx.fillText(trucks[truckClicked].etsname + "(" + trucks[truckClicked].name + ") ", 175, c.offsetHeight - 90);
      //ctx.fillText("Speed: "+trucks[truckClicked].speed+" km/h | "+"RPM: "+trucks[truckClicked].rpm+"/"+trucks[truckClicked].engine_rpm_max+" | " + "Fuel: "+trucks[truckClicked].fuel +"/" + trucks[truckClicked].fuel_max + "L | Gear: "+trucks[truckClicked].gear, 200 , c.offsetHeight - 70);
      //ctx.fillText("Truck ",175, c.offsetHeight - 60);
      //ctx.fillText("Steering Direction: "+trucks[truckClicked].user_steer+" | Throttle: "+trucks[truckClicked].user_throttle+" | Brake: "+trucks[truckClicked].user_brake+" | Clutch: "+trucks[truckClicked].user_clutch, 200 , c.offsetHeight - 50);
      //ctx.fillText("Engine("+trucks[truckClicked].engine_enabled+") | Electrics("+trucks[truckClicked].truck_electrics+") | Lights("+trucks[truckClicked].truck_lights_drive+") | HighBeam("+trucks[truckClicked].truck_lights_high+") | < ("+trucks[truckClicked].truck_lights_l_blinker+") | ("+trucks[truckClicked].truck_lights_r_blinker+") > | Beacon("+trucks[truckClicked].truck_lights_beacon+")", 200 , c.offsetHeight - 30);
      ctx.fillText("Truck: " + trucks[truckClicked].truck_brand + " (" + trucks[truckClicked].truck_model + ") Load: (" + trucks[truckClicked].cargo_weight + " kg)", 200, c.offsetHeight - 30);
      ctx.fillText("Hauling: " + trucks[truckClicked].cargo_name + " (" + trucks[truckClicked].source_city + " " + trucks[truckClicked].source_company + ") -> (" + trucks[truckClicked].destination_city + " " + trucks[truckClicked].destination_company + ")", 200, c.offsetHeight - 10);
    }
  }

  lastUpdateTime = new Date().getTime();
}

/*** CONTROL EVENTS ***/
function mouseDown(event) {
  tap(event.pageX, event.pageY, 0);
}

function mouseUp(event) {
  untap(event.pageX, event.pageY, 0);
}

function mouseOver(event) {
  drag(event.pageX, event.pageY, 0);
}

function mouseWheel(e) {
  var e = window.event || e; // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  zoom *= 1 + delta / 20;
}

function tap(ex, ey, index) {
  var x = ex - elemLeft;
  var y = ey - elemTop;

  truckClicked = null;
  poiClicked = null;
  isClicking[index] = true;
}

function untap(ex, ey, index) {
  var x = ex - elemLeft;
  var y = ey - elemTop;

  if ((isClicking) && (!isDragging)) {
    if (index == 0) {
      truckClicked = null;
      if (trucks != null) {
        myforeach(trucks, function(key) {
          if (trucks[key].isClicked(x, y)) {
            truckClicked = key;
          }
        });
      }
      if (pois != null) {
        myforeach(pois, function(key) {
          if (pois[key].isClicked(x, y)) {
            poiClicked = key;
          }
        });
      }
    }
  }
  isDragging = false;
  isClicking[index] = false;

  mXOld[index] = null;
  mYOld[index] = null;
}


function drag(ex, ey, index) {
  var x = ex - elemLeft;
  var y = ey - elemTop;

  if (isClicking[index]) {
    isDragging = true;
    if ((index == 0) && (!isClicking[1])) {
      if ((mXOld[index] != null) && (mYOld[index] != null)) {
        cameraX -= (x - mXOld[index]) * imageCoords / tileSize / zoom;
        cameraY -= (y - mYOld[index]) * imageCoords / tileSize / zoom;

        xVel = 4 * (x - mXOld[index]) * imageCoords / tileSize / zoom;
        yVel = 4 * (y - mYOld[index]) * imageCoords / tileSize / zoom;
      }
    } else if ((isClicking[0]) && (isClicking[1]) && (mXOld[0] != null) && (mYOld[0] != null) && (mXOld[1] != null) && (mYOld[1] != null)) {
      var dx0 = mXOld[0] - mXOld[1];
      var dy0 = mYOld[0] - mYOld[1];
      var dx1 = dx0;
      var dy1 = dy0;

      if (index == 0) {
        dx1 = x - mXOld[1];
        dy1 = y - mYOld[1];
      } else if (index == 1) {
        dx1 = mXOld[0] - x;
        dy1 = mYOld[0] - y;
      }

      var l0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
      var l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      var scale = l1 / l0;
      if (!isNaN(scale) && (scale != 0)) {
        zoom *= scale;
      }

    }

  } else {
    mouse = screenToCoord(x, y);
    mouseX = mouse.x;
    mouseY = mouse.y;
  }

  mXOld[index] = x;
  mYOld[index] = y;
}

function touchHandler(event) {
  var touches = event.changedTouches;
  for (var index = 0; index < touches.length; index++) {
    if ((touches[index] != null)) {
      if (event.type == "touchstart") {
        tap(touches[index].clientX, touches[index].clientY, touches[index].identifier);
      }
      if (event.type == "touchmove") {
        drag(touches[index].clientX, touches[index].clientY, touches[index].identifier);
      }
      if (event.type == "touchend") {
        untap(touches[index].clientX, touches[index].clientY, touches[index].identifier);
      }
    }
  }

  event.preventDefault();

}

function coordToScreen(x, y, width, height, ukscale) {
  if (ukscale == null) {
    ukscale = true;
  }
  var cx = cameraX;
  var cy = cameraY;
  //{"x":-22145,"y":-9275,"name":"Europoort","type":"City","pois":[
  if (cy < (-.76 * cx - 30140) && (cx < -22145)) {
    cx = cx * .75 - 8337;
    cy = cy * .75 - 1000;
  }

  if ((y < (-.76 * x - 30140)) && (ukscale) && (x < -22145)) {
    x = x * .75 - 8337;
    y = y * .75 - 1000;
  }

  ret = [];
  ret.x = x * tileSize / imageCoords * zoom + screenWidth / 2 - cx / (imageCoords / tileSize) * zoom - width / 2 * zoom;
  ret.y = y * tileSize / imageCoords * zoom + screenHeight / 2 - cy / (imageCoords / tileSize) * zoom - height / 2 * zoom;
  return ret;
}

function screenToCoord(x, y, ukscale) {
  if (ukscale == null) {
    ukscale = true;
  }

  var cx = cameraX;
  var cy = cameraY;

  if (cy < (-.76 * cx - 30140) && (cx < -22145)) {
    cx = cx * .75 - 8337;
    cy = cy * .75 - 1000;
  }

  ret = [];
  ret.x = (x + cx / (imageCoords / tileSize) * zoom - screenWidth / 2) / (tileSize / imageCoords * zoom);
  ret.y = (y + cy / (imageCoords / tileSize) * zoom - screenHeight / 2) / (tileSize / imageCoords * zoom);
  if ((ret.y < (-.76 * ret.x - 30140)) && (ukscale) && (ret.x < -22145)) {
    ret.x = (ret.x + 8337) / .75;
    ret.y = (ret.y + 1000) / .75;
  }
  return ret;
}

function buildPois() {
  /*var locs = document.getElementById("pois");
   var searchText = document.getElementById("search").value.toLowerCase();
   var tags = searchText.split(" ");
   var str = '';
   for(var i=0;i<pois.length;i++) {
   if((searchText!=null)&&(searchText!="")) {
   var check = true;
   for(var j=0;j<tags.length;j++) {
   if(pois[i].search.toLowerCase().indexOf(tags[j]) < 0) {
   check = false;
   }
   }
   if((check) || (searchText=="*")) {
   str+= '<div class="poi" style="margin-left:'+pois[i].depth*10+'px;" onClick="viewPoi('+i+')">'+pois[i].name+'</div>';
   }
   }
   }
   locs.innerHTML = str;*/
}


function viewPoi(index) {
  cameraX = pois[index].x;
  cameraY = pois[index].y;
  truckClicked = null;
}

function getTruckData() {
  //console.log("----------------------------");
  //console.log("BeginGetTruckData()");
  var screen = screenToCoord(screenWidth / 2, screenHeight / 2);
  var outer = screenToCoord(-20, -20);
  var boundX = screen.x - outer.x;
  var boundY = screen.y - outer.y;
  var zoomLevel;

  if (boundX > boundY) {
    zoomLevel = boundX;
  } else {
    zoomLevel = boundY;
  }

  zoomLevel = Math.round(zoomLevel * 1.25);
  //@TODO "+ document.getElementById("server").value + "
  //var url = "http://tracker.ets2map.com/v2/0/"+Math.round(cameraX)+"/"+Math.round(cameraY)+"/"+zoomLevel;
  var url = "http://tracker.ets2map.com/v2/" + localStorage.getItem("server") + "/" + Math.round(cameraX) + "/" + Math.round(cameraY) + "/" + zoomLevel;
  request(url, processTruckResponse);
  //console.log("Post-Poll GetTruckData()");
}

function processTruckResponse(response) {

  var keys = [];

  myforeach(response.Trucks, function(key) {
    keys[keys.length] = key;
    if (trucks[key] == null) {
      trucks[key] = new Truck(response.Trucks[key].x, response.Trucks[key].y, key, response.Trucks[key].s, response.Trucks[key].r, response.Trucks[key].name, response.Trucks[key].mp_id, response.Trucks[key].p_id);
    } else {
      trucks[key].prevTimeUpdated = trucks[key].lastTimeUpdated;
      trucks[key].lastTimeUpdated = (new Date().getTime());

      if (trucks[key].TS != response.Trucks[key].t) {

        trucks[key].lastx = trucks[key].x;
        trucks[key].lasty = trucks[key].y;
        trucks[key].x = response.Trucks[key].x;
        trucks[key].y = response.Trucks[key].y;
        trucks[key].s = response.Trucks[key].s;
        trucks[key].r = response.Trucks[key].r;
        trucks[key].direction = response.Trucks[key].h;
        trucks[key].isActive = true;

        trucks[key].prevTS = trucks[key].TS;
        trucks[key].TS = response.Trucks[key].t;
        trucks[key].TSTime = (new Date().getTime());
        if ((trucks[key].initialTS == null) && (trucks[key].prevTS != null)) {
          trucks[key].initialTS = trucks[key].TS;
          trucks[key].initialTSTime = (new Date().getTime());
        }
        trucks[key].xvel = trucks[key].x - trucks[key].lastx;
        trucks[key].yvel = trucks[key].y - trucks[key].lasty;
        if (trucks[key].xvel * trucks[key].xvel + trucks[key].yvel * trucks[key].yvel > 500 * 500) {
          trucks[key].lastx = trucks[key].x;
          trucks[key].lasty = trucks[key].y;
          trucks[key].xvel = 0;
          trucks[key].yvel = 0;
          trucks[key].drawx = trucks[key].x;
          trucks[key].drawy = trucks[key].y;
        }

        trucks[key].oldrot = trucks[key].rot;
        if ((trucks[key].yvel != 0) || (trucks[key].xvel != 0)) {
          var newrot = Math.atan2(trucks[key].yvel, trucks[key].xvel);
          trucks[key].rot = newrot;
        }
        trucks[key].rotvel = trucks[key].rot - trucks[key].oldrot;
        while (trucks[key].rotvel >= Math.PI) {
          trucks[key].rotvel -= 2 * Math.PI;
        }
        while (trucks[key].rotvel < -Math.PI) {
          trucks[key].rotvel += 2 * Math.PI;
        }
      }
    }
  });
  //console.log(trucks);

  myforeach(trucks, function(key) {
    if (keys.indexOf(key) == -1) {
      trucks[key].isActive = false;
    }
  });
}

function getTruckStats(truckClicked) {
  var url = "http://tracker.ets2map.com:8080/stats/" + truckClicked;
  request(url, processTruckStatResponse);
}

function processTruckStatResponse(response) {
  //console.debug(response);
  myforeach(response, function(key) {
    //console.debug(response[key].cargo_name);
    //trucks[key].speed = response[key].speed;
    //trucks[key].engine_enabled = response[key].engine_enabled;
    //trucks[key].rpm = response[key].engine_rpm;
    //trucks[key].engine_rpm_max = response[key].engine_rpm_max;
    //trucks[key].fuel = response[key].fuel;
    //trucks[key].fuel_max = response[key].fuel_max;
    //trucks[key].fuel_cons = response[key].fuel_cons;
    //trucks[key].gear = response[key].gear;
    //trucks[key].trailer_attached = response[key].trailer_attached;
    //trucks[key].trailer_attached = response[key].trailer_attached;
    //trucks[key].user_steer = response[key].user_steer;
    //trucks[key].user_throttle = response[key].user_throttle;
    //trucks[key].user_brake = response[key].user_brake;
    //trucks[key].user_clutch = response[key].user_clutch;
    trucks[truckClicked].truck_brand = response[key].truck_brand;
    trucks[truckClicked].truck_model = response[key].truck_model;
    trucks[truckClicked].cargo_name = response[key].cargo_name;
    trucks[truckClicked].cargo_weight = response[key].cargo_weight;
    trucks[truckClicked].source_city = response[key].source_city;
    trucks[truckClicked].destination_city = response[key].destination_city;
    trucks[truckClicked].source_company = response[key].source_company;
    trucks[truckClicked].destination_company = response[key].destination_company;
    //trucks[key].truck_electrics = response[key].truck_electrics;
    //trucks[key].truck_lights_drive = response[key].truck_lights_drive;
    //trucks[key].truck_lights_high = response[key].truck_lights_high;
    //trucks[key].truck_lights_l_blinker = response[key].truck_lights_l_blinker;
    //trucks[key].truck_lights_r_blinker = response[key].truck_lights_r_blinker;
    //trucks[key].truck_lights_beacon = response[key].truck_lights_beacon;
    //console.log(key);
  });
}

function getPoIData() {
  request("http://ets2map.com/automated_v16.json", processPoIResponse);
}

function processPoIResponse(response) {
  processPois(response);
  buildPois();
}

function processPois(ps, searchstring, depth) {
  if (searchstring == null) searchstring = "";
  if (depth == null) depth = 0;
  myforeach(ps, function(key) {
    //console.log(ps);
    pois[pois.length] = new Poi(ps[key].x, ps[key].y, ps[key].name, ps[key].type);
    pois[pois.length - 1].search = searchstring + " " + pois[pois.length - 1].name;
    pois[pois.length - 1].depth = depth;
    if (ps[key].pois != null) {
      var parentIndex = pois.length - 1;
      processPois(ps[key].pois, pois[pois.length - 1].search, depth + 1);
      if (pois.length > (parentIndex + 1)) {
        for (var j = parentIndex + 1; j < pois.length; j++) {
          pois[parentIndex].search += pois[j].search;
        }
      }
    }
  });
}

function request(url, func) {
  var reqId = 0;
  while (xmlHttp[reqId] != null) {
    reqId++;
  }
  xmlHttp[reqId] = new XMLHttpRequest();
  xmlHttp[reqId].onreadystatechange = routeResponse;
  xmlHttp[reqId].func = func;
  xmlHttp[reqId].open("GET", url, true);
  xmlHttp[reqId].send(null);
}

function routeResponse() {
  if (this.readyState == 4 && this.status == 200) {
    if (this.responseText == "Not found") { /*problem*/ } else {
      var response = eval("(" + this.responseText + ")");
      this.func(response);
    }
  }
  xmlHttp[this.reqId] = null;
}

function myforeach(array, funct) {
  for (var key in array) {
    if (array.hasOwnProperty(key) && /^0$|^[1-9]\d*$/.test(key) && key <= 4294967294) {
      funct(key);
    }
  }
}


function start() {
  init();
  if (intervalId) window.clearInterval(intervalId);
  intervalId = window.setInterval("run()", 1000 / 30);
}

function resize() {
  var w = window.innerWidth / 1.165;
  var h = window.innerHeight / 1.55;

  /*
  w -=  window.innerWidth/8;
  h -=  window.innerHeight/2;
  var w=document.documentElement.offsetWidth;
   var h=document.documentElement.offsetHeight;
   var boxcontainer = document.getElementById("box");
   boxcontainer.style.width = w-1+'px';
   boxcontainer.style.height = h-1+'px';

   var poicontainer = document.getElementById("poicontainer");
   poicontainer.style.width = Math.floor(w*.2-1)+'px';
   poicontainer.style.height = Math.floor(h*.2-1)+'px';

   var pois = document.getElementById("pois");
   pois.style.width = Math.floor(w*.2-1)+'px';
   pois.style.height = Math.floor(h*.2-1)+'px';

   var canvascontainer = document.getElementById("canvascontainer");
   canvascontainer.style.width = w-1+'px';
   canvascontainer.style.height = h-1+'px';
   */
  c.height = h;
  c.width = w;

  screenWidth = w;
  screenHeight = h;
}

function searchTruck() {
  truckClicked = localStorage.getItem("mpid");
  if (trucks[truckClicked] == null) {
    truckClicked = null;
  }
  //alert(zoomLevel+"");
}

window.onresize = function(event) {
  resize();
};

start();
