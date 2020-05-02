# Instalation Laravel + Voyager admin platform

### [Original documentations of Voyager](https://voyager-docs.devdojo.com/ "Original documentations of Voyager")

#### For clean Voyager platform

> `composer require tcg/voyager --dev`

#### Instalation

> `php artisan voyager:install`

#### Create admin user
>
> If you did not go with the dummy user, you may wish to assign admin privileges to an existing user. This can easily be done by running this command:
>
> `php artisan voyager:admin your@email.com`

or
>
> If you wish to create a new admin user you can pass the --create flag, like so:
>
> `php artisan voyager:admin your@email.com --create`

#### Compile public files

> `npm install && npm run dev`

