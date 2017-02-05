/**
2017/01/19現在
mBaas
データベースは、NiftyCloudのmobile backendを使用
OSSフレームワークのCordovaを使用
Androidの画像表示とmobile backendのファイルストアへの画像投稿
**/


		ons.bootstrap();
  	var appkey="niftyAPI";
    var clikey="niftyClikey";
    var ncmb = new NCMB(appkey,clikey);
    //Android5.0以上推奨
	  var appState = {
	    takingPicture: true,
	    imageUri: ""
	  };
	  var APP_STORAGE_KEY = "exampleAppState";
	  var app = {
	    //Androidライフサイクルに応答
	    initialize: function() {
	      this.bindEvents();
	   },
	    //状態を保存する
	    bindEvents: function() {
	      document.addEventListener('deviceready', this.onDeviceReady, false);
	      document.addEventListener('pause', this.onPause, false);
	      document.addEventListener('resume', this.onResume, false);
	    },
	    //アプリケーション開始(フロントエンドから)
	    onDeviceReady: function() {
	      take_picture = document.getElementById("take-pict");
	      get_picture = document.getElementById("get-pict");
	      img_send = document.getElementById("form-send");
	      
	      take_picture.addEventListener("click", function() {
	        appState.takingPicture = true;
	        navigator.camera.getPicture(cameraSuccessCallback, cameraFailureCallback,
					  {
					    quality: 80,
					    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
					    destinationType: Camera.DestinationType.FILE_URI,
					    targetWidth: 350,		//画像横幅  横と縦の比率保たれる
					    targetHeight: 350		//画像縦幅
					  }
	        );
	      });
				//nifty mobilebackendのファイルストアへ画像を格納
	      //ファイルストアへ画像をupload
	      img_send.addEventListener('click',function(){
			    return new Promise(function(resolve, reject) {
			    	//選択ファイル名の取得
			      window.resolveLocalFileSystemURL(get_picture.src, function success(fileEntry) {
			        console.log("filename: " + fileEntry.fullPath);
			        var filename = fileEntry.name;
			        fileEntry.file(function(file) {
			          var reader = new FileReader();
			          reader.onloadend = function(evt) {
			          	//ロード完了後処理
			            console.log("readOK");
			            //JavaScriptSDKはblobにしないとmimetypeがtext/plainになる
			            //blobに変換
			            var blob = new Blob([evt.target.result], {type: "image/jpg"});
			            //blob後のファイルサイズ
			            console.log("file size:" + blob.size);
			            //uploadは保存ファイル名,image
			            ncmb.File.upload(filename, blob).then(function(res){
			              console.log("success upload!");
			              alert("success upload!");
			              resolve(res);
			            }).catch(function(err){
			              console.log("fail upload!");
			              console.log(err);
			              reject(err);
			            });
			          };
			          reader.readAsArrayBuffer(file);
			        },
			        function() {
			        	console.log(error);
			        });
			      },
			      function() {
			      	console.log(error);
			      });
			    });
			  });
	    },
	    //アプリがバックエンドへ移動
	    onPause: function() {
	      if(appState.takingPicture || appState.imageUri){
	        window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
	      }
	    },
	    //保持されたアプリケーションの呼び出し
	    //格納された状態をチェックし、復元する
	    onResume: function(event){
	      var storedState = window.localStorage.getItem(APP_STORAGE_KEY);
	      if(storedState) appState = JSON.parse(storedState);
	      if(!appState.takingPicture && appState.imageUri){
	        get_picture.src = appState.imageUri;
	      }else if(appState.takingPicture && event.pendingResult){
	        if(event.pendingResult.pluginStatus === "OK"){
	          cameraSuccessCallback(event.pendingResult.result);
	        }else{
	          cameraFailureCallback(event.pendingResult.result);
	        }
	      }
	    }
	  }
	  //成功時
	  function cameraSuccessCallback(imageUri){
	    appState.takingPicture = false;
	    appState.imageUri = imageUri;
	    get_picture.src = imageUri;
	  }
	  //失敗時
	  function cameraFailureCallback(error){
	    appState.takingPicture = false;
	    console.log(error);
	  }
	  app.initialize();
