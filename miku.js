enchant();

window.onload = function(){

	game = new Game(320, 200);
	game.fps = 30;
	game.preload("sounds/bakuhatu.ogg","sounds/bgm.ogg","sounds/select.ogg","sounds/banboo.ogg","sounds/sword.ogg","sounds/canon.ogg","sounds/fuckin.ogg","sounds/imagin.ogg","images/menu.png","images/menu2.png","images/menu3.png","images/menu4.png","images/yazirusi.png","images/tips.gif","images/banboo.gif","images/bassy.gif", "images/tileset.gif", "images/metto.gif", "images/miku.gif", "images/bakuhatu.gif","sounds/shot.ogg","images/tile.gif");

	
	//1pキー設定
	game.keybind(97, "a");		//バスター
	game.keybind(98, "b");		//チップ1
	game.keybind(99, "c");		//チップ2
	game.keybind(100, "d");		//チップ3
	game.keybind(101, "e");		//チップ4
	game.keybind(102, "f");		//チップ5

	//2pキー設定
	game.keybind(71, "g");		//バスターa
	game.keybind(72, "h");		//チップ1b
	game.keybind(74, "i");		//チップ2c
	game.keybind(84, "j");		//チップ3d
	game.keybind(89, "k");		//チップ4e
	game.keybind(85, "l");		//チップ5f
	game.keybind(87, "m");		//上up
	game.keybind(83, "n");		//下down
	game.keybind(65, "o");		//左l
	game.keybind(68, "p");		//右r
	
	game.mode = "team";
	game.naviname = [];
	
	//タイトル画面
	game.titleScene = function() {
		var scene = new Scene();
		var label = new Label();
		var menu = new Sprite(240,96);
		menu.image = game.assets["images/menu.png"];
		menu.x = game.width/2 - menu.width/2;
		menu.y = game.height/2 - menu.height/2;
		
		var yazirusi = new Sprite(8,8);
		yazirusi.image = game.assets["images/yazirusi.png"];
		yazirusi.x =  menu.x+menu.width/2-45;
		yazirusi.y =  menu.y+menu.height/2-17;
		yazirusi.frame=0;
		yazirusi.iti = 0;
		
		yazirusi.addEventListener(Event.ENTER_FRAME, function(e) {
			yazirusi.frame++;
			if(yazirusi.frame > 5){
				if(game.input.up || game.input.m){
					
					if(this.iti>0){
						this.y -= 16;
						game.assets["sounds/select.ogg"].play();
					}
					this.iti = 0;
				}else if(game.input.down || game.input.n){
					if(this.iti==0){
						this.y += 16;
						game.assets["sounds/select.ogg"].play();
					}
					this.iti = 1;
				}else if(game.input.a || game.input.g ){
					game.assets["sounds/select.ogg"].play();
					if(yazirusi.iti == 0){
						game.replaceScene(game.oneplayMenu());
					}else{
						game.replaceScene(game.twoplayMenu());
					}
				}
			}
		});
		scene.addChild(menu);                  // シーンにラベルに追加
		scene.addChild(yazirusi);
		scene.backgroundColor = '#000000';      // シーンの背景色を設定
		
		return scene;
	};
	
	//一人プレイメニュー
	game.oneplayMenu = function() {
		var scene = new Scene();
		var label = new Label();
		var menu = new Sprite(216,80);
		menu.image = game.assets["images/menu2.png"];
		menu.x = game.width/2 - menu.width/2;
		menu.y = game.height/2 - menu.height/2;
		
		var yazirusi = new Sprite(8,8);
		yazirusi.image = game.assets["images/yazirusi.png"];
		yazirusi.x =  menu.x+menu.width/2-30;
		yazirusi.y =  menu.y+menu.height/2-17;
		yazirusi.frame = 0;
		yazirusi.iti = 0;
		yazirusi.addEventListener(Event.ENTER_FRAME, function(e) {
			yazirusi.frame++;
			if(yazirusi.frame > 5){
				if(game.input.up || game.input.m){
					if(this.iti>0){
						this.y -= 16;
						game.assets["sounds/select.ogg"].play();
					}
					this.iti = 0;
				}else if(game.input.down || game.input.n){
					if(this.iti==0){
						this.y += 16;
						game.assets["sounds/select.ogg"].play();
					}
					this.iti = 1;
				}else if(game.input.a || game.input.g ){
					game.assets["sounds/select.ogg"].play();
					if(yazirusi.iti == 0){
						game.naviname = ["rockman"];
					}else{
						game.naviname = ["metto"];
					}
					game.replaceScene(game.startcnt());
				}
			}
		});
		scene.addChild(menu);                  // シーンにラベルに追加
		scene.addChild(yazirusi);
		scene.backgroundColor = '#000000';      // シーンの背景色を設定
		
		return scene;
	};
	
	//二人プレイメニュー
	game.twoplayMenu = function() {
		var scene = new Scene();
		var label = new Label();
		var menu = new Sprite(216,80);
		menu.image = game.assets["images/menu3.png"];
		menu.x = game.width/2 - menu.width/2;
		menu.y = game.height/2 - menu.height/2;
		
		var yazirusi = new Sprite(8,8);
		yazirusi.image = game.assets["images/yazirusi.png"];
		yazirusi.x =  menu.x+menu.width/2-30;
		yazirusi.y =  menu.y+menu.height/2-17;
		yazirusi.frame = 0;
		yazirusi.iti = 0;
		
		var charselect = function() {
			var scene = new Scene();
			var label = new Label();
			var menu = new Sprite(224,80);
			var mode = mode;
			select1 = null;
			select2 = null;
			menu.image = game.assets["images/menu4.png"];
			menu.x = game.width/2 - menu.width/2;
			menu.y = game.height/2 - menu.height/2;
			
			//1P矢印
			var yazirusi1 = new Sprite(8,8);
			yazirusi1.image = game.assets["images/yazirusi.png"];
			yazirusi1.x =  menu.x+menu.width/2-83;
			yazirusi1.y =  menu.y+menu.height/2-17;
			yazirusi1.frame = 0;
			yazirusi1.iti = 0;
			yazirusi1.addEventListener(Event.ENTER_FRAME, function(e) {
				this.frame++;
				if(this.frame > 5){
					if(game.input.m){
						if(this.iti>0){
							this.y -= 16;
						
							game.assets["sounds/select.ogg"].play();
						}
						this.iti = 0;
					}else if(game.input.n){
						if(this.iti==0){
							this.y += 16;
							game.assets["sounds/select.ogg"].play();
						}
						this.iti = 1;
					}else if(game.input.g ){
						game.assets["sounds/select.ogg"].play();
						if(this.iti == 0){
							var snaviname = "rockman";
						}else{
							var snaviname = "metto";
						}
						select1 = snaviname;
						scene.removeChild(this);
						
					}
				}
			});
			//2P矢印
			var yazirusi2 = new Sprite(8,8);
			yazirusi2.image = game.assets["images/yazirusi.png"];
			yazirusi2.x =  menu.x+menu.width/2+30;
			yazirusi2.y =  menu.y+menu.height/2-17;
			yazirusi2.frame = 0;
			yazirusi2.iti = 0;
			yazirusi2.addEventListener(Event.ENTER_FRAME, function(e) {
				this.frame++;
				if(this.frame > 5){
					if(game.input.up){
						if(this.iti>0){
							this.y -= 16;
						game.assets["sounds/select.ogg"].play();
						}
						this.iti = 0;
					}else if(game.input.down){
						if(this.iti==0){
							this.y += 16;
							game.assets["sounds/select.ogg"].play();
						}
						this.iti = 1;
					}else if(game.input.a){
						game.assets["sounds/select.ogg"].play();
						if(this.iti == 0){
							var snaviname = "rockman";
						}else{
							var snaviname = "metto";
						}
						select2 = snaviname;
						scene.removeChild(this);
						
					}
				}
			});
			menu.addEventListener(Event.ENTER_FRAME, function(e) {
				if(select1!=null && select2!=null){
					game.naviname = [select1,select2];
					game.replaceScene(game.startcnt());
				}
			});
			scene.addChild(menu);                  // シーンにラベルに追加
			scene.addChild(yazirusi1);
			scene.addChild(yazirusi2);
			scene.backgroundColor = '#000000';      // シーンの背景色を設定
			
			return scene;
		}
		
		yazirusi.addEventListener(Event.ENTER_FRAME, function(e) {
			this.frame++;
			if(this.frame > 5){
				if(game.input.up || game.input.m){
					if(this.iti>0){
						this.y -= 16;
						game.assets["sounds/select.ogg"].play();
					}
					this.iti = 0;
				}else if(game.input.down || game.input.n){
					if(this.iti==0){
						this.y += 16;
						game.assets["sounds/select.ogg"].play();
					}
					this.iti = 1;
				}else if(game.input.a || game.input.g ){
						game.assets["sounds/select.ogg"].play();
					if(this.iti == 0){
						var selectmode = "vs";
					}else{
						var selectmode = "team";
					}
					game.mode = selectmode;
					game.replaceScene(charselect());
				}
			}
		});
		scene.addChild(menu);                  // シーンにラベルに追加
		scene.addChild(yazirusi);
		scene.backgroundColor = '#000000';      // シーンの背景色を設定
		
		return scene;
	};
	game.startcnt = function(){
		var scene = new Scene();
		var counter = new Label("３");
		counter.cnt = 3;
		counter.font = "48px famiconfont";
		counter.color = '#FFFFFF';
		counter.width = game.width;
		counter._element.style.textAlign = "center";
		counter.y = 30;
		counter.scene = scene;
		counter.addEventListener(Event.ENTER_FRAME, function(e) {
			if(game.frame % 30==0){
				this.cnt--;
				this.text = convNum(this.cnt);
				if(this.cnt<=0){
					game.replaceScene(game.battleScene());
				}
			}
		});
		scene.addChild(counter);                  // シーンにラベルに追加
		scene.backgroundColor = 'black';
		
		return scene;
	}
	game.resultScene = function(mozi) {
		scene = new Scene();
		scene.backgroundColor = 'black';
		var mozilabel = new Label(mozi);
		mozilabel.font = "48px famiconfont";
		mozilabel.color = '#FFFFFF';
		mozilabel.width = game.width;
		mozilabel._element.style.textAlign = "center";
		mozilabel.y = 30;
		scene.addChild(mozilabel);
		
		return scene;
	}
	game.battleScene = function() {
		scene = new Scene();
		this.scene = scene;
		game.assets["sounds/bgm.ogg"].play();
		field = new Group();		//バトルフィールドグループ
		field.block_size_x = 40;	//ブロックサイズ指定
		field.block_size_y = 24;
		gamemode = 2;
		//ブロックの定義
		var blocks = [
			[14,14,14,14,14,14,14,14],
			[14,0,0,0,1,1,1,14],
			[14,2,2,2,3,3,3,14],
			[14,2,2,2,3,3,3,14],
			[14,12,12,12,13,13,13,14]
		];

		//移動可能範囲の定義
		var collisions1 = [
			[0,0,0,0,0,0,0,0],
			[0,1,1,1,0,0,0,0],
			[0,1,1,1,0,0,0,0],
			[0,1,1,1,0,0,0,0],
			[0,0,0,0,0,0,0,0],
		];

		var collisions2 = [
			[0,0,0,0,0,0,0,0],
			[0,0,0,0,1,1,1,0],
			[0,0,0,0,1,1,1,0],
			[0,0,0,0,1,1,1,0],
			[0,0,0,0,0,0,0,0],
		];

		//バトルフィールド生成
		map1 = new Map(40, 24);
		map1.image = game.assets["images/tileset.gif"];
		map1.loadData(blocks);
		map1.collisionData = collisions1;
		map1.y = 0;
		map1.x=0;
		map1.zIndex = -10;
		map1.lock = false;

		map2 = new Map(40, 24);
		map2.image = game.assets["images/tileset.gif"];
		map2.loadData(blocks);
		map2.collisionData = collisions2;
		map2.y = 0;
		map2.x=0;
		map2.zIndex = -10;
		map2.lock = false;
		
		players = [];
		enemys = [];
		if(game.naviname.length==1){
			players = [new Player(game.naviname[0],true,1,2,2)];
			enemys = [new Player("rockman",false,-1,2,2),new Player("metto",false,-1,3,3)];
		}else{
			if(game.mode == "team"){
				players = [new Player(game.naviname[0],true,1,2,1),new Player(game.naviname[1],true,1,2,3)];
				enemys = [new Player("rockman",false,-1,2,2),new Player("metto",false,-1,3,3)];
			}else{
				players = [new Player(game.naviname[0],true,1,2,2)];
				enemys = [new Player(game.naviname[1],true,-1,2,2)];
			}
		}
		

		for(var i=0;i<players.length;i++){
			players[i].setPlayer(players);
			players[i].setEnemy(enemys);
			
		}
		for(var i=0;i<enemys.length;i++){
			enemys[i].setPlayer(enemys);
			enemys[i].setEnemy(players);
		}
		

		field.y +=30;
		field.addChild(map1);
		scene.backgroundColor = 'black';
		scene.addChild(field);
		

		game.addEventListener(Event.ENTER_FRAME, function(e) {
			game.assets["sounds/bgm.ogg"].play();
			var deadcnt=0;
			
			for(var i=0;i<players.length;i++){
				if(players[i].collision==null){
					deadcnt += 1;
				}
			}
			if(deadcnt == players.length){
				
				game.replaceScene(game.resultScene("２Ｐ　かち"));
			}
				
			var deadcnt=0;
			
			for(var i=0;i<enemys.length;i++){
				if(enemys[i].collision==null){
					deadcnt += 1;
				}
			}
			if(deadcnt == enemys.length){
				game.replaceScene(game.resultScene("１Ｐ　かち"));
			}
		
		//1pここから
			if(game.input.p){
				players[0].right = true;
			}else{
				players[0].right = false;
			}
			if(game.input.o){
				players[0].left = true;
			}else{
				players[0].left = false;
			}
			if(game.input.m){
				players[0].up = true;
			}else{
				players[0].up = false;
			}
			if(game.input.n){
				players[0].down = true;
			}else{
				players[0].down = false;
			}
			if(game.input.g){
				players[0].a = true;
			}else{
				players[0].a = false;
			}
			if(game.input.h){
				players[0].b = true;
			}else{
				players[0].b = false;
			}
			if(game.input.i){
				players[0].c = true;
			}else{
				players[0].c = false;
			}
			if(game.input.j){
				players[0].d = true;
			}else{
				players[0].d = false;
			}
			if(game.input.k){
				players[0].e = true;
			}else{
				players[0].e = false;
			}
			if(game.input.l){
				players[0].f = true;
			}else{
				players[0].f = false;
			}

			
			var conts = [];
			conts = [enemys[0],players[1]];
			var cntnum = players.length;
			if(cntnum>2)cntnum=2;
			//2pここから
			if(game.input.right){
				conts[cntnum-1].right = true;
			}else{
				conts[cntnum-1].right = false;
			}
			if(game.input.left){
				conts[cntnum-1].left = true;
			}else{
				conts[cntnum-1].left = false;
			}
			if(game.input.up){
				conts[cntnum-1].up = true;
			}else{
				conts[cntnum-1].up = false;
			}
			if(game.input.down){
				conts[cntnum-1].down = true;
			}else{
				conts[cntnum-1].down = false;
			}
			if(game.input.a){
				conts[cntnum-1].a = true;
			}else{
				conts[cntnum-1].a = false;
			}
			if(game.input.b){
				conts[cntnum-1].b = true;
			}else{
				conts[cntnum-1].b = false;
			}
			if(game.input.c){
				conts[cntnum-1].c = true;
			}else{
				conts[cntnum-1].c = false;
			}
			if(game.input.d){
				conts[cntnum-1].d = true;
			}else{
				conts[cntnum-1].d = false;
			}
			if(game.input.e){
				conts[cntnum-1].e = true;
			}else{
				conts[cntnum-1].e = false;
			}
			if(game.input.f){
				conts[cntnum-1].f = true;
			}else{
				conts[cntnum-1].f = false;
			}
		});
		
		
		return scene;
		
		
	};
	game.onload = function(){
		
		game.replaceScene(game.titleScene());
	}
	game.start();
};


