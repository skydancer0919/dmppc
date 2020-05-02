# Guide to roles and permissions.

1.  #### Do following

    > `composer require laravel/ui --dev`
    >
    > `php artisan ui vue --auth`
    >
    > `php artisan migrate`
    >
    > `npm install && npm run dev`

    _Taken from_ [Laravel Roles and Rights guide](https://laravel.demiart.ru/guide-to-roles-and-permissions/ "Laravel Roles and Rights guide")

2.  #### Generating Models and Migrations

    > `php artisan make:model Role -m`
    >
    > `php artisan make:model Permission -m`

    **Adding the necessary pivot tables**

    > `php artisan make:migration create_users_permissions_table`
    >
    > `php artisan make:migration create_users_roles_table`
    >
    > `php artisan make:migration create_roles_permissions_table`

    **Modification files**

    > !!! Be sure to add it to all files ../database/migrations/ specifying that InnoDB should be used !!!

        ...
            Schema::create ... {
                $table->engine = 'InnoDB';
        ...

    ***

        ../database/migrations/<*>_create_users_table.php


            public function up()
            {
                Schema::create('users', function (Blueprint $table) {

                    $table->engine = 'InnoDB';

                    $table->bigIncrements('id');
                    $table->string('name');
                    $table->string('email')->unique();
                    $table->timestamp('email_verified_at')->nullable();
                    $table->string('password');

                    $table->string('fname');
                    $table->string('mname');
                    $table->string('lname');
                    $table->binary('avatar');

                    $table->rememberToken();
                    $table->timestamps();

                });
            }

        ./database/migrations/<*>_create_password_resets_table.php

            public function up()
            {
                Schema::create('password_resets', function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->string('email')->index();
                    $table->string('token');
                    $table->timestamp('created_at')->nullable();
                });
            }

        ./database/migrations/<*>_create_failed_jobs_table.php

            public function up()
            {
                Schema::create('failed_jobs', function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->bigIncrements('id');
                    $table->text('connection');
                    $table->text('queue');
                    $table->longText('payload');
                    $table->longText('exception');
                    $table->timestamp('failed_at')->useCurrent();
                });
            }

        ./database/migrations/<*>_create_roles_table.php

            public function up()
            {
                Schema::create('roles', function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->bigIncrements('id');
                    $table->string('name');
                    $table->string('slug');
                    $table->timestamps();
                });
            }

        ./database/migrations/<*>_create_permissions_table.php

            public function up()
            {
                Schema::create('permissions', function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->bigIncrements('id');
                    $table->string('name');
                    $table->string('slug');
                    $table->timestamps();
                });
            }

        ./database/migrations/<*>_create_users_permissions_table.php

            public function up()
            {
                Schema::create('users_permissions', function (Blueprint $table) {
                    $table->engine = 'InnoDB';
                    $table->unsignedBigInteger('user_id');
                    $table->unsignedBigInteger('permission_id');
                    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                    $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
                    $table->primary(['user_id','permission_id']);
            });
            }

        ./database/migrations/<*>_create_users_roles_table.php

            Schema::create('users_roles', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('role_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
                $table->primary(['user_id','role_id']);
            });

        ./database/migrations/<*>_create_roles_permissions_table.php

            Schema::create('roles_permissions', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('permission_id');
                $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
                $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
                $table->primary(['role_id','permission_id']);
            });
    **Create tables**
    > `php artisan migrate`

