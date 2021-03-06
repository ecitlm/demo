// zxx.crop_rotation.js by zhangxinxu  welcome to visit my personal website http://www.zhangxinxu.com/
// 2010-05-06 v1.0 beta
// 图片剪裁旋转前端展示
/*一些说明:
* 1. 旋转效果查看需通过在角度文本框中输入数值
* 2. 后台处理图片需要5个参数，剪裁起始点，以及剪裁的高宽，这5个参数均可以通过id获取。其中角度值即旋转角度输入框的值，id为zxxRotAngle，坐标及高宽参数分别藏在4个隐藏的文本框中，id分别是：cropPosX, cropPosY, cropImageWidth, cropImageHeight
* 3. 自动对比当前图片与原始图片尺寸比例，计算实际的剪裁值，对于高度及位置溢出也做了处理
* 4. 如果出现由于图片旋转而发生遮挡的现象，设置遮挡元素的position属性为relative，z-index为1，可修复此问题
* 5. 经我测试，excanvas.js需在头部加载以支持IE浏览器的canvas
*/
var fnImageCropRot = function(o){
	//o为图片对象
	if(typeof(o) === "object" && o.nodeName.toLowerCase() === "img"){//检测是否是图片类型的DOM对象
		//当前显示图片的高度和宽度
		var iCurWidth = o.width, iCurHeight = o.height;
		o.height = iCurHeight;
		//获取实际图片的高宽
		var oCreateImg = new Image();
		oCreateImg.src = o.src;
		var iOrigWidth = oCreateImg.width, iOrigHeight = oCreateImg.height;
		
		if(iCurWidth && iOrigWidth){//如果宽度为不为0 - 意味着加载成功
			//计算当前与实际的纵横比
			var scaleX = iCurWidth / iOrigWidth;
			var scaleY = iCurHeight / iOrigHeight;			
			//实现图片对象的包裹
			//创建包裹div
			var oRelDiv = document.createElement("div");
			oRelDiv.style.position = "relative";
			oRelDiv.style.width = iCurWidth + "px";
			oRelDiv.style.height = iCurHeight + 30 + "px";
			oRelDiv.style.top = "30px";
			//定义ID方法
			var ID = function(id){
				return document.getElementById(id);
			};
			//插入到当前图片对象之前
			o.parentNode.insertBefore(oRelDiv, o);
			//初始化坐标与剪裁高宽
			var cropW = 80, cropH = 80;
			var posX = (iCurWidth - cropW)/2, posY = (iCurHeight - cropH)/2;
			//剪裁需要的HTML元素
			var sInnerHtml = '<div style="font-size:12px; position:absolute; top:-24px; right:0;">旋转：<input id="zxxRotAngle" type="text" value="0" style="width:38px; height:15px; border:1px solid #a0b3d6; font-size:100%; padding:2px 0 1px 2px; margin-right:3px; color:#333333;" />度</div><canvas id="zxxImageCanvas" style="position:absolute;"></canvas><div id="zxxCropBox" style="height:'+cropH+'px; width:'+cropW+'px; position:absolute; left:'+posX+'px; top:'+posY+'px; border:1px solid black;"><div id="zxxDragBg" style="height:100%; background:white; opacity:0.3; filter:alpha(opacity=30); cursor:move;"></div><div id="dragLeftTop" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; top:-3px; cursor:nw-resize;"></div><div id="dragLeftBot" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; bottom:-3px; cursor:sw-resize;"></div><div id="dragRightTop" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; top:-3px; cursor:ne-resize;"></div><div id="dragRightBot" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; bottom:-3px; cursor:se-resize;"></div><div id="dragTopCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; top:-3px; left:50%; margin-left:-3px; cursor:n-resize;"></div><div id="dragBotCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; bottom:-3px; left:50%; margin-left:-3px; cursor:s-resize;"></div><div id="dragRightCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; top:50%; margin-top:-3px; cursor:e-resize;"></div><div id="dragLeftCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; top:50%; margin-top:-3px; cursor:w-resize;"></div></div><input type="hidden" id="cropPosX" value="'+posX/scaleX+'" /><input type="hidden" id="cropPosY" value="'+posY/scaleY+'" /><input type="hidden" id="cropImageWidth" value="'+cropW/scaleX+'" /><input type="hidden" id="cropImageHeight" value="'+cropH/scaleY+'" />';
			//嵌入HTML元素
			oRelDiv.innerHTML = sInnerHtml;
			//图片重新插入
			var oCanvas = ID("zxxImageCanvas");
			if(window.ActiveXObject){
				//IE
				oCanvas = window.G_vmlCanvasManager.initElement(oCanvas); //使IE支持动态创建的canvas元素
			}
			oRelDiv.insertBefore(o, oCanvas);
			//---------------------------图片包裹装载完毕-----------------------
			
			var fnCanvasRotate = function(canvas,img,rot){//canvas旋转角度的方法
				//获取图片的高宽
				var w = iCurWidth;
				var h = iCurHeight;
				//角度转为弧度
				if(!rot){
					rot = 0;	
				}
				var rotation = Math.PI * rot / 180;
				var c = Math.round(Math.cos(rotation) * 1000) / 1000;
				var s = Math.round(Math.sin(rotation) * 1000) / 1000;
				//旋转后canvas标签的大小
				canvas.height = Math.abs(c*h) + Math.abs(s*w);
				canvas.width = Math.abs(c*w) + Math.abs(s*h);
				//绘图开始
				var context = canvas.getContext("2d");
				context.save();
				//改变中心点
				if (rotation <= Math.PI/2) {
					context.translate(s*h,0);
				} else if (rotation <= Math.PI) {
					context.translate(canvas.width,-c*h);
				} else if (rotation <= 1.5*Math.PI) {
					context.translate(-c*w,canvas.height);
				} else {
					context.translate(0,-s*w);
				}
				//旋转90°
				context.rotate(rotation);
				//绘制
				context.drawImage(img, 0, 0, w, h);
				context.restore();
				img.style.display = "none";	
			};
			//侦听旋转角度输入框
			ID("zxxRotAngle").onkeyup = function(){
				var v = parseInt(this.value, 10);
				if(!v){
					v = 0;	
				}
				//执行角度旋转
				fnCanvasRotate(oCanvas, o, v);
			};
			
			//拖拽与拉伸方法
			//拖拽拉伸所需参数
			var params = {
				left: 0,
				top: 0,
				width:0,
				height:0,
				currentX: 0,
				currentY: 0,
				flag: false,
				kind: "drag"
			};
			//获取相关CSS属性方法
			var getCss = function(o,key){
				return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key]; 	
			};
			var startDrag = function(point, target, kind){	
				//point是拉伸点，target是被拉伸的目标，其高度及位置会发生改变
				//此处的target与上面拖拽的target是同一目标，故其params.left,params.top可以共用，也必须共用
				//初始化宽高
				params.width = getCss(target, "width");
				params.height = getCss(target, "height");
				//初始化坐标
				if(getCss(target, "left") !== "auto"){
					params.left = getCss(target, "left");
				}
				if(getCss(target, "top") !== "auto"){
					params.top = getCss(target, "top");
				}
				//target是移动对象
				point.onmousedown = function(event){
					params.kind = kind;
					params.flag = true;
					if(!event){
						event = window.event;
					}
					var e = event;
					params.currentX = e.clientX;
					params.currentY = e.clientY;
					//防止IE文字选中，有助于拖拽平滑
					point.onselectstart = function(){
						return false;
					}  
				};
				document.onmouseup = function(){
					params.flag = false;	
					if(getCss(target, "left") !== "auto"){
						params.left = getCss(target, "left");
					}
					if(getCss(target, "top") !== "auto"){
						params.top = getCss(target, "top");
					}
					params.width = getCss(target, "width");
					params.height = getCss(target, "height");
					
					//给隐藏文本框赋值
					posX = parseInt(target.style.left);
					posY = parseInt(target.style.top);
					cropW = parseInt(target.style.width);
					cropH = parseInt(target.style.height);
					if(posX < 0){
						posX = 0;	
					}
					if(posY < 0){
						posY = 0;
					}
					if((posX + cropW) > iCurWidth){
						cropW = iCurWidth - posX;	
					}
					if((posY + cropH) > iCurHeight){
						cropH = iCurHeight - posY;	
					}
					//比例计算
					posX = posX / scaleX;
					posY /= scaleY;
					cropW /= scaleX;
					cropH /= scaleY;
					//赋值
					ID("cropPosX").value = posX;
					ID("cropPosY").value = posY;
					ID("cropImageWidth").value = cropW;
					ID("cropImageHeight").value = cropH;
				};
				document.onmousemove = function(event){
					var e = event ? event: window.event;
					if(params.flag){
						var nowX = e.clientX, nowY = e.clientY;
						var disX = nowX - params.currentX, disY = nowY - params.currentY;
						if(params.kind === "n"){
							//上拉伸
							//高度增加或减小，位置上下移动
							target.style.top = parseInt(params.top) + disY + "px";
							target.style.height = parseInt(params.height) - disY + "px";
						}else if(params.kind === "w"){//左拉伸
							target.style.left = parseInt(params.left) + disX + "px";
							target.style.width = parseInt(params.width) - disX + "px";
						}else if(params.kind === "e"){//右拉伸
							target.style.width = parseInt(params.width) + disX + "px";
						}else if(params.kind === "s"){//下拉伸
							target.style.height = parseInt(params.height) + disY + "px";
						}else if(params.kind === "nw"){//左上拉伸
							target.style.left = parseInt(params.left) + disX + "px";
							target.style.width = parseInt(params.width) - disX + "px";
							target.style.top = parseInt(params.top) + disY + "px";
							target.style.height = parseInt(params.height) - disY + "px";
						}else if(params.kind === "ne"){//右上拉伸
							target.style.top = parseInt(params.top) + disY + "px";
							target.style.height = parseInt(params.height) - disY + "px";
							//右
							target.style.width = parseInt(params.width) + disX + "px";
						}else if(params.kind === "sw"){//左下拉伸
							target.style.left = parseInt(params.left) + disX + "px";
							target.style.width = parseInt(params.width) - disX + "px";
							//下
							target.style.height = parseInt(params.height) + disY + "px";
						}else if(params.kind === "se"){//右下拉伸
							target.style.width = parseInt(params.width) + disX + "px";
							target.style.height = parseInt(params.height) + disY + "px";
						}else{//移动
							target.style.left = parseInt(params.left) + disX + "px";
							target.style.top = parseInt(params.top) + disY + "px";
						}
					}
				}	
			};
			
			//绑定拖拽
			startDrag(ID("zxxDragBg"),ID("zxxCropBox"),"drag");
			//绑定拉伸
			startDrag(ID("dragLeftTop"),ID("zxxCropBox"),"nw");
			startDrag(ID("dragLeftBot"),ID("zxxCropBox"),"sw");
			startDrag(ID("dragRightTop"),ID("zxxCropBox"),"ne");
			startDrag(ID("dragRightBot"),ID("zxxCropBox"),"se");
			startDrag(ID("dragTopCenter"),ID("zxxCropBox"),"n");
			startDrag(ID("dragBotCenter"),ID("zxxCropBox"),"s");
			startDrag(ID("dragRightCenter"),ID("zxxCropBox"),"e");
			startDrag(ID("dragLeftCenter"),ID("zxxCropBox"),"w");
			
			//图片不能被选中，目的在于使拖拽顺滑
			ID("zxxImageCanvas").onselectstart = function(){
				return false;
			};
			o.onselectstart = function(){
				return false;
			};
		}//if end
	}//if end
};