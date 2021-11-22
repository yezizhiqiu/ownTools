class MyPromise1 {
    constructor(executor) {
        // 每一个PROMISE实例都有一个状态和结果属性
        this.status = 'pending';
        this.value = undefined;

        // 用来存储基于THEN指定的成功或者失败的方法
        this.resolveArr = [];
        this.rejectArr = [];

        // 定义RESOLVE/REJECT方法用来改变PROMISE实例的状态和结果
        let change = (status, value) => {
            // 状态一但改变过，再改变则无效
            if (this.status !== 'pending') return;
            this.value = value;
            this.status = status;
            // 改变完成状态后，把基于THEN指定的对应方法执行
            let fnArr = status === 'resolved' ? this.resolveArr : this.rejectArr;
            fnArr.forEach(item => {
                if (typeof item !== 'function') return;
                item(this.value);
            });
        };
        // 为了保证执行RESOLVE/REJECT的时候，已经通过THEN把需要执行的方法弄好了，我们判断处理（没有方法的时候，我们让改变状态的操作延迟进行）
        let resolve = result => {
            if (this.resolveArr.length > 0) {
                change('resolved', result);
                return;
            }
            let delayTimer = setTimeout(_ => {
                change('resolved', result);
                clearTimeout(delayTimer);
            }, 0);
        };
        let reject = reason => {
            if (this.rejectArr.length > 0) {
                change('rejected', reason);
                return;
            }
            let delayTimer = setTimeout(_ => {
                change('rejected', reason);
                clearTimeout(delayTimer);
            }, 0);
        };

        // 每一次NEW PROMISE都会立即执行EXECUTOR函数
        executor(resolve, reject);
    }

    // MyPromise.prototype.then
    then(resolveFn, rejectFn) {
        this.resolveArr.push(resolveFn);
        this.rejectArr.push(rejectFn);
    }
}