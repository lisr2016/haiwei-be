接口文档

1.POST /login

功能: 用户登陆

提交参数

    body:{
        phone : 手机号, 必填
        password : 密码, 长度6到16个任意字符
    }
返回数据

失败
状态码 400

返回格式 
    
      {msg: '错误原因'}
成功
状态码 200
返回格式

    {
      'msg': '登陆成功',
      'data': {
        'token': 1
      }
    }

2.GET /getVerifyCode

功能: 获取验证码

提交参数: 

    phone: 手机号,必填

返回数据

失败
状态码 400

返回格式

     {msg: '错误原因'}
     
成功
状态码 200
返回格式

    {
      'msg': '成功',
      'data': {
        'verifyCode': XXX
      }
    }


3.GET /check/VerifyCode

功能: 校验验证码

提交参数: 

    phone: 手机号, 必填
    VerifyCode: 验证码, 必填

返回数据:

失败
状态码 400
返回格式 

    {msg: '验证码错误'}
    
成功
状态码 200
返回格式
 
    {msg: '校验成功'}

4.POST /reset/password

功能: 重置密码

提交参数

参数字段

    body{
        phone : 用户名, 长度1到15个字符，只能是字母数字下划线中文，必填
        password : 密码, 长度6到16个任意字符，必填
        newPassword : 新密码, 长度6到16个任意字符，必填
    }
    
返回数据

失败
状态码 400
返回格式 

    {msg: '用户不存在'} 或者 {msg: '密码不正确'}
    
成功
状态码 200
返回格式

    {
      'msg': '更改成功',
      'data': {
        'token': xxx
      }
    }
    

5.GET /v1/user/info

功能: 获取用户信息

提交参数: 无

返回数据:

失败
状态码 400
返回格式 

    {msg: '未登录'}
    
成功
状态码 200
返回格式

    {
      'data': [
        userInfo: {
          'userId': 1,
          'username': '123',
        },
        orgInfo:
        {
          'orgId': 2,   // 机构id
          'name': '学前端', // 机构名称
          'initialized': false,             // 是否进行过初始化信息填报
          'corporationPhone': xxx   // 法人电话
          'managerPhone': xxx   // 负责人电话
          'bednum': xxx   // 床位数
          'address': xxx   // 地址
          'level': xxx   // 级别
          'street': xxx   // 街道
        }
      ]
    }

6.POST /v1/init/org/info

功能: 机构信息初始化填报

参数字段

    body{ 
              'initialized': false,             // 是否进行过初始化信息填报
              'corporationPhone': xxx   // 法人电话
              'managerPhone': xxx   // 负责人电话
              'bednum': xxx   // 床位数
              'address': xxx   // 地址
              'level': xxx   // 级别
              'street': xxx   // 街道
    }
    
返回数据
失败
状态码 400
返回格式 

    {msg: '登录后才能操作'}
    
成功
状态码 200
返回格式

    {
      'msg': '更新成功'
    }
    
7.POST /v1/message/list

功能: 用户消息列表

提交参数

参数字段

    无
    
返回数据

失败
状态码 400
返回格式 

    {'msg': 'XXX'}
    
成功
状态码 200

返回格式
 
    { 'msg': '查询成功'
     'data': {
         list:[
            {
                content: XXX // 内容
                type: XXX  // 消息类型，(根据type枚举值判断跳转)
                isRead: false // 是否已读
                time: XXX // 推送时间
            }, ...
         ]
     }
    }
 
8.POST /v1/domestic/daily

功能: 提交生活垃圾日报。

