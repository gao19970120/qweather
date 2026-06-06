# 和风天气 for Home Assistant

基于原作者 [xiaoshi930/qweather](https://github.com/xiaoshi930/qweather) 持续维护，并拆分出独立的新天气卡与中转集成。

当前仓库不是单一组件，而是 2 套协同工作的内容：

- `custom_components/qweather`
  - 和风天气主集成
  - 负责请求官方 API、生成原始 weather 实体
  - 已恢复“分钟天气独立更新周期”
- `custom_components/new_weather`
  - 轻量中转集成
  - 负责补回小时预报中的“当前小时”
  - 提供独立前端卡片，不再依赖 `qweather` 内置前端资源

## 当前结构

```text
custom_components/
  qweather/
  new_weather/
```

`qweather` 和 `new_weather` 需要一起使用：

- `qweather` 先产出原始天气实体
- `new_weather` 再基于这个原始实体生成中转实体
- Lovelace 天气卡最终建议绑定 `new_weather` 生成的实体

## 主要能力

### `qweather`

- 和风天气官方 API 数据接入
- 当前天气、每日、小时、分钟、AQI、预警、指数等属性输出
- 分钟天气独立更新周期
- 分钟天气支持以下独立刷新周期：
  - `5分钟`
  - `10分钟`
  - `15分钟`
  - `20分钟`
  - `30分钟`
  - `45分钟`
  - `1小时`

### `new_weather`

- 独立天气卡资源：`/new_weather/new-weather-card.js`
- 独立主卡：
  - `custom:new-weather-pad-card`
- 独立外层概览卡：
  - `custom:new-weather-glance-card`
- 小时预报增强：
  - 当原始 `hourly_forecast` 从下一个小时开始时，自动补回当前小时
- 图标资源独立：
  - 卡片图标从 `/new_weather/icon` 加载
  - 后续 `qweather` 更新不会再覆盖卡片资源

## 安装

### 1. 安装集成

把以下两个目录一起复制到 Home Assistant 的 `custom_components` 目录：

- `custom_components/qweather`
- `custom_components/new_weather`

复制完成后重启 Home Assistant。

### 2. 添加 `qweather`

在 Home Assistant 中先添加 `qweather` 集成，完成 API Key、位置和功能开关配置。

建议启用：

- 小时天气
- 分钟天气
- 天气预警
- 空气质量
- 天气指数

如果要使用分钟天气，请在 `qweather` 的配置或选项里设置 `分钟天气更新周期`。

### 3. 添加 `new_weather`

在 Home Assistant 中再添加 `new_weather` 集成。

需要填写：

- `name`
  - 例如：`new_weather_wo_jia_de_tian_qi`
- `source_entity`
  - 例如：`weather.wo_jia_de_tian_qi`

添加后会生成一个新的 weather 实体，通常形如：

```text
weather.new_weather_wo_jia_de_tian_qi
```

后续 Lovelace 卡片建议统一使用这个中转实体。

## Lovelace 资源

需要在 Lovelace 资源中加入：

```yaml
resources:
  - url: /new_weather/new-weather-card.js?v=1.0.0
    type: module
```

不要再依赖旧的：

```yaml
/qweather/weather-card.js
```

## 卡片使用

### 外层概览卡

```yaml
type: custom:new-weather-glance-card
entity: weather.new_weather_wo_jia_de_tian_qi
sun_entity: sun.sun
weather_icon_type: line
animated_icon: true
show_warning: true
show_no_warning: true
```

### 主弹窗卡

```yaml
type: custom:new-weather-pad-card
entity: weather.new_weather_wo_jia_de_tian_qi
entities:
  - weather.new_weather_wo_jia_de_tian_qi
entity_names:
  - 上海
default_entity_index: 0
```

### 多实体切换

```yaml
type: custom:new-weather-pad-card
entities:
  - weather.new_weather_wo_jia_de_tian_qi
  - weather.new_weather_huai_nan
entity_names:
  - 上海
  - 淮南
default_entity_index: 0
```

## 推荐用法

- 外层入口卡使用 `custom:new-weather-glance-card`
- 详细天气弹窗使用 `custom:new-weather-pad-card`
- 弹窗实体统一绑定 `new_weather` 中转实体
- 原始 `qweather` 实体只作为上游数据源保留

## 迁移说明

如果你之前使用的是：

- `custom:qweather-glance-card`
- `custom:xiaoshi-weather-pad-card`
- `/qweather/weather-card.js`

现在建议迁移为：

- `custom:new-weather-glance-card`
- `custom:new-weather-pad-card`
- `/new_weather/new-weather-card.js`

实体也建议从原始 `weather.xxx` 改为 `new_weather` 生成的中转实体。

## 说明

- 仓库中不包含你的 Lovelace 页面配置文件，例如 `main-ui.yaml`
- 仓库提供的是集成与卡片代码本身
- 实际页面布局、弹窗方式、Dashboard 组织方式，请按你自己的 HA 配置接入

## 数据来源

- [和风天气开发文档](https://dev.qweather.com/docs/)
- [和风天气数据更新时间说明](https://dev.qweather.com/docs/resource/glossary/#update-time)

## 更新记录

### 2026.06.06

- 新增独立 `new_weather` 集成
- 新增独立卡片资源 `new-weather-card.js`
- 新增 `new-weather-pad-card`
- 新增 `new-weather-glance-card`
- 新增小时天气中转逻辑，补回当前小时
- 恢复 `qweather` 的分钟天气独立更新周期

### 2026.05.14

- 发布 `6.1` 版本
- 修正 AQI 面板首要污染物为空时显示为 `无`
- 调整空气质量 `良` 的提示文案为“空气良好，正常出行”

### 2026.05.08

- 重构 `xiaoshi-weather-pad-card` 整体视觉与布局
- 将每日、小时、分钟预报整合到同一界面切换显示
- 优化 AQI、生活指数、预警、日出日落与二级详情弹层
- 优化弹窗、滑块、卡片层级与毛玻璃样式细节
- 增加桌面端鼠标拖动预报滚动区支持