function convNum(aVal){
var Zenkaku = "０１２３４５６７８９";
var Hankaku = "0123456789";
 var str = "";
 var ind = "";
 aVal = aVal.toString(10);

 for(var i=0; i<aVal.length; i++){
  ind = aVal.charAt(i);
  ind= Hankaku.indexOf(ind,0);
  str = str + Zenkaku.charAt(ind);
 }

 return str;
}
//プレイヤークラス（Groupクラス、変数名 field のインスタンスを作っておくこと）
var Player = Class.create({
	initialize:function(naviname,isNavi,scaleX,x,y){
		this.group = new Group();
		this.scaleX = scaleX;
		this.isMoving = false;
		this.isWaiting = false;
		this.isBasting = false;
		this.isInvisi = false;
		this.isGuard = false;
		this.isNavi = isNavi;

		//ボタン入力
		this.up = false;
		this.down = false;
		this.right = false;
		this.left = false;
		this.a = false;
		this.b = false;
		this.c = false;
		this.d = false;
		this.e = false;
		this.f = false;
		
		
		//ナビの初期化
		this.navi = new Navi(this,naviname,x,y);
		var colname = this.navi.getColname;
		
		//当たり判定の初期化
		this.collision = new Collision(this,colname,38,22);

		//攻撃演算の初期化
		this.attack = new Attack(this);

		//HPラベルの初期化
		this.label = new Label();
		this.label.text = convNum(this.navi.HP);
		this.label.font = "12px famiconfont";
		this.label.x = this.collision.x + 10;
		this.label.y = this.collision.y + 16;
		this.label._element.style.zIndex = 2;
		this.label.color = '#FFFFFF';

		//TPラベルの初期化
		this.label2 = new Label();
		this.label2.text = 'TP:' + convNum(this.navi.TP);
		this.label.font = "12px famiconfont";
		this.label2.x = field.block_size_x;
		if(this.navi.scaleX == -1) this.label2.x += field.block_size_x *3;
		this.label2.y = field.block_size_y * 5;
		this.label2.color = '#FFFFFF';

		if(this.isNavi){
		//チップアイコンの初期化
			this.tipicon = [];

			for(var i=0;i<6;i++){
				this.tipicon[i] = new Icon(this,i,14,14);
				this.tipicon[i].x=field.block_size_x + 15*i + field.block_size_x * 0.4;
				if(this.navi.scaleX == -1) this.tipicon[i].x += field.block_size_x *3;
				this.tipicon[i].y=field.block_size_y * 6;
				this.tipicon[i].image = game.assets["images/tips.gif"];
				this.tipicon[i].frame = i;
				this.tipicon[i].addEventListener(Event.ENTER_FRAME, function(e) {
					//現在のTPによってチップアイコンの透明度を変更
					if(this.player.navi != null && this.player.navi.TP >= this.player.attack.tips[this.num].USE_TP){
						this.opacity = 1;
					}else{
						this.opacity = 0.3;	
					}
				});
				field.addChild(this.tipicon[i]);
			}
		}
		if(this.label2.x < 0){
			this.label2.x += field.block_size_x*7;
		}
		this.label._element.style.zIndex = y+1;

		//敵のポインタ（Playerインスタンス生成後必ずsetEnemy()から登録する）
		this.enemys = [];
		this.players = [];
		//フィールドに追加
		field.addChild(this.navi);
		field.addChild(this.collision);
		scene.addChild(this.attack);

		field.addChild(this.label);
		if(this.isNavi){
			field.addChild(this.label2);
		}
	},
	setPlayer:function(players){
		this.players=players;
	},
	setEnemy:function(enemys){
		this.enemys=enemys;
	}
});