3.  #### Configuration of Role Relationships and Rights

    ##### Let's define the many-to-many relationship between roles and rights.

    1.  Open and modify:

        > _./app/Role.php_

            ...
            use Illuminate\Database\Eloquent\Model;

            class Role extends Model
            {
                public function permissions()
                {
                    return $this->belongsToMany(Permission::class,'roles_permissions');
                }
            ...

    2.  Open and modify:

        > _./app/Permission.php_

            ...
            use Illuminate\Database\Eloquent\Model;

                class Permission extends Model
                {
                    public function roles()
                    {
                        return $this->belongsToMany(Role::class,'roles_permissions');
                    }
                }
            ...

4.  #### Creating a trait HasRolesandPermissions for the User model.

    1.  > `mkdir app/traits -p`
    2.  > `touch app/traits/HasRolesAndPermissions.php`
    3.  Copy text to:

        > _./app/traits/HasRolesAndPermissions.php_

            namespace App\Traits;
            use App\Role;
            use App\Permission;

            trait HasRolesAndPermissions
            {
                /**
                * @return mixed
                */
                public function roles()
                {
                    return $this->belongsToMany(Role::class,'users_roles');
                }

                /**
                * @return mixed
                */
                public function permissions()
                {
                    return $this->belongsToMany(Permission::class,'users_permissions');
                }

                /**
                 * @param mixed ...$roles
                 * @return bool
                 */
                public function hasRole(... $roles )
                {
                    foreach ($roles as $role)
                    {
                        if ($this->roles->contains('slug', $role))
                        {
                            return true;
                        }
                    }
                    return false;
                }

                /**
                * @param $permission
                * @return bool
                */
                protected function hasPermission($permission)
                {
                    return (bool) $this->permissions->where('slug', $permission->slug)->count();
                }

                /**
                * @param $permission
                * @return bool
                */
                protected function hasPermissionTo($permission)
                {
                    return $this->hasPermissionThroughRole($permission) || $this->hasPermission($permission);
                }

                /**
                * @param $permission
                * @return bool
                */
                public function hasPermissionThroughRole($permission)
                {
                    foreach ($permission->roles as $role){
                        if($this->roles->contains($role)) {
                            return true;
                        }
                    }
                    return false;
                }

                /**
                * @param array $permissions
                * @return mixed
                */
                protected function getAllPermissions(array $permissions)
                {
                    return Permission::whereIn('slug',$permissions)->get();
                }

                /**
                * @param mixed ...$permissions
                * @return $this
                */
                public function givePermissionsTo(... $permissions)
                {
                    $permissions = $this->getAllPermissions($permissions);
                    if($permissions === null) {
                        return $this;
                    }
                    $this->permissions()->saveMany($permissions);
                    return $this;
                }

                /**
                * @param mixed ...$permissions
                * @return $this
                */
                public function deletePermissions(... $permissions )
                {
                    $permissions = $this->getAllPermissions($permissions);
                    $this->permissions()->detach($permissions);
                    return $this;
                }
                /**
                * @param mixed ...$permissions
                * @return HasRolesAndPermissions
                */
                public function refreshPermissions(... $permissions )
                {
                    $this->permissions()->detach();
                    return $this->givePermissionsTo($permissions);
                }

            }

5.  #### Open file and next insert text code:

    > _./dmppc/app/User.php_

        use Illuminate\Notifications\Notifiable;
        use App\Traits\HasRolesAndPermissions; // insert sting code `use App\Traits\HasRolesAndPermissions;`

        class User extends Authenticatable
        {
            use Notifiable, HasRolesAndPermissions;    // insert sting code `, HasRolesAndPermissions`

6.  #### Adding seeder classes for quick testing of roles and rights.

    1.  > `php artisan make:seed PermissionSeeder` > `php artisan make:seed RoleSeeder` > `php artisan make:seed UserSeeder`

    2.  ##### Open and modify:

        > _./database/seeds/PermissionSeeder.php_

            <?php

            use Illuminate\Database\Seeder;
            use App\Permission;

            class PermissionSeeder extends Seeder
            {
                /**
                 * Run the database seeds.
                 *
                 * @return void
                 */
                public function run()
                {
                    $manageUser = new Permission();
                    $manageUser->name = 'Manage users';
                    $manageUser->slug = 'manage-users';
                    $manageUser->save();
                    $createTasks = new Permission();
                    $createTasks->name = 'Create Tasks';
                    $createTasks->slug = 'create-tasks';
                    $createTasks->save();
                }
            }

    3.  ##### Open and modify:

        > _./database/seeds/RoleSeeder.php_

            <?php

            use Illuminate\Database\Seeder;
            use App\Role;

            class RoleSeeder extends Seeder
            {
                /**
                 * Run the database seeds.
                 *
                 * @return void
                 */
                public function run()
                {
                    $manager = new Role();
                    $manager->name = 'Project Manager';
                    $manager->slug = 'project-manager';
                    $manager->save();

                    $developer = new Role();
                    $developer->name = 'Web Developer';
                    $developer->slug = 'web-developer';
                    $developer->save();
                }
            }

    4.  ##### Open and modify:

        > _./database/seeds/UserSeeder.php_

            <?php

            use Illuminate\Database\Seeder;
            use App\Role;
            use App\User;
            use App\Permission;

            class UserSeeder extends Seeder
            {
                /**
                 * Run the database seeds.
                 *
                 * @return void
                 */
                public function run()
                {
                    $developer = Role::where('slug','web-developer')->first();
                    $manager = Role::where('slug', 'project-manager')->first();
                    $createTasks = Permission::where('slug','create-tasks')->first();
                    $manageUsers = Permission::where('slug','manage-users')->first();

                    $user1 = new User();
                    $user1->name = 'Jhon Deo';
                    $user1->email = 'jhon@deo.com';
                    $user1->password = bcrypt('secret');
                    $user1->save();
                    $user1->roles()->attach($developer);
                    $user1->permissions()->attach($createTasks);


                    $user2 = new User();
                    $user2->name = 'Mike Thomas';
                    $user2->email = 'mike@thomas.com';
                    $user2->password = bcrypt('secret');
                    $user2->save();
                    $user2->roles()->attach($manager);
                    $user2->permissions()->attach($manageUsers);
                }
            }

    5.  ##### Open and modify:
        > *./database/seeds/DatabaseSeeder.php*

            <?php

            use Illuminate\Database\Seeder;

            class DatabaseSeeder extends Seeder
            {
                /**
                 * Seed the application's database.
                 *
                 * @return void
                 */
                public function run()
                {
                    // $this->call(UsersTableSeeder::class);
                    $this->call(RoleSeeder::class);
                    $this->call(PermissionSeeder::class);
                    $this->call(UserSeeder::class);
                }
            }

    6. ##### For testing, do the following.
        1. ##### To save data in the database, run the following command in the terminal.

                php artisan db:seed

        2. ##### Check The user Rights and Roles as shown below.

                    $user = App\User::find(1);
                    dd($user->hasRole('web-developer'); // вернёт true
                    dd($user->hasRole('project-manager');// вернёт false
                    dd($user->givePermissionsTo('manage-users'));
                    dd($user->hasPermission('manage-users');// вернёт true

7.  #### Adding a blade Directive for Roles and Rights to use in blade templates.

    1.  ##### Сreating a new service provider.
        > `php artisan make:provider RolesServiceProvider`
    2.  ##### Open and modify:

        > _./app/Providers/RolesServiceProvider.php_

            <?php

            namespace App\Providers;

            use Illuminate\Support\ServiceProvider;
            use Illuminate\Support\Facades\Blade;

            class RolesServiceProvider extends ServiceProvider
            {
                /**
                * Register services.
                *
                * @return void
                */
                public function register()
                {
                    //
                }

                /**
                * Bootstrap services.
                *
                * @return void
                */
                public function boot()
                {
                    Blade::directive('role', function ($role){
                        return "<?php if(auth()->check() && auth()->user()->hasRole({$role})) :";
                    });
                    Blade::directive('endrole', function ($role){
                        return "<?php endif; ?>";
                    });
                }
            }

    3.  ##### In Blade templates, you can use this Directive as follows:

            @role('project-manager')
            Project Manager Panel
            @endrole

            @role(‘web-developer’)
            Web Developer Panel
            @endrole

    4.  ##### For Rights, we will use the x Directive to check whether the User has a Right. Instead of using \$user->hasPermissionTo(), we will use \$user->can().

        1.  ##### let's create a new service provider and call it Permission ServiceProvider.
            > `php artisan make:provider PermissionServiceProvider`
        2.  ##### Open and modify:

            > _./app/Providers/PermissionServiceProvider.php_

                <?php

                namespace App\Providers;

                use Illuminate\Support\ServiceProvider;
                use App\Permission;
                use Illuminate\Support\Facades\Gate;

                class PermissionServiceProvider extends ServiceProvider
                {
                    /**
                    * Register services.
                    *
                    * @return void
                    */
                    public function register()
                    {
                        //
                    }

                    /**
                    * Bootstrap services.
                    *
                    * @return void
                    */
                    public function boot()
                    {
                        try {
                            Permission::get()->map(function ($permission) {
                                Gate::define($permission->slug, function ($user) use ($permission) {
                                    return $user->hasPermissionTo($permission);
                                });
                            });
                        } catch (\Exception $e) {
                            report($e);
                            return false;
                        }
                    }
                }

            > Here we map all Rights, define slug Rights (in our case) , and check whether the User has a Right. Now you can check the User's Rights as shown below.
            >
            > `dd($user->can('manage-users')); // return true`

8.  #### Adding a Middlewar for Roles and Rights

        You can create specific Role areas in a web application.
        For example, you can grant access to manage Users only to project Managers.
        To do this, we will use Laravel middleware.
        Using them, we can add additional control over incoming requests.

    1.  ##### To create a middlewar for Roles, run the command below.
        > `php artisan make:middleware RoleMiddleware`
    2.  ##### Open and modify file:

        > _./app/Http/Middleware/RoleMiddleware.php_

            <?php

            namespace App\Http\Middleware;

            use Closure;

            class RoleMiddleware
            {
                /**
                * Handle an incoming request.
                * @param $request
                * @param Closure $next
                * @param $role
                * @param null $permission
                * @return mixed
                */
                public function handle($request, Closure $next, $role, $permission = null)
                {
                    if(!auth()->user()->hasRole($role)) {
                        abort(404);
                    }
                    if($permission !== null && !auth()->user()->can($permission)) {
                        abort(404);
                    }
                    return $next($request);
                }
            }

    3.  ##### Before using this middlewar you must add it to the file:

        > _./app/Http/Kernel.php_

            Update the $route Middleware array as shown below.

                /**
                 * The application's route middleware.
                 *
                 * These middleware may be assigned to groups or used individually.
                 *
                 * @var array
                 */
                protected $routeMiddleware = [
                    'auth' => \App\Http\Middleware\Authenticate::class,
                    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
                    'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
                    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
                    'can' => \Illuminate\Auth\Middleware\Authorize::class,
                    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
                    'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
                    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
                    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
                    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
                    'role'  =>  \App\Http\Middleware\RoleMiddleware::class, // Middleware our  inserted role
                ];

    4.  ##### You can now use the middlewar as shown below.

            Route::group(['middleware' => 'role:project-manager'], function() {
                Route::get('/dashboard', function() {
                    return 'Добро пожаловать, Менеджер проекта';
                });
            });
