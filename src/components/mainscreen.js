import Log from '../utils/logger.js';
import EventEmitter from 'events';
import DanmuItem from '../basis/danmuItem.js'
import BigGift from '../basis/bigGift.js'

class MainScreen {
  constructor(parent, config) {
    this.TAG = 'MainScreen';
    Log.v(this.TAG);
    this._emitter = new EventEmitter();
    this.container = new createjs.Container(); //总容器
    this.leftMain = new createjs.Container(); //左边显示区域
    this.centerMain = new createjs.Container() //中间显示区域
    this.rightMain = new createjs.Container(); //右边显示区域
    this.leftMain.name="左边"
    this.rightMain.name="右边"
    this.config=config;
    this.onlinetimer=null;//在线人数更新计时器
    this.online=0;//在线人数
    this._randomList= [ 1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1 ];//在线随机数组
    this.load = new createjs.LoadQueue(false);
    this.load.loadManifest(this.config);
    this.load.on('complete', () => {
      let bg = new createjs.Bitmap(this.load.getResult("bg"));
      this.mainWidth = bg.getBounds().width;
      this.mainHeight = bg.getBounds().height;
      bg.x = 0;
      bg.y = 0;
      this.container.addChild(bg);


      let centerSprite = new createjs.Shape();
      centerSprite.graphics.beginFill("green").drawRect(0, 0, 1348, 785);
      this.centerWidth = 1348;
      this.centerHeight = 785;
      // this.centerMain.addChild(centerSprite);

      let centerkv = new createjs.Bitmap(this.load.getResult("kv"));
      this.centerMain.addChild(centerkv);

      let leftSprite = new createjs.Shape();
      leftSprite.graphics.beginFill("#000").drawRect(0, 0, 960, 920);
      this.leftWidht = 960;
      this.leftHeight = 920;
      // this.leftMain.addChild(leftSprite);

      this.itemLeft=new DanmuItem(this.leftMain,this.config);
      this.itemRight=new DanmuItem(this.rightMain,this.config);

      let rightSprite = new createjs.Shape();
      rightSprite.graphics.beginFill("#000").drawRect(0, 0, 960, 920);
      this.rightWidht = 960;
      this.rightHeight = 920;
      // this.rightMain.addChild(rightSprite);


      this.container.addChild(this.centerMain);
      this.centerMain.x = this.mainWidth - this.centerWidth >> 1;
      this.centerMain.y = this.mainHeight - this.centerHeight >> 1
      this.container.addChild(this.leftMain);
      this.leftMain.x = 50;
      this.leftMain.y = 80;
      this.container.addChild(this.rightMain);
      this.rightMain.x = this.mainWidth - this.rightWidht - 50;
      this.rightMain.y = 80;

      this.allPerImg = new createjs.Bitmap(this.load.getResult("allper"))
      this.allPerImg.x = this.mainWidth - this.allPerImg.getBounds().width >> 1
      this.allPerImg.y = 40;
      this.container.addChild(this.allPerImg);
      this.allPerTxt = new createjs.Text(this._setNumChange("123456789"), "bold 60px 微软雅黑", "#fff");
      this.allPerTxt.x = this.allPerImg.x + 260
      this.allPerTxt.y = (this.allPerImg.getBounds().height - this.allPerTxt.getBounds().height)/2+40;
      this.container.addChild(this.allPerTxt);

      this.biggift=new BigGift(this.container);

      this._emitter.emit("complete")
    });

    parent.addChild(this.container);
  }

  addDanmu(data){
    console.log(data)
    if(data.type=="yzcmghp" || data.type=="yzcmmfp" || data.type=="yzcmgrp"){
      if(data.count){
        if(Math.random()<0.5){
          this.itemLeft.addDanmu(data);
        }else{
          this.itemRight.addDanmu(data);
        }
      }
    }
  }

  get perNum() {
    return this.allPerTxt.text;
  }
  set perNum(value) {
    // this.allPerTxt.text = this._setNumChange(value);
    // this.allPerTxt.x = this.allPerImg.x + 260
    // this.allPerTxt.y = (this.allPerImg.getBounds().height - this.allPerTxt.getBounds().height )/2+40;
    this.stepupdateonline(value)
  }

  stepupdateonline(value){
    if(this.onlinetimer){
      clearInterval(this.onlinetimer)
    }
    let step=parseInt((value-this.online)/600);
    this.setsteponline(step)
    this.onlinetimer = setInterval(function()
    {
      this.setsteponline(step);
    }.bind(this), 100);
  }

  setsteponline(step){
    let temp = this.getOnlineStep(step);
    this.online += temp;
    if (this.online < 0)
    {
      this.online = 0;
    }
    this.allPerTxt.text = this._setNumChange(parseInt(this.online));
   
    this.allPerTxt.x = this.allPerImg.x + 260
    this.allPerTxt.y = (this.allPerImg.getBounds().height - this.allPerTxt.getBounds().height )/2+40;
  }
  getOnlineStep(step)
  {
      let temp = step;
      if (Math.abs(temp) > 1)
      {
          if (temp > 0)
          {
              temp = Math.ceil(temp);
          }
          else
          {
              temp = Math.floor(temp);
          }
      }
      else
      {
          temp = this.getRandomStep();
      }
      return temp || 0;
  }
  getRandomStep()
  {
      let randomIndex = Math.floor(Math.random() * this._randomList.length);
      return this._randomList.slice(randomIndex, 1)[0];
  }

  _setNumChange(data) {
    return parseFloat((data).toString()).toLocaleString();
  }

  destroy() {
    this._emitter.removeAllListeners();
    this._emitter = null;
  }

  on(event, listener) {
    this._emitter.addListener(event, listener);
  }
  off(event, listener) {
    this._emitter.removeListener(event, listener);
  }


}
export default MainScreen;