~function ($) {
    function ztree(params) {
        if (!$.isArray(params) || params.length === 0) {
            console.warn('请传入正确数据');
            return false
        }
        let count = 0,
            $this = $(this);
        //=>数据绑定
        let bindHTML = function (data) {
            let str = ``;
            data.forEach(item => {
                count++;
                let {
                    name,
                    open,
                    children
                } = item;
                str += `<li>
					<a href="" class="title">${name}</a>
					${children ? `<em class="icon ${open ? 'open' : ''}"></em>
					<ul class="level level${count}" 
						style="display:${open ? 'block' : 'none'}">
						${bindHTML(children)}
					</ul>`: ``}
				</li>`;
                count--;
            });
            return str;
        }
        $this.html(bindHTML(params));
        //=>基于事件委托实现点击操作
        $this.click(function (ev) {
            let target = ev.target,
                $target = $(target),
                $next = $target.next('ul');
            if (target.tagName === 'EM') {
                $target.toggleClass('open');
                $next.stop().slideToggle(100);
            }
        });
    }
    // 向JQ中扩展插件
    $.fn.extend({
        ztree: ztree
    });
}(jQuery)