//ナビクラス	
var Navi = Class.create(Sprite, {
	initialize: function(player,naviname,x,y) {
	        Sprite.call(this, 80, 60);
		this.player = player;				//プレイヤー
	        this.x = field.block_size_x*x +1;		//表示座標の設定
	        this.y = -38 + field.block_size_y * y ;
		this._element.style.zIndex = y;			//奥行きの設定（0=奥,1=真ん中,2=手前）

	
		this.image = game.assets["images/miku.gif"];
		this.scaleX = this.player.scaleX;		//1p=1,2p=-
		//2pの場合のナビ位置変更処理
		if(this.scaleX == -1){
			this.x += 120;
		}
		this.frame = 0;					//ナビのフレーム
		this.MOVING_SPEED = 2;				//ナビの移動速度
		this.HP = 500;					//ナビの体力
		this.TP = 25;					//ナビのチップポイント
		this.TP_RECOVER = 1;				//チップポイント自動回復量
		this.BASTING_SPEED = 8;				//バスター発射後の待ち時間
		this.BASTING_POWER = 1;				//バスターの攻撃力
		this.BASTING_TP_RECOVER = 10;			//バスターによるチップポイント回復量*/
		this.image = game.assets["images/miku.gif"];
		this.invisiCnt = 0;
		this.invisiEnd = 30;
		this.superArmor = false;
		this.cnt=0;
		this.tip1 = "baster";
		this.tip2 = "guard";
		this.tip3 = "canon";
		this.tip4 = "sward";
		this.tip5 = "bumboo";
		this.tip6 = "bassi";
		this.dead = false;

		if(naviname=="rockman"){
			this.image = game.assets["images/miku.gif"];
			this.MOVING_SPEED = 2;				//ナビの移動速度
			this.HP = 500;					//ナビの体力
			this.TP = 25;					//ナビのチップポイント
			this.TP_RECOVER = 1;				//チップポイント自動回復量
			this.BASTING_SPEED = 8;				//バスター発射後の待ち時間
			this.BASTING_POWER = 1;				//バスターの攻撃力
			this.BASTING_TP_RECOVER = 5;			//バスターによるチップポイント回復量*/
			this.superArmor = false;
			this.move = function() {
				//攻撃連打を防ぐため、攻撃中であればボタンフラグを変える
				if(this.player.a) this.player.a = false;
				if(this.player.b) this.player.b = false;
				if(this.player.c) this.player.c = false;
				if(this.player.d) this.player.d = false;
				if(this.player.e) this.player.e = false;
				if(this.player.f) this.player.f = false;
				this.TP = 100;
				this.TP_RECOVER = 100;
				var vx = 0;
				var vy = 0;
				var vz = Number(this._element.style.zIndex);
				if(game.frame%(this.MOVING_SPEED*2)==0){
					if(Math.floor(Math.random()*5)==0){
						//3分の1の確立で攻撃
						
						var target = -1;
						//ターゲットを決める
						if(Math.floor(Math.random()*5)!=0){
							for(var i=0;i<this.player.enemys.length && target == -1;i++){
								if(this.player.enemys[i].collision){
									//決め打ち
									//敵と自分の距離
									var enemybasyo = this.player.enemys[i].collision.getBasyo();
									var playbasyo = this.player.collision.getBasyo();
									var kyorix = Number(enemybasyo[0])+Number(playbasyo[0])-1;
									var kyoriy = Math.abs(Number(enemybasyo[1])-Number(playbasyo[1]));
									if(this._element.style.zIndex == this.player.enemys[i].navi._element.style.zIndex){
										if(kyorix <= 2 && kyoriy <= 1){
											if(Math.floor(Math.random()*2)==0){
												this.player.d = true;
												console.log("sward");
											}else{
												this.player.c = true;
											}
										}else{
											this.player.c = true;
										}
									}else if(enemybasyo[0] == 3){
										this.player.e = true;
									}
								}
							}
						}else{	
							switch (Math.floor(Math.random()*5)) {
								case 0:
									this.player.b = true;
									break;
								case 1:
									this.player.c = true;
									break;
								case 2:
									this.player.d = true;
									break;
								case 3:
									this.player.e = true;
									break;
								case 4:
									this.player.f = true;
									break;
							} 
						}
						
					}else{
						if(Math.floor(Math.random()*10)==0)this.player.a = true;
						if(Math.floor(Math.random()*10)==0){
							this.player.a = false;
							this.player.b = true;
						}
						vx=field.block_size_x * (Math.floor(Math.random()*3)-1);
						vy=field.block_size_y * (Math.floor(Math.random()*3)-1);
						if(vy>0){
							vz++;
						}else if(vy<0){
							vz--;
						}
					}
				}
				return [vx,vy,vz];
			}
		}else if(naviname=="metto"){
			this.image = game.assets["images/metto.gif"];
			this.MOVING_SPEED = 10;				//ナビの移動速度
			this.HP = 200;					//ナビの体力
			this.TP = 100;					//ナビのチップポイント
			this.TP_RECOVER = 100;				//チップポイント自動回復量
			this.BASTING_SPEED = 8;				//バスター発射後の待ち時間
			this.BASTING_POWER = 1;				//バスターの攻撃力
			this.BASTING_TP_RECOVER = 5;			//バスターによるチップポイント回復量*/
			this.colname = "metto";
			this.superArmor = true;
			this.invisiEnd = 0;
			this.tip1 = "shockwave";
			this.tip2 = "shockwave2";
			this.tip3 = "mettoguard";
			this.tip4 = "shockwave";
			this.tip5 = "shockwave";
			this.tip6 = "shockwave";
			this.move = function() {
					//攻撃連打を防ぐため、攻撃中であればボタンフラグを変える
					if(this.player.a) this.player.a = false;
					if(this.player.b) this.player.b = false;
					if(this.player.c) this.player.c = false;	
					var x = 0;
					var y = 0;
					var z = Number(this._element.style.zIndex);

					//フレームを管理するカウンター、行動するごとにリセットする
					this.cnt ++;
					if(this.isBasting == false) this.cnt=1;
					
					//ターゲットにする相手を一人選ぶ
					var target = -1;
					for(var i=0;i<this.player.enemys.length && target == -1;i++){
						if(this.player.enemys[i].collision)target = i;
					}

					//フレームに揺らぎを与える
					var yuragi=Math.floor(Math.random()*7)-3;

					if(target != -1){
						//移動速度毎に行動
						if(this.cnt%(this.MOVING_SPEED + yuragi) == 0){
							if(Math.floor(Math.random()*5) == 0){
								//ランダムでメットガード
									this.player.c = true; 
							}else if(this._element.style.zIndex == this.player.enemys[target].navi._element.style.zIndex){
								//相手と同じ列であれば攻撃
								if(Math.floor(Math.random()*5) == 0){
									//5分の1の確立でショックウェーブ2
									this.player.b = true;
								}else{
									this.player.a = true;
								}
							}else if (this.player.navi._element.style.zIndex < this.player.enemys[target].navi._element.style.zIndex) {
								//相手と同じ列に移動
								y=field.block_size_y;
								z+=1;
							}else{
								y=field.block_size_y * -1;
								z-=1;
							}
						}
					}
				return [x,y,z];
			}
		}else if(naviname=="metto2"){
			this.image = game.assets["images/metto.gif"];
			this.MOVING_SPEED = 10;				//ナビの移動速度
			this.HP = 1000;					//ナビの体力
			this.TP = 100;					//ナビのチップポイント
			this.TP_RECOVER = 100;				//チップポイント自動回復量
			this.BASTING_SPEED = 8;				//バスター発射後の待ち時間
			this.BASTING_POWER = 1;				//バスターの攻撃力
			this.BASTING_TP_RECOVER = 5;			//バスターによるチップポイント回復量*/
			this.colname = "metto";
			this.superArmor = true;
			this.invisiEnd = 0;
			this.tip1 = "shock";
			this.tip2 = "mettoguard";
			this.tip3 = "shock";
			this.tip4 = "shock";
			this.tip5 = "shock";
			this.tip6 = "shock";
			this.move = function() {
				if(this.player.a) this.player.a = false;	
				if(this.player.b) this.player.a = false;
				var x = 0;
				var y = 0;
				var z = Number(this._element.style.zIndex);
				this.cnt ++;
				if(this.isBasting == false) this.cnt=1;
				if(this.player.enemys[0].navi!=null){
					if(this.cnt%this.MOVING_SPEED == 0){
						if(this._element.style.zIndex == this.player.enemys[0].navi._element.style.zIndex){
							y=0;
							
						}else if (this.player.navi._element.style.zIndex < this.player.enemys[0].navi._element.style.zIndex) {
							y=field.block_size_y;
							z+=1;
						}else if (this.player.navi._element.style.zIndex > this.player.enemys[0].navi._element.style.zIndex) {
							y=field.block_size_y * -1;
							z-=1;
						}
					}
				}
				return [x,y,z];
			}
		}


		//死亡判定
		this.addEventListener(Event.ENTER_FRAME, function(e) {
			//BGM1.play();
			if(this.dead == false){
				if(this.HP <= 0){
					this.HP=0;
					this.dead = true;
					var bakuhatu = new Sprite(16,16);
					bakuhatu.image = game.assets["images/bakuhatu.gif"];
					bakuhatu.scale(2,2);
					bakuhatu.x = this.player.collision.x + 10;
					bakuhatu.y = this.player.collision.y;
					bakuhatu._element.style.zIndex = 10;
					bakuhatu.cnt = 0;
					bakuhatu.deadframe = game.frame;
					bakuhatu._element.style.zIndex = this._element.style.zIndex;
					bakuhatu.addEventListener(Event.ENTER_FRAME, function(e) {
						var cnt = game.frame - this.deadframe;
						if(cnt != 0 && cnt%5 ==0){
							if(this.frame == 4)field.removeChild(this);
							this.frame++;
						}
						
					});
					field.addChild(bakuhatu) ;
					var sound = game.assets["sounds/bakuhatu.ogg"].clone();
					sound.play();
					game.rootScene.removeChild(this.player.attack);
					field.removeChild(this.player.collision);
					field.removeChild(this.player.label);
					field.removeChild(this.player.navi);
					this.player.attack=null;
					this.player.collision=null;
					this.player.label=null;
					this.player.navi=null;

					if(this.scaleX == 1){
						//game.end('WINNER', 'PLAYER2');
					}else{
						//game.end('WINNER', 'PLAYER1');
					}
				}else{
					this.player.label.text = convNum(this.HP);
					this.player.label2.text = 'TP:' + convNum(this.TP);
					if(game.frame %10 == 0 && this.TP < 100){
						this.TP+=this.TP_RECOVER;
					}
					if(this.TP > 100){
						this.TP =100;
					}
				}
			}else{
			}
		});
		this.addEventListener(Event.ENTER_FRAME, function(e) {

			if(this.player.isInvisi){
				this.player.navi.opacity=0.3;
				this.invisiCnt++;
				if(this.invisiCnt > this.invisiEnd){
					this.player.navi.opacity=1;
					this.invisiCnt=0;
					this.player.isInvisi=false;
				}
			}
		});
	},
	getColname:function(){
		return colname;
	}
});
//アイコンクラス
var Icon = Class.create(Sprite, {
	initialize: function(player,num,width,height) {
		Sprite.call(this, width, height);
		this.player=player;
		this.num = num;
	}
});

