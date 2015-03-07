"use strict";

var appName = "todo";
var app = angular.module(appName, ["ngMaterial", "ngCookies", "angularLocalStorage"]);

app.controller("container", function($scope, $mdToast, $animate, storage) {
  $scope.addable = false;

  // 日付系
  var now = new Date();
  $scope.zero = function(n) { var result = (n<10)? "0"+n : n; return result; }
  $scope.today = [now.getFullYear(), now.getMonth()+1, now.getDate(), now.getDay()];
  $scope.week = ["日","月","火","水","木","金","土"];
  $scope.month = function(y, n) {
    var M = [31,28,31,30,31,30,31,31,30,31,30,31];
    if(y%4==0 && n==2){ return 29; }else{ return M[n-1]; } 
  }
  $scope.Datify = function(d){
      var date = new Date(d);
      return date;
  }
  $scope.Stringify = function(d){
      var D = new Date(d);
      var options = { weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return D.toLocaleTimeString("ja-JP", options);
  }
  
  // Todoデータ系
  storage.bind($scope, "todos");
  $scope.todos = ($scope.todos == undefined)? [] : $scope.todos;  
  $scope.categories = ["なし","食事","勉強","仕事","趣味","その他"];
  $scope.classes = {
    "なし": "none",
    "食事": "meal",
    "勉強": "study",
    "仕事": "work",
    "趣味": "hobby",
    "その他": "others"
    };
  $scope.importance = ["☆", "☆☆", "☆☆☆", "★★★★", "★★★★★"];
  
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
      $scope.toast("入力が正しくありません");
    }
  }
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
    if(r[0]>0){
      remained = (r[0]==1 && r[1]<0)? (r[1]+12)+"ヶ月後" : r[0] + "年後"; 
      }else
    if(r[1]>0){
      remained = (r[1]==1 && r[2]<0)? (r[2]+$scope.month(today[0],today[1]))+"日後" : r[1]+"ヶ月後"; 
      }else 
    if(r[2]>=7){ remained = parseInt(r[2]/7) + "週後";}
    else{ 
      remained = (r[2]<0)? "超過"
               : (r[2]<1)? "今日中"
               : (r[2]<2)? "明日中"
               : r[2]+"日後";
      isYabai = (r[2]<1)? true : false;
      }
    
    return {remained: remained, isYabai: isYabai};
  }
  
  $scope.vanish = function(key, ev) {
    var confirm = $mdDialog.confirm()
      .title("削除してよろしいですか？")
      .content("この操作は取り消せません．本当に削除しますか？")
      .ariaLabel("削除してよろしいですか？")
      .ok("はい")
      .cancel("いいえ")
      .targetEvent(ev);
    $mdDialog.show(confirm).then(function() {
      $scope.todos.splice(key, 1);
      $scope.toast("削除しました");
    });
  };

});