提交参数：

    body :{
          time: 填报日期 本日零点时间戳
          orgId: 机构id
          userId: 填报人
            
          meetingTimes: XXX  // Number, 管理工作会议次数
          meetingHost: XXX // String,管理工作会议主持人
          meetingContent: XXX //  String,会议具体事项
          
          selfTimes: XXX //  Number,  自测、巡查次数
          selfProblems: XXX // Number,  存在问题数目
          selfContent: XXX //  String,主要涉及问题
          selfCorrected: XXX //Boolean 是否改正到位
          
          advertiseTimes: XXX  //  Number, 宣传次数
          advertiseContent: XXX //  String, 宣传方式
          
          traningTimes: XXX //  Number,  培训次数
          trainees: XXX //  Number,  培训人数
          traningContent: XXX //  String, 培训内容
          
          govTimes: XXX //  Number,  政府检查次数
          govProblems: XXX // Number,  存在问题数目
          govContent: XXX // String, 主要涉及问题
          govCorrected: XXX // Boolean, 是否改正到位
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' }

 
9.POST /v1/domestic/weekly

功能: 提交生活垃圾周报。

提交参数：

    body :{
          time: 填报日期 填报周周四零点时间戳
          orgId: 机构id
          userId: 填报人
         
          kitchenWasteCollectors: XXX // Number, 厨余垃圾投放收集容器(个)
          kitchenWastePositions: XXX // Number, 厨余垃圾单位暂时存放点(个)
          recyclableWasteCollectors: XXX // Number, 可回收垃圾投放收集容器(个)
          recyclableWastePositions: XXX // Number, 可回收垃圾单位暂时存放点(个)
          harmfulWasteCollectors: XXX // Number, 有害垃圾投放收集容器(个)
          harmfulWastePositions: XXX // Number, 有害垃圾单位暂时存放点(个)
          otherWasteCollectors: XXX // Number, 其它垃圾投放收集容器(个)
          otherWastePositions: XXX // Number, 其它垃圾单位暂时存放点(个)
          medicWasteCollectors: XXX // Number, 医疗垃圾投放收集容器(个)
          medicWastePositions: XXX // Number, 医疗垃圾单位暂时存放点(个)
          bulkyWastePositions: XXX // Number, 大件垃圾单位暂时存放点(处)
          kitchenWaste: XXX // Number, 厨余垃圾(公斤)
          recyclableWaste: XXX // Number, 可回收垃圾(公斤)
          harmfulWaste: XXX // Number, 有害垃圾(公斤)
          otherWaste: XXX // Number, 其他垃圾(公斤)
          medicWaste: XXX // Number, 医疗废物(公斤)
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' }
    
 
10.POST /v1/domestic/monthly

功能: 提交生活垃圾月报。

提交参数：

    body :{
          time: 填报日期 填报月份
          orgId: 机构id
          userId: 填报人
          
          kitchenWaste: XXX // Number, 厨余垃圾(公斤)
          recyclableWaste: XXX // Number, 可回收垃圾(公斤)
          harmfulWaste: XXX // Number, 有害垃圾(公斤)
          bulkyWaste: XXX // Number, 大件废物(公斤)
          otherWaste: XXX // Number, 其他垃圾(公斤)
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' }
    
 
11.POST /v1/medic/monthly

功能: 提交医疗垃圾月报。

提交参数：

    body :{
          time: 填报日期 填报月份
          orgId: 机构id
          userId: 填报人
          
          // 待定
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' } 

12.POST /v1/cms/get/user/list

功能: 获取用户列表。

提交参数：

    body :{
      search,
      sort,
      isAdmin,
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '查询成功',
      'data': 
        'list': [
           {
             username: XXX,
             password: XXX,
             orgInfo: {
                  // 同接口2 orgInfo
                }
             initialized: true,
             
             isAdmin: false,
             authority: XXX, //管理员级别
           },
         ]
     }


13.POST /v1/cms/new/user/

功能: 新增用户。

提交参数：

    body :{
      phone,    // 必填
      password, // 非必填
      username, // 
      isAdmin, // 是否是管理员
      authority: XXX, //管理员级别
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' } 

14.POST /v1/cms/update/user/info

功能: 修改用户信息。

提交参数：

    body :{
      phone,    // 必填
      password, // 非必填
      username, // 
    }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' } 

15.POST /v1/cms/update/org/info

功能: 修改机构信息。

提交参数：

      body{ 
        'initialized': false,             // 是否进行过初始化信息填报
        'corporationPhone': xxx   // 法人电话
        'managerPhone': xxx   // 负责人电话
        'bednum': xxx   // 床位数
        'address': xxx   // 地址
        'level': xxx   // 级别
        'street': xxx   // 街道
      }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '提交成功' } 
    
16.POST /v1/cms/report/summary

功能: 获取量化填报汇总数据。

提交参数：

      body{ 
        startTime:  // 开始时间,
        endTime:  // 结束时间,
        wasteType: // String 垃圾种类 1.厨余垃圾，2.可回收垃圾，3.有害垃圾，4.大件垃圾，1、5.医疗垃圾，6.其他垃圾
        reportType: // String 报告类型 1.生活垃圾日报,2.生活垃圾月报,3.生活垃圾年报,4.医疗垃圾月报
      }

返回数据

失败
状态码 400
返回格式范例

    {'msg': 'XXX'}
    
成功
状态码 200
返回格式
 
    { 'msg': '查询成功',
      'data': {
        'list': [{
        
        },...
        ]
      }
      } 
