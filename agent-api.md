# 智能体接口对接说明（DeepSeek）

## 1. 接口地址

- `POST /api/Agent/Ask`
- 需要登录态（Bearer Token）
- 允许角色：`ADMIN` / `TEACHER` / `STUDENT`

## 2. 请求头

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

## 3. 请求参数

```json
{
  "question": "帮我找出这个班级里哪个 topic 的 report 可能有抄袭",
  "courseId": 1,
  "classId": 2,
  "topicId": null,
  "maxReportCount": 8,
  "similarityThreshold": 0.7
}
```

字段说明：

- `question`：必填，用户问题
- `courseId`：可选，限定课程
- `classId`：可选，限定班级
- `topicId`：可选，限定题目
- `maxReportCount`：可选，最大参考报告数（1~20）
- `similarityThreshold`：可选，抄袭风险阈值（0~1）

## 4. 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "answer": "结论：...\n依据：...\n建议：...",
    "role": "TEACHER",
    "resourceScope": {
      "courses": [
        { "id": 1, "name": "软件工程" }
      ],
      "classes": [
        { "id": 2, "name": "计科2201", "grade": 2022 }
      ]
    },
    "referencedReportCount": 8,
    "suspectedPairCount": 3
  }
}
```

## 5. 角色权限说明

- `ADMIN`
  - 可访问全量资源（课程、班级、题目、报告）
- `TEACHER`
  - 仅可访问自己授课相关资源（课程、班级、学生、题库、报告）
- `STUDENT`
  - 仅可访问本人及本人所在班级课程相关资源

> 智能体在服务端按角色过滤数据库数据后，再送入 DeepSeek，不会把越权数据放入模型上下文。

## 6. 教师场景（重复率/抄袭）

当问题包含“抄袭、重复率、相似度”等关键词时：

1. 服务端先按教师权限筛选可见报告
2. 从 MinIO 下载报告文件文本
3. 结合系统已有相似度字段 + 文本语义比对，构建“可疑报告对”上下文
4. 让 DeepSeek 输出：
   - 哪个 `topic` 下哪些 `report` 可疑
   - 可疑原因（相似度、语句重合、结构接近等）
   - 人工复核建议

## 7. 前端建议

- 提供“普通问答”和“重复率分析问答”两个快捷入口
- 重复率分析默认带上 `courseId`、`classId`
- 将 `data.answer` 按换行渲染为分段文本
- 展示 `referencedReportCount`、`suspectedPairCount` 作为可信度辅助信息

## 8. 部署前配置

在 `appsettings.json` 配置：

```json
"DeepSeek": {
  "BaseUrl": "https://api.deepseek.com",
  "ChatEndpoint": "/chat/completions",
  "ApiKey": "你的 DeepSeek Key",
  "Model": "deepseek-chat",
  "Temperature": 0.2,
  "MaxTokens": 1200
}
```

`ApiKey` 为空时，接口会返回“未配置 DeepSeek ApiKey”的提示。
