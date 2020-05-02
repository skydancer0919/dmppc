# Регистрация, активация и авторизация.

### [Based on Laravel Framework 6.x](https://laravel.com/docs/6.x "Основанный на Laravel Framework 6.x")

#### На данный момент:

> Composer version 1.9.2 + Laravel Installer 3.0.1 +Laravel Framework v6.13.1 + Powerful REPL for the Laravel framework v2.1.0 + Laravel UI utilities and presets v1.1.2.

1. Cозданим заготовки всех необходимых для аутентификации роутов и шаблонов при помощи пакета laravel/ui:

    > Рекомендуется на начальном этапе создания проекта. Устанавливаются все необходимые шаблоны для регистрации и логина, а также роуты, требуемые для системы аутентификации. Также будет сгенерирован HomeController, на коорый будет сделан редирект залогиненного пользователя.
    >
    > `composer require laravel/ui`
    >
    > `php artisan ui vue --auth`
    >
    > Производим миграцию
    >
    > `php artisan migrate`
    >
    > Установим и скомпилируем зависимости
    >
    > `npm install && npm run dev`

2. Удаляем поля ввода и подтверждения пароля в форме регистрации:
    > File: `./resources/views/auth/register.blade.php`
3. В контроллере регистрации:

    > File: `app/Http/Controllers/Auth/RegisterController.php`

    удаляем из валидацию поля пароля и генерируеи случайный пароль, который записывам в добавленное свойство класса \$randomGeneratePassword для включение его в письмо пользователю, а также для сохранения оного в базе данных, хешем пароля.

    !!! Сразу после регистрации пользователь авторизован. !!!

    Необходимо перегрузить метод `registered`, этот метод определён в трейте `Illuminate\Foundation\Auth\RegistersUsers`. В нём пропишем разлогиновку и перенаправление на страницу входа с сообщением об отправке приветственного письма с паролем.

    > `Исправления:`

    ```
    ...

    use Illuminate\Support\Facades\Validator;

    use Illuminate\Http\Request; //вставка
    use Illuminate\Support\Str; //вставка

    class RegisterController extends Controller {

    ...

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    protected $randomGenerateUserPassword = null; // вставка обявления переменной

    ...

        /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            // 'password' => ['required', 'string', 'min:8', 'confirmed'], // комментирум
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {

        $this->randomGenerateUserPassword = Str::random(8);

        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            // 'password' => Hash::make($data['password']), // комментирум
            'password' => Hash::make($this->randomGenerateUserPassword), // добавляем
        ]);
    }

    ...

    // добавляем полностью функцию
    /**
     * registered
     *
     * @param  mixed $request
     * @param  mixed $user
     *
     * @return mixed
     */
    protected function registered(Request $request, $user)
    {
        $this->guard()->logout();

        return redirect($this->redirectPath())->withSuccess('Thanks for registration! The password has been sent to your email.');
    }

    ...

    ```

4. Создаем событие (Event) регистрации:

    > `php artisan make:event Auth/UserRegistered`

    Поллучаем файл `./app/Events/Auth/UserRegistered.php` и приводим его к следующему виду:

    ```
    ...

    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Queue\SerializesModels;

    use App\User; // вставка

    class UserRegistered
    {

    public $user; //вставка

    public $password; //вставка

    ...

    /**
     * Create a new event instance.
     *
     * @return void
     */
    // public function __construct() меняем на
    public function __construct(User $user, $password)
    {
        //
        $this->user = $user;
        $this->password = $password;
    }

    ...
    ```

    В конструктор передаётся модель пользователя и пароль, сохраняются в соответствующие публичные свойства, которые будут использовать в слушателе для отправки почты пользователю.

5. Создаём слушателя.

    > `php artisan make:listener Auth/SendRegisterNotification --event=Auth\UserRegistered`

    File: `./app/Listeners/Auth/SendRegisterNotification.php`