//当たり判定クラス
var Collision = Class.create(Sprite, {
	initialize: function(player,colname,width,height) {
	        Sprite.call(this, width, height);
		this.player = player;
		this.y = this.player.navi.y + 38;
		this.x = this.player.navi.x;
		this._element.style.zIndex = this.player.navi._element.style.zIndex;
		this.actionFrame = 0;
		this.actionEnd = 0;
		this.colname = colname;
		this.scaleX = this.player.scaleX;		//1p=1,2p=-1
		if(this.player.scaleX == -1){
			this.player.navi.x -= field.block_size_x+2;
		}
		this.addEventListener(Event.ENTER_FRAME, function(e) {
	//プレイヤー移動
			if(this.player.isMoving){
				if(this.player.isWaiting == false){
					
					//collision移動
					this.x += this.vx;
					this.y += this.vy;
					this._element.style.zIndex = this.vz;
					//navi移動
					this.player.navi.x += this.vx;
					this.player.navi.y += this.vy;
					this.player.navi._element.style.zIndex = this.vz;
					//label移動
					this.player.label.x += this.vx;
					this.player.label.y += this.vy;
					this.player.label._element.style.zIndex = this.vz+1;
					this.player.isWaiting = true;

					
				}else{
					this.actionFrame++;
					if(this.actionFrame >= this.actionEnd){
						this.player.navi.frame = 0;
						this.actionFrame = 0;
						this.actionEnd = 0;
						this.player.isMoving = false;
						this.player.isWaiting = false;
					}
				}
			}else{
				
				if(!this.player.isBasting){
					var x;
					var y;
					this.vx = this.vy = 0;
					this.vz = Number(this._element.style.zIndex);
					if(this.player.right){
						this.vx += field.block_size_x;
					}else if(this.player.left){
						this.vx -= field.block_size_x;
					}else if(this.player.up){
						this.vy -= field.block_size_y;
						this.vz -= 1;
					}else if(this.player.down){
						this.vy += field.block_size_y;
						this.vz += 1;
					}
					if(this.player.isNavi == false){

						var array = this.player.navi.move();
						this.vx = array[0];
						this.vy = array[1];
						this.vz = array[2];
						
					}
					x = this.x + this.vx;
					y = this.y + this.vy;
					
					if(x != this.x || y != this.y){
						var hit = false;
						if(this.player.scaleX == 1){
							hit = map1.hitTest(x,y);
							
						}else{
							hit = map2.hitTest(x,y);
						}
						var vcol = new Sprite(this.width,this.height);
							
						vcol.x=x+1;
						vcol.y=y+1;
						field.addChild(vcol);
						for(var i=0;i<this.player.players.length;i++){
							if(this.player.players[i].collision != null)hit = hit && !vcol.intersect(this.player.players[i].collision);
						}
						field.removeChild(vcol);

						vcol=null;
						if(hit){
							
							this.player.isMoving = true;
							this.actionFrame = 0;
							this.actionEnd = this.player.navi.MOVING_SPEED;
							arguments.callee.call(this);
						}
					}
				}
			}
		});
	},
	getBasyo:function(){
		var x=0;
		var y=0;
		x=~~((this.x-field.block_size_x)/field.block_size_x)+1;
		y=~~((this.y-field.block_size_y)/field.block_size_y)+1;
		if(this.player.scaleX == 1){
			x=4-x;
		}else{
			x=x-3;
		}
		return [x,y];
	}
});

