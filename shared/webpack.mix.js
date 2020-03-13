const host_name = 'dev.sensor-dream.ru';
const http_schema = 'https://';
const path_key = '../security_file/ssl/privkey.pem';
const path_cert = '../security_file/ssl/fullchain.pem';
const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js("resources/js/app.js", "public/js")
    .sass("resources/sass/app.scss", "public/css")
    .browserSync({
        ui: {
            port: 9090,
        },
        proxy: {
            target: http_schema + host_name,
            ws: true
        },
        port: 8080,
        ws: true,
        host: host_name,
        https: {
            key: path_key,
            cert: path_cert
        },
        cors: true,
        notify: true,
        open: "external",
        // open: "local",
        plugins: ["bs-html-injector"],
        injectChanges: true,
        codeSync: true
    });
