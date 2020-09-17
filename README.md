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
    
      { 'code': 5, 'msg': '错误原因'}
成功
状态码 200
返回格式

    {
      'code': 0, 
      'msg': '登陆成功',
      'data': {
        'token': 1
      }
    }

2.GET /get/verifyCode

功能: 获取验证码

提交参数: 

    phone: 手机号, 必填

返回数据

失败
状态码 400

返回格式

      {'code': 5, 'msg': '错误原因'}
     
成功
状态码 200
返回格式

    {
      'code': 0, 
      'msg': '成功',
      'data': {
        'verifyCode': XXX
      }
    }


3.GET /check/verifyCode

功能: 校验验证码

提交参数: 
    
    phone: 手机号, 必填
    verifyCode: 验证码, 必填

返回数据:

失败
状态码 400
返回格式 

    { 
      'code': 5, msg: '验证码错误'
    }
    
成功
状态码 200
返回格式
 
    {
      'code': 0, 
       msg: '校验成功' 
    }

4.POST /reset/password

功能: 重置密码

提交参数

参数字段

    body{
        verifyCode: 验证码, 必填
        password : 密码, 长度6到16个任意字符，必填
        newPassword : 新密码, 长度6到16个任意字符，必填
    }
    
返回数据

失败
状态码 400
返回格式 

    {
      'code': 5, 
      'msg': '用户不存在'
    } 
    
成功
状态码 200
返回格式

    {
      'code': 0, 
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

    {  
      'code': 5, 
       'msg': '未登录'
    }
    
成功
状态码 200
返回格式

    {
      'code': 0, 
      'data': {
        orgInfo:
        {
          'name': 'xxx', // 机构名称
          'initialized': false,             // 是否进行过初始化信息填报
          'corporationPhone': xxx   // 法人电话
          'managerPhone': xxx   // 负责人电话
          'bednum': xxx   // 床位数
          'address': xxx   // 地址
          'level': xxx   // 级别
          'street': xxx   // 街道
        }
    }

6.POST /v1/init/org/info

功能: 机构信息初始化填报

参数字段

    body{ 
              'corporationPhone': xxx   // String,非必填 法人电话
              'managerPhone': xxx   // String,必填 负责人电话
              'bednum': xxx   // Number,非必填, 床位数
              'address': xxx   // String,必填 地址
              'level': xxx   // String,必填 级别
              'street': xxx   // String,必填 街道
    }
    
返回数据
失败
状态码 400
返回格式 

    {
      'code': 5, 
       'msg': 'XXX'
      }
    
成功
状态码 200
返回格式

    {
      'code': 0, 
      'msg': '更新成功'
    }
    
7.GET /v1/message/list

功能: 用户消息列表

提交参数

参数字段

    无
    
返回数据

失败
状态码 400
返回格式 

    {
      'code': 5, 
        'msg': 'XXX'
    }
    
成功
状态码 200

返回格式
 
    {       
     'code': 0,  
     'msg': '查询成功'
     'data': {
         list:[
            {   
                title: XXX // String 显示标题
                content: XXX //  String 内容,type 为1时有这个字段
                type: XXX  //  String  消息类型，(根据type枚举值判断跳转)1.公告信息 2.跳转生活日报 3跳转生活周报 4跳转生活月报 4调整医疗月报
                isRead: false // Boolean 是否已读
                createTime: XXX // 推送时间
            }, ...
         ]
     }
    }

8.GET /v1/message/:id

功能: 消息事项已处理(已跳转)

提交参数

参数字段

    无
    
返回数据

失败
状态码 400
返回格式 

    {
      'code': 5, 
        'msg': 'XXX'
    }
    
成功
状态码 200

返回格式
 
    {       
     'code': 0,  
     'msg': '提交成功'
    }
 
 

8.1.GET /v1/message/:id

功能: 消息事项已处理(已跳转)

提交参数

参数字段

    无
    
返回数据

失败
状态码 400
返回格式 

    {
      'code': 5, 
        'msg': 'XXX'
    }
    
成功
状态码 200

返回格式
 
    {       
     'code': 0,  
     'msg': '提交成功'
    }
 
 
9.POST /v1/domestic/daily

功能: 提交生活垃圾日报。

提交参数：

    body :{
          time: 填报日期 本日零点时间戳
            
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

    {
     'code': 5, 
    'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    {     
      'code': 0, 
      'msg': '提交成功' 
      }

 
10.POST /v1/domestic/weekly

功能: 提交生活垃圾周报。

提交参数：

    body :{
          time: 填报日期 填报周周四零点时间戳
         
          consignee: XXX // Number, 收运人员人数
          guide: XXX // Number, 看守引导人员人数
          inspector: XXX // Number, 监督检查人员人数
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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 0, 
      'msg': '提交成功'
     }
    
 
11.POST /v1/domestic/monthly

功能: 提交生活垃圾月报。

提交参数：

    body :{
          time: 1, // Number填报月份
          
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

    

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 0, 
      'msg': '提交成功'
     }
    
 
12.POST /v1/medic/monthly

功能: 提交医疗垃圾月报。

提交参数：

    body :{
          time: 1, // Number填报月份
          
          totalWeight:  XXX // Number, 月医疗垃圾产量(公斤)
    }

返回数据

失败
状态码 400
返回格式范例

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 0, 
      'msg': '提交成功'
     }

13.POST /cms/login

功能: 管理端登陆。

提交参数：

    body :{
      phone,
      password
    }

返回数据

失败
状态码 400
返回格式范例

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 200,
      'msg': '查询成功',
      'data': 
        'token': 
     }
     
 13.1 GET /cms/user/info
 
 功能: 管理员用户信息。
 
 提交参数：
 
 返回数据
 
 失败
 状态码 400
 返回格式范例
 
     {
      'code': 5, 
      'msg': 'XXX'
     }
     
 成功
 状态码 200
 返回格式
  
     { 
       'code': 200,
       'msg': '查询成功',
       'data': 
            'user': {
                'idv: '5f5fc3ffed8da219bc89963b',
                'phone': xx,
                'username': '管理员1',
                'authority': '1'
            }
      }
      
      
14.POST /cms/reset/password

功能: 管理端登陆。

提交参数：

    body{
        verifyCode: 验证码, 必填
        password : 密码, 长度6到16个任意字符，必填
        newPassword : 新密码, 长度6到16个任意字符，必填
    }

返回数据

失败
状态码 400
返回格式范例

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 200,
      'msg': '修改成功
     }

