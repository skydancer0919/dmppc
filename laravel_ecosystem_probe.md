# Laravel Probe installation packages

1.  php packages:

        'brick/math'
        'laravel/ui'
        'laracasts/flash'
        'beyondcode/laravel-websockets'
        'spatie/laravel-sitemap'
        'spatie/laravel-backup'
        'laravel/telescope --dev'

2.  javascript packages:

        global:
            @vue/cli

        production:
            vue
            core-js
            bootstrap-vue
            bootstrap
            vuex
            vue-recaptcha
            axios
            @popperjs/core
            vue-router
            vee-validate
            laravel-echo
            pusher-js
            portal-vue
            toasts

        development:
            browser-sync
            browser-sync-webpack-plugin
            bs-html-injector

3. Probe:

    1.  https://labs.infyom.com/laravelgenerator/docs/7.0/installation

            "require": {
                ...
                "infyomlabs/laravel-generator": "7.0.x-dev",
                "laravelcollective/html": "^6.1",
                "infyomlabs/adminlte-templates": "7.0.x-dev"
                "infyomlabs/generator-builder": "dev-master"
                ...
            }

    2.  https://voyager-docs.devdojo.com/getting-started/installation

            composer require tcg/voyager
            php artisan voyager:install



`composer update`

