~function ($) {
    /**
     * 
     * @param {*} abbre 左侧缩略图div 包含div.mark img
     * @param {*} mark 左侧缩略图div鼠标选择区域
     * @param {*} origin 右侧原图div(大图) 包含 img
     */
    function magnifier($abbre, $mark, $origin) {
        if (!($abbre && $mark && $origin)) {
            console.warn('参数错误，需要对应三个jq对象');
            return false
        }
        /* 首先计算大图的大小 */
        let $originImg = $origin.find('img');
        let abbreW = $abbre.outerWidth(),
            abbreH = $abbre.outerHeight(),
            abbreOffset = $abbre.offset(),
            markW = $mark.outerWidth(),
            markH = $mark.outerHeight(),
            originW = $origin.outerWidth(),
            originH = $origin.outerHeight(),
            originImgW = abbreW / markW * originW,
            originImgH = abbreH / markH * originH;
        $originImg.css({
            width: originImgW,
            height: originImgH
        })

        /* 鼠标进入和离开完成的事情 */
        // 计算MARK盒子的位置 和 控制大图的移动
        function computedMark(ev) {
            let markL = ev.clientX - abbreOffset.left - markW / 2,
                markT = ev.clientY - abbreOffset.top - markH / 2;
            let minL = 0,
                minT = 0,
                maxL = abbreW - markW,
                maxT = abbreH - markH;
            markL = markL < minL ? minL : (markL > maxL ? maxL : markL);
            markT = markT < minT ? minT : (markT > maxT ? maxT : markT);
            $mark.css({
                top: markT,
                left: markL
            });
            $originImg.css({
                top: -markT / abbreH * originImgH,
                left: -markL / abbreW * originImgW
            })
        }
        $abbre.on('mouseenter', function (ev) {
            $mark.css('display', 'block');
            $origin.css('display', 'block');
            computedMark(ev);
        }).on('mouseleave', function (ev) {
            $mark.css('display', 'none');
            $origin.css('display', 'none');
        }).on('mousemove', computedMark);
    }
    // 向JQ中扩展插件
    $.fn.extend({
        magnifier: magnifier
    });
}(jQuery)