//攻撃処理クラス
var Attack = Class.create(Sprite,{
	initialize:function(player){
		Sprite.call(this,0,0);
		this.player = player;
		this.now = 0;
		this.tips = [];

		/* --- 攻撃内容書き換え ---*/

		//バスター
		this.tips[0] = this.create(this.player.navi.tip1);
		this.tips[1] = this.create(this.player.navi.tip2);
		this.tips[2] = this.create(this.player.navi.tip3);
		this.tips[3] = this.create(this.player.navi.tip4);
		this.tips[4] = this.create(this.player.navi.tip5);
		this.tips[5] = this.create(this.player.navi.tip6);

		this.actionFrame = 0;
		this.actionEnd = 0;
		
		this.addEventListener(Event.ENTER_FRAME, function(e) {
			//チップ・バスター処理
			if(this.player.isBasting){
				this.actionFrame++;
				if(this.actionFrame >= this.actionEnd){
					if(this.player.collision != null)this.player.navi.frame=0;
					this.actionFrame = 0;
					this.actionEnd = 0;
					this.player.isBasting = false;
				}
			}else if(!this.player.isMoving){
				var tipnum = -1;
				if(this.player.a) tipnum = 0;
				if(this.player.b) tipnum = 1;
				if(this.player.c) tipnum = 2;
				if(this.player.d) tipnum = 3;
				if(this.player.e) tipnum = 4;
				if(this.player.f) tipnum = 5;

				if(this.player.collision != null && tipnum != -1 && this.tips[tipnum].isWaiting && this.player.navi.TP - this.tips[tipnum].USE_TP >= 0){	//チップ1 メットガード
					this.actionFrame = 0;
					this.actionEnd = this.tips[tipnum].WAIT_TIME;
					this.player.navi.frame = this.tips[tipnum].NAVI_FRAME;
					this.player.isBasting = true;
					this.tips[tipnum].action();
				}
			}
		});
	},
	create:function(tipname){
		var tip;
		if(tipname == "baster"){
			tip = new Tip(this.player,90, 90,40,24);
			tip.WAIT_TIME= this.player.navi.BASTING_SPEED;
			tip.TIP_SPEED = 40;
			tip.TIP_POWER = this.player.navi.BASTING_POWER;
			tip.TP_RECOVER = this.player.navi.BASTING_TP_RECOVER;
			tip.WAIT_TIME_B = 100;
			tip.START_TIME = 1;
			tip.END_TIME=300;
			tip.USE_TP=0;
			tip.collision.ax = field.block_size_x * this.player.navi.scaleX;
			tip.chargeCnt = 0;
			tip.MAX_CHARGE = 30;
			tip.sound = 'sounds/shot.ogg';
		}else if(tipname == "guard") {
			tip = new Tip(this.player,90, 90,40,24);
			tip.NAVI_FRAME = 6;
			tip.NAVI_FRAME2 = 6;
			tip.WAIT_TIME= 20;
			tip.TIP_SPEED = 0;
			tip.TIP_POWER = 0;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 30;
			tip.START_TIME = 0;
			tip.USE_TP=10;
			tip.hando=false;
			tip.isGuard=true;
			tip.sound = 'sounds/imagin.ogg';
		}else if(tipname == "canon") {
			tip =  new Tip(this.player,90, 90,40,24);
			tip.NAVI_FRAME = 5;
			tip.NAVI_FRAME2 = 5;
			tip.WAIT_TIME= 20;
			tip.TIP_SPEED = 40;
			tip.TIP_POWER = 70;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 100;
			tip.START_TIME = 10;
			tip.USE_TP=20;
			tip.hando=true;
			tip.sound = 'sounds/canon.ogg';
		}else if(tipname == "sward") {
			tip = new Tip(this.player,90, 90,80,72);
			tip.NAVI_FRAME = 2;
			tip.NAVI_FRAME2 = 2;
			tip.WAIT_TIME= 15;
			tip.TIP_SPEED = 0;
			tip.TIP_POWER = 50;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 5;
			tip.START_TIME = 3;
			tip.USE_TP=30;
			tip.hando=true;
			tip.sound = 'sounds/sword.ogg';
			tip.collision.ax = field.block_size_x * this.player.navi.scaleX;
			if(this.player.navi.scaleX==-1){
				tip.collision.ax-=field.block_size_x;
			}
			tip.collision.ay = -field.block_size_y

		}else if(tipname == "bumboo") {
			tip = new Tip(this.player,50, 72,40,72);
			tip.NAVI_FRAME = 0;
			tip.NAVI_FRAME2 = 0;
			tip.WAIT_TIME= 1;
			tip.TIP_SPEED = 0;
			tip.TIP_POWER = 120;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 15;
			tip.START_TIME = 3;
			tip.USE_TP=40;
			tip.hando=true;
			tip.scaleX = this.player.navi.scaleX;
			tip.isKotei = true;
			tip.collision.x = (this.player.navi.scaleX == 1)? field.block_size_x * 6 : field.block_size_x * 1 ;
			tip.collision.y = field.block_size_y;
			tip.x = tip.collision.x;
			tip.y = field.block_size_y * 0.8;
			tip.image = game.assets["images/banboo.gif"];
			tip.enemy_move_x = -40 * this.player.navi.scaleX;
			tip.sound = 'sounds/banboo.ogg';
			tip.invisi=false;
		}else if(tipname == "bassi") {
			tip = new Tip(this.player,90, 90,40,72);
			tip.image = game.assets["images/bassy.gif"];
			tip.NAVI_FRAME = 0;
			tip.NAVI_FRAME2 = 0;
			tip.WAIT_TIME= 1;
			tip.TIP_SPEED = 7;
			tip.TIP_POWER = 200;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 100;
			tip.START_TIME = 30;
			tip.USE_TP=50;
			tip.hando=true;
			tip.ax = 0;
			tip.ay = -field.block_size_y;
			tip.collision.ax = field.block_size_x * this.player.navi.scaleX;
			tip.collision.ay = -field.block_size_y;
			tip.sound = 'sounds/fuckin.ogg';
		}else if(tipname == "shockwave") {
			tip =  new Tip(this.player,90, 90,40,24);
			tip.NAVI_FRAME = 1;
			tip.NAVI_FRAME2 = 2;
			tip.WAIT_TIME= 40;
			tip.TIP_SPEED = 10;
			tip.TIP_POWER = 70;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 1000;
			tip.START_TIME = 20;
			tip.USE_TP=20;
			tip.hando=true;
			tip.sound = 'sounds/canon.ogg';
		}else if(tipname == "shockwave2") {
			tip =  new Tip(this.player,90, 90,40,24);
			tip.NAVI_FRAME = 1;
			tip.NAVI_FRAME2 = 2;
			tip.WAIT_TIME= 40;
			tip.TIP_SPEED = 30;
			tip.TIP_POWER = 140;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 100;
			tip.START_TIME = 20;
			tip.USE_TP=20;
			tip.hando=true;
			tip.sound = 'sounds/canon.ogg';
		}else if(tipname == "mettoguard") {
			tip = new Tip(this.player,90, 90,40,24);
			tip.NAVI_FRAME = 3;
			tip.NAVI_FRAME2 = 3;
			tip.WAIT_TIME= 60;
			tip.TIP_SPEED = 0;
			tip.TIP_POWER = 0;
			tip.TP_RECOVER = 0;
			tip.END_TIME = 100;
			tip.START_TIME = 5;
			tip.USE_TP=0;
			tip.hando=false;
			tip.isGuard=true;
			tip.sound = 'sounds/imagin.ogg';
		}
		return tip;
	}
});

