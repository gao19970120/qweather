# 和风天气 - 官方 API 版

基于原作者 [dscao/qweather](https://github.com/dscao/qweather) 修改，并继续维护。

本仓库同时包含：

- `custom_components/qweather` 集成
- 配套天气前端卡片 `custom_components/qweather/www/weather-card.js`

本次卡片重构只更新前端卡片文件，不改动集成逻辑。

## 官方文档

- [和风天气开发文档](https://dev.qweather.com/docs/)
- [和风天气数据更新时间说明](https://dev.qweather.com/docs/resource/glossary/#update-time)

## 安装

1. 将 `qweather` 文件夹复制到 Home Assistant 配置目录下的 `custom_components` 中。
2. 重启 Home Assistant。
3. 在 Home Assistant 中添加并配置 `qweather` 集成。

## 前端卡片资源

如果你手动管理 Lovelace 资源，请确认已经加载卡片资源：

```yaml
url: /local/qweather-card/qweather-card.js
type: module
```

如果你的环境实际加载的是 `custom_components/qweather/www/weather-card.js` 对应资源路径，请按你的现有部署方式保持一致即可。

## 天气卡片说明

新版 `xiaoshi-weather-pad-card` 采用毛玻璃风格重构，保留并整合了原有主要天气信息：

- 当前天气
- 每日 / 小时 / 分钟预报
- AQI 与污染物数据
- 生活指数
- 日出日落
- 预警详情

支持在同一界面中切换 `每日 / 小时 / 分钟` 预报，也支持配置多个天气实体切换显示。

## 卡片配置示例

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

### 兼容说明

- 未配置 `entities` 时，会回退使用原有 `entity`
- `entity_names` 可选；未设置时默认使用 `friendly_name` 或实体 ID

## 使用建议

- 推荐在弹窗中使用这张卡，以获得完整布局体验
- 桌面端支持鼠标拖动下方预报横向滚动区
- 平板与触屏设备支持原生横向滑动

## 搜索天气说明

搜索天气的实体在城市为空时，表示当前未提供可用数据，这是正常状态，不需要手动删除实体。录入城市后会重新加载。

## 更新说明

### 2026.05.08

1. 重构 `xiaoshi-weather-pad-card` 的整体视觉与布局
2. 将每日、小时、分钟预报整合到同一界面切换显示
3. 优化 AQI、生活指数、预警、日出日落与细节弹窗表现
4. 增加桌面端鼠标拖动预报滚动区支持

### 2025.08.08

1. 增加 HA 启动时，优先启动“移动应用”，后启动本集成

### 2025.08.02

1. 完善并修改集成逻辑

### 2025.08.02

1. 删除天气预报（预报来源 API 不可访问）
2. 修复更新时间间隔不生效问题

### 2025.07.29

发布初始版本。
