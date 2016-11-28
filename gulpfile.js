'use strict';

var gulp = require('gulp'),                         // gulp核心模块
	DEST = 'build',                                 // 编译目录 
	CSS_DEST = 'var/build',                         // css编译目录
	JS_DEST = 'var/js',                           // js编译目录
	IMG_DEST = 'var/img',                        // img编译目录
	HTML_DEST = 'var/build',                       // html编译目录
	WEB_PORT = 80,                                // 服务器监听的端口
	$ = require('gulp-load-plugins')();             // gulp插件加载模块
	
	 // var sass = require('gulp-sass'),	              // sass与编译模块
	// 	jade = require('gulp-jade'),                  // jade与编译模块
	// 	autoprefixer = require('gulp-autoprefixer'), // 浏览器前缀自动补全
	// 	minifyCss = require('gulp-minify-css'),	    // 压缩css
	// 	minifyHtml = require("gulp-minify-html"),	// 压缩html
	// 	jshint = require('gulp-jshint'),             // js语法校验
	// 	browserify = require('gulp-browserify'),     // js模块化构建工具
	// 	uglify = require('gulp-uglify'),			 // 压缩js
	// 	imagemin = require('gulp-imagemin'),         // 压缩图片
	// 	spritesmith=require('gulp.spritesmith'),     // css sprite
	// 	rename = require('gulp-rename'),             // 文件重命名
	// 	clean = require('gulp-clean'),               // 文件清理
	// 	notify = require('gulp-notify'),             // 消息通知
	// 	cache = require('gulp-cache'),               // 缓存
	// 	sequence = require('gulp-sequence'),         // gulp任务执行队列
	// 	connect = require('gulp-connect'),           // node本地服务器
	// 	livereload = require('gulp-livereload');     // 浏览器即时刷新
		    

// 处理样式
gulp.task('styles', function() {
	return gulp.src(['share/scss/**/kopi6.scss','share/spriteCSS/**/*.css'])
		.pipe($.sass())
		.pipe($.autoprefixer('last 2 version','safari 5','ie 8','ie 9','opera 12.1','ios 6','android 4'))
		.pipe($.minifyCss())
		.pipe($.concat('kopi6.min.css'))
		.pipe(gulp.dest(CSS_DEST))
		.pipe($.livereload())
		.pipe($.notify({
			message: 'Styles task complete'
		}));
});

//处理jade-html
gulp.task('htmls', function() {
	return gulp.src(['share/jade/**/*.jade','!share/jade/**/_*.jade'])
		.pipe($.jade({pretty: '\t'}))
		// .pipe($.rename({
		// 	suffix: '.min'
		// }))
		// .pipe($.minifyHtml())
		.pipe(gulp.dest(HTML_DEST))
		.pipe($.livereload())
		.pipe($.notify({
			message: 'Htmls task complete'
		}))
});

// 处理javascript 
gulp.task('scripts', function() {
	return gulp.src('var/build/js/**/*.js')
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		.pipe($.browserify())
		.pipe(gulp.dest(JS_DEST))
		.pipe($.rename({
			suffix: '.min'
		}))
		.pipe($.uglify())
		.pipe(gulp.dest(JS_DEST))
		.pipe($.livereload())
		.pipe($.notify({
			message: 'Scripts task complete'
		}));
});

// 处理图片
gulp.task('images', function() {
	return gulp.src(['share/img/**/*.*','!share/img/sprite/**/*.*'])
		.pipe($.cache($.imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		})))
		.pipe(gulp.dest(IMG_DEST))
		.pipe($.livereload())
		.pipe($.notify({
			message: 'Images task complete'
		}))
});

// 合并雪碧图
gulp.task('sprite',function () {
	var spriteData = gulp.src('share/img/sprite/sprite_1/*.*').pipe($.spritesmith({
	    imgName: 'var/img/sprite_1.png',
	    cssName: 'share/spriteCSS/sprite_1.css'
	}));
	return spriteData.pipe(gulp.dest('./'));
});

// 清理build目录
gulp.task('clean', function() {
	return gulp.src([HTML_DEST,JS_DEST,CSS_DEST,IMG_DEST], {
		read: false
	})
	.pipe($.clean())
	.pipe($.notify({
		message: 'Clean task complete'
	}));
});

// 设置服务器
gulp.task('http', function() {
    $.connect.server({
        root: DEST,
        port: WEB_PORT,
        livereload: true
    });
});

// 监听文件变化
gulp.task('watch', function() {

	// 监听livereload
	$.livereload.listen();

	// 监听sprite
	gulp.watch('share/img/sprite/**/*.*', ['sprite']);

	// 监听sass
	gulp.watch('share/scss/**/*.scss', ['styles']);

	// 监听js
	gulp.watch('var/js/**/*.js', ['scripts']);

	// 监听图片
	gulp.watch('var/img/**/*', ['images']);

	// 监听html
	gulp.watch('share/jade/**/*.jade', ['htmls']);

});

// build任务
gulp.task('build', function(cb){
	$.sequence('clean',['sprite','styles','scripts','images','htmls','watch'])(cb)
});

// 主任务
gulp.task('main', function(cb){
	$.sequence('build', ['http'])(cb)
});

// 默认任务
gulp.task('default',['main']);
