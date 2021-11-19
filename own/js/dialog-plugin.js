/*
 * 我们把写好的方法扩展到内置的window.alert上
 *   alert('你好世界！');  =>弹出提升框  可以关闭，3S后自动消失
 *   alert('你好世界！',{  =>支持自定义配置项
 *      title: '系统温馨提示',   控制标题的提示内容
        confirm: false,   是否显示确认和取消按钮
        handled: null     再点击确认/取消/×按钮的时候，触发的回调函数
 *   });
 */
window.alert = (function () {
	// DIALOG：模态框类（每一个模态框都是创建这个类的实例）
	class Dialog {
		constructor(content, options) {
			// 把后续在各个方法中用到的内容全部挂载到实例上
			this.content = content;
			this.options = options;
			// 初始化
			this.init();
		}
		// 创建元素
		create(type, cssText) {
			let element = document.createElement(type);
			element.style.cssText = cssText;
			return element;
		}
		createElement() {
			this.$DIALOG = this.create('div', `
				position: fixed;
				top: 0;
				left: 0;
				z-index: 9998;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, .8);
				user-select: none;
				opacity: 0;
				transition: opacity .3s;
			`);
			this.$MAIN = this.create('div', `
				position: absolute;
				top: 100px;
				left: 50%;
				margin-left: -200px;
				z-index: 9999;
				width: 400px;
				background: #FFF;
				border-radius: 3px;
				overflow: hidden;
				transform: translateY(-1000px);
				transition: transform .3s;
			`);
			this.$HEADER = this.create('div', `
				position: relative;
				box-sizing: border-box;
				padding: 0 10px;
				height: 40px;
				line-height: 40px;
				background: #2299EE;
				cursor: move;
			`);
			this.$TITLE = this.create('h3', `
				font-size: 18px;
				color: #FFF;
				font-weight: normal;
			`);
			this.$CLOSE = this.create('i', `
				position: absolute;
				right: 10px;
				top: 50%;
				transform: translateY(-50%);
				font-size: 24px;
				font-style: normal;
				color: #FFF;
				font-family: 'Courier New';
				cursor: pointer;
			`);
			this.$BODY = this.create('div', `
				padding: 30px 10px;
				line-height: 30px;
				font-size: 16px;
			`);
			this.$FOOTER = this.create('div', `
				text-align: right;
				padding: 10px 10px;
				border-top: 1px solid #EEE;
			`);
			this.$CONFIRM = this.create('button', `
				margin: 0 5px;
				padding: 0 15px;
				height: 28px;
				line-height: 28px;
				border: none;
				font-size: 14px;
				cursor: pointer;
				color: #FFF;
				background: #2299EE;
			`);
			this.$CANCEL = this.create('button', `
				margin: 0 5px;
				padding: 0 15px;
				height: 28px;
				line-height: 28px;
				border: none;
				font-size: 14px;
				cursor: pointer;
				color: #000;
				background: #DDD;
			`);
			// 把创建的元素按照层级合成（从里向外合成）
			let {
				title,
				confirm
			} = this.options;
			this.$TITLE.innerHTML = title;
			this.$CLOSE.innerHTML = 'X';
			this.$HEADER.appendChild(this.$TITLE);
			this.$HEADER.appendChild(this.$CLOSE);
			this.$BODY.innerHTML = this.content;
			this.$MAIN.appendChild(this.$HEADER);
			this.$MAIN.appendChild(this.$BODY);
			if (confirm) {
				// 显示底部确定和取消按钮
				this.$CONFIRM.innerHTML = '确定';
				this.$CANCEL.innerHTML = '取消';
				this.$FOOTER.appendChild(this.$CONFIRM);
				this.$FOOTER.appendChild(this.$CANCEL);
				this.$MAIN.appendChild(this.$FOOTER);
			}
			this.$DIALOG.appendChild(this.$MAIN);
			// 插入到页面中
			document.body.appendChild(this.$DIALOG);
		}
		// 显示模态框
		show() {
			this.$DIALOG.style.opacity = 1;
			this.$MAIN.style.transform = 'translateY(0)';

			// 如果没有确定和取消按钮，让其显示3000MS后消失
			if (!this.options.confirm) {
				this.$timer = setTimeout(() => {
					this.hide();
					clearTimeout(this.$timer);
				}, 3000);
			}
		}
		// 隐藏模态框 lx='CONFIRM/CANCEL'
		hide(lx = 'CANCEL') {
			this.$MAIN.style.transform = 'translateY(-1000px)';
			this.$DIALOG.style.opacity = 0;
			let fn = () => {
				// 触发handled回调函数执行
				if (typeof this.options.handled === "function") {
					this.options.handled.call(this, lx);
				}
				// 移除创建的元素
				document.body.removeChild(this.$DIALOG);
				// 当前方法只绑定一次
				this.$DIALOG.removeEventListener('transitionend', fn);
			};
			this.$DIALOG.addEventListener('transitionend', fn);
		}
		// 拖拽实现
		down(ev) {
			this.startX = ev.clientX;
			this.startY = ev.clientY;
			this.startT = this.$MAIN.offsetTop;
			this.startL = this.$MAIN.offsetLeft;
			this._MOVE = this.move.bind(this);
			this._UP = this.up.bind(this);
			document.addEventListener('mousemove', this._MOVE);
			document.addEventListener('mouseup', this._UP);
		}
		move(ev) {
			let curL = ev.clientX - this.startX + this.startL,
				curT = ev.clientY - this.startY + this.startT;
			let minL = 0,
				minT = 0,
				maxL = this.$DIALOG.offsetWidth - this.$MAIN.offsetWidth,
				maxT = this.$DIALOG.offsetHeight - this.$MAIN.offsetHeight;
			curL = curL < minL ? minL : (curL > maxL ? maxL : curL);
			curT = curT < minT ? minT : (curT > maxT ? maxT : curT);
			this.$MAIN.style.left = curL + 'px';
			this.$MAIN.style.top = curT + 'px';
			this.$MAIN.style.marginLeft = 0;
		}
		up(ev) {
			document.removeEventListener('mousemove', this._MOVE);
			document.removeEventListener('mouseup', this._UP);
		}
		// 执行INIT可以创建元素，让其显示，并且实现对应的逻辑操作
		init() {
			this.createElement();
			this.$DIALOG.offsetWidth; //=>阻断渲染队列，让上述代码立即先渲染
			this.show();

			// 基于事件委托实现关闭/确定/取消按钮的点击操作
			this.$DIALOG.addEventListener('click', ev => {
				let target = ev.target;
				if (/^(BUTTON|I)$/i.test(target.tagName)) {
					// 取消自动消失
					clearTimeout(this.$timer);
					this.hide(target.innerHTML === '确定' ? 'CONFIRM' : 'CANCEL');
				}
			});

			// 实现拖拽效果
			this.$HEADER.addEventListener('mousedown', this.down.bind(this));
		}
	}

	// PROXY：就是ALERT执行的函数
	// =>插件封装的时候，如果需要传递多个配置项，我们一般都让其传递一个对象，而不是单独一项项让其传递，这样处理的好处：不需要考虑是否必传以及传递信息的顺序了、方便后期的扩展和升级...
	return function proxy(content, options = {}) {
		// 传参验证
		if (typeof content === 'undefined') {
			throw new Error("错误：提示内容必须传递！");
		}
		if (options === null || typeof options !== "object") {
			throw new Error("错误：参数配置项必须是一个对象！");
		}
		// 参数默认值和替换 (Object.assign合并对象)
		options = Object.assign({
			title: '系统温馨提示',
			confirm: false,
			handled: null
		}, options);
		return new Dialog(content, options);
	}
})();