15.POST /cms/get/user/list

功能: 获取用户列表。

提交参数：

    body :{
      search, // String, 查询 手机号、机构名称
      offset, // 页数, 默认1
      limit, // 每页大小, 默认50
      
      rule // 正序/倒叙 暂不支持
      sort,  // String, 暂不支持
      isAdmin, // Boolean，是否是管理员，暂不支持
    }

返回数据

失败
状态码 400
返回格式范例

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 200,
      'msg': '查询成功',
      'data': 
        'list': [
           {
             phone: XX,
             orgInfo: {
                  // 同接口5 orgInfo
                }
             initialized: true,
             
             isAdmin: false,
             authority: XXX, //管理员级别
           },
         ]
     }


16.POST /cms/new/user

功能: 新增用户。

提交参数：

    body :{
      phone,    // 必填
      password, // 非必填
      organizationName, // 机构名称
    }

返回数据

失败
状态码 400
返回格式范例

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 0, 
      'msg': '添加成功'
     }

17.POST /cms/update/user/info

功能: 修改用户信息。

提交参数：

    body :{
      userId, // 用户id，必填
      password, // 非必填
    }

返回数据

失败
状态码 400
返回格式范例

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 0, 
      'msg': '提交成功'
     }

18.POST /cms/update/org/info

功能: 修改机构信息。

提交参数：

      body{ 
        'organizationId': xxx // 机构id
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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
      'code': 0, 
      'msg': '提交成功'
     }
   
19.POST /cms/summary/domestic/daily

功能: 生活垃圾日报汇总。

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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
    'code': 200,
    'msg': '查询成功',
      'data': {
        'list': [{
        
        },...
        ]
      }
      } 

20.POST /cms/summary/domestic/weekly

功能: 生活垃圾周报汇总。

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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
    'code': 200,
    'msg': '查询成功',
      'data': {
        'list': [{
        
        },...
        ]
      }
      } 

21.POST /cms/summary/domestic/monthly

功能: 生活垃圾月报汇总。

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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
    'code': 200,
    'msg': '查询成功',
      'data': {
        'list': [{
        
        },...
        ]
      }
      } 

 
22.POST /cms/summary/medic/monthly

功能: 医疗垃圾月报汇总。

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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
    'code': 200,
    'msg': '查询成功',
      'data': {
        'list': [{
        
        },...
        ]
      }
      } 
      
      
23.POST /cms/screen

功能: 数据大屏数据汇总。

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

    {
     'code': 5, 
     'msg': 'XXX'
    }
    
成功
状态码 200
返回格式
 
    { 
    'code': 200,
    'msg': '查询成功',
      'data': {      
        'userCount': // 用户总数
         ...
        ]
      }
      } 
