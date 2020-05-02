### [The PHP Framework for Web Artisans](https://laravel.com/docs "The PHP Framework for Web Artisans")

# Web Server Configuration

#### Apache

Laravel includes a public/.htaccess file that is used to provide URLs without the index.php front controller in the path. Before serving Laravel with Apache, be sure to enable the mod_rewrite module so the .htaccess file will be honored by the server.

If the .htaccess file that ships with Laravel does not work with your Apache installation, try this alternative:

> `Options +FollowSymLinks -Indexes` >`RewriteEngine On`
>
> `RewriteCond %{HTTP:Authorization} .`
>
> `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`
>
> `RewriteCond %{REQUEST_FILENAME} !-d`
>
> `RewriteCond %{REQUEST_FILENAME} !-f`
>
> `RewriteRule ^ index.php [L]`

#### Nginx

If you are using Nginx, the following directive in your site configuration will direct all requests to the index.php front controller:

> `location / { try_files $uri $uri/ /index.php?\$query_string;}`

## Installation and configure LARAVEl

---

> `composer global require laravel/installer`

#### Export path LARAVEL

> `composer global about`

and

> `export PATH=$HOME/.config/composer/vendor/bin:$PATH`

or

> `export PATH=$HOME/.composer/vendor/bin:$PATH`

#### Instal base Laravel system

> `laravel new <project>`

or

> `composer create-project --prefer-dist laravel/laravel <project>`

#### Local Development Server

> `php artisan serve`
>
> and open browser and find development at http://localhost:8000

Public Directory

> After installing Laravel, you should configure your web server's document / web root to be the public directory. The index.php in this directory serves as the front controller for all HTTP requests entering your application.

Directory Permissions

> After installing Laravel, you may need to configure some permissions. Directories within the storage and the bootstrap/cache directories should be writable by your web server or Laravel will not run.

Application Key

> The next thing you should do after installing Laravel is set your application key to a random string. If you installed Laravel via Composer or the Laravel installer, this key has already been set for you by the `php artisan key:generate` command.

#### JavaScript & CSS Scaffolding

> While Laravel does not dictate which JavaScript or CSS pre-processors you use, it does provide a basic starting point using Bootstrap, React, and / or Vue that will be helpful for many applications. By default, Laravel uses NPM to install both of these frontend packages.
>
> `npm install`
>
> `npm install -D vue core-js vuex @popperjs/core`
>
> The Bootstrap and Vue scaffolding provided by Laravel is located in the laravel/ui Composer package, which may be installed using Composer:
>
> `composer require laravel/ui --dev`
>
> Please run `npm install && npm run dev` to compile your fresh scaffolding
>
#### The initial structure of the database catalog in Laravel.

```
database
├── factories
│   └── UserFactory.php
├── migrations
│   ├── 2014_10_12_000000_create_users_table.php
│   ├── 2014_10_12_100000_create_password_resets_table.php
│   └── 2019_08_19_000000_create_failed_jobs_table.php
└── seeds
    └── DatabaseSeeder.php

3 directories, 5 files
```
>
> Once the laravel/ui package has been installed, you may install the frontend scaffolding using the ui Artisan command:
>
> ```// Generate basic scaffolding...
> php artisan ui bootstrap
> php artisan ui vue
> php artisan ui react
> ```
>
> ```
> // Generate login / registration scaffolding...
> php artisan ui bootstrap --auth
> php artisan ui vue --auth
> php artisan ui react --auth
> ```
>
> Please run `npm install && npm run dev` to compile your fresh scaffoldin
