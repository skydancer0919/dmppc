# Development of multi-purpose portal core. (DMPPC).

## Chapter one.

---

1.  > composer create-project --prefer-dist laravel/laravel dmppc
2.  `Configure .env file.`

        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=here your database name(dmppc)
        DB_USERNAME=here database username(root)
        DB_PASSWORD=here database password(root)

3.  `Create Migration`

    > php artisan make:migration create_products_table --create=products

4.  `After this command you will find one file in following path "database/migrations" and you have to put bellow code in your migration file for create products table.`

        public function up()
        {
            Schema::create('products', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name');
                $table->text('detail');
                $table->timestamps();
            });
        }

5.  > php artisan migrate

6.  `Add Resource Route`

        Open your "routes/web.php" file and add following route.

        Route::resource('products','ProductController');

7.  `Add Controller and Model`

        After bellow command you will find new file in this path "app/Http/Controllers/ProductController.php".

        In this controller will create seven methods by default as bellow methods:

        1. index()

        2. create()

        3. store()

        4. show()

        5. edit()

        6. update()

        7. destroy()

8.  `Copy bellow code and put on ProductController.php file.`

        <?php
            namespace App\Http\Controllers;
            use App\Product;
            use Illuminate\Http\Request;

            class ProductController extends Controller
            {
                /**
                * Display a listing of the resource.
                *
                * @return \Illuminate\Http\Response
                */

                public function index()
                {
                    $products = Product::latest()->paginate(5);
                    return view('products.index',compact('products'))
                        ->with('i', (request()->input('page', 1) - 1) * 5);
                }

                /**
                * Show the form for creating a new resource.
                *
                * @return \Illuminate\Http\Response
                */
                public function create()
                {
                    return view('products.create');
                }

                /**
                * Store a newly created resource in storage.
                *
                * @param  \Illuminate\Http\Request  $request
                * @return \Illuminate\Http\Response
                */
                public function store(Request $request)
                {
                    $request->validate([
                        'name' => 'required',
                        'detail' => 'required',
                    ]);

                    Product::create($request->all());

                    return redirect()->route('products.index')->with('success','Product created successfully.');

                }


                /**
                * Display the specified resource.
                *
                * @param  \App\Product  $product
                * @return \Illuminate\Http\Response
                */

                public function show(Product $product)
                {
                    return view('products.show',compact('product'));
                }

                /**
                * Show the form for editing the specified resource.
                *
                * @param  \App\Product  $product
                * @return \Illuminate\Http\Response
                */

                public function edit(Product $product)
                {
                    return view('products.edit',compact('product'));
                }

                /**
                * Update the specified resource in storage.
                *
                * @param  \Illuminate\Http\Request  $request
                * @param  \App\Product  $product
                * @return \Illuminate\Http\Response
                */

                public function update(Request $request, Product $product)
                {
                    $request->validate([
                        'name' => 'required',
                        'detail' => 'required',
                    ]);

                    $product->update($request->all());

                    return redirect()->route('products.index')->with('success','Product updated successfully');

                }

                /**
                * Remove the specified resource from storage.
                *
                * @param  \App\Product  $product
                * @return \Illuminate\Http\Response
                */

                public function destroy(Product $product)
                {
                    $product->delete();

                    return redirect()->route('products.index')->with('success','Product deleted successfully');

                }

            }

9.  `Find "app/Product.php" and put bellow content in Product.php file`

        class Product extends Model
        {
            protected $fillable = [
                'name',
                'detail'
            ];
        }

10. `Add Blade Files`

        In last step. In this step we have to create just blade files. So mainly we have to create layout file and then create new folder "products" then create blade files of crud app. So finally you have to create following bellow blade files:

            1. layout.blade.php
            2. index.blade.php
            3. create.blade.php
            4. edit.blade.php
            5. show.blade.php

    > `cd 'project path'`
    >
    > `mkdir -p resources/views/products`
    >
    > `cd resources/views/products && touch layout.blade.php index.blade.php create.blade.php edit.blade.php show.blade.php`

