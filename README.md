
paintCircle.html-JS加载圆环进度条Bug:

pro: this.calCircleDeg(bot_deg) 在chrome,firefox浏览器显示正常,IE(IE9以下不考虑)下动画无效<br/>
ros: "obj.style.cssText" 解决JS控制dom动画带有webkit前缀问题
