"use strict";

var appName = "todo";
var app = angular.module(appName, ["ngMaterial", "ngCookies", "angularLocalStorage"]);

app.controller("container", function($scope, $mdToast, $animate, storage) {
  // 日付系
  var now = new Date();
  $scope.zero = function(n) { var result = (n<10)? "0"+n : n; return result; }
  $scope.today = [now.getFullYear(), now.getMonth()+1, now.getDate(), now.getDay()];
  $scope.week = ["日","月","火","水","木","金","土"];
  
  // Todoデータ系
  storage.bind($scope, "todos");
  $scope.todos = ($scope.todos == undefined)? [] : $scope.todos;  
  $scope.categories = ["なし","食事","勉強","仕事","趣味","その他"];
  $scope.importance = ["最悪やらなくてOK", "さほど", "ふつう", "重要", "他を犠牲にしてでも"];
  
  // Toastの表示設定
  var setting = { bottom: true, top: false, left: false, right: true };
  var getPos = function() {
    return Object.keys(setting).filter(function(pos) { return setting[pos]; }).join(' ');
  };
  $scope.toast = function(str) {
    $mdToast.show( $mdToast.simple().content(str).position(getPos()).hideDelay(3000) );
  };
});

app.controller("adder", function($scope) {
  $scope.todo = {
      "title": "",
      "category": $scope.categories[0],
      "deadline": new Date(),
      "isDone": false,
      "importance": 3
    };
    
  var isInRange = function(num, range){ return Math.ceil( num / range ) == 1; }
  $scope.add = function() {
    var isValid =  $scope.todo.title    != ""        &&
                   $scope.todo.category != ""        && 
                   $scope.todo.deadline != undefined &&
                   isInRange($scope.todo.importance, 5);
    if(isValid){
      $scope.todos.unshift({
        "title": $scope.todo.title,
        "category": $scope.todo.category,
        "deadline": $scope.todo.deadline,
        "isDone": false,
        "importance": $scope.todo.importance
      });
      
      // リセット．もうちょっと綺麗に書きたい…
      $scope.todo = {
        "title": "",
        "category": $scope.categories[0],
        "deadline": new Date(),
        "isDone": false,
        "importance": 3
      };
    }else{
      $scope.toast("入力項目が足りていません");
    }
  }
});

app.controller("categorizer", function($scope) {

});

app.controller("viewer", function($scope, $mdDialog) {
  $scope.restBefore = function(date){
    // jsonにはDateオブジェクトをそのまま格納できない？ので文字列かどうか判定
    if(typeof date === "string") date = new Date(date);
    var deadline = [date.getFullYear(), date.getMonth()+1, date.getDate()];
    var today = [$scope.today[0], $scope.today[1], $scope.today[2]];
    var r = [deadline[0] - today[0], deadline[1] - today[1], deadline[2] - today[2]];
    
    var remained = "";
    var isYabai = false;
    if(r[0] > 0){ remained = "残り" + r[0] + "年"; }else
    if(r[1] > 0){ remained = "残り" + r[1] + "月"; }else 
    if(r[2] > 7){ remained = "残り" + parseInt(r[2]/7) + "週";}
    else{ 
      remained = (r[2]<0)? "超過"
               : (r[2]<1)? "今日中"
               : (r[2]<2)? "明日中"
               : "残り"+r[2]+"日";
      isYabai = (r[2]<1)? true : false;
      }
    
    return {remained: remained, isYabai: isYabai};
  }
  
  $scope.vanish = function(key, ev) {
    var confirm = $mdDialog.confirm()
      .title("削除してよろしいですか？")
      .content("履歴から完全に削除します．この操作は取り消せません．")
      .ariaLabel("削除してよろしいですか？")
      .ok("はい")
      .cancel("いいえ")
      .targetEvent(ev);
    $mdDialog.show(confirm).then(function() {
      $scope.todos.splice(key, 1);
    });
  };

});