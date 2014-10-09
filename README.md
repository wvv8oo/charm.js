# charm.js
===========

以更优雅的方式调用RESTful APIs，在`charm.js`中，你可以使用`router.project(1).issue(2).retrieve()`这样的方式来调用你的API。

##过去

```
var project_id = '5433d5e4e737cbe96dcef312'
var issue_id = '5434f2a85a68db8073c4a29e'
var url = 'api/project/' + project_id + '/issue/' + issue_id

//get
$.ajax({
	url: url,
	type: 'GET',
	success: function(result){
		//do something
	}
})

//post
$.ajax({
	url: url,
	type: 'post',
	data: {
		name: 'project name'
	},
	success: function(result){
		//do something
	}
})

//.... 更多的代码
```

##现在

```
var router = charm(options)
var project_id = '5433d5e4e737cbe96dcef312'
var issue_id = '5434f2a85a68db8073c4a29e'
router.parse('project/:project_id/issue/:issue_id')

//获取所有的项目信息
router.project().retrieve().then(callback)

//获取指定id的项目信息
router.project(project_id).retrieve().then(callback)

//获取issue的信息
router.project(project_id).issue(issue_id).retrieve().then(callback)

//创建项目
router.project().create({name: 'project name'}).then(callback)

//更新项目
router.project(project_id).update({name: 'project name'}).then(callback)

//更新issue
router.project(project_id).issue(issue_id).update({name: 'issue name'}).then(callback)

//创建issue
router.project(project_id).issue().create({name: 'issue name'}).then(callback)

```

#如何使用

## 新手入门

将`dist/charm.js`复制到你的项目中并引入，如`<script src="js/charm.js"></script>`。如果你在项目中使用了coffee，那么你也可以直接引入`src/charm.coffee`，推荐使用[silky](http://github.com/wvv8oo/silky)来实时编译coffee。

###常规使用

```
var router = charm(options)
router.parse('project/:project_id/issue/:issue_id')
router.project().retrieve().then(callback)    //获取所有项目资料

````

### require下的使用

`charm.js`支持require，在require下可以这样调用

```
define(['charm'], function(_charm){
	var router = charm(options)
	router.parse('project/:project_id/issue/:issue_id')
	router.project().retrieve().then(callback)    //获取所有项目资料
})
```

## options

### ajax

默认情况下，`charm.js`会主动查找$.ajax，如果你没有引入jQuery或者希望有更大的控制权，可以指定`ajax`参数。`ajax`参数是一个函数：

````
options.ajax = function(url, type, data, success){
	//url: ajax请求的url
	//type: 请求的类型，POST/GET/PUT/DELETE/PATCH之一
	//data：要向服务器提交的数据或者参数(GET模式下)
	//success：请求成功后的回调数据
}
````

### promise

考虑到代码重复，`charm.js`并没有内置promise，如果你希望使用promise，你需要在此参数指定promise，比如Q或者angular中的$q。如果你没有使用此参数，在发起动作的时候，需要设置回调函数。

* 没有使用promise

````
router.project().retrieve(null, function(result){
	console.log(result)
})
````

* 使用了promise

````
router.project().retrieve().then(function(result){
	console.log(result)
})
````

### prefix

url的前缀，`charm.js`会在所有请求的url前面附加这个前缀

### suffix

url的后缀，`charm.js`会在所有请求的url前面附加这个后缀

### methods

`charm.js`提供五种http的操作方法，分别是create/retrieve/update/delete/patch，对应到http的操作方法就是post/get/put/delete/patch。

但你可能习惯使用get/post/remove/put这样的写法，没关系，通过methods参数，你可以配置成为你想要的，如：

````
var options = {
    prefix: '/api',
    suffix: '.html',
    methods: {
        get: 'get',
        delete: 'remove',
        patch: 'patch',
        put: 'put',
        post: 'post'
    }
}
````

调用的时候，你就可以这样了：

````
router.project(1).get(condition).then()
router.project(1).post(data).then()
````
## 方法
### parse(apis)
转换api，apis参数可以是字符、数组或者对象

* 字符形式，如`parse('project/:project_id')`
* 数组，如`parse(['project/:project_id', ['session']])`
* 对象，如`parse({url: 'project/:project_id'})`，或者`parse([{url: 'project/:project_id'}])`

在url中，可以添加占位符，占位符的格式是`:+name`，如前面的`:project_id`和':issue_id'，占位符的作用就是替代url中的一些变量。

### toString

将charm转换为字符形式的url，例如：

```
var options = {
	prefix: '/api',
	suffix: '.html'
}
var router = charm(options)
router.parse('project/:project_id/issue/:issue_id')

console.log(router.project(1).issue(2).toString())
//打印结果为：/api/project/1/issue/2.html

console.log(router.project(1).toString())
//打印结果为：/api/project/1.html
```