//チップクラス　必ず攻撃処理クラスから呼び出す
var Tip = Class.create(Sprite, {
	initialize: function(player,width,height,cwidth,cheight) {
	        Sprite.call(this, width, height);
		this.player=player;
	        this.x = 0;
	        this.y = 0;
		this._element.style.zIndex = 0;		//奥行き
		this.frame = 0;
		this.NAVI_FRAME = 1;				//ナビのモーション指定
		this.NAVI_FRAME2 = 1;
		this.WAIT_TIME = 10;				//攻撃硬直時間
		this.END_TIME = 150;
		this.START_TIME = 20;
		this.hando = false;
		this.TIP_SPEED = 10;				//collisionの移動速度
		this.TIP_POWER = 10;				//攻撃力
		this.USE_TP = 10;					//消費TP
		this.scaleX = player.navi.scaleX;	//移動方向
		this.isMoving = false;				//移動中か
		this.isAttack = false;				//攻撃中か
		this.isWaiting = true;				//大気中か
		this.isReady = false;	
		this.isGuard=false;
		this.enemy_move_x = 0;
		this.collision = new Sprite(cwidth,cheight);
		this.collision.opacity=0.5;
		this.collision.x = 0;
	    	this.collision.y = 0;
		this.collision.image = game.assets["images/tile.gif"];
		this.sound = 'sounds/shot.ogg';
		this.collision.ax=0;
		this.collision.ay=0;
		this.isKotei=false;
		this.invisi = true;
		this.collision.vx=0;
		this.collision.vy=0;
		this.TP_RECOVER = 0;
		this.actionFrame = 0;
		this.actionEnd = 0;
		this.startcnt = 0;
		this.atkenemy = [];

		this.addEventListener(Event.ENTER_FRAME, function(e) {
			this.actionFrame ++;
			if(this.isAttack){
				field.removeChild(this);
				field.removeChild(this.collision);
				for(var i=0;i<this.atkenemy.length;i++){
					if(this.atkenemy[i] == true){
						if(this.player.enemys[i].isGuard){
							this.player.enemys[i].navi.TP += this.USE_TP;
							//this.player.enemys.navi.HP += parseInt(this.TIP_POWER * 0.1);
							if(this.player.enemys[i].navi.TP>100) this.player.enemys[i].navi.TP=100;
						}else{
							this.player.enemys[i].navi.HP -= this.TIP_POWER;
							this.player.navi.TP += this.TP_RECOVER;
						}
						if(this.player.navi.TP>100) this.player.navi.TP=100;
						if(this.hando && this.player.enemys[i].isGuard==false){
							if(this.player.enemys[i].navi.superArmor==false){
								this.player.enemys[i].isMoving = true;
								this.player.enemys[i].isWaiting = true;
								this.player.enemys[i].navi.frame=4;
							}

							if(this.enemy_move_x != 0){
									//バンブーランスなど相手を動かす処理
									this.player.enemys[i].collision.x += this.enemy_move_x;
									this.player.enemys[i].navi.x += this.enemy_move_x;
									this.player.enemys[i].label.x += this.enemy_move_x;
									var hit = false;
									for(var j = 0;j<this.player.enemys.length;j++){
										hit = hit && this.player.enemys[j].collision.intersect(this.player.enemys[i].collision);
									}
									if(hit || this.player.enemys[i].collision.x < 40 || this.player.enemys[i].collision.x > 280){
										this.player.enemys[i].collision.x -= this.enemy_move_x;
										this.player.enemys[i].navi.x -= this.enemy_move_x;
										this.player.enemys[i].label.x -= this.enemy_move_x;
									}	
									

							}

							this.player.enemys[i].collision.actionFrame = 0;
							this.player.enemys[i].collision.actionEnd = 15;
							this.player.enemys[i].isInvisi = this.invisi;
						}
					}
				}
				if(this.isKotei==false){
					this.collision.x =0;
					this.collision.y=0;
					this.x = 0;
					this.y = 0;
				}
				
				this.actionFrame=0;
				this.isAttack = false;
				this.isMoving = false;
				this.isWaiting = true;
				this.startcnt = 0;
			}else if(this.isMoving){
				this.collision.x += this.collision.vx;
				this.collision.y += this.collision.vy;
				this._element.style.zIndex = this.collision.vz;
				this.x += this.collision.vx;
				this.y += this.collision.vy;
				this.isMoving = false;
			}else if(!this.isWaiting){
				if(this.actionFrame >= this.START_TIME){
					//攻撃開始
					
					//一度だけフレームを変える実行する
					if(this.player.navi && this.actionFrame == this.START_TIME)this.player.navi.frame = this.NAVI_FRAME2;
					this.player.isGuard = this.isGuard;
						this.startcnt++;
					this.collision.vx = this.collision.vy = 0;
					this.collision.vz = parseInt(this._element.style.zIndex);
					
					this.collision.vx += this.TIP_SPEED * this.scaleX;
					var x = this.collision.x + this.collision.vx;
					var y = this.collision.y + this.collision.vy + field.block_size_y - 5;

					this.atkenemy = [];
					for(var i=0;i<this.player.enemys.length;i++){
						var hit = false;
						if(this.player.enemys[i].collision != null){
							hit = this.collision.intersect(this.player.enemys[i].collision);
							if(this.player.enemys[i].isInvisi){
								hit=false;
							}
						}
						this.atkenemy[i] = hit;
					}

					hit = false;
					for(var i=0;i<this.atkenemy.length;i++){
						if(this.atkenemy[i] == true) hit = true;
					}
					if(hit){
						this.isAttack = true;
						arguments.callee.call(this);
					}else if(x<-field.block_size_x || x>field.block_size_x * 7 ||this.actionFrame > this.END_TIME){
					if(this.player.navi)this.player.navi.frame = 0;
						field.removeChild(this);
						field.removeChild(this.collision);
						this.actionFrame=0;
						this.isAttack = false;
						this.isMoving = false;
						this.isWaiting = true;
						this.startcnt = 0;
						this.player.isGuard = false;
					}else{
						this.isMoving = true;
						arguments.callee.call(this);
					}
				}
			}

		});
	},

	//チップ使用
	action:function(){
		if(this.isKotei){

		}else{
			this.collision.x = this.player.collision.x + this.collision.ax;
	      		this.collision.y = this.player.collision.y + this.collision.ay;
			this.x = this.collision.x + this.ax;
			this.y = this.collision.y +this.ay;
		}

		this._element.style.zIndex = this.player.navi._element.style.zIndex;
		this.player.navi.TP -= this.USE_TP;
		field.addChild(this);
		field.addChild(this.collision);
		//音を重ねて再生
		var sound = game.assets[this.sound].clone();
		sound.play();
		this.isWaiting=false;
	}
});