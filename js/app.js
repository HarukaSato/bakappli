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
 メモオブジェクトを作成する関数
 */
var createMemo = function(title, place, details){
  return {
    title: title,
    place: place,
    details: details,
    timestamp: new Date()
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
  var li = document.createElement("li");
  li.appendChild(createMemoTitleElement(memo));
  li.appendChild(createMemoDetailsElement(memo));
  li.appendChild(createMemoPlaceElement(memo));
  li.appendChild(createMemoTimestampElement(memo));
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
  
  document.location = "#home";
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

initApp();
