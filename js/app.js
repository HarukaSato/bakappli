var MEMOLISTNAME = "memo-list"; // localforage で利用するキー
var ENDPOINT = "http://maps.googleapis.com/maps/api/geocode/json";

/*
 memo 作成画面で表示されるフォーム
*/
var memoInputElements = {
  title: document.querySelector("#memo-title"),
  place: document.querySelector("#memo-place"),
  details: document.querySelector("#memo-details"),
  submit: document.querySelector("#memo-submit"),
  location: document.querySelector("#memo-location")
};

/*
 様々な出力先
 */
var outputElements = {
  memoList: document.querySelector("#memo-list")
};

/*
 登録される全メモをいれたメモリスト
 */
var memos = [];

/*
  最後に撮った写真のデータ
*/
var latestPhoto = null;

/*
 メモオブジェクトを作成する関数
 */
var createMemo = function(title, place, details){
  return {
    title: title,
    place: place,
    details: details,
    timestamp: new Date(),
    photo: latestPhoto
  };
};

/*
 メモオブジェクトのタイトル部分を HTML にする関数
 */
var createMemoTitleElement = function(memo){
  var div = document.createElement("div");
  div.textContent = memo.title;
  div.setAttribute("class", "memo-title");
  return div;
};

/*
 メモオブジェクトの場所部分を HTML にする関数
 */
var createMemoPlaceElement = function(memo){
  var div = document.createElement("div");
  div.textContent = memo.place;
  div.setAttribute("class", "memo-place");
  return div;
};

/*
 メモオブジェクトの詳細部分を HTML にする関数
 */
var createMemoDetailsElement = function(memo){
  var div = document.createElement("div");
  div.textContent = memo.details;
  div.setAttribute("class", "memo-details");
  return div;
};

/*
 メモオブジェクトの日付部分を HTML にする関数
 */
var createMemoTimestampElement = function(memo){
  var div = document.createElement("div");
  div.textContent = memo.timestamp;
  div.setAttribute("class", "memo-timestamp");
  return div;
};

/*
  メモオブジェクトに保存されている写真を表示するための要素を作る関数
  */
var createMemoPhoto = function(memo){
  var img = document.createElement("img");
  var src = "img/no-image.png";
  if(memo.photo != null){
    src = memo.photo;
  }
  img.setAttribute("src", src);
  return img;
};

var createMemobutton = function(memo){
  var btn = document.createElement("button");
  btn.innerHTML="location";
  //btn.setAttribute("value","aaa");
 return btn;
}
/*
 メモリストを保存する関数
 */
var saveMemoList = function(){
  localforage.setItem(MEMOLISTNAME, memos);
};

/*
 メモを削除する関数。メモリストからも HTML からも削除される。
 */
var removeMemo = function(memo, element){
  if(element != null && element.parentNode != null){
    element.parentNode.removeChild(element);
  }
  var index = memos.indexOf(memo);
  if(index >= 0){
    memos.splice(index, 1);
    saveMemoList();
  }
};

/*
 メモオブジェクトを HTML にする関数
 */
var createMemoElement = function(memo){
  console.log(memo);
  var li = document.createElement("li");
  li.appendChild(createMemoTitleElement(memo));
  li.appendChild(createMemoDetailsElement(memo));
  li.appendChild(createMemoPlaceElement(memo));
  li.appendChild(createMemoTimestampElement(memo));
  li.appendChild(createMemoPhoto(memo));
  li.appendChild(createMemobutton(memo));
  li.setAttribute("class", "memo");

 // スワイプされたらメモを削除する
  li.addEventListener("swipe", function(){
    removeMemo(memo, li);
  });
  
  return li;
};



/*
 メモオブジェクトを HTML として表示する関数
 */
var displayMemo = function(memo){
  outputElements.memoList.appendChild(createMemoElement(memo));
};

/*
 メモ入力画面の各フォームの入力値をからにする関数
 */
var clearMemoInput = function(){
  memoInputElements.title.value = "";
  memoInputElements.place.value = "";
  memoInputElements.details.value = "";
  latestPhoto = null;
};

/*
 メモを追加する関数。メモ入力画面のコントローラ
 */
var addMemo = function(){
  var newMemo = createMemo(memoInputElements.title.value,
                           memoInputElements.place.value,
                           memoInputElements.details.value);
  memos.push(newMemo);
  displayMemo(newMemo);
  saveMemoList();
  clearMemoInput();
  
  document.location = "#timeline";
};

var showGeolocationError = function(){
};

var showCurrentPosition = function(response){
  console.log(response);
  if(response.status == "OK"){
    memoInputElements.place.value = response.results[0].formatted_address;
  }
};

var buildInvertGeocodingQuery = function(position){
  var latlng = position.coords.latitude + "," + position.coords.longitude;
  return ENDPOINT + "?sensor=true&latlng=" + latlng;
};

var invertGeocode = function(position){
  console.log(position);
  var query = buildInvertGeocodingQuery(position);
  console.log("send invert geocoding query as "  + query);
  $.getJSON(query, showCurrentPosition);
};

var estimateCurrentLocation = function(){
  navigator.geolocation.getCurrentPosition(invertGeocode, showGeolocationError);
};

/*
 保存されていたデータからメモリストと、画面表示を復元する関数。
 localforage.getItem のコールバック関数
 */
var restoreMemoList = function(list){
  memos = list;
  if(memos == null){
    memos = [];
  }
  var i = 0;
  while(i < memos.length){
    displayMemo(memos[i]);
    i = i + 1;
  }
};

/*
 アプリの初期化を行う関数
 */
var initApp = function(){
  memoInputElements.submit.addEventListener("click", addMemo);
  memoInputElements.location.addEventListener("click", estimateCurrentLocation);
  localforage.getItem(MEMOLISTNAME, restoreMemoList);
};

//APIを格納
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//window.URLのAPIをすべてwindow.URLに統一
window.URL = window.URL || window.webkitURL;

if (!navigator.getUserMedia) {
    alert("カメラ未対応のブラウザです。");
}

// 変数
var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    video = document.getElementById("video"),
    btnStart = document.getElementById("start"),
    btnStop = document.getElementById("stop"),
    btnPhoto = document.getElementById("photo"),
    btnMap = document.getElementById("view_map"),
    videoObj = {
        video: true,
        audio: false
    };

  btnMap.addEventListener("click", function(){
          mapInit();
        });

btnStart.addEventListener("click", function() {
    var localMediaStream;
    
    if (navigator.getUserMedia) {
        navigator.getUserMedia(videoObj, function(stream) {
            localMediaStream = stream;
            video.src = window.URL.createObjectURL(localMediaStream);
            
        }, function(error) {
            console.error("getUserMedia error: ", error.code);
        });
        
        btnStop.addEventListener("click", function() {
            localMediaStream.stop();
        });

        
        btnPhoto.addEventListener("click", function() {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            latestPhoto = canvas.toDataURL();    // firfoxならtoblobで直接blobにして保存できます。
        });
    }


});

function mapInit() {
  /*
    var centerPosition = new google.maps.LatLng(35.656956, 139.695518);
    var option = {
        zoom : 18,
        center : centerPosition,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    };
    //地図本体描画
    var googlemap = new google.maps.Map(document.getElementById("mapField"), option);
    console.log(googlemap);
    */
      var latlng = new google.maps.LatLng(35.539001,134.228468);
  var opts = {
    zoom: 13,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map"), opts);
}



initApp();



//    mapInit();