11. `Put below code.`

    1.  resources/views/products/layout.blade.php

            <!DOCTYPE html>
            <html>
            <head>
                <title>Laravel 6 CRUD Application - ItSolutionStuff.com</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha/css/bootstrap.css" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    @yield('content')
                </div>
            </body>
            </html>

    2.  resources/views/products/index.blade.php

            @extends('products.layout')

            @section('content')
            <div class="row">
                    <div class="col-lg-12 margin-tb">
                        <div class="pull-left">
                            <h2>Laravel 6 CRUD Example from scratch - ItSolutionStuff.com</h2>
                        </div>
                        <div class="pull-right">
                            <a class="btn btn-success" href="{{ route('products.create') }}"> Create New Product</a>
                        </div>
                    </div>
                </div>

                @if ($message = Session::get('success'))
                    <div class="alert alert-success">
                        <p>{{ $message }}</p>
                    </div>
                @endif

                <table class="table table-bordered">
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Details</th>
                        <th width="280px">Action</th>
                    </tr>

                    @foreach ($products as $product)

                    <tr>
                        <td>{{ ++$i }}</td>
                        <td>{{ $product->name }}</td>
                        <td>{{ $product->detail }}</td>
                        <td>
                            <form action="{{ route('products.destroy',$product->id) }}" method="POST">
                                <a class="btn btn-info" href="{{ route('products.show',$product->id) }}">Show</a>
                                <a class="btn btn-primary" href="{{ route('products.edit',$product->id) }}">Edit</a>

                                @csrf

                                @method('DELETE')

                                <button type="submit" class="btn btn-danger">Delete</button>
                            </form>
                        </td>
                    </tr>
                    @endforeach
                </table>
                {!! $products->links() !!}
            @endsection

    3.  resources/views/products/create.blade.php

            @extends('products.layout')

            @section('content')

            <div class="row">
                <div class="col-lg-12 margin-tb">
                    <div class="pull-left">
                        <h2>Add New Product</h2>
                    </div>
                    <div class="pull-right">
                        <a class="btn btn-primary" href="{{ route('products.index') }}"> Back</a>
                    </div>
                </div>
            </div>

            @if ($errors->any())
                <div class="alert alert-danger">
                    <strong>Whoops!</strong> There were some problems with your input.<br><br>
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form action="{{ route('products.store') }}" method="POST">
                @csrf
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <strong>Name:</strong>
                            <input type="text" name="name" class="form-control" placeholder="Name">
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <strong>Detail:</strong>
                            <textarea class="form-control" style="height:150px" name="detail" placeholder="Detail"></textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12 text-center">
                            <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>

            @endsection

    4.  resources/views/products/edit.blade.php

            @extends('products.layout')

            @section('content')

            <div class="row">
                <div class="col-lg-12 margin-tb">
                    <div class="pull-left">
                        <h2>Edit Product</h2>
                    </div>
                    <div class="pull-right">
                        <a class="btn btn-primary" href="{{ route('products.index') }}"> Back</a>
                    </div>
                </div>
            </div>

            @if ($errors->any())
            <div class="alert alert-danger">
                <strong>Whoops!</strong> There were some problems with your input.<br><br>
                <ul>
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
            @endif

            <form action="{{ route('products.update',$product->id) }}" method="POST">

                @csrf

                @method('PUT')
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <strong>Name:</strong>
                            <input type="text" name="name" value="{{ $product->name }}" class="form-control" placeholder="Name">
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <strong>Detail:</strong>
                            <textarea class="form-control" style="height:150px" name="detail"
                                placeholder="Detail">{{ $product->detail }}</textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12 text-center">
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>

            @endsection

    5.  resources/views/products/show.blade.php

            @extends('products.layout')
            @section('content')

            <div class="row">
                <div class="col-lg-12 margin-tb">
                    <div class="pull-left">
                        <h2> Show Product</h2>
                    </div>
                    <div class="pull-right">
                        <a class="btn btn-primary" href="{{ route('products.index') }}"> Back</a>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xs-12 col-sm-12 col-md-12">
                    <div class="form-group">
                        <strong>Name:</strong> {{ $product->name }}
                    </div>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-12">
                    <div class="form-group">
                        <strong>Details:</strong> {{ $product->detail }}
                    </div>
                </div>
            </div>

            @endsection

12. `php artisan serve` and open http://localhost:8000/products link in browser

## License

    @Author: Pavel M. Teslenko
    @Email: sensor-dream@sensor-dream.ru
    @Copyright © Pavel M. Teslenko. All rights reserved. Contacts: sensor-dream@sensor-dream.ru
    @Copyright © sensor-dream. All rights reserved. Contacts: sensor-dream@sensor-dream.ru
    @Copyright © Sensor-Dream Boxed System (SDBS). Contacts: sensor-dream@sensor-dream.ru
    @License: http://www.apache.org/licenses/LICENSE-2.0
    @Site: https://sensor-dream.ru
    @File: chapter_1.md.php
    @Creation date file: 10.03.2020, 23:28:26
