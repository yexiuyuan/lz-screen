/*
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const del = require('del');
const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const babelify = require('babelify');
const browserify = require('browserify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const spritesmith = require('gulp.spritesmith');

const browserSync = require('browser-sync').create();

function doWatchify() {
    let customOpts = {
        entries: 'src/index.js',
        standalone: 'screenjs',
        debug: true,
        transform: ['babelify', 'browserify-versionify'],
        plugin: ['browserify-derequire']
    };

    let opts = Object.assign({}, watchify.args, customOpts);
    let b = watchify(browserify(opts));

    b.on('update', function () {
        return doBundle(b).on('end', browserSync.reload.bind(browserSync));
    });
    b.on('log', console.log.bind(console));

    return b;
}

function doBundle(b) {
    return b.bundle()
        .on('error', console.error.bind(console))
        .pipe(source('screen.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
}

function doLint(paths, exit) {
    return gulp.src(paths)
        .pipe(eslint({fix:true}))
        .pipe(eslint.format())
        .pipe(exit ? eslint.failAfterError() : eslint.result(function () {}));
}

gulp.task('default', ['clean', 'lint', 'build']);
gulp.task('release', ['clean', 'lint', 'build', 'minimize']);

gulp.task('watch', ['clean'], function () {
    let gulpWatcher = gulp.watch(['gulpfile.js', 'src/**/*.js']);

    gulpWatcher.on('change', function (e) {
        if (e.type === 'changed' || e.type === 'added') {
            return doLint(e.path, false);
        }
    });

    return doBundle(doWatchify()).on('end', function () {
        browserSync.init({
            server: {
                baseDir: './'
            },
            port: 8000,
            open: false
        });
        require('opn')('http://localhost:8000/demo/index.html');
    });
});

gulp.task('clean', function () {
    return del([
        'dist/*'
    ]);
});

gulp.task('lint', function () {
    return doLint(['gulpfile.js', 'src/**/*.js'], true);
});

gulp.task('build', ['clean', 'lint'], function () {
    let b = browserify({
        entries: 'src/index.js',
        standalone: 'screenjs',
        debug: true,
        transform: ['babelify', 'browserify-versionify'],
        plugin: ['browserify-derequire']
    });

    return doBundle(b);
});

gulp.task('minimize', ['lint', 'build'], function () {
    let options = {
        sourceMap: true,
        sourceMapIncludeSources: true,
        sourceMapRoot: './src/',
        mangle: true,
        compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true
        }
    };

    return gulp.src('dist/screen.js')
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify(options))
            .on('error', console.error.bind(console))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('sprite', function () {
    return gulp.src('images/*.png')//需要合并的图片地址
        .pipe(spritesmith({
            imgName: 'sprite.png',//保存合并后图片的地址
            cssName: 'images/a.css',//保存合并后对于css样式的地址
            padding:5,//合并时两个图片的间距
            algorithm: 'binary-tree',//注释1
            cssTemplate:""//注释2
        }))
        .pipe(gulp.dest('spr/'));
});