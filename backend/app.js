var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const UserRouter = require('./routes/backWay/UserRouter');
const JWT = require('./util/JWT');
const MerchantRouter = require('./routes/backWay/MerchantRouter');
const ComplaintRouter = require('./routes/backWay/ComplaintRouter');
const RoleRouter = require('./routes/backWay/RoleRouter');
const ContentRouter = require('./routes/backWay/ContentRouter');
const CommonRouter = require('./routes/gateway/commonRouter');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// 富文本正文（HTML）可能超过默认 100KB，放宽到 2MB，避免 413 返回 HTML 错误页
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// 写在所有路由的前面，对其进行token校验
app.use((req, res, next) => {
    if (req.url === '/manage/member/login' || req.url === '/portal/member/login' || req.url === '/portal/member/register') {
        next()
        return
    }
    const token = req.headers?.['authorization']?.split?.(" ")?.[0]
    if (token) {
        var payload = JWT.verify(token)
        if (payload) {
            const newToken = JWT.generate({
                _id: payload._id,
                username: payload.username
            }, '1d')
            res.header('Authorization', newToken)
            next()
        } else {
            res.status(401).send({ result: false, message: "用户验证过期，请重新登录" })
        }
    } else {
        res.status(401).send({ result: false, message: "请登录" })
    }
})
app.use(UserRouter)
app.use(MerchantRouter)
app.use(ComplaintRouter)
app.use(RoleRouter)
app.use(ContentRouter)
app.use(CommonRouter)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
