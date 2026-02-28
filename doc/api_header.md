# 接口全局说明

## 结果Status状态码说明

| status   | 说明      |
| -------- | -------- |
| 0        | 响应成功   |
| 1        | 响应失败   |
| 10001    | 参数错误  |
| 10002    | 请求header需要设置token|
| 10003    | 无效token |
| 10004    | 未认证登录  |

## headers 设置

* `Content-Type: application/json` json格式请求
* `Authorization: Bearer token` 需要token认证的API，headers中需带上token字符串
