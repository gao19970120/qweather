# 和风天气 - 官方 API 版

基于原作者 [dscao/qweather](https://github.com/dscao/qweather) 修改，并继续维护。

这是一个适用于 Home Assistant 的和风天气项目，仓库内同时包含：

- `custom_components/qweather`：集成代码
- `custom_components/qweather/www/weather-card.js`：前端天气卡片

这次更新主要聚焦天气卡片重构，集成本身保持原样。

## 项目说明

- 数据来源：和风天气官方 API
- 适用平台：Home Assistant
- 仓库内容：集成 + 前端天气卡片

官方文档：

- [和风天气开发文档](https://dev.qweather.com/docs/)
- [和风天气数据更新时间说明](https://dev.qweather.com/docs/resource/glossary/#update-time)

## 安装方式

### 方式一：手动安装

1. 将仓库中的 `custom_components/qweather` 复制到 Home Assistant 配置目录下的 `custom_components` 中。
2. 重启 Home Assistant。
3. 在 Home Assistant 中添加并配置 `qweather` 集成。

### 方式二：通过 HACS 安装

如果你已经在使用 HACS，也可以按你的现有方式将该仓库作为自定义集成添加并安装。

## 前端卡片资源

如果你手动管理 Lovelace 资源，请确认前端卡片资源已经正确加载。

常见写法如下：

```yaml
url: /local/qweather-card/qweather-card.js
type: module
```

如果你的环境实际使用的是其它静态资源路径，请按你的现有部署方式保持一致，不需要强行改成同一写法。

## `xiaoshi-weather-pad-card` 说明

新版 `xiaoshi-weather-pad-card` 采用毛玻璃风格重构，重点是把原本分散的天气信息整合到一个更完整的弹窗界面中。

主要能力包括：

- 当前天气信息展示
- 每日 / 小时 / 分钟预报切换
- AQI 与污染物信息展示
- 生活指数展示与详情弹层
- 预警信息展示与详情弹层
- 日出日落信息展示
- 桌面端鼠标拖动预报滚动区
- 平板与触屏设备横向滑动预报区域

## 卡片配置

### 单实体

```yaml
type: custom:xiaoshi-weather-pad-card
entity: weather.home
```

### 多实体切换

```yaml
type: custom:xiaoshi-weather-pad-card
entities:
  - weather.home
  - weather.company
entity_names:
  - 家
  - 公司
default_entity_index: 0
```

## 配置兼容性

- 未配置 `entities` 时，会自动回退到原有 `entity`
- `entity_names` 为可选项
- 未设置 `entity_names` 时，默认显示 `friendly_name`，否则回退到实体 ID
- `default_entity_index` 默认值为 `0`

## 使用建议

- 推荐在弹窗中使用 `xiaoshi-weather-pad-card`，能够更完整地展示布局和交互
- 桌面端可以直接用鼠标拖动下方预报滚动区
- 平板和触屏设备可直接横向滑动预报内容

## 搜索天气说明

当搜索天气对应的实体城市为空时，表示当前没有可用数据，这是正常状态，不需要手动删除。录入城市后会重新加载。

## 更新说明

### 2026.05.08

1. 重构 `xiaoshi-weather-pad-card` 整体视觉与布局
2. 将每日、小时、分钟预报整合到同一界面切换显示
3. 优化 AQI、生活指数、预警、日出日落与二级详情弹层
4. 优化弹窗、滑块、卡片层级与毛玻璃样式细节
5. 增加桌面端鼠标拖动预报滚动区支持

### 2025.08.08

1. 增加 HA 启动时优先启动“移动应用”，后启动本集成

### 2025.08.02

1. 完善并调整集成逻辑

### 2025.08.02

1. 删除天气预报（预报来源 API 不可访问）
2. 修复更新时间间隔不生效问题

### 2025.07.29

发布初始版本。