6. Т.к. в слушателе нам понадобится класс для отправки почты, создаем его с генерацией markdown-шаблона для письма:

    > `php artisan make:mail Auth/RegistrationEmail --markdown=emails.auth.registration`

    Files: `./app/Mail/Auth/RegistrationEmail.php` and `./resources/views/emails/auth/registration.blade.php`

7. Открываем созданный на предыдущем шаге слушатель и прописываем отправку почты:

    ```
    ...

    use App\Events\Auth\UserRegistered;

    ...

    use App\Mail\Auth\RegistrationEmail; // вставка
    use Mail; // вставка

    ...

        /**
        * Handle the event.
        *
        * @param  UserRegistered  $event
        * @return void
        */
        public function handle(UserRegistered $event)
        {
            //
            Mail::to($event->user->email)->send(new RegistrationEmail($event->user, $event->password)); // вставка
        }
    ...

    ```

8. Регистрируем слушателя события. По документации лучшим местом для этого является провайдер сервиса событий `./app/Providers/EventServiceProvider.php`

    ```
    use Illuminate\Support\Facades\Event;

    use App\Events\Auth\UserRegistered; // вставка
    use App\Listeners\Auth\SendRegisterNotification; // вставка

    class EventServiceProvider extends ServiceProvider
    {
        /**
        * The event listener mappings for the application.
        *
        * @var array
        */
        protected $listen = [
            Registered::class => [
                SendEmailVerificationNotification::class,
            ],
            // вставка
            UserRegistered::class => [
                SendRegisterNotification::class,
            ],
        ];
    ```

9. Изменяем файл `./app/Mail/Auth/RegistrationEmail.php`. В конструктор передаётся модель пользователя и пароль, сохраняются в соответствующие публичные свойства, которые будут использовать в слушателе для отправки почты пользователю. Реализуем метод build(), в котором сконструируем письмо.

    ```
    ...

    use App\User; // вставка

    class RegistrationEmail extends Mailable
    {
        use Queueable, SerializesModels;

        public $user; // вставка

        public $password; // вставка

        ...

        // public function __construct()
        public function __construct(User $user, $password) // вставка
        {
            //
            $this->user = $user; // вставка
            $this->password = $password; // вставка
        }

        ...

        public function build()
        {
            // return $this->markdown('emails.auth.registration');
            return $this->markdown('emails.auth.registration')->subject(config('app.name').": Registration Notification")->from(config('mail.from.address')); //вставка

        ...
    }
    ```

10. Изменяем файл шаблона письма `./resources/emails/auth/registration.blade.php`

    ```
    @component('mail::message')
    # Welcome!

    Thanks for signing up. This is the password we generated for you: **{{ $password }}**

    You can change it in your profile.

    @component('mail::button', ['url' => route('login')])
    Login
    @endcomponent

    Thanks,<br>
    {{ config('app.name') }}
    @endcomponent
    ```

11. Изменяем контроллер регистрации ``. В методе registered() добавляем событие.

    ```
    ...
    use Illuminate\Support\Facades\Validator;

    use Illuminate\Http\Request;
    use Illuminate\Support\Str;

    use App\Events\Auth\UserRegistered; //вставка

    class RegisterController extends Controller

    ...

    protected function registered(Request $request, $user)
    {

        event(new UserRegistered($user, $this->password)); //вставка

        $this->guard()->logout();

        return redirect($this->redirectPath())->withSuccess('Thanks for registration! The password has been sent to your email.');
    }

    ...
    ```

12.

12) Последнее
    > `npm run dev`

`Использовался материал:`

> [Laravel 6](https://laravel.com/docs/6.x "РЕГИСТРАЦИЯ В LARAVEL С ПРОВЕРКОЙ EMAIL. СОБЫТИЯ И СЛУШАТЕЛИ")

> [РЕГИСТРАЦИЯ В LARAVEL С ПРОВЕРКОЙ EMAIL. СОБЫТИЯ И СЛУШАТЕЛИ](https://si-dev.com/ru/blog/registration-events-and-listeners "РЕГИСТРАЦИЯ В LARAVEL С ПРОВЕРКОЙ EMAIL. СОБЫТИЯ И СЛУШАТЕЛИ")
