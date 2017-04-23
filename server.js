var express = require("express");
var app = express();
app.use("/", express.static(__dirname + "/www"));
var http = require("http");
var server = http.createServer(app);
server.listen(3000);
var socketIo = require("socket.io");
var users = [];
var io = socketIo.listen(server); //将socket.io模块绑定到服务器

io.on("connection", function (socket) {
    socket.on("login", function (data) {
        users.push(data);
        socket.user = data;
        socket.emit("loginSuccess", data);
    });
    socket.on("send", function (data) {
        if(data == "cls"){
            io.sockets.emit("cls");
        }else{
            var timer = setInterval(function () {
                var ns = random();  //发送方数据帧
                var vr = 0; //接收方数据帧
                io.sockets.emit("sending", "<div>正在发送...</div>", "<div>等待......</div>");
                var isSend = random();
                if (isSend == 0) {    //发送丢失
                    io.sockets.emit("isLost", "<div>超时计时器时间到,重新发送</div>", "<div>发送丢失</div>");
                } else {  //发送没丢失,此时判断 ns与vr是否相等
                    if (ns != vr) {
                        io.sockets.emit("isRight", "<div>收到确认帧,错误,丢弃这个确认帧</div>", "<div>收到ns与vr不相等</div>");
                    } else {  //如果vr与ns相等,此时进行CRC校验
                        var CRC = random();
                        if (CRC == 0) {   //CRC校验失败
                            io.sockets.emit("crcWrong", "<div>CRC校验失败</div>", "<div>CRC校验失败</div>");
                        } else {    //CRC校验成功
                            io.sockets.emit("crcRight", "<div>CRC校验成功</div><div>收到确认帧! 正确, 消息内容为"+data+", 从主机取一个新的数据帧,放入发送缓存</div>", "<div>CRC校验成功</div><div>将收到的数据帧中的数据部分送交上层软件</div>");
                            clearInterval(timer);
                        }
                    }
                }
            }, 500);
        }
    });

});

//编写函数,用来随机生成0或1
function random() {
    var num = Math.random();
    if (num > 0.4) {
        return 1;
    } else {
        return 0;
    }
}

//编写函数,删除数组中指定元素
function deleteVal(arr, val) {
    var i = 0;
    for (i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            break;
        }
    }
    if (i < arr.length) {
        arr.splice(i, 1);
    }
    return arr;
}
