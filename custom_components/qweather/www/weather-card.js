console.info("%c 天气卡片 \n%c   v 3.5   ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class XiaoshiWeatherPhoneEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      label {
        font-weight: bold;
      }
      select, input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
      }
      input[type="number"] {
        width: 100px;
      }
      .conditional-field {
        display: none;
      }
      .conditional-field.visible {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .entity-search-container {
        position: relative;
        width: 100%;
      }
      .entity-search-container input {
        width: 100%;
        min-width: 200px;
      }
      datalist {
        max-height: 200px;
        overflow-y: auto;
      }
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="form">
        <div class="form-group">
          <label>天气实体</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.entity || ''}
            name="entity"
          >
            <option value="">选择天气实体</option>
            ${Object.keys(this.hass.states)
              .filter(entityId => entityId.startsWith('weather.'))
              .map(entityId => html`
                <option value="${entityId}" 
                  .selected=${entityId === this.config.entity}>
                  ${this.hass.states[entityId].attributes.friendly_name || entityId} ${this.hass.states[entityId].attributes.friendly_name ? '(' + entityId + ')' : ''}
                </option>
              `)}
          </select>
        </div>
        
        <div class="form-group">
          <label>视觉样式</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.visual_style !== undefined ? this.config.visual_style : 'button'}
            name="visual_style"
          >
            <option value="button">按钮模式</option>
            <option value="dot">圆点模式</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>主题</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.theme !== undefined ? this.config.theme : 'on'}
            name="theme"
          >
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>

        <div class="form-group">
          <label>预报列数</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.columns !== undefined ? this.config.columns : 9}
            name="columns"
          >
            <option value="7">7列</option>
            <option value="8">8列</option>
            <option value="9">9列</option>
            <option value="10">10列</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>图标模式</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.mode !== undefined ? this.config.mode : '家'}
            name="mode"
          >
            <option value="家">家</option>
            <option value="手机定位">手机定位</option>
            <option value="搜索城市">搜索城市</option>
          </select>
        </div>
        
       
        <div class="form-group conditional-field ${this.config.mode === '搜索城市' ? 'visible' : ''}" id="city-entity-group">
          <label>搜索城市text实体</label>
          <div class="entity-search-container">
            <input 
              type="text" 
              .value=${this.config.city_entity || 'text.set_city'}
              @input=${this._onCityEntityInput}
              @change=${this._entityChanged}
              name="city_entity"
              placeholder="搜索城市text实体（如 text.set_city）"
              list="city-entities"
            />
            <datalist id="city-entities">
              ${Object.keys(this.hass.states)
                .filter(entityId => 
                  entityId.startsWith('text.') ||
                  entityId.toLowerCase().includes('city') ||
                  entityId.toLowerCase().includes('城市')
                )
                .map(entityId => html`
                  <option value="${entityId}">
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </datalist>
          </div>
        </div>

        <div class="form-group">
          <label>是否实体替换实时温湿度</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.use_custom_entities !== undefined ? this.config.use_custom_entities : false}
            name="use_custom_entities"
          >
            <option value=false>否（使用天气实体的温湿度）</option>
            <option value=true>是（使用自定义实体）</option>
          </select>
        </div>
        
        <div class="form-group conditional-field ${this.config.use_custom_entities ? 'visible' : ''}" id="temperature-entity-group">
          <label>温度实体</label>
          <div class="entity-search-container">
            <input 
              type="text" 
              .value=${this.config.temperature_entity || ''}
              @input=${this._onTemperatureEntityInput}
              @change=${this._entityChanged}
              name="temperature_entity"
              placeholder="搜索温度实体（如 sensor.temperature）"
              list="temperature-entities"
            />
            <datalist id="temperature-entities">
              ${Object.keys(this.hass.states)
                .filter(entityId => 
                  this.hass.states[entityId].attributes?.unit_of_measurement === '°C' ||
                  this.hass.states[entityId].attributes?.device_class === 'temperature' ||
                  entityId.toLowerCase().includes('temp')
                )
                .map(entityId => html`
                  <option value="${entityId}">
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </datalist>
          </div>
        </div>
        
        <div class="form-group conditional-field ${this.config.use_custom_entities ? 'visible' : ''}" id="humidity-entity-group">
          <label>湿度实体</label>
          <div class="entity-search-container">
            <input 
              type="text" 
              .value=${this.config.humidity_entity || ''}
              @input=${this._onHumidityEntityInput}
              @change=${this._entityChanged}
              name="humidity_entity"
              placeholder="搜索湿度实体（如 sensor.humidity）"
              list="humidity-entities"
            />
            <datalist id="humidity-entities">
              ${Object.keys(this.hass.states)
                .filter(entityId => 
                  this.hass.states[entityId].attributes?.unit_of_measurement === '%' ||
                  this.hass.states[entityId].attributes?.device_class === 'humidity' ||
                  entityId.toLowerCase().includes('humid')
                )
                .map(entityId => html`
                  <option value="${entityId}">
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </datalist>
          </div>
        </div>
         
      </div>
    `;
  }

  _entityChanged(e) {
    const { name, value } = e.target;
    if (!value && name !== 'theme' && name !== 'mode' && name !== 'columns' && name !== 'use_custom_entities' && name !== 'temperature_entity' && name !== 'humidity_entity' && name !== 'city_entity' && name !== 'visual_style') return;

    let processedValue = value;
    if (name === 'columns' ) {
      processedValue = parseInt(value);
    } else if (name === 'use_custom_entities') {
      processedValue = value === 'true';
    }
    
    this.config = {
      ...this.config,
      [name]: processedValue
    };

    // 处理条件字段的显示/隐藏
    if (name === 'use_custom_entities' || name === 'mode') {
      this._updateConditionalFields();
    }

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  } 

  _updateConditionalFields() {
    // 更新条件字段的显示状态
    const useCustomEntities = this.config.use_custom_entities;
    const mode = this.config.mode;
    
    // 获取条件字段元素
    const tempGroup = this.shadowRoot?.getElementById('temperature-entity-group');
    const humidityGroup = this.shadowRoot?.getElementById('humidity-entity-group');
    const cityGroup = this.shadowRoot?.getElementById('city-entity-group');
    
    if (tempGroup) {
      if (useCustomEntities) {
        tempGroup.classList.add('visible');
      } else {
        tempGroup.classList.remove('visible');
        // 如果禁用，清空配置
        delete this.config.temperature_entity;
      }
    }
    
    if (humidityGroup) {
      if (useCustomEntities) {
        humidityGroup.classList.add('visible');
      } else {
        humidityGroup.classList.remove('visible');
        // 如果禁用，清空配置
        delete this.config.humidity_entity;
      }
    }
    
    if (cityGroup) {
      if (mode === '搜索城市') {
        cityGroup.classList.add('visible');
      } else {
        cityGroup.classList.remove('visible');
        // 如果不是搜索城市模式，清空配置
        delete this.config.city_entity;
      }
    }
  }

  _onTemperatureEntityInput(e) {
    // 实时更新配置值，但不触发配置更改事件
    this.config = {
      ...this.config,
      temperature_entity: e.target.value
    };
  }

  _onHumidityEntityInput(e) {
    // 实时更新配置值，但不触发配置更改事件
    this.config = {
      ...this.config,
      humidity_entity: e.target.value
    };
  }

  _onCityEntityInput(e) {
    // 实时更新配置值，但不触发配置更改事件
    this.config = {
      ...this.config,
      city_entity: e.target.value
    };
  }

  setConfig(config) {
    this.config = config;
    // 在配置设置后更新条件字段
    setTimeout(() => {
      this._updateConditionalFields();
    }, 0);
  }
}
customElements.define('xiaoshi-weather-phone-editor', XiaoshiWeatherPhoneEditor);

class XiaoshiWeatherPhoneCard extends LitElement {
  // 温度计算常量
  static get TEMPERATURE_CONSTANTS() {
    return {
      BUTTON_HEIGHT_VW: 3.4,        // 温度矩形高度（vw）
      CONTAINER_HEIGHT_VW: 21,       // 温度容器总高度（vw）
      FORECAST_COLUMNS: 9,          // 预报列数
    };
  }

  // 图标路径常量 - 方便调试修改
  static get ICON_PATH() {
    return '/qweather/icon';
  }

  static getConfigElement() {
    return document.createElement("xiaoshi-weather-phone-editor");
  }

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      city_entity: { type: Object },
      entity: { type: Object },
      mode: { type: String },
      forecastMode: { type: String }, // 'daily' 或 'hourly'
      showWarningDetails: { type: Boolean }, // 是否显示预警详情
      showApiInfo: { type: Boolean }, // 是否显示空气质量详情
      showIndicesDetails: { type: Boolean } // 是否显示天气指数详情
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        background: transparent;
        --ha-card-background: transparent;
        --mdc-theme-surface: transparent;
      }

      /*主卡片样式*/
      .weather-card {
        position: relative;
        border-radius: 3vw;
        padding: 1.6vw;
        padding-bottom: 0.6vw;
        font-family: sans-serif;
        overflow: hidden;
      }

      /*主卡片样式*/
      .weather-card.dark-theme {
      }

      .main-content {
        position: relative;
      }

      /*天气头部*/
      .weather-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 0px;
        margin-bottom: 0px;
      }

      .weather-left {
        display: flex;
        align-items: center;
      }

      /*天气头部 图标*/
      .weather-icon {
        width: 10vw;
        height: 10vw;
        margin-right: 16px;
        margin-bottom: 0px;
      }

      /*天气头部 图标*/
      .weather-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /*天气头部 温度*/
      .weather-temperature {
        height: 7vw;
        font-size: 5vw;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0;
      }

      /*天气头部 天气信息*/
      .weather-info {
        height: 3vw;
        font-size: 3vw;
        margin-top: -1vw;
        white-space: nowrap;
      }

      /*天气头部 城市信息*/
      .city-info {
        text-align: right;
        margin-top: 0.5vw;
        font-size: 4vw;
        font-weight: bold;
        white-space: nowrap;
      }

      /*天气右侧容器*/
      .weather-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .toggle-btn {
        padding: 0.6vw 2vw;
        border: none;
        border-radius: 1.2vw;
        font-size: 1.8vw;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-weight: bold;
      }


      .toggle-btn.daily-mode {
        background: #03A9F4; /* 蓝色 */
      }

      .toggle-btn.hourly-mode {
        background: #9C27B0; /* 紫色 */
      }

      .toggle-btn.minutely-mode {
        background: #4CAF50; /* 绿色 */
      }

      /*小时天气温度样式*/
      .temp-curve-hourly {
        position: absolute;
        left: 0;
        right: 0;
        height: 3.5vw;
        background: linear-gradient(to bottom, 
          rgba(156, 39, 176) 0%, 
          rgba(103, 58, 183) 100%);
        border-radius: 0.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2vw;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      /*分钟天气温度样式（绿色）*/
      .temp-curve-minutely {
        position: absolute;
        left: 0;
        right: 0;
        height: 3.5vw;
        background: linear-gradient(to bottom, 
          rgba(76, 175, 80) 0%, 
          rgba(56, 142, 60) 100%);
        border-radius: 0.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2vw;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      /*9日天气部分*/
      .forecast-container {
        display: grid;
        gap: 0.4vw;
        margin-top: 2vw;
        position: relative;
      }

      /*小时天气滑动容器*/
      .hourly-forecast-scroll-container {
        overflow-x: auto;
        overflow-y: hidden;
        margin-top: 2vw;
        position: relative;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
      }

      .hourly-forecast-scroll-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }

      /*启用触摸滑动和平滑滚动*/
      .hourly-forecast-scroll-container {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x;
        cursor: grab;
      }

      .hourly-forecast-scroll-container:active {
        cursor: grabbing;
      }

      /*小时天气内容容器*/
      .hourly-forecast-container {
        display: grid;
        gap: 0.4vw;
        position: relative;
        min-width: max-content;
      }

      /*9日天气部分*/
      .forecast-day {
        grid-row: 1;
        text-align: center;
        position: relative;
        border-radius: 8px;
        padding: 1vw;
        position: relative;
      }

      /*9日天气部分 星期*/
      .forecast-weekday {
        font-size: 2.2vw;
        height: 2.8vw;
        margin-top: -1vw;
        margin-bottom: 0.2vw;
        font-weight: 500;
        white-space: nowrap;
      }
      
      /*9日天气部分 日期*/
      .forecast-date {
        font-size: 1.6vw;
        margin-bottom: 3vw;
        margin-left: 0vw;
        margin-right: 0vw;
        height: 2vw;
        white-space: nowrap;
      }

      /*9日天气部分 温度区域*/
      .forecast-temp-container {
        position: relative;
        height: 21vw;
        margin-top: 0;
        margin-bottom: 0;
        white-space: nowrap;
      }

      /*9日天气部分 温度区域*/
      .forecast-temp-null {
        position: relative;
        height: 2vw;
      }

      /*9日天气部分 雨量容器*/
      .forecast-rainfall-container {
        text-align: center;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 2.5vw;
        margin-top: -2vw;
        margin-bottom: 0;
      }
 
      /*雨量填充矩形*/
      .rainfall-fill {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(80, 177, 200, 0.8);
        border-radius: 1.2vw;
        margin: 0 -1vw;
        bottom: -3vw;
        transition: all 0.3s ease;
        z-index: 1;
      }

      /*9日天气部分 雨量标签*/
      .forecast-rainfall {
        background: rgba(80, 177, 200);
        color: white;
        font-size: 1.4vw;
        font-weight: bold;
        height: 2.5vw;
        min-width: 80% ;
        border-radius: 1.2vw;
        width: fit-content;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        padding: 0 0.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }

      /*9日天气部分 图标*/
      .forecast-icon-container {
        text-align: center;
        position: relative;
      }

      /*9日天气部分 图标*/
      .forecast-icon {
        width: 5vw;
        height: 5vw;
        margin: 0px auto;
        margin-top: 0;
      }

      /*9日天气部分 图标*/
      .forecast-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /*9日天气部分 风速*/
      .forecast-wind-container {
        grid-row: 4;
        text-align: center;
        position: relative;
        height: 3vw;
        margin-top: -1vw;
      }

      /*9日天气部分 风速*/
      .forecast-wind {
        font-size: 2vw;
        margin-top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5px;
        height: 3vw;
      }

      /*9日天气部分 风速*/
      .wind-direction {
        font-size: 1.8vw;
      }

      /*9日天气部分 温度曲线 Canvas*/
      .temp-line-canvas {
        position: absolute;
        left: 0;
        width: 100%;
        pointer-events: none;
        z-index: 100;
      }

      .temp-line-canvas-high {
        top: 7.7vw;
        height: 21vw; 
      }

      .temp-line-canvas-low {
        top: 7.7vw;
        height: 21vw; 
      }

      .temp-curve-high {
        position: absolute;
        left: 0;
        right: 0;
        height: 3.5vw;
        border-radius: 0.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2.2vw;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      .temp-curve-low {
        position: absolute;
        left: 0;
        right: 0;
        height: 3.5vw;
        border-radius: 0.5vw;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2.2vw;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      /* 圆点模式样式 */
      .dot-mode .temp-curve-high,
      .dot-mode .temp-curve-low,
      .dot-mode .temp-curve-hourly,
      .dot-mode .temp-curve-minutely {
        width: 1vw;
        height: 1vw;
        border-radius: 50%;
        left: calc(50% - 0.5vw);
        margin-top: -0.65vw;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2vw;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .dot-mode .temp-curve-high {
        background: rgba(255, 87, 34);
        z-index: 3;
      }

      .dot-mode .temp-curve-low {
        background: rgba(3, 169, 243);
        z-index: 4;
      }

      .dot-mode .temp-curve-hourly {
        background: rgba(156, 39, 176);
      }

      .dot-mode .temp-curve-minutely {
        background: rgba(76, 175, 80);
      }

      /* 圆点上方的温度文字 */
      .dot-mode .temp-text {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2.2vw;
        font-weight: 600;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(123, 123, 123, 0.3);
        margin-left: 0.4vw;
      }

      .dot-mode .temp-curve-high .temp-text {
        color: rgba(255, 87, 34);
        top: -3.8vw;
      }

      .dot-mode .temp-curve-low .temp-text {
        color: rgba(3, 169, 243);
        top: 0vw;
      }
      .dot-mode .temp-curve-hourly .temp-text {
        color: rgba(193, 65, 215, 1);
        top: -3.8vw;
      }

      .dot-mode .temp-curve-minutely .temp-text {
        color: rgba(76, 175, 80, 1);
        top: -3.8vw;
      }

      .unavailable {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 0;
        min-height: 0;
        max-height: 0;
        margin: 0;
        padding: 0;
      }

      /*预警图标和文字样式*/
      .warning-icon-text {
        color: #FFA726;
        height: 7vw;
        font-size: 4vw;
        font-weight: bold;
        margin-left: 3vw;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .warning-icon-text:hover {
        transform: scale(1.1);
      }

      /*预警详情卡片样式*/
      .warning-details-card {
        position: relative;
        border-radius: 2vw;
        margin-top: 1vw;
        padding: 2vw;
        color: white;
        overflow: hidden;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /*预警标题样式*/
      .warning-title-line {
        font-size: 2.5vw;
        font-weight: bold;
        white-space: nowrap;
        height: 4vw;
        margin-bottom: 0.5vw;
      }

      /*预警文本滚动容器*/
      .warning-text-container1 {
        display: flex;
        width: 97%;
        font-size: 2.2vw;
        line-height: 3vw;
        align-items: center;
        margin: 0.5vw 2vw;
      }

      /*预警文本滚动内容*/
      .warning-text-scroll1 {
        padding-left: 100%;
      }

      /*预警文本滚动容器*/
      .warning-text-container {
        display: flex;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        height: 3vw;
        font-size: 2.5vw;
        align-items: center;
        margin-bottom: 1vw;
      }

      /*预警文本滚动内容*/
      .warning-text-scroll {
        display: inline-block;
        padding-left: 100%;
        animation: scroll linear infinite;
      }

      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }

      .update-time { 
        display: flex;
        align-items: flex-end;
        justify-content: start;
        margin-bottom: 1vw;
        margin-top: 2vw;
        margin-left: 1vw;
        font-size: 2vw;
        height: 2vw;
      }

      /*空气质量按钮样式*/
      .toggle-btn-api {
        background: transparent;
        padding: 0;
        border: none;
        font-size: 3vw;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-left: 1vw;
      }

      /*空气质量详情卡片样式*/
      .aqi-details-card {
        position: relative;
        border-radius: 2vw;
        margin-top: 1vw;
        padding: 2vw;
        overflow: hidden;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
        animation: slideDown 0.3s ease-out;
      }

      /*天气指数详情卡片样式*/
      .indices-details-card {
        position: relative;
        border-radius: 2vw;
        margin-top: 1vw;
        padding: 2vw;
        overflow: hidden;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
        animation: slideDown 0.3s ease-out;
      }
      .input-container {
        display: flex;
        align-items: center;
        padding: 0;
        height: 100%;
        transition: all 0.3s ease;
      } 
      .input-container.on {
        background-color: rgb(255,255,255);
        color: black;
      }
      .input-container.off {
        background-color: rgb(50,50,50);
        color: white;
      }
      .icon {
        margin-right: 0.5rem;
        font-size: 1.2rem;
        margin-left: 0.5rem;
      }
      .input-wrapper {
        flex-grow: 1;
        position: relative;
      }
      input {
        width: 100%;
        border: none;
        background: transparent;
        color: inherit;
        font-size: 1rem;
        padding: 0.5rem 0;
        outline: none;
      }
      .placeholder {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        color: gray;
        pointer-events: none;
        transition: all 0.2s ease;
        font-size: 0.9rem;
        opacity: 1;
      }
      input:focus + .placeholder,
      input:not(:placeholder-shown) + .placeholder,
      .placeholder.hidden {
        top: 0;
        transform: translateY(0);
        font-size: 0.7rem;
        opacity: 0;
      }

      .input-gap {
        height: 8px;
        minheight: 8px;
      }

    `;
  }

  constructor() {
    super();
    this.mode = '家';
    this.city_entity ='text.set_city';
    this.forecastMode = 'daily'; // 默认显示每日天气
    this._forecastToggleState = 0; // 0: daily, 1: hourly, 2: minutely
    this.showWarningDetails = false;
    this.showApiInfo = false;
    this.showIndicesDetails = false;
    this.warningTimer = null;
    this.apiTimer = null;
    this.indicesTimer = null;
    this._value = '';
    this._isEditing = false;
    this._pendingSave = false;
    this._hourlyModalMode = 'hourly';
  }
  
  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string') {
          // 处理Home Assistant模板语法 [[[ return theme() ]]]
          if (this.config.theme.includes('[[[') && this.config.theme.includes(']]]')) {
              // 提取模板中的JavaScript代码
              const match = this.config.theme.match(/\[\[\[\s*(.*?)\s*\]\]\]/);
              if (match && match[1]) {
                  const code = match[1].trim();
                  // 如果代码以return开头，直接执行
                  if (code.startsWith('return')) {
                      return (new Function(code))();
                  }
                  // 否则包装在return中执行
                  return (new Function(`return ${code}`))();
              }
          }
          // 处理直接的JavaScript函数字符串
          if (this.config.theme.includes('return') || this.config.theme.includes('=>')) {
              return (new Function(`return ${this.config.theme}`))();
          }
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._updateEntities();
    }
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this.entity = this.hass.states[this.config.entity];
    this.mode = this.config.mode || 'home';
    this.city_entity =  this.hass.states[this.config.city_entity] || 'text.set_city';
  }

  _getWeatherIcon(condition) {
    const sunState = this.hass?.states['sun.sun']?.state || 'above_horizon';
    const theme = this._evaluateTheme();
    const isDark = theme === 'on';
    const iconPath = XiaoshiWeatherPhoneCard.ICON_PATH;
    
    const iconMap = {
      '晴': isDark ? 
        (sunState === 'above_horizon' ? `${iconPath}/晴-白天-暗黑.svg` : `${iconPath}/晴-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/晴-白天.svg` : `${iconPath}/晴-夜晚.svg`),
      '少云': isDark ?
        (sunState === 'above_horizon' ? `${iconPath}/少云-白天-暗黑.svg` : `${iconPath}/少云-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/少云-白天.svg` : `${iconPath}/少云-夜晚.svg`),
      '多云': isDark ?
        (sunState === 'above_horizon' ? `${iconPath}/多云-白天-暗黑.svg` : `${iconPath}/多云-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/多云-白天.svg` : `${iconPath}/多云-夜晚.svg`),
      '阴': isDark ? `${iconPath}/阴-暗黑.svg` : `${iconPath}/阴.svg`,
      '雨夹雪': isDark ? `${iconPath}/雨夹雪-暗黑.svg` : `${iconPath}/雨夹雪.svg`,
      '小雨': isDark ? `${iconPath}/小雨-暗黑.svg` : `${iconPath}/小雨.svg`,
      '小雪': isDark ? `${iconPath}/小雪-暗黑.svg` : `${iconPath}/小雪.svg`,
      'clear-night': isDark ? `${iconPath}/晴-夜晚-暗黑.svg` : `${iconPath}/晴-夜晚.svg`,
      'cloudy': isDark ? `${iconPath}/多云-暗黑.svg` : `${iconPath}/多云.svg`,
      'partlycloudy': isDark ? `${iconPath}/少云-暗黑.svg` : `${iconPath}/少云.svg`,
      'sunny': isDark ? `${iconPath}/晴-白天-暗黑.svg` : `${iconPath}/晴-白天.svg`,
      'rainy': isDark ? `${iconPath}/小雨-暗黑.svg` : `${iconPath}/小雨.svg`,
      'snowy': isDark ? `${iconPath}/小雪-暗黑.svg` : `${iconPath}/小雪.svg`,
      'snowy-rainy': isDark ? `${iconPath}/雨夹雪-暗黑.svg` : `${iconPath}/雨夹雪.svg`
    };

    return iconMap[condition] || (isDark ? `${iconPath}/${condition}-暗黑.svg` : `${iconPath}/${condition}.svg`);
  }

  _formatTemperature(temp) {
    if (temp === undefined || temp === null) return '--';
    return temp.toString().includes('.') ? temp : temp;
  }

  _formatDateToBeijing(datetime) {
    try {
      const d = new Date(datetime);
      const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(d);
      const get = (t) => parts.find(p => p.type === t)?.value || '';
      return `${get('year')}-${get('month')}-${get('day')}`;
    } catch {
      return datetime ? datetime.slice(0, 10) : '';
    }
  }

  _getCityIcon() {
    const icons = {
      '家': '🏠',
      '搜索城市': '🔍',
      '手机定位': '📍'
    };
    return icons[this.mode] || '🏠';
  }

  _getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    // 如果传入的是字符串且格式为 YYYY-MM-DD，手动解析以避免时区问题
    let targetDate;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [y, m, d] = date.split('-').map(Number);
        targetDate = new Date(y, m - 1, d);
    } else {
        // 兼容 Date 对象或非标准字符串
        const d = new Date(date);
        targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // 计算日期差（毫秒）
    const diffTime = targetDate - todayDate;
    // 使用 Math.round 避免浮点数精度问题
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // 根据日期差返回相应的文本
    if (diffDays === -2) {
      return '前天';
    } else if (diffDays === -1) {
      return '昨天';
    } else if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '明天';
    } else if (diffDays === 2) {
      return '后天';
    }  else {
      // 其他日期返回星期几
      return weekdays[targetDate.getDay()];
    }
  }

  _getForecastDays() {
    const columns = this.config?.columns || XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS.FORECAST_COLUMNS;
    if (!this.entity?.attributes?.daily_forecast) return [];
    return this.entity.attributes.daily_forecast.slice(0, columns);
  }

  _getHourlyForecast() {
    if (!this.entity?.attributes?.hourly_forecast) return [];
    return this.entity.attributes.hourly_forecast.slice(0, 24);
  }

  _getMinutelyForecast() {
    if (!this.entity?.attributes?.minutely_forecast) return [];
    return this.entity.attributes.minutely_forecast.slice(0, 24);
  }

  _toggleForecastMode() {
    // 检查是否有分钟天气数据
    const enableMinutelyForecast = this.entity?.attributes?.minutely_forecast && this.entity.attributes.minutely_forecast.length > 0;
    
    if (enableMinutelyForecast) {
      // 有分钟天气数据: daily -> hourly -> minutely -> daily (3种模式循环)
      this._forecastToggleState = (this._forecastToggleState + 1) % 3;
      
      switch(this._forecastToggleState) {
        case 0:
          this.forecastMode = 'daily';
          break;
        case 1:
          this.forecastMode = 'hourly';
          break;
        case 2:
          this.forecastMode = 'minutely';
          break;
      }
    } else {
      // 没有分钟天气数据: daily -> hourly -> daily (2种模式循环)
      this._forecastToggleState = (this._forecastToggleState + 1) % 2;
      
      switch(this._forecastToggleState) {
        case 0:
          this.forecastMode = 'daily';
          break;
        case 1:
          this.forecastMode = 'hourly';
          break;
      }
    }
    this.requestUpdate();
  }

  _toggleHourlyModalMode() {
    const enableMinutelyForecast = this.entity?.attributes?.minutely_forecast && this.entity.attributes.minutely_forecast.length > 0;
    if (enableMinutelyForecast) {
        this._hourlyModalMode = this._hourlyModalMode === 'hourly' ? 'minutely' : 'hourly';
        this.requestUpdate();
    }
  }

  _formatMinutelyTime(datetime) {
    const date = new Date(datetime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  _formatMinutelyDate(datetime) {
    const date = new Date(datetime);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}月${day}日`;
  }

  _toggleWarningDetails() {
    if (this.showWarningDetails ) {
      // 如果当前显示，则隐藏并清除定时器
      this._hideWarningDetails();
    } else {
      // 如果当前隐藏，则显示并设置20秒定时器
      this.showWarningDetails = true;
      this.requestUpdate();
      
      // 清除之前的定时器
      if (this.warningTimer) {
        clearTimeout(this.warningTimer);
      }
      
      // 设置20秒后自动隐藏
      this.warningTimer = setTimeout(() => {
        this._hideWarningDetails();
      }, 20000);
    }

  }

  _hideWarningDetails() {
    this.showWarningDetails = false;
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    this.requestUpdate();
  }

  _toggleApiInfo() {
    if (this.showApiInfo ) {
      // 如果当前显示，则隐藏并清除定时器
      this._hideApiDetails();
    } else {
      // 如果当前隐藏，则显示并设置20秒定时器
      this.showApiInfo = true;
      this.requestUpdate();
      
      // 清除之前的定时器
      if (this.apiTimer) {
        clearTimeout(this.apiTimer);
      }
      
      // 设置20秒后自动隐藏
      this.apiTimer = setTimeout(() => {
        this._hideApiDetails();
      }, 20000);
    }
  }

  _hideApiDetails() {
    this.showApiInfo = false;
    if (this.apiTimer) {
      clearTimeout(this.apiTimer);
      this.apiTimer = null;
    }
    this.requestUpdate();
  }

  _toggleIndicesDetails() {
    if (this.showIndicesDetails ) {
      // 如果当前显示，则隐藏并清除定时器
      this._hideIndicesDetails();
    } else {
      // 如果当前隐藏，则显示并设置20秒定时器
      this.showIndicesDetails = true;
      this.requestUpdate();
      
      // 清除之前的定时器
      if (this.indicesTimer) {
        clearTimeout(this.indicesTimer);
      }
      
      // 设置20秒后自动隐藏
      this.indicesTimer = setTimeout(() => {
        this._hideIndicesDetails();
      }, 20000);
    }
  }

  _hideIndicesDetails() {
    this.showIndicesDetails = false;
    if (this.indicesTimer) {
      clearTimeout(this.indicesTimer);
      this.indicesTimer = null;
    }
    this.requestUpdate();
  }

  _formatHourlyTime(datetime) {
    const date = new Date(datetime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  _formatHourlyDate(datetime) {
    const date = new Date(datetime);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}月${day}日`;
  }


  _getCustomTemperature() {
    if (!this.config?.use_custom_entities || !this.config?.temperature_entity || !this.hass?.states[this.config.temperature_entity]) {
      return null;
    }
    
    const temp = this.hass.states[this.config.temperature_entity].state;
    const tempValue = parseFloat(temp);
    
    if (isNaN(tempValue)) {
      return null;
    }
    
    // 保留1位小数
    return tempValue.toFixed(1);
  }

  _getCustomHumidity() {
    if (!this.config?.use_custom_entities || !this.config?.humidity_entity || !this.hass?.states[this.config.humidity_entity]) {
      return null;
    }
    
    const humidity = this.hass.states[this.config.humidity_entity].state;
    const humidityValue = parseFloat(humidity);
    
    if (isNaN(humidityValue)) {
      return null;
    }
    
    // 保留1位小数
    return humidityValue.toFixed(1);
  }

  _formatSunTime(datetime) {
    if (!datetime) return '';
    
    try {
      const date = new Date(datetime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.warn('时间格式化错误:', error);
      return datetime;
    }
  }

  _getTemperatureExtremes() {
    let temperatures = [];
    
    if (this.forecastMode === 'daily') {
      const forecastDays = this._getForecastDays();
      if (forecastDays.length === 0) {
        return { minTemp: 0, maxTemp: 0, range: 0 };
      }
      temperatures = forecastDays.flatMap(day => [
        parseFloat(day.native_temp_low) || 0,
        parseFloat(day.native_temperature) || 0
      ]);
    } else {
      const hourlyForecast = this._getHourlyForecast();
      if (hourlyForecast.length === 0) {
        return { minTemp: 0, maxTemp: 0, range: 0 };
      }
      temperatures = hourlyForecast.map(hour => parseFloat(hour.native_temperature) || 0);
    }

    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const range = maxTemp - minTemp;
    
    // 检查是否所有温度都相等
    const allEqual = temperatures.every(temp => temp === temperatures[0]);
    
    return { minTemp, maxTemp, range, allEqual };
  }

  _calculateTemperatureBounds(day, extremes) {
    const { minTemp, maxTemp, range } = extremes;
    const highTemp = parseFloat(day.native_temperature) || 0;
    const lowTemp = parseFloat(day.native_temp_low) || 0;
    
    // 使用常量
    const { BUTTON_HEIGHT_VW, CONTAINER_HEIGHT_VW } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
    
    // 最终分配的区间高度
    const availableHeight = CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW;
    
    if (range === 0) {
      return { highTop: 2, lowTop: 10 }; // 默认位置
    }
    
    // 每个温度值对应top位置 = (max-当前温度值) * availableHeight / range
    const unitPosition = availableHeight / range;
    
    // 高温矩形的上边界位置（温度越高，top值越小）
    const highTop = (maxTemp - highTemp) * unitPosition;
    
    // 低温矩形的上边界位置（温度越低，top值越大）
    const lowTop = availableHeight - (lowTemp - minTemp) * unitPosition;
    
    const finalHighTop = Math.max(0, Math.min(highTop, CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW));
    const finalLowTop = Math.max(0, Math.min(lowTop, CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW));
    
    return { 
      highTop: finalHighTop, 
      lowTop: finalLowTop
    };
  } 

  _generateTemperatureLine(forecastData, extremes, isHigh = true) {
    if (forecastData.length === 0) return { points: [], curveHeight: 0, curveTop: 0 };
    
    const { BUTTON_HEIGHT_VW, FORECAST_COLUMNS } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
    
    // 动态计算实际列数
    const actualColumns = this.forecastMode === 'daily' ? 
      (this.config?.columns || FORECAST_COLUMNS) : 
      forecastData.length;
    
    let boundsList;
    if (this.forecastMode === 'daily') {
      // 每日天气使用现有的计算方法
      boundsList = forecastData.map(day => this._calculateTemperatureBounds(day, extremes));
    } else {
      // 小时天气只需要一个温度，简化计算
      const { minTemp, maxTemp, range, allEqual } = extremes;
      const { BUTTON_HEIGHT_VW, CONTAINER_HEIGHT_VW } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
      const availableHeight = CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW;
      
      // 如果所有温度相等，将位置设置在中间
      if (allEqual) {
        const middlePosition = (CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW) / 2;
        boundsList = forecastData.map(() => ({
          highTop: middlePosition,
          lowTop: middlePosition
        }));
      } else {
        const unitPosition = range === 0 ? 0 : availableHeight / range;
        boundsList = forecastData.map(hour => {
          const temp = parseFloat(hour.native_temperature) || 0;
          const topPosition = (maxTemp - temp) * unitPosition;
          return { highTop: topPosition, lowTop: topPosition };
        });
      }
    }
    
    // 计算曲线范围
    let curveTop, curveBottom, curveHeight;
    
    if (this.forecastMode === 'daily') {
      if (isHigh) {
        const highTops = boundsList.map(bounds => bounds.highTop);
        curveTop = Math.min(...highTops);
        curveBottom = Math.max(...highTops) + BUTTON_HEIGHT_VW;
        curveHeight = curveBottom - curveTop;
      } else {
        const lowTops = boundsList.map(bounds => bounds.lowTop);
        curveTop = 0;
        curveBottom = Math.max(...lowTops) + BUTTON_HEIGHT_VW;
        curveHeight = curveBottom - curveTop;
      }
    } else {
      // 小时天气模式
      const tops = boundsList.map(bounds => bounds.highTop);
      const { allEqual } = extremes;
      
      if (allEqual) {
        // 如果所有温度相等，将曲线设置在中间位置，高度为按钮高度
        curveTop = 0; // 所有点都在同一个位置
        curveBottom = curveTop + BUTTON_HEIGHT_VW;
        curveHeight = BUTTON_HEIGHT_VW;
      } else {
        curveTop = Math.min(...tops);
        curveBottom = Math.max(...tops) + BUTTON_HEIGHT_VW;
        curveHeight = curveBottom - curveTop;
      }
    }
    
    const points = forecastData.map((data, index) => {
      const bounds = boundsList[index];
      const topPosition = this.forecastMode === 'daily' ? 
        (isHigh ? bounds.highTop : bounds.lowTop) : 
        bounds.highTop;
      
      // 计算相对于曲线顶部的Y坐标（vw单位），使用矩形中心
      const y = topPosition - curveTop + BUTTON_HEIGHT_VW / 1.7;
      
      // 计算X坐标（百分比）
      const x = (index * 100) / actualColumns + (100 / actualColumns) / 2;
      
      return { x, y };
    });
    
    return { points, curveHeight, curveTop };
  }

  _getInstanceId() {
    if (!this._instanceId) {
      this._instanceId = Math.random().toString(36).substr(2, 9);
    }
    return this._instanceId;
  }

  _generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  _drawTemperatureCurve(canvasId, points, color) {
    
    requestAnimationFrame(() => {
      // 先在shadow DOM中查找，再在document中查找
      let canvas = this.shadowRoot?.getElementById(canvasId) || document.getElementById(canvasId);
      
      if (!canvas) {
        // 通过类名查找
        const className = canvasId.includes('high') ? 'temp-line-canvas-high' : 'temp-line-canvas-low';
        canvas = this.shadowRoot?.querySelector(`.${className}`) || document.querySelector(`.${className}`);
      }
      
      if (!canvas) {
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      // 设置Canvas实际尺寸
      canvas.width = rect.width *3;
      canvas.height = rect.height *3;
      
      if (points.length < 2) {
        return;
      }
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 设置线条样式
      ctx.strokeStyle = color;
      ctx.lineWidth = 6; // 固定线宽
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 开始绘制路径
      ctx.beginPath();
      
      const { CONTAINER_HEIGHT_VW } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
      
      // 转换所有点为Canvas坐标
      const canvasPoints = points.map((point, index) => {
        const x = (point.x / 100) * canvas.width;
        const y = (point.y / CONTAINER_HEIGHT_VW) * canvas.height;
        return { x, y };
      });
      
      if (canvasPoints.length < 2) {
        // 如果只有两个点，直接画直线
        if (canvasPoints.length === 2) {
          ctx.beginPath();
          ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
          ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
          ctx.stroke();
        }
        return;
      }
      
      // 开始绘制平滑曲线，确保通过所有原始点
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      
      // 使用更保守的样条算法，减少曲线过度弯曲
      const tension = 0.2; // 减小张力系数，避免过度弯曲
      
      for (let i = 0; i < canvasPoints.length - 1; i++) {
        const p0 = canvasPoints[Math.max(0, i - 1)];
        const p1 = canvasPoints[i];
        const p2 = canvasPoints[i + 1];
        const p3 = canvasPoints[Math.min(canvasPoints.length - 1, i + 2)];
        
        // 计算控制点，限制控制点距离，避免过度弯曲
        const dx1 = (p2.x - p0.x) * tension;
        const dy1 = (p2.y - p0.y) * tension;
        const dx2 = (p3.x - p1.x) * tension;
        const dy2 = (p3.y - p1.y) * tension;
        
        // 限制控制点的垂直距离，防止曲线超出边界
        const maxControlDistance = Math.abs(p2.x - p1.x) * 0.3;
        const limitedDy1 = Math.max(-maxControlDistance, Math.min(maxControlDistance, dy1));
        const limitedDy2 = Math.max(-maxControlDistance, Math.min(maxControlDistance, dy2));
        
        const cp1x = p1.x + dx1;
        const cp1y = p1.y + limitedDy1;
        const cp2x = p2.x - dx2;
        const cp2y = p2.y - limitedDy2;
        
        // 如果是第一段，使用二次贝塞尔
        if (i === 0) {
          ctx.quadraticCurveTo(cp1x, cp1y, p2.x, p2.y);
        } else {
          // 使用三次贝塞尔曲线，确保通过原始点
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
      }
      
      ctx.stroke();
    });
  }

  _getWarningColorForLevel(level) {
    if (level == "红色") return "rgb(255,50,50)";
    if (level == "橙色") return "rgb(255,100,0)";
    if (level == "黄色") return "rgb(255,200,0)";
    if (level == "蓝色") return "rgb(50,150,200)";
    
    return "#FFA726"; // 默认颜色
  }

  _getWarningColor(warning) {
    if (!warning || warning.length === 0) return "#FFA726"; // 默认颜色
    
    let level = "";
    const priority = ["红色", "橙色", "黄色", "蓝色"];
    
    for (let i = 0; i < warning.length; i++) {
      const currentLevel = warning[i].level;
      if (priority.indexOf(currentLevel) < priority.indexOf(level) || level == "") {
        level = currentLevel;
      }
    }
    
    if (level == "红色") return "rgb(255,50,50)";
    if (level == "橙色") return "rgb(255,100,0)";
    if (level == "黄色") return "rgb(255,200,0)";
    if (level == "蓝色") return "rgb(50,150,200)";
    
    return "#FFA726"; // 默认颜色
  }

  _getWindDirectionIcon(bearing) {
    const directions = [
      { range: [337.5, 360], icon: '↑' },
      { range: [0, 22.5], icon: '↑' },
      { range: [22.5, 67.5], icon: '↗' },
      { range: [67.5, 112.5], icon: '→' },
      { range: [112.5, 157.5], icon: '↘' },
      { range: [157.5, 202.5], icon: '↓' },
      { range: [202.5, 247.5], icon: '↙' },
      { range: [247.5, 292.5], icon: '←' },
      { range: [292.5, 337.5], icon: '↖' }
    ];
    const direction = directions.find(dir => {
      if (dir.range[0] <= dir.range[1]) {
        return bearing >= dir.range[0] && bearing < dir.range[1];
      } else if (dir.range[0] === 337.5 && dir.range[1] === 360) {
        return bearing >= dir.range[0] && bearing <= 360;
      } else if (dir.range[0] === 0 && dir.range[1] === 22.5) {
        return bearing >= dir.range[0] && bearing < dir.range[1];
      }
      return false;
    });
    return direction ? direction.icon : '↓';
  }

  _getWindDirectionIcon(bearing) {
    const directions = [
      { range: [337.5, 360], icon: '↑' },
      { range: [0, 22.5], icon: '↑' },
      { range: [22.5, 67.5], icon: '↗' },
      { range: [67.5, 112.5], icon: '→' },
      { range: [112.5, 157.5], icon: '↘' },
      { range: [157.5, 202.5], icon: '↓' },
      { range: [202.5, 247.5], icon: '↙' },
      { range: [247.5, 292.5], icon: '←' },
      { range: [292.5, 337.5], icon: '↖' }
    ];
    const direction = directions.find(dir => {
      if (dir.range[0] <= dir.range[1]) {
        return bearing >= dir.range[0] && bearing < dir.range[1];
      } else if (dir.range[0] === 337.5 && dir.range[1] === 360) {
        return bearing >= dir.range[0] && bearing <= 360;
      } else if (dir.range[0] === 0 && dir.range[1] === 22.5) {
        return bearing >= dir.range[0] && bearing < dir.range[1];
      }
      return false;
    });
    return direction ? direction.icon : '↓';
  }

  _getRelativeTime(updateTime) {
    if (!updateTime || updateTime === '未知时间') {
      return '未知时间';
    }
    
    try {
      // 解析更新时间，支持多种格式
      let updateDate;
      if (updateTime.includes(' ')) {
        // 格式: "2025-12-18 20:28"
        const [datePart, timePart] = updateTime.split(' ');
        updateDate = new Date(`${datePart}T${timePart}:00`);
      } else if (updateTime.includes('T')) {
        // 格式: "2025-12-18T20:28:00"
        updateDate = new Date(updateTime);
      } else {
        return updateTime; // 无法解析，返回原始值
      }
      
      const now = new Date();
      const diffMs = now - updateDate;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let relativeTime = '';
      if (diffMinutes < 1) {
        relativeTime = '刚刚';
      } else if (diffMinutes < 60) {
        relativeTime = `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        relativeTime = `${diffHours}小时前`;
      } else {
        relativeTime = `${diffDays}天前`;
      }
      
      return `数据更新时间：${updateTime} ( ${relativeTime} )`;
    } catch (error) {
      console.warn('时间解析错误:', error);
      return `数据更新时间：${updateTime}`;
    }
  }

   _getAqiCategoryHtml() {
    const category = this.entity.attributes?.aqi?.category;
    if (!category) return '';
    
    let color = '';
    switch(category) {
      case '优':
        color = '#4CAF50'; // 绿色
        break;
      case '良':
        color = '#FFC107'; // 黄色
        break;
      case '轻度污染':
        color = '#FF9800'; // 橙色
        break;
      case '中度污染':
      case '重度污染':
      case '严重污染':
        color = '#F44336'; // 红色
        break;
      default:
        color = '#9E9E9E'; // 灰色（其他未知类别）
    }
    
    return html`
            <button class="toggle-btn-api" style = "color: ${color};"} @click="${() => this._toggleApiInfo()}">
              ${category}
            </button>
            `
  } 

  render() {
    if (this.mode !== "搜索城市" && (!this.entity || this.entity.state === 'unavailable')) {
      return html`<div class="unavailable"> </div>`;
    }

    else if (this.mode !== "搜索城市" && (this.entity || this.entity.state !== 'unavailable')) {
      return this._rendermain();
    }

    else if (this.mode === "搜索城市" && (!this.entity || this.entity.state === 'unavailable')) {
      return  html`${this._renderInput()}`;
    }

    else if (this.mode === "搜索城市" && (this.entity || this.entity.state !== 'unavailable')) {
      return html`${this._rendermain()} <div class="input-gap"> </div> ${this._renderInput()}`;
    }
  }

  _rendermain(){
    // 获取自定义或默认的温度和湿度
    const customTemp = this._getCustomTemperature();
    const customHumidity = this._getCustomHumidity();
    const temperature = customTemp || this._formatTemperature(this.entity.attributes?.temperature);
    const humidity = customHumidity || this._formatTemperature(this.entity.attributes?.humidity);
    const condition = this.entity.attributes?.condition_cn || '未知';
    const windSpeed = this.entity.attributes?.wind_speed || 0;
    const windBearing = this.entity.attributes?.wind_bearing || 0;
    const pressure = this.entity.attributes?.pressure || 0;
    const visibility = this.entity.attributes?.visibility || 0;
    const city = this.entity.attributes?.city || '未知城市';
    const update_time = this.entity.attributes?.update_time || '未知时间';
    const warning = this.entity.attributes?.warning || [];
    const theme = this._evaluateTheme();
    const hasWarning = warning && Array.isArray(warning) && warning.length > 0;
    const hasapi = this.entity.attributes?.aqi && Object.keys(this.entity.attributes.aqi).length > 0;
    const hassairindices = this.entity.attributes?.air_indices && Object.keys(this.entity.attributes.air_indices).length > 0;
    const warningColor = this._getWarningColor(warning);
    const enableHourlyForecast = this.entity.attributes?.hourly_forecast && this.entity.attributes?.hourly_forecast.length > 0;
    const sunRise = this.entity.attributes?.sun.sunrise || '';
    const sunSet = this.entity.attributes?.sun.sunset || '';

    // 获取颜色
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = this.config.card_bg_color || (theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)');
    const secondaryColor = theme === 'on' ? 'rgb(110, 190, 240)' : 'rgb(110, 190, 240)';
    const visualStyle = this.config.visual_style || 'button';
    const isDotMode = visualStyle === 'dot';

    return html`
      <div class="weather-card ${theme === 'on' ? 'dark-theme' : ''} ${isDotMode ? 'dot-mode' : ''}" style="background-color: ${bgColor}; color: ${fgColor};">
        <div class="main-content">
          <!-- 天气头部信息 -->
          <div class="weather-header">
            <div class="weather-left">
              <div class="weather-icon">
                <img src="${this._getWeatherIcon(condition)}" alt="${condition}">
              </div>
              <div class="weather-details">
                <div class="weather-temperature">
                  ${temperature}<font size="1vw"><b> ℃&ensp;</b></font>
                  ${humidity}<font size="1vw"><b> % </b></font>
                  ${hasWarning ? 
                    html`<span class="warning-icon-text" style="color: ${warningColor}; cursor: pointer; user-select: none;" @click="${() => this._toggleWarningDetails()}">⚠ ${warning.length}</span>` : ''}
                </div>
                <div class="weather-info">
                    <span style="color: ${secondaryColor};">${condition}  
                      ${windSpeed}<span style="font-size: 0.6em;">km/h </span>
                      ${pressure}<span style="font-size: 0.6em;">hPa </span>
                      ${visibility}<span style="font-size: 0.6em;">km </span>
                    </span>
                    ${this._getAqiCategoryHtml()}
                </div>
              </div>
            </div>
            <!-- 城市信息 - 放在头部右侧 -->
            <div class="weather-right">
              <div class="city-info">${this._getCityIcon()}${city}</div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <!-- 天气指数按钮 -->
                ${this.entity.attributes?.air_indices && this.entity.attributes.air_indices.length > 0 ? html`
                  <div class="forecast-toggle-button">
                    <button class="toggle-btn" style="margin-right: 1vw; background: rgb(51, 122, 159);" @click="${() => this._toggleIndicesDetails()}">
                      天气指数
                    </button>
                  </div>
                ` : ''}

                <!-- 切换按钮 -->
                ${enableHourlyForecast ? html`
                  <div class="forecast-toggle-button">
                    <button class="toggle-btn ${this.forecastMode === 'daily' ? 'daily-mode' : this.forecastMode === 'hourly' ? 'hourly-mode' : 'minutely-mode'}" @click="${() => this._toggleForecastMode()}">
                      ${this.forecastMode === 'daily' ? '每日天气' : this.forecastMode === 'hourly' ? '小时天气' : '分钟天气'}
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- 预报内容 -->
          ${this._renderDailyForecast()}

        </div>
        
        <!-- 预警详情 -->
        ${this.showWarningDetails && hasWarning ? this._renderWarningDetails() : ''}

        <!-- 空气质量详情 -->
        ${this.showApiInfo && hasapi ? this._renderAqiDetails() : ''}

        <!-- 天气指数详情 -->    
        ${this.showIndicesDetails && hassairindices ? this._renderIndicesDetails() : ''}

        <div class="update-time" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            ${this._getRelativeTime(update_time)}  
          </div>
          
          <!-- 日出日落信息 - 放在右侧 -->
          ${sunRise && sunSet ? html`
            <div class="sunrise-sunset-container" style="display: flex; align-items: center; gap: 1vw;">
              <div style="display: flex; align-items: center; font-size: 2vw;">
                <ha-icon icon="mdi:weather-sunset-up" style="color: #FFA726; margin-right: 0.6vw; --mdc-icon-size: 2.3vw;"></ha-icon>
                <span>${sunRise} </span>
              </div>
              <div style="display: flex; align-items: center; font-size: 2vw;">
                <ha-icon icon="mdi:weather-sunset-down" style="color: #FF7043; margin-right: 0.6vw; --mdc-icon-size: 2.3vw;"></ha-icon>
                <span style="margin-right: 1vw;">${sunSet}  </span>
              </div>
            </div>
          ` : ''}
        </div>  
      </div>
    `;
  }

  _renderDailyForecast() {
    if (this.forecastMode === 'hourly') {
      return this._renderHourlyForecast();
    } else if (this.forecastMode === 'minutely') {
      return this._renderMinutelyForecast();
    }
    
    const forecastDays = this._getForecastDays();
    const extremes = this._getTemperatureExtremes();
    const theme = this._evaluateTheme();
    const secondaryColor = theme === 'on' ? 'rgb(60, 140, 190)' : 'rgb(110, 190, 240)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    // 生成温度曲线坐标
    const highTempData = this._generateTemperatureLine(forecastDays, extremes, true);
    const lowTempData = this._generateTemperatureLine(forecastDays, extremes, false);
    
    // 使用组件实例ID + Canvas ID，避免多实例冲突
    const instanceId = this._getInstanceId();
    const highCanvasId = `high-temp-canvas-${instanceId}`;
    const lowCanvasId = `low-temp-canvas-${instanceId}`;
    
    // 在DOM更新完成后绘制曲线
    this.updateComplete.then(() => {
      setTimeout(() => {
        this._drawTemperatureCurve(highCanvasId, highTempData.points, 'rgba(255, 87, 34)');
        this._drawTemperatureCurve(lowCanvasId, lowTempData.points, 'rgba(33, 150, 243)');
      }, 50);
    });
    
    const columns = this.config?.columns || XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS.FORECAST_COLUMNS;
    return html`
      <div class="forecast-container" style="grid-template-columns: repeat(${columns}, 1fr);">
        <!-- 最高温度连接线 Canvas -->
        <canvas class="temp-line-canvas temp-line-canvas-high" id="high-temp-canvas-${this._getInstanceId()}"></canvas>
        
        <!-- 最低温度连接线 Canvas -->
        <canvas class="temp-line-canvas temp-line-canvas-low" id="low-temp-canvas-${this._getInstanceId()}"></canvas>
        
        ${forecastDays.map((day, index) => {
          let date;
          if (typeof day.datetime === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day.datetime)) {
              const [y, m, d] = day.datetime.split('-').map(Number);
              date = new Date(y, m - 1, d);
          } else {
              date = new Date(day.datetime);
          }
          const weekday = this._getWeekday(day.datetime);
          const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
          const highTemp = this._formatTemperature(day.native_temperature);
          const lowTemp = this._formatTemperature(day.native_temp_low);
          
          // 如果是昨天，设置透明度 
          const isYesterday = weekday !== '昨天' && weekday !== '前天';
          const opacity = isYesterday ? 1 : 0.5;
          const theme = this._evaluateTheme();

          const hightbackground = isYesterday ? 
                'linear-gradient(to bottom,rgba(255, 87, 34) 0%,rgba(255, 152, 0) 100%)':
                theme === 'on' ? 
                'linear-gradient(to bottom,rgb(250, 149, 117) 0%,rgb(250, 188, 97) 100%)':
                'linear-gradient(to bottom,rgb(181, 81, 49) 0%,rgb(181, 120, 28) 100%)';
          const lowbackground = isYesterday ?  
                'linear-gradient(to bottom,rgba(3, 169, 243) 0%,rgba(33, 150, 243) 100%)':
                theme === 'on' ? 
                'linear-gradient(to bottom,rgb(99, 198, 243) 0%,rgb(117, 187, 243)100%)':
                'linear-gradient(to bottom,rgb(30, 130, 174) 0%,rgb(48, 118, 174) 100%)';
                
          const hightcolor = isYesterday ? 'rgba(255, 87, 34)': theme === 'on' ? 'rgb(250, 149, 117)' : 'rgb(181, 81, 49)';
          const lowcolor = isYesterday ? 'rgba(3, 169, 243)': theme === 'on' ? 'rgb(99, 198, 243)' : 'rgb(30, 130, 174)';
 
          // 计算温度矩形的动态边界和高度
          const tempBounds = this._calculateTemperatureBounds(day, extremes);
           
          // 获取雨量信息
          const rainfall = parseFloat(day.native_precipitation) || 0;
          
          // 计算雨量矩形高度和位置
          
          const {CONTAINER_HEIGHT_VW } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
          const RAINFALL_MAX = 25; // 最大雨量25mm
          const rainfallHeight = Math.min((rainfall / RAINFALL_MAX) * CONTAINER_HEIGHT_VW+4, CONTAINER_HEIGHT_VW+4); // 最大高度21.6vw（到日期下面）

          return html`
            <div class="forecast-day" style="background: ${backgroundColor};">
              <!-- 星期（周X） -->
              <div class="forecast-weekday" style="opacity: ${opacity};">${weekday}</div>
              
              <!-- 日期（mm月dd日） -->
              <div class="forecast-date" style="color: ${secondaryColor}; opacity: ${opacity};">${dateStr}</div>
              
              <!-- 高温（橙色）和 低温（蓝色） -->
              <div class="forecast-temp-container">
                ${this.config.visual_style === 'dot' ? html`
                  <!-- 圆点模式 -->
                  <div class="temp-curve-high" style="top: ${tempBounds.highTop + 1.75}vw">
                    <div class="temp-text" style="color: ${hightcolor};">${highTemp}°</div>
                  </div>
                  <div class="temp-curve-low" style="top: ${tempBounds.lowTop + 1.75}vw">
                    <div class="temp-text" style="color: ${lowcolor};">${lowTemp}°</div>
                  </div>
                ` : html`
                  <!-- 按钮模式 -->
                  <div class="temp-curve-high" style="background: ${hightbackground}; top: ${tempBounds.highTop}vw">
                    ${highTemp}°
                  </div>
                  <div class="temp-curve-low" style="background: ${lowbackground}; top: ${tempBounds.lowTop}vw">
                    ${lowTemp}°
                  </div>
                `}
                
                <!-- 雨量填充矩形 -->
                ${rainfall > 0 ? html`
                  <div class="rainfall-fill" style="height: calc(${rainfallHeight}vw + 10px); opacity: ${0.3+rainfall / RAINFALL_MAX}"></div>
                ` : ''}
              </div>
              <div class="forecast-temp-null"></div>
            </div>
          `;
        })}
        
        <!-- 雨量标签行 - 10列网格 -->
        ${forecastDays.map(day => {
          const rainfall = parseFloat(day.native_precipitation) || 0;
          return html`
            <div class="forecast-rainfall-container">
              ${rainfall > 0 ? html`
                <div class="forecast-rainfall">
                  ${rainfall}mm
                </div>
              ` : ''}
            </div>
          `;
        })}
        
        <!-- 天气图标行 -->
        ${this._renderWeatherIcons(forecastDays)}
        
        <!-- 风向风级行 -->
        ${this._renderWindInfo(forecastDays)}
      </div>
    `;
  }

  _renderHourlyForecast() {
    const hourlyForecast = this._getHourlyForecast();
    const extremes = this._getTemperatureExtremes();
    const theme = this._evaluateTheme();
    const secondaryColor = theme === 'on' ? 'rgb(60, 140, 190)' : 'rgb(110, 190, 240)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // 生成温度曲线坐标（小时天气只有一个温度）
    const tempData = this._generateTemperatureLine(hourlyForecast, extremes, true);
    
    // 使用组件实例ID + Canvas ID，避免多实例冲突
    const instanceId = this._getInstanceId();
    const canvasId = `hourly-temp-canvas-${instanceId}`;
    
    // 在DOM更新完成后绘制曲线
    this.updateComplete.then(() => {
      setTimeout(() => {
        this._drawTemperatureCurve(canvasId, tempData.points, 'rgba(156, 39, 176)');
      }, 50);
    });
    
    // 计算实际列数（小时天气可能有更多数据）
    const columns = hourlyForecast.length;
    // 使用与每日天气相同的宽度计算公式：
    // 每列宽度 = (100vw - 8px*2 - (FORECAST_COLUMNS-1)*2px) / FORECAST_COLUMNS
    const FORECAST_COLUMNS = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS.FORECAST_COLUMNS;
    const columnWidth = 9.6
     
    return html`
      <div class="hourly-forecast-scroll-container">
        <div class="hourly-forecast-container" style="grid-template-columns: repeat(${columns}, ${columnWidth}vw);">
          <!-- 小时温度连接线 Canvas -->
          <canvas class="temp-line-canvas temp-line-canvas-high" id="hourly-temp-canvas-${this._getInstanceId()}"></canvas>
          
          ${hourlyForecast.map((hour, index) => {
            const timeStr = this._formatHourlyTime(hour.datetime);
            const dateStr = this._formatHourlyDate(hour.datetime);
            const temp = this._formatTemperature(hour.native_temperature);
            
            // 获取雨量信息
            const rainfall = parseFloat(hour.native_precipitation) || 0;
            
            // 计算温度位置（简化版）
            const { minTemp, maxTemp, range, allEqual } = extremes;
            const { BUTTON_HEIGHT_VW, CONTAINER_HEIGHT_VW } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
            const availableHeight = CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW;
            
            let finalTopPosition;
            if (allEqual) {
              // 如果所有温度相等，将位置设置在中间
              finalTopPosition = (CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW) / 2;
            } else {
              const unitPosition = range === 0 ? 0 : availableHeight / range;
              const tempValue = parseFloat(hour.native_temperature) || 0;
              const topPosition = (maxTemp - tempValue) * unitPosition;
              finalTopPosition = Math.max(0, Math.min(topPosition, CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW));
            }
            
            // 计算雨量矩形高度和位置
            const RAINFALL_MAX = 5; // 最大雨量5mm
            const rainfallHeight = Math.min((rainfall / RAINFALL_MAX) * CONTAINER_HEIGHT_VW+4, CONTAINER_HEIGHT_VW+4); // 最大高度21.6vw（到日期下面）


            return html`
              <div class="forecast-day" style="background: ${backgroundColor};">
                <!-- 时间（hh:mm） -->
                <div class="forecast-weekday">${timeStr}</div>
                
                <!-- 日期（mm月dd日） -->
                <div class="forecast-date" style="color: ${secondaryColor};">${dateStr}</div>
                
                <!-- 温度（紫色） -->
                <div class="forecast-temp-container">
                  ${this.config.visual_style === 'dot' ? html`
                    <!-- 圆点模式 -->
                    <div class="temp-curve-hourly" style="top: ${finalTopPosition + 1.75}vw">
                      <div class="temp-text">${temp}°</div>
                    </div>
                  ` : html`
                    <!-- 按钮模式 -->
                    <div class="temp-curve-hourly" style="top: ${finalTopPosition}vw">
                      ${temp}°
                    </div>
                  `}
                  
                  <!-- 雨量填充矩形 -->
                  ${rainfall > 0 ? html`
                    <div class="rainfall-fill" style="height: calc(${rainfallHeight}vw + 10px); opacity: ${0.3+rainfall / RAINFALL_MAX}"></div>
                  ` : ''}
                </div>
                <div class="forecast-temp-null"></div>
              </div>
            `;
          })}
          
          <!-- 雨量标签行 -->
          ${hourlyForecast.map(hour => {
            const rainfall = parseFloat(hour.native_precipitation) || 0;
            return html`
              <div class="forecast-rainfall-container">
                ${rainfall > 0 ? html`
                  <div class="forecast-rainfall">
                    ${rainfall}mm
                  </div>
                ` : ''}
              </div>
            `;
          })}
          
          <!-- 天气图标行 -->
          ${this._renderHourlyWeatherIcons(hourlyForecast)}
          
          <!-- 风向风级行 -->
          ${this._renderHourlyWindInfo(hourlyForecast)}
        </div>
      </div>
    `;
  }

  _renderMinutelyForecast() {
    const minutelyForecast = this._getMinutelyForecast();
    const extremes = this._getTemperatureExtremes();
    const theme = this._evaluateTheme();
    const secondaryColor = theme === 'on' ? 'rgb(60, 140, 190)' : 'rgb(110, 190, 240)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // 生成温度曲线坐标（分钟天气只有一个温度）
    const tempData = this._generateTemperatureLine(minutelyForecast, extremes, true);
    
    // 使用组件实例ID + Canvas ID，避免多实例冲突
    const instanceId = this._getInstanceId();
    const canvasId = `minutely-temp-canvas-${instanceId}`;
    
    // 在DOM更新完成后绘制曲线（绿色）
    this.updateComplete.then(() => {
      setTimeout(() => {
        this._drawTemperatureCurve(canvasId, tempData.points, 'rgba(76, 175, 80)');
      }, 50);
    });
    
    // 计算实际列数（分钟天气可能有更多数据）
    const columns = minutelyForecast.length;
    const columnWidth = 9.6;
     
    return html`
      <div class="hourly-forecast-scroll-container">
        <div class="hourly-forecast-container" style="grid-template-columns: repeat(${columns}, ${columnWidth}vw);">
          <!-- 分钟温度连接线 Canvas -->
          <canvas class="temp-line-canvas temp-line-canvas-high" id="minutely-temp-canvas-${this._getInstanceId()}"></canvas>
          
          ${minutelyForecast.map((minute, index) => {
            const timeStr = this._formatMinutelyTime(minute.datetime);
            const dateStr = this._formatMinutelyDate(minute.datetime);
            const temp = this._formatTemperature(minute.native_temperature);
            
            // 获取雨量信息
            const rainfall = parseFloat(minute.native_precipitation) || 0;
            
            // 计算温度位置（简化版）
            const { minTemp, maxTemp, range, allEqual } = extremes;
            const { BUTTON_HEIGHT_VW, CONTAINER_HEIGHT_VW } = XiaoshiWeatherPhoneCard.TEMPERATURE_CONSTANTS;
            const availableHeight = CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW;
            
            let finalTopPosition;
            if (allEqual) {
              // 如果所有温度相等，将位置设置在中间
              finalTopPosition = (CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW) / 2;
            } else {
              const unitPosition = range === 0 ? 0 : availableHeight / range;
              const tempValue = parseFloat(minute.native_temperature) || 0;
              const topPosition = (maxTemp - tempValue) * unitPosition;
              finalTopPosition = Math.max(0, Math.min(topPosition, CONTAINER_HEIGHT_VW - BUTTON_HEIGHT_VW));
            }
            
            // 计算雨量矩形高度和位置
            const RAINFALL_MAX = 1; // 最大雨量1mm
            const rainfallHeight = Math.min((rainfall / RAINFALL_MAX) * CONTAINER_HEIGHT_VW+4, CONTAINER_HEIGHT_VW+4); // 最大高度21.6vw（到日期下面）


            return html`
              <div class="forecast-day" style="background: ${backgroundColor};">
                <!-- 时间（hh:mm） -->
                <div class="forecast-weekday">${timeStr}</div>
                
                <!-- 日期（mm月dd日） -->
                <div class="forecast-date" style="color: ${secondaryColor};">${dateStr}</div>
                
                <!-- 温度（绿色） -->
                <div class="forecast-temp-container">
                  ${this.config.visual_style === 'dot' ? html`
                    <!-- 圆点模式 -->
                    <div class="temp-curve-minutely" style="top: ${finalTopPosition + 1.75}vw">
                      <div class="temp-text">${temp}°</div>
                    </div>
                  ` : html`
                    <!-- 按钮模式 -->
                    <div class="temp-curve-minutely" style="top: ${finalTopPosition}vw">
                      ${temp}°
                    </div>
                  `}
                  
                  <!-- 雨量填充矩形 -->
                  ${rainfall > 0 ? html`
                    <div class="rainfall-fill" style="height: calc(${rainfallHeight}vw + 10px); opacity: ${0.3+rainfall / RAINFALL_MAX}"></div>
                  ` : ''}
                </div>
                <div class="forecast-temp-null"></div>
              </div>
            `;
          })}
          
          <!-- 雨量标签行 -->
          ${minutelyForecast.map(minute => {
            const rainfall = parseFloat(minute.native_precipitation) || 0;
            return html`
              <div class="forecast-rainfall-container">
                ${rainfall > 0 ? html`
                  <div class="forecast-rainfall">
                    ${rainfall}mm
                  </div>
                ` : ''}
              </div>
            `;
          })}
          
          <!-- 天气图标行 -->
          ${this._renderMinutelyWeatherIcons(minutelyForecast)}
          
          <!-- 风向风级行 -->
          ${this._renderMinutelyWindInfo(minutelyForecast)}
        </div>
      </div>
    `;
  }

  _renderMinutelyWeatherIcons(minutelyForecast) {
    return html`
      ${minutelyForecast.map(minute => {
        return html`
          <div class="forecast-icon-container">
            <div class="forecast-icon">
              <img src="${this._getWeatherIcon(minute.text)}" alt="${minute.text}">
            </div>
          </div>
        `;
      })}
    `;
  }

  _renderMinutelyWindInfo(minutelyForecast) {
    const theme = this._evaluateTheme();
    const secondaryColor = theme === 'on' ? 'rgb(10, 90, 140)' : 'rgb(110, 190, 240)';
    return html`
      ${minutelyForecast.map(minute => {
        const windSpeedRaw = minute.windscaleday || 0;
        let windSpeed = windSpeedRaw;
        
        // 如果风速是 "4-5" 格式，取最大值
        if (typeof windSpeedRaw === 'string' && windSpeedRaw.includes('-')) {
          const speeds = windSpeedRaw.split('-').map(s => parseFloat(s.trim()));
          if (speeds.length === 2 && !isNaN(speeds[0]) && !isNaN(speeds[1])) {
            windSpeed = Math.max(speeds[0], speeds[1]);
          }
        }
        
        const windDirection = minute.wind_bearing || 0;
        
        return html`
          <div class="forecast-wind-container">
            <div class="forecast-wind" style="color: ${secondaryColor};">
              <span class="wind-direction">${this._getWindDirectionIcon(windDirection)}</span>
              <span>${windSpeed}级</span>
            </div>
          </div>
        `;
      })}
    `;
  }

  _renderWeatherIcons(forecastDays) {
    return html`
      ${forecastDays.map(day => {
        // 如果是昨天，设置透明度 
        const weekday = this._getWeekday(day.datetime);
        const isYesterday = weekday !== '昨天' && weekday !== '前天';
        const opacity = isYesterday ? 1 : 0.5;
        return html`
          <div class="forecast-icon-container" style="opacity: ${opacity}">
            <div class="forecast-icon">
              <img src="${this._getWeatherIcon(day.text)}" alt="${day.text}">
            </div>
          </div>
        `;
      })}
    `;
  }

  _renderHourlyWeatherIcons(hourlyForecast) {
    return html`
      ${hourlyForecast.map(hour => {
        return html`
          <div class="forecast-icon-container">
            <div class="forecast-icon">
              <img src="${this._getWeatherIcon(hour.text)}" alt="${hour.text}">
            </div>
          </div>
        `;
      })}
    `;
  }

  _renderWindInfo(forecastDays) {
    const theme = this._evaluateTheme();
    const secondaryColor = theme === 'on' ? 'rgb(10, 90, 140)' : 'rgb(110, 190, 240)';
    return html`
      ${forecastDays.map(day => {
        const windSpeedRaw = day.windscaleday || 0;
        let windSpeed = windSpeedRaw;

        // 如果是昨天，设置透明度 
        const weekday = this._getWeekday(day.datetime);
        const isYesterday = weekday !== '昨天' && weekday !== '前天';
        const opacity = isYesterday ? 1 : 0.5;

        // 如果风速是 "4-5" 格式，取最大值
        if (typeof windSpeedRaw === 'string' && windSpeedRaw.includes('-')) {
          const speeds = windSpeedRaw.split('-').map(s => parseFloat(s.trim()));
          if (speeds.length === 2 && !isNaN(speeds[0]) && !isNaN(speeds[1])) {
            windSpeed = Math.max(speeds[0], speeds[1]);
          }
        }
        
        const windDirection = day.wind_bearing || 0;
        
        return html`
          <div class="forecast-wind-container" style="opacity: ${opacity}">
            <div class="forecast-wind" style="color: ${secondaryColor};">
              <span class="wind-direction" >${this._getWindDirectionIcon(windDirection)}</span>
              <span>${windSpeed}级</span>
            </div>
          </div>
        `;
      })}
    `;
  }

  _getWindDirectionIcon(bearing) {
    // 0是北风，按顺时针方向增加
    const directions = [
      { range: [337.5, 360], icon: '↑', name: '北' },    // 337.5-360度
      { range: [0, 22.5], icon: '↑', name: '北' },        // 0-22.5度
      { range: [22.5, 67.5], icon: '↗', name: '东北' },    // 22.5-67.5度
      { range: [67.5, 112.5], icon: '→', name: '东' },     // 67.5-112.5度
      { range: [112.5, 157.5], icon: '↘', name: '东南' },   // 112.5-157.5度
      { range: [157.5, 202.5], icon: '↓', name: '南' },     // 157.5-202.5度
      { range: [202.5, 247.5], icon: '↙', name: '西南' },   // 202.5-247.5度
      { range: [247.5, 292.5], icon: '←', name: '西' },     // 247.5-292.5度
      { range: [292.5, 337.5], icon: '↖', name: '西北' }    // 292.5-337.5度
    ];

    const direction = directions.find(dir => {
      if (dir.range[0] <= dir.range[1]) {
        // 正常范围，如 22.5-67.5
        return bearing >= dir.range[0] && bearing < dir.range[1];
      } else if (dir.range[0] === 337.5 && dir.range[1] === 360) {
        // 337.5-360度特殊处理
        return bearing >= dir.range[0] && bearing <= 360;
      } else if (dir.range[0] === 0 && dir.range[1] === 22.5) {
        // 0-22.5度特殊处理
        return bearing >= dir.range[0] && bearing < dir.range[1];
      }
      return false;
    });

    return direction ? direction.icon : '↓';
  }

  _renderHourlyWindInfo(hourlyForecast) {
    const theme = this._evaluateTheme();
    const secondaryColor = theme === 'on' ? 'rgb(10, 90, 140)' : 'rgb(110, 190, 240)';
    return html`
      ${hourlyForecast.map(hour => {
        const windSpeedRaw = hour.windscaleday || 0;
        let windSpeed = windSpeedRaw;
        
        // 如果风速是 "4-5" 格式，取最大值
        if (typeof windSpeedRaw === 'string' && windSpeedRaw.includes('-')) {
          const speeds = windSpeedRaw.split('-').map(s => parseFloat(s.trim()));
          if (speeds.length === 2 && !isNaN(speeds[0]) && !isNaN(speeds[1])) {
            windSpeed = Math.max(speeds[0], speeds[1]);
          }
        }
        
        const windDirection = hour.wind_bearing || 0;
        
        return html`
          <div class="forecast-wind-container">
            <div class="forecast-wind" style="color: ${secondaryColor};">
              <span class="wind-direction">${this._getWindDirectionIcon(windDirection)}</span>
              <span>${windSpeed}级</span>
            </div>
          </div>
        `;
      })}
    `;
  }

  _renderWarningDetails() {
    if (!this.showWarningDetails || !this.entity?.attributes?.warning) {
      return '';
    }

    const warning = this.entity.attributes.warning;
    const theme = this._evaluateTheme();
    const textcolor = theme === 'on' ? 'rgba(0, 0, 0)' : 'rgba(255, 255, 255)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    return html`
      <div class="warning-details-card" style=" background-color: ${backgroundColor};">
        ${warning.map((warningItem, index) => {
          const typeName = warningItem.typeName ?? "";
          const level = warningItem.level ?? "";
          const warningColor = this._getWarningColorForLevel(level);
          const sender = warningItem.sender ?? "";
          const startTime = warningItem.startTime ? this._formatDateToBeijing(warningItem.startTime) : "";
          const endTime = warningItem.endTime ? this._formatDateToBeijing(warningItem.endTime) : "";
          const text = warningItem.text ?? "";
          const scrollDuration = Math.max(5, text.length * 0.3);

          return html`
            <div style="margin-bottom: 1vw;">
              <!-- 第一行：预警标题 -->
              <div class="warning-title-line" style="color: ${warningColor};">
                ${sender}: 【${typeName}】${level}预警&emsp;( ${startTime}至${endTime} )
              </div>
              
              <!-- 第二行：预警文本滚动 -->
              <div class="warning-text-container1" style="color: ${textcolor}; ">
               
                  <span>${text}</span>
               
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderAqiDetails() {
    if (!this.showApiInfo || !this.entity?.attributes?.aqi) {
      return '';
    }

    const aqi = this.entity.attributes.aqi;
    const theme = this._evaluateTheme();
    const textcolor = theme === 'on' ? 'rgba(0, 0, 0)' : 'rgba(255, 255, 255)';
    const backgroundColor = theme === 'on' ? 'rgba(50,50,50, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // 获取AQI数值和等级
    const aqiValue = aqi.aqi || aqi.value || 0;
    const category = aqi.category || '未知';
    const level = aqi.level || '未知';
    const pm25 = aqi.pm2p5 || 0;
    const pm10 = aqi.pm10 || 0;
    const so2 = aqi.so2 || 0;
    const no2 = aqi.no2 || 0;
    const co = aqi.co || 0;
    const o3 = aqi.o3 || 0;
    
    // 根据等级获取颜色
    const getAqiColor = (category) => {
      switch(category) {
        case '优': return '#4CAF50'; // 绿色
        case '良': return '#FFC107'; // 黄色
        case '轻度污染': return '#FF9800'; // 橙色
        case '中度污染': return '#FF5722'; // 深橙色
        case '重度污染': return '#F44336'; // 红色
        case '严重污染': return '#9C27B0'; // 紫色
        default: return '#9E9E9E'; // 灰色
      }
    };
    
    const aqiColor = getAqiColor(category);

    return html`
      <div class="aqi-details-card" style="background-color: ${backgroundColor}; border-radius: 2vw; padding: 2vw; margin-top: 1.5vw;">
        
        <!-- AQI总览 -->
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.5vw; padding: 0.5vw;  border-radius: 1.5vw;">
          <div style="text-align: center;">
            <div style="font-size: 4vw; font-weight: bold; color: ${aqiColor};">${aqiValue}</div>
            <div style="font-size: 2.5vw; color: ${aqiColor}; margin-top: 0.5vw;">${category} ( ${level}级 )</div>
          </div>
        </div>
        
        <!-- 污染物详情 -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1vw;">
          <div style="text-align: center; padding: 0.5vw;border-radius: 1vw;">
            <div style="font-size: 2.2vw; font-weight: bold; color: ${textcolor};">PM2.5</div>
            <div style="font-size: 2vw; color: ${textcolor};">${pm25} μg/m³</div>
          </div>
          
          <div style="text-align: center; padding: 0.5vw; border-radius: 1vw;">
            <div style="font-size: 2.2vw; font-weight: bold; color: ${textcolor};">PM10</div>
            <div style="font-size: 2vw; color: ${textcolor};">${pm10} μg/m³</div>
          </div>
          
          <div style="text-align: center; padding: 0.5vw; border-radius: 1vw;">
            <div style="font-size: 2.2vw; font-weight: bold; color: ${textcolor};">SO₂</div>
            <div style="font-size: 2vw; color: ${textcolor};">${so2} μg/m³</div>
          </div>
          
          <div style="text-align: center; padding: 0.5vw; border-radius: 1vw;">
            <div style="font-size: 2.2vw; font-weight: bold; color: ${textcolor};">NO₂</div>
            <div style="font-size: 2vw; color: ${textcolor};">${no2} μg/m³</div>
          </div>
          
          <div style="text-align: center; padding: 0.5vw; border-radius: 1vw;">
            <div style="font-size: 2.2vw; font-weight: bold; color: ${textcolor};">CO</div>
            <div style="font-size: 2vw; color: ${textcolor};">${co} mg/m³</div>
          </div>
          
          <div style="text-align: center; padding: 0.5vw; border-radius: 1vw;">
            <div style="font-size: 2.2vw; font-weight: bold; color: ${textcolor};">O₃</div>
            <div style="font-size: 2vw; color: ${textcolor};">${o3} μg/m³</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderIndicesDetails() {
    if (!this.showIndicesDetails || !this.entity?.attributes?.air_indices) {
      return '';
    }

    const indices = this.entity.attributes.air_indices;
    const theme = this._evaluateTheme();
    const textcolor = theme === 'on' ? 'rgba(0, 0, 0)' : 'rgba(255, 255, 255)';
    const textcolor2 = theme === 'on' ? 'rgba(23, 140, 5, 1)' : 'rgba(10, 231, 47, 1)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const backgroundColor2 = theme === 'on' ? 'rgba(255, 255, 255)' : 'rgba(50, 50, 50)';

    return html`
      <div class="indices-details-card" style="background-color: ${backgroundColor}; border-radius: 2vw; padding: 2vw; margin-top: 1.5vw;">
        
        <!-- 指数列表 -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1vw;">
          ${indices.map(index => html`
            <div style="padding: 1vw; background: ${backgroundColor2}; border-radius: 1vw;">
              <div> 
                <span style="font-size: 2vw; font-weight: bold; color: ${textcolor2}; margin-bottom: 0.2vw;">${index.name} </span>
                <span style="font-size: 1.8vw; color: ${textcolor}; margin-bottom: 0.2vw;"> 等级:${index.level}  ${index.category}</span>
              </div>

              <div style="font-size: 1.5vw; color: ${textcolor}; opacity: 0.8; line-height: 1.4;">${index.text}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderInput(){
    if (!this.config || !this.hass ) return html``;
    const cityEntity = this.city_entity || 'text.set_city';
    const currentValue = this.hass.states[cityEntity].state;
    if (!this._isEditing && this._value !== currentValue) {
      this._value = currentValue;
    }
    const theme = this._evaluateTheme();
    const themeClass = theme === 'off' ? 'off' : 'on';
    const showPlaceholder = !this._value && !this._isEditing;

    return html`
      <div class="input-container ${themeClass}" \n
           style="width: ${this.config.width}; height: 12vw ;border-radius: 3vw;">
        <div class="icon">
          <ha-icon icon="mdi:magnify"></ha-icon>
        </div>
        <div class="input-wrapper">
          <input
            type="text"\n
            .value=${this._value}\n
            @input=${this._handleInput}\n
            @keydown=${this._handleKeyDown}\n
            @focus=${() => this._isEditing = true}\n
            @blur=${this._handleBlur}\n
            placeholder=" "
          />
          <div class="placeholder ${!showPlaceholder ? 'hidden' : ''}">等待设置搜索的城市...</div>
        </div>
      </div>
    `;
  }

  _handleInput(e) {
    this._value = e.target.value;
    this._isEditing = true;
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' && this.city_entity) {
      this._pendingSave = true;
      this._setEntityValue();
      this._isEditing = false;
      e.target.blur();
    }
  }

  _handleBlur() {
    this._isEditing = false;
    if (!this._pendingSave && this.city_entity) {
      this._setEntityValue();
    }
    this._pendingSave = false;
  }

  _setEntityValue() {
    if (!this.city_entity) return; 
    
    this.hass.callService('text', 'set_value', {
      entity_id: this.city_entity,
      value: this._value,
    });

  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
  }

  getCardSize() {
    return 8;
  }
}
customElements.define('xiaoshi-weather-phone-card', XiaoshiWeatherPhoneCard);

class XiaoshiWeatherPadEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      label {
        font-weight: bold;
      }
      select, input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
      }
      input[type="number"] {
        width: 100px;
      }
      .conditional-field {
        display: none;
      }
      .conditional-field.visible {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .entity-search-container {
        position: relative;
        width: 100%;
      }
      .entity-search-container input {
        width: 100%;
        min-width: 200px;
      }
      datalist {
        max-height: 200px;
        overflow-y: auto;
      }
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="form">
        <div class="form-group">
          <label>天气实体</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.entity || ''}
            name="entity"
          >
            <option value="">选择天气实体</option>
            ${Object.keys(this.hass.states)
              .filter(entityId => entityId.startsWith('weather.'))
              .map(entityId => html`
                <option value="${entityId}" 
                  .selected=${entityId === this.config.entity}>
                  ${this.hass.states[entityId].attributes.friendly_name || entityId} ${this.hass.states[entityId].attributes.friendly_name ? '(' + entityId + ')' : ''}
                </option>
              `)}
          </select>
        </div>
        
        <div class="form-group">
          <label>视觉样式</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.visual_style !== undefined ? this.config.visual_style : 'button'}
            name="visual_style"
          >
            <option value="button">按钮模式</option>
            <option value="dot">圆点模式</option>
          </select>
        </div>

        <div class="form-group">
          <label>主题</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.theme !== undefined ? this.config.theme : 'on'}
            name="theme"
          >
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>

        <div class="form-group">
          <label>预报列数</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.columns !== undefined ? this.config.columns : 5}
            name="columns"
          >
            <option value="5">5列</option>
            <option value="6">6列</option>
            <option value="7">7列</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>卡片宽度 (px)</label>
          <input 
            type="number"
            min="200"
            max="800"
            step="10"
            @change=${this._entityChanged}
            .value=${this.config.width !== undefined ? this.config.width : 260}
            name="width"
            placeholder="260"
          />
        </div>

        <div class="form-group">
          <label>背景颜色 (可选)</label>
          <input 
            type="text" 
            .value=${this.config.card_bg_color || ''}
            @change=${this._entityChanged}
            name="card_bg_color"
            placeholder="例如: #FFFFFF 或 rgba(255,255,255,1)"
          />
        </div>
        

        
        <div class="form-group">
          <label>是否实体替换实时温湿度</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.use_custom_entities !== undefined ? this.config.use_custom_entities : 'false'}
            name="use_custom_entities"
          >
            <option value="false">否（使用天气实体的温湿度）</option>
            <option value="true">是（使用自定义实体）</option>
          </select>
        </div>
        
        <div class="form-group conditional-field ${this.config.use_custom_entities ? 'visible' : ''}" id="temperature-entity-group">
          <label>温度实体</label>
          <div class="entity-search-container">
            <input 
              type="text" 
              .value=${this.config.temperature_entity || ''}
              @input=${this._onTemperatureEntityInput}
              @change=${this._entityChanged}
              name="temperature_entity"
              placeholder="搜索温度实体（如 sensor.temperature）"
              list="temperature-entities"
            />
            <datalist id="temperature-entities">
              ${Object.keys(this.hass.states)
                .filter(entityId => 
                  this.hass.states[entityId].attributes?.unit_of_measurement === '°C' ||
                  this.hass.states[entityId].attributes?.device_class === 'temperature' ||
                  entityId.toLowerCase().includes('temp')
                )
                .map(entityId => html`
                  <option value="${entityId}">
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </datalist>
          </div>
        </div>
        
        <div class="form-group conditional-field ${this.config.use_custom_entities ? 'visible' : ''}" id="humidity-entity-group">
          <label>湿度实体</label>
          <div class="entity-search-container">
            <input 
              type="text" 
              .value=${this.config.humidity_entity || ''}
              @input=${this._onHumidityEntityInput}
              @change=${this._entityChanged}
              name="humidity_entity"
              placeholder="搜索湿度实体（如 sensor.humidity）"
              list="humidity-entities"
            />
            <datalist id="humidity-entities">
              ${Object.keys(this.hass.states)
                .filter(entityId => 
                  this.hass.states[entityId].attributes?.unit_of_measurement === '%' ||
                  this.hass.states[entityId].attributes?.device_class === 'humidity' ||
                  entityId.toLowerCase().includes('humid')
                )
                .map(entityId => html`
                  <option value="${entityId}">
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </datalist>
          </div>
        </div>
        
        <div class="form-group conditional-field ${this.config.mode === '搜索城市' ? 'visible' : ''}" id="city-entity-group">
          <label>城市文本实体</label>
          <div class="entity-search-container">
            <input 
              type="text" 
              .value=${this.config.city_entity || 'text.set_city'}
              @input=${this._onCityEntityInput}
              @change=${this._entityChanged}
              name="city_entity"
              placeholder="搜索城市文本实体（如 text.set_city）"
              list="city-entities"
            />
            <datalist id="city-entities">
              ${Object.keys(this.hass.states)
                .filter(entityId => 
                  entityId.startsWith('text.') ||
                  entityId.toLowerCase().includes('city') ||
                  entityId.toLowerCase().includes('城市')
                )
                .map(entityId => html`
                  <option value="${entityId}">
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </datalist>
          </div>
        </div>
         
      </div>
    `;
  }



  _entityChanged(e) {
    const { name, value } = e.target;
    if (!value && name !== 'theme' && name !== 'columns' && name !== 'width' && name !== 'use_custom_entities' && name !== 'temperature_entity' && name !== 'humidity_entity' && name !== 'visual_style' && name !== 'card_bg_color') return;
    
    let processedValue = value;
    if (name === 'columns' || name === 'width') {
      processedValue = parseInt(value);
      // 确保宽度在有效范围内
      if (name === 'width' && (processedValue < 200 || processedValue > 800 || isNaN(processedValue))) {
        processedValue = 260; // 默认值
      }
    } else if (name === 'use_custom_entities') {
      processedValue = value === 'true';
    }
    
    this.config = {
      ...this.config,
      [name]: processedValue
    };
    
    // 处理条件字段的显示/隐藏
    if (name === 'use_custom_entities' || name === 'mode') {
      this._updateConditionalFields();
    }
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }

  _updateConditionalFields() {
    // 更新条件字段的显示状态
    const useCustomEntities = this.config.use_custom_entities;
    const mode = this.config.mode;
    
    // 获取条件字段元素
    const tempGroup = this.shadowRoot?.getElementById('temperature-entity-group');
    const humidityGroup = this.shadowRoot?.getElementById('humidity-entity-group');
    const cityGroup = this.shadowRoot?.getElementById('city-entity-group');
    
    if (tempGroup) {
      if (useCustomEntities) {
        tempGroup.classList.add('visible');
      } else {
        tempGroup.classList.remove('visible');
        // 如果禁用，清空配置
        delete this.config.temperature_entity;
      }
    }
    
    if (humidityGroup) {
      if (useCustomEntities) {
        humidityGroup.classList.add('visible');
      } else {
        humidityGroup.classList.remove('visible');
        // 如果禁用，清空配置
        delete this.config.humidity_entity;
      }
    }
    
    if (cityGroup) {
      if (mode === '搜索城市') {
        cityGroup.classList.add('visible');
      } else {
        cityGroup.classList.remove('visible');
        // 如果不是搜索城市模式，清空配置
        delete this.config.city_entity;
      }
    }
  }

  _onTemperatureEntityInput(e) {
    // 实时更新配置值，但不触发配置更改事件
    this.config = {
      ...this.config,
      temperature_entity: e.target.value
    };
  }

  _onHumidityEntityInput(e) {
    // 实时更新配置值，但不触发配置更改事件
    this.config = {
      ...this.config,
      humidity_entity: e.target.value
    };
  }

  _onCityEntityInput(e) {
    // 实时更新配置值，但不触发配置更改事件
    this.config = {
      ...this.config,
      city_entity: e.target.value
    };
  }

  setConfig(config) {
    this.config = config;
    // 在配置设置后更新条件字段
    setTimeout(() => {
      this._updateConditionalFields();
    }, 0);
  }
}
customElements.define('xiaoshi-weather-pad-editor', XiaoshiWeatherPadEditor);

class XiaoshiWeatherPadCard extends LitElement {
  // 温度计算常量
  static get TEMPERATURE_CONSTANTS() {
    return {
      BUTTON_HEIGHT_PX: 17,        // 温度矩形高度（px）
      CONTAINER_HEIGHT_PX: 125,      // 温度容器总高度（px）
      FORECAST_COLUMNS: 5,          // 预报列数
    };
  }

  // 图标路径常量 - 方便调试修改
  static get ICON_PATH() {
    return '/qweather/icon';
  } 

  static getConfigElement() {
    return document.createElement("xiaoshi-weather-pad-editor");
  }

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entity: { type: Object },
      mode: { type: String },
      _showHourly: { type: Boolean, state: true },
      _showWarning: { type: Boolean, state: true },
      _showAqi: { type: Boolean, state: true },
      _showIndices: { type: Boolean, state: true }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        background: transparent;
      }

      /* 模态框样式 */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
      }

      .modal-content {
        width: 600px;
        max-width: 95%;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 12px;
        box-shadow: 
          0 12px 48px rgba(0, 0, 0, 0.5), 
          0 4px 12px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        position: relative;
        display: flex;
        flex-direction: column;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .modal-content::-webkit-scrollbar {
        display: none;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(51, 51, 51, 0.8);
        flex-shrink: 0;
      }

      .modal-header h2, .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
      }

      .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .modal-body::-webkit-scrollbar {
        display: none;
      }

      .modal-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .modal-close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      /*主卡片样式*/
      .weather-card {
        position: relative;
        border-radius: 15px;
        padding: 8px;
        font-family: sans-serif;
        overflow: hidden;
      }

      /*主卡片样式*/
      .weather-card.dark-theme {
      }

      .main-content {
        position: relative;
      }

      /*天气头部*/
      .weather-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 0px;
        margin-bottom: 0px;
      }

      .weather-left {
        display: flex;
        align-items: center;
      }

      /*天气头部 图标*/
      .weather-icon {
        width: 72px;
        height: 72px;
        margin-right: 16px;
        margin-bottom: 0px;
      }

      /*天气头部 图标*/
      .weather-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }


      /*天气行*/
      .weather-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 0px;
      }

      /*天气右侧对齐*/
      .weather-right-align {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      /*天气右侧容器*/
      .weather-right {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        flex: 1;
        width: 100%;
        position: relative;
      }

      /*天气温度样式*/
      .weather-temperature {
        height: 36px;
        line-height: 36px;
        font-size: 26px;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0;
      }

      /*天气信息样式*/
      .weather-info {
        height: 36px;
        line-height: 36px;
        font-size: 16px;
        margin-top: 0;
        margin-bottom: 0;
        white-space: nowrap;
        display: flex;
        align-items: center;
      }

      .forecast-toggle-button {
        margin-top: auto;
      }

      .toggle-btn {
        padding: 11px 24px;
        border: none;
        border-radius: 20px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        line-height: 16px;
      }

      .toggle-btn-aqi {
        background: transparent;
        padding:0;
        border: none;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
        white-space: nowrap;
        margin-left: 5px;
      }

      .toggle-btn.daily-mode {
        background: #03A9F4; /* 蓝色 */
      }

      .toggle-btn:hover {
        transform: scale(1.1);
      }

      /*9日天气部分*/
      .forecast-container {
        display: grid;
        gap: 4px;
        margin-top: 4px;
        position: relative;
      }

      /*9日天气部分*/
      .forecast-day {
        grid-row: 1;
        text-align: center;
        position: relative;
        border-radius: 8px;
        padding: 3px;
        position: relative;
      }

      /*9日天气部分 星期*/
      .forecast-weekday {
        font-size: 16px;
        height: 14px;
        margin-top: -5px;
        margin-bottom: 5px;
        font-weight: 500;
        white-space: nowrap;
      }
      
      /*9日天气部分 日期*/
      .forecast-date {
        font-size: 13px;
        margin-bottom: 15px;
        margin-left: 0px;
        margin-right: 0px;
        height: 10px;
        white-space: nowrap;
      }

      /*9日天气部分 温度区域*/
      .forecast-temp-container {
        position: relative;
        height: 125px;
        margin-top: 0;
        margin-bottom: 0;
      }

      /*9日天气部分 温度区域*/
      .forecast-temp-null {
        position: relative;
        height: 10px;
      }

      /*9日天气部分 雨量容器*/
      .forecast-rainfall-container {
        text-align: center;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 12.5px;
        margin-top: -10px;
        margin-bottom: 0;
      }

      /*9日天气部分 雨量标签*/
      .forecast-rainfall {
        background: rgba(80, 177, 200);
        color: white;
        font-size: 12px;
        font-weight: bold;
        height: 12.5px;
        min-width: 80% ;
        border-radius: 6px;
        width: fit-content;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        padding: 0 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }
 
      /*雨量填充矩形*/
      .rainfall-fill {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(80, 177, 200, 0.8);
        border-radius: 6px;
        z-index: 1;
        margin: 0 -5px;
        bottom: -15px;
        transition: all 0.3s ease;
      }

      /*9日天气部分 图标*/
      .forecast-icon-container {
        text-align: center;
        position: relative;
        width: 70%;
        height: 70%;
        left: 15%;
        object-fit: contain;
        margin: -5px 0 -10px 0;
      }

      /*9日天气部分 图标*/
      .forecast-icon {
        margin: 0px auto;
      }

      /*9日天气部分 图标*/
      .forecast-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /*9日天气部分 风速*/
      .forecast-wind-container {
        grid-row: 4;
        text-align: center;
        position: relative;
        height: 15px;
        margin-top: -5px;
      }

      /*9日天气部分 风速*/
      .forecast-wind {
        font-size: 15px;
        margin-top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5px;
        height: 15px;
      }

      /*9日天气部分 风速*/
      .wind-direction {
        font-size: 14px;
      }

      /*9日天气部分 温度曲线 Canvas*/
      .temp-line-canvas {
        position: absolute;
        left: 0;
        width: 100%;
        pointer-events: none;
        z-index: 3;
      }

      .temp-line-canvas-high {
        top: 38.5px;
        height: 120px; 
      }

      .temp-line-canvas-low {
        top: 38.5px;
        height: 120px; 
      }

      .temp-line-canvas-hourly {
        position: absolute !important;
        top: 38.5px !important;
        left: 0 !important;
        right: 0 !important;
        height: 125px !important;
        width: 100% !important;
        pointer-events: none !important;
        z-index: 100;
      }

      .temp-curve-high {
        position: absolute;
        left: 0;
        right: 0;
        height: 17.5px;
        border-radius: 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      .temp-curve-low {
        position: absolute;
        left: 0;
        right: 0;
        height: 17.5px;
        border-radius: 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
        margin-top: -5px;
      }

      /* Pad卡片小时和分钟天气按钮样式 */
      .temp-curve-hourly,
      .temp-curve-minutely {
        position: absolute;
        left: 0;
        right: 0;
        height: 17.5px;
        background: linear-gradient(to bottom, 
          rgba(156, 39, 176) 0%, 
          rgba(103, 58, 183) 100%);
        border-radius: 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }
      
      .temp-curve-minutely {
        background: linear-gradient(to bottom, 
          rgba(76, 175, 80) 0%, 
          rgba(56, 142, 60) 100%);
      }

      /* 圆点模式样式 */
      .dot-mode .temp-curve-high,
      .dot-mode .temp-curve-low {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        left: calc(50% - 2.5px);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .dot-mode .temp-curve-hourly {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        left: calc(50% - 2.5px);
        margin-top: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .dot-mode .temp-curve-high {
        background: rgba(255, 87, 34);
        margin-top: -4px;
      }

      .dot-mode .temp-curve-low {
        background: rgba(3, 169, 243);
        margin-top: -6.5px;
      }

      /* 圆点上方的温度文字 */
      .dot-mode .temp-text {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(123, 123, 123, 0.3);
      }

      .dot-mode .temp-curve-high .temp-text {
        color: rgba(255, 87, 34);
        top: -18px;
      }

      .dot-mode .temp-curve-low .temp-text {
        color: rgba(3, 169, 243);
        top: 2px;
      }

      /*预警图标和文字样式*/
      .warning-icon-text {
        color: #FFA726;
        height: 20px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s ease;
        white-space: nowrap;
        align-self: center;
        margin-left: auto;
        margin-top: -2px;
      }

      .warning-icon-text:hover {
        transform: scale(1.1);
      }

      .unavailable {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 0;
        min-height: 0;
        max-height: 0;
        margin: 0;
        padding: 0;
      }
    `;
  }

  constructor() {
    super();
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.scrollTarget = null;
    this.rafId = null;
    this.startX = 0;
    this._hourlyModalMode = 'hourly';
  }
  
  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string') {
          // 处理Home Assistant模板语法 [[[ return theme() ]]]
          if (this.config.theme.includes('[[[') && this.config.theme.includes(']]]')) {
              // 提取模板中的JavaScript代码
              const match = this.config.theme.match(/\[\[\[\s*(.*?)\s*\]\]\]/);
              if (match && match[1]) {
                  const code = match[1].trim();
                  // 如果代码以return开头，直接执行
                  if (code.startsWith('return')) {
                      return (new Function(code))();
                  }
                  // 否则包装在return中执行
                  return (new Function(`return ${code}`))();
              }
          }
          // 处理直接的JavaScript函数字符串
          if (this.config.theme.includes('return') || this.config.theme.includes('=>')) {
              return (new Function(`return ${this.config.theme}`))();
          }
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._updateEntities();
    }
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this.entity = this.hass.states[this.config.entity];
  }

  _getWeatherIcon(condition) {
    const sunState = this.hass?.states['sun.sun']?.state || 'above_horizon';
    const isDark = false;
    const iconPath = XiaoshiWeatherPadCard.ICON_PATH;
    
    const iconMap = {
      '晴': isDark ? 
        (sunState === 'above_horizon' ? `${iconPath}/晴-白天-暗黑.svg` : `${iconPath}/晴-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/晴-白天.svg` : `${iconPath}/晴-夜晚.svg`),
      '少云': isDark ?
        (sunState === 'above_horizon' ? `${iconPath}/少云-白天-暗黑.svg` : `${iconPath}/少云-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/少云-白天.svg` : `${iconPath}/少云-夜晚.svg`),
      '多云': isDark ?
        (sunState === 'above_horizon' ? `${iconPath}/多云-白天-暗黑.svg` : `${iconPath}/多云-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/多云-白天.svg` : `${iconPath}/多云-夜晚.svg`),
      '阴': isDark ? `${iconPath}/阴-暗黑.svg` : `${iconPath}/阴.svg`,
      '雨夹雪': isDark ? `${iconPath}/雨夹雪-暗黑.svg` : `${iconPath}/雨夹雪.svg`,
      '小雨': isDark ? `${iconPath}/小雨-暗黑.svg` : `${iconPath}/小雨.svg`,
      '小雪': isDark ? `${iconPath}/小雪-暗黑.svg` : `${iconPath}/小雪.svg`,
      'clear-night': isDark ? `${iconPath}/晴-夜晚-暗黑.svg` : `${iconPath}/晴-夜晚.svg`,
      'cloudy': isDark ? `${iconPath}/多云-暗黑.svg` : `${iconPath}/多云.svg`,
      'partlycloudy': isDark ? `${iconPath}/少云-暗黑.svg` : `${iconPath}/少云.svg`,
      'sunny': isDark ? `${iconPath}/晴-白天-暗黑.svg` : `${iconPath}/晴-白天.svg`,
      'rainy': isDark ? `${iconPath}/小雨-暗黑.svg` : `${iconPath}/小雨.svg`,
      'snowy': isDark ? `${iconPath}/小雪-暗黑.svg` : `${iconPath}/小雪.svg`,
      'snowy-rainy': isDark ? `${iconPath}/雨夹雪-暗黑.svg` : `${iconPath}/雨夹雪.svg`
    };

    return iconMap[condition] || (isDark ? `${iconPath}/${condition}-暗黑.svg` : `${iconPath}/${condition}.svg`);
  }

  _formatTemperature(temp) {
    if (temp === undefined || temp === null) return '--';
    return temp.toString().includes('.') ? temp : temp;
  }

  _getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    // 如果传入的是字符串且格式为 YYYY-MM-DD，手动解析以避免时区问题
    let targetDate;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [y, m, d] = date.split('-').map(Number);
        targetDate = new Date(y, m - 1, d);
    } else {
        // 兼容 Date 对象或非标准字符串
        const d = new Date(date);
        targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // 计算日期差（毫秒）
    const diffTime = targetDate - todayDate;
    // 使用 Math.round 避免浮点数精度问题
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // 根据日期差返回相应的文本
    if (diffDays === -2) {
      return '前天';
    } else if (diffDays === -1) {
      return '昨天';
    } else if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '明天';
    } else if (diffDays === 2) {
      return '后天';
    }  else {
      // 其他日期返回星期几
      return weekdays[targetDate.getDay()];
    }
  }

  _getForecastDays() {
    const columns = this.config?.columns || XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS.FORECAST_COLUMNS;
    if (!this.entity?.attributes?.daily_forecast) return [];
    return this.entity.attributes.daily_forecast.slice(0, columns);
  }

  _toggleHourlyModal() {
    this._showHourly = true;
  }

  _toggleHourlyModalMode() {
    const enableMinutelyForecast = this.entity?.attributes?.minutely_forecast && this.entity.attributes.minutely_forecast.length > 0;
    if (enableMinutelyForecast) {
        this._hourlyModalMode = this._hourlyModalMode === 'hourly' ? 'minutely' : 'hourly';
        this.requestUpdate();
    }
  }

  _getWarningColorForLevel(level) {
    if (level == "红色") return "rgb(255,50,50)";
    if (level == "橙色") return "rgb(255,100,0)";
    if (level == "黄色") return "rgb(255,200,0)";
    if (level == "蓝色") return "rgb(50,150,200)";
    
    return "#FFA726"; // 默认颜色
  }

  _getWarningColor(warning) {
    if (!warning || warning.length === 0) return "#FFA726"; // 默认颜色
    
    let level = "";
    const priority = ["红色", "橙色", "黄色", "蓝色"];
    
    for (let i = 0; i < warning.length; i++) {
      const currentLevel = warning[i].level;
      if (priority.indexOf(currentLevel) < priority.indexOf(level) || level == "") {
        level = currentLevel;
      }
    }
    
    return this._getWarningColorForLevel(level);
  }

  _toggleWarningModal() {
    this._showWarning = true;
  }

  _toggleApiInfo() {
    this._showAqi = true;
  }
  
  _toggleIndicesDetails() {
    this._showIndices = true;
  }

  _getAqiCategoryHtml() {
    const category = this.entity.attributes?.aqi?.category;
    if (!category) return '';
    
    let color = '';
    switch(category) {
      case '优':
        color = '#4CAF50'; // 绿色
        break;
      case '良':
        color = '#FFC107'; // 黄色
        break;
      case '轻度污染':
        color = '#FF9800'; // 橙色
        break;
      case '中度污染':
      case '重度污染':
      case '严重污染':
        color = '#F44336'; // 红色
        break;
      default:
        color = '#9E9E9E'; // 灰色（其他未知类别）
    }
    
    return html`
            <button class="toggle-btn-aqi" style="color: ${color};" @click="${() => this._toggleApiInfo()}">
              ${category}
            </button>
            ` 
  }

  _getCustomTemperature() {
    if (!this.config?.use_custom_entities || !this.config?.temperature_entity || !this.hass?.states[this.config.temperature_entity]) {
      return null;
    }
    
    const temp = this.hass.states[this.config.temperature_entity].state;
    const tempValue = parseFloat(temp);
    
    if (isNaN(tempValue)) {
      return null;
    }
    
    // 保留1位小数
    return tempValue.toFixed(1);
  }

  _getCustomHumidity() {
    if (!this.config?.use_custom_entities || !this.config?.humidity_entity || !this.hass?.states[this.config.humidity_entity]) {
      return null;
    }
    
    const humidity = this.hass.states[this.config.humidity_entity].state;
    const humidityValue = parseFloat(humidity);
    
    if (isNaN(humidityValue)) {
      return null;
    }
    
    // 保留1位小数
    return humidityValue.toFixed(1);
  }

  _formatSunTime(datetime) {
    if (!datetime) return '';
    
    try {
      const date = new Date(datetime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.warn('时间格式化错误:', error);
      return datetime;
    }
  }

  _getTemperatureExtremes() {
    let temperatures = [];
    
    // 主卡片只显示每日天气，所以固定使用 daily 模式
    const forecastDays = this._getForecastDays();
    if (forecastDays.length === 0) {
      return { minTemp: 0, maxTemp: 0, range: 0 };
    }
    temperatures = forecastDays.flatMap(day => [
      parseFloat(day.native_temp_low) || 0,
      parseFloat(day.native_temperature) || 0
    ]);

    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const range = maxTemp - minTemp;
    
    // 检查是否所有温度都相等
    const allEqual = temperatures.every(temp => temp === temperatures[0]);
    
    return { minTemp, maxTemp, range, allEqual };
  }

  _calculateTemperatureBounds(day, extremes) {
    const { minTemp, maxTemp, range } = extremes;
    const highTemp = parseFloat(day.native_temperature) || 0;
    const lowTemp = parseFloat(day.native_temp_low) || 0;
    
    // 使用常量
    const { BUTTON_HEIGHT_PX, CONTAINER_HEIGHT_PX } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
    
    // 最终分配的区间高度
    const availableHeight = CONTAINER_HEIGHT_PX - BUTTON_HEIGHT_PX;
    
    if (range === 0) {
      return { highTop: 2, lowTop: 10 }; // 默认位置
    }
    
    // 每个温度值对应top位置 = (max-当前温度值) * availableHeight / range
    const unitPosition = availableHeight / range;
    
    // 高温矩形的上边界位置（温度越高，top值越小）
    const highTop = (maxTemp - highTemp) * unitPosition;
    
    // 低温矩形的上边界位置（温度越低，top值越大）
    const lowTop = availableHeight - (lowTemp - minTemp) * unitPosition;
    
    const finalHighTop = Math.max(0, Math.min(highTop, CONTAINER_HEIGHT_PX - BUTTON_HEIGHT_PX));
    const finalLowTop = Math.max(0, Math.min(lowTop, CONTAINER_HEIGHT_PX - BUTTON_HEIGHT_PX));
    
    return { 
      highTop: finalHighTop, 
      lowTop: finalLowTop
    };
  } 

  _getInstanceId() {
    if (!this._instanceId) {
      this._instanceId = Math.random().toString(36).substr(2, 9);
    }
    return this._instanceId;
  }

  _drawTemperatureCurve(canvasId, points, color) {
    
    requestAnimationFrame(() => {
      // 先在shadow DOM中查找，再在document中查找
      let canvas = this.shadowRoot?.getElementById(canvasId) || document.getElementById(canvasId);
      
      if (!canvas) {
        // 通过类名查找
        const className = canvasId.includes('high') ? 'temp-line-canvas-high' : 'temp-line-canvas-low';
        canvas = this.shadowRoot?.querySelector(`.${className}`) || document.querySelector(`.${className}`);
      }
      
      if (!canvas) {
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      // 设置Canvas实际尺寸
      let targetWidth = rect.width;
      
      // 对于小时温度曲线，确保Canvas覆盖整个可滚动宽度
      if (canvasId.includes('hourly')) {
        const hourlyData = this._getHourlyForecast();
        const contentWidth = hourlyData.length * 50; // 每小时50px
        targetWidth = Math.max(rect.width, contentWidth);
      }
      
      canvas.width = targetWidth*3;
      canvas.height = rect.height*3;
      
      if (points.length < 2) {
        return;
      }
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 设置线条样式
      ctx.strokeStyle = color;
      ctx.lineWidth = 6; // 固定线宽
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 开始绘制路径
      ctx.beginPath();
      
      const { CONTAINER_HEIGHT_PX } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
      
      // 转换所有点为Canvas坐标
      const canvasPoints = points.map((point, index) => {
        const x = (point.x / 100) * canvas.width;
        const y = (point.y / CONTAINER_HEIGHT_PX) * canvas.height;
        return { x, y };
      });
      
      if (canvasPoints.length < 2) {
        // 如果只有两个点，直接画直线
        if (canvasPoints.length === 2) {
          ctx.beginPath();
          ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
          ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
          ctx.stroke();
        }
        return;
      }
      
      // 开始绘制平滑曲线，确保通过所有原始点
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      
      // 使用更保守的样条算法，减少曲线过度弯曲
      const tension = 0.2; // 减小张力系数，避免过度弯曲
      
      for (let i = 0; i < canvasPoints.length - 1; i++) {
        const p0 = canvasPoints[Math.max(0, i - 1)];
        const p1 = canvasPoints[i];
        const p2 = canvasPoints[i + 1];
        const p3 = canvasPoints[Math.min(canvasPoints.length - 1, i + 2)];
        
        // 计算控制点，限制控制点距离，避免过度弯曲
        const dx1 = (p2.x - p0.x) * tension;
        const dy1 = (p2.y - p0.y) * tension;
        const dx2 = (p3.x - p1.x) * tension;
        const dy2 = (p3.y - p1.y) * tension;
        
        // 限制控制点的垂直距离，防止曲线超出边界
        const maxControlDistance = Math.abs(p2.x - p1.x) * 0.3;
        const limitedDy1 = Math.max(-maxControlDistance, Math.min(maxControlDistance, dy1));
        const limitedDy2 = Math.max(-maxControlDistance, Math.min(maxControlDistance, dy2));
        
        const cp1x = p1.x + dx1;
        const cp1y = p1.y + limitedDy1;
        const cp2x = p2.x - dx2;
        const cp2y = p2.y - limitedDy2;
        
        // 如果是第一段，使用二次贝塞尔
        if (i === 0) {
          ctx.quadraticCurveTo(cp1x, cp1y, p2.x, p2.y);
        } else {
          // 使用三次贝塞尔曲线，确保通过原始点
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
      }
      
      ctx.stroke();
    });
  }

  _generateTemperatureLine(forecastData, extremes, isHigh = true) {
    if (forecastData.length === 0) return { points: [], curveHeight: 0, curveTop: 0 };
    
    const { BUTTON_HEIGHT_PX, FORECAST_COLUMNS } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
    // 主卡片只显示每日天气，所以固定使用 daily 模式的列数
    const actualColumns = this.config?.columns || FORECAST_COLUMNS;

    // 每日天气使用现有的计算方法
    let boundsList = forecastData.map(day => this._calculateTemperatureBounds(day, extremes));
    
    // 计算曲线范围
    let curveTop, curveBottom, curveHeight;
    
    // 每日天气模式
    if (isHigh) {
      const highTops = boundsList.map(bounds => bounds.highTop);
      curveTop = Math.min(...highTops);
      curveBottom = Math.max(...highTops) + BUTTON_HEIGHT_PX;
      curveHeight = curveBottom - curveTop;
    } else {
      const lowTops = boundsList.map(bounds => bounds.lowTop);
      curveTop = 0;
      curveBottom = Math.max(...lowTops) + BUTTON_HEIGHT_PX;
      curveHeight = curveBottom - curveTop;
    }
    
    const points = forecastData.map((data, index) => {
      const bounds = boundsList[index];
      const topPosition = isHigh ? bounds.highTop : bounds.lowTop;
      
      // 计算相对于曲线顶部的Y坐标（px单位），使用矩形中心
      const y = topPosition - curveTop + BUTTON_HEIGHT_PX/ 1.7;
      
      // 计算X坐标（百分比）
      const x = (index * 100) / actualColumns + (100 / actualColumns) / 2;
      
      return { x, y };
    });
    
    return { points, curveHeight, curveTop };
  }

  _renderDailyForecast() {
    const forecastDays = this._getForecastDays();
    const extremes = this._getTemperatureExtremes();
    const theme = this._evaluateTheme();
    const secondaryColor = 'rgb(110, 190, 240)';
    const backgroundColor = 'rgba(255, 255, 255, 0.2)';

    // 生成温度曲线坐标
    const highTempData = this._generateTemperatureLine(forecastDays, extremes, true);
    const lowTempData = this._generateTemperatureLine(forecastDays, extremes, false);
    
    // 使用组件实例ID + Canvas ID，避免多实例冲突
    const instanceId = this._getInstanceId();
    const highCanvasId = `high-temp-canvas-${instanceId}`;
    const lowCanvasId = `low-temp-canvas-${instanceId}`;
    
    // 在DOM更新完成后绘制曲线
    this.updateComplete.then(() => {
      setTimeout(() => {
        this._drawTemperatureCurve(highCanvasId, highTempData.points, 'rgba(255, 87, 34)');
        this._drawTemperatureCurve(lowCanvasId, lowTempData.points, 'rgba(33, 150, 243)');
      }, 50);
    });
    
    const columns = this.config?.columns || XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS.FORECAST_COLUMNS;
    return html`
      <div class="forecast-container" style="grid-template-columns: repeat(${columns}, 1fr);">
        <!-- 最高温度连接线 Canvas -->
        <canvas class="temp-line-canvas temp-line-canvas-high" id="high-temp-canvas-${this._getInstanceId()}"></canvas>
        
        <!-- 最低温度连接线 Canvas -->
        <canvas class="temp-line-canvas temp-line-canvas-low" id="low-temp-canvas-${this._getInstanceId()}"></canvas>
        
        ${forecastDays.map((day, index) => {
          let date;
          if (typeof day.datetime === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day.datetime)) {
              const [y, m, d] = day.datetime.split('-').map(Number);
              date = new Date(y, m - 1, d);
          } else {
              date = new Date(day.datetime);
          }
          const weekday = this._getWeekday(day.datetime);
          const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
          const highTemp = this._formatTemperature(day.native_temperature);
          const lowTemp = this._formatTemperature(day.native_temp_low);

          // 如果是昨天，设置透明度 
          const isYesterday = weekday !== '昨天' && weekday !== '前天';
          const opacity = isYesterday ? 1 : 0.5;
          const theme = this._evaluateTheme();
          const hightbackground = isYesterday ? 
                'linear-gradient(to bottom,rgba(255, 87, 34) 0%,rgba(255, 152, 0) 100%)':
                theme === 'on' ? 
                'linear-gradient(to bottom,rgb(250, 149, 117) 0%,rgb(250, 188, 97) 100%)':
                'linear-gradient(to bottom,rgb(181, 81, 49) 0%,rgb(181, 120, 28) 100%)';
          const lowbackground = isYesterday ?  
                'linear-gradient(to bottom,rgba(3, 169, 243) 0%,rgba(33, 150, 243) 100%)':
                theme === 'on' ? 
                'linear-gradient(to bottom,rgb(99, 198, 243) 0%,rgb(117, 187, 243)100%)':
                'linear-gradient(to bottom,rgb(30, 130, 174) 0%,rgb(48, 118, 174) 100%)';
                
          const hightcolor = isYesterday ? 'rgba(255, 87, 34)': theme === 'on' ? 'rgb(250, 149, 117)' : 'rgb(181, 81, 49)';
          const lowcolor = isYesterday ? 'rgba(3, 169, 243)': theme === 'on' ? 'rgb(99, 198, 243)' : 'rgb(30, 130, 174)';



          // 计算温度矩形的动态边界和高度
          const tempBounds = this._calculateTemperatureBounds(day, extremes);
          
          // 获取雨量信息
          const rainfall = parseFloat(day.native_precipitation) || 0;
          
          // 计算雨量矩形高度和位置
          const RAINFALL_MAX = 25; // 最大雨量25mm
          const rainfallHeight = Math.min((rainfall / RAINFALL_MAX) * 125, 125); // 最大高度125px（到日期下面）

          return html`
            <div class="forecast-day" style="background: ${backgroundColor};">
              <!-- 星期（周X） -->
              <div class="forecast-weekday" style="opacity: ${opacity};">${weekday}</div>
              
              <!-- 日期（mm月dd日） -->
              <div class="forecast-date" style="color: ${secondaryColor}; opacity: ${opacity};">${dateStr}</div>
              
              <!-- 高温（橙色）和 低温（蓝色） -->
              <div class="forecast-temp-container">
                ${this.config.visual_style === 'dot' ? html`
                  <!-- 圆点模式 -->
                  <div class="temp-curve-high" style="top: ${tempBounds.highTop + 8.5}px">
                    <div class="temp-text" style="color: ${hightcolor};">${highTemp}°</div>
                  </div>
                  <div class="temp-curve-low" style="top: ${tempBounds.lowTop + 8.5}px">
                    <div class="temp-text" style="color: ${lowcolor};">${lowTemp}°</div>
                  </div>
                ` : html`
                  <!-- 按钮模式 -->
                  <div class="temp-curve-high" style="background: ${hightbackground}; top: ${tempBounds.highTop}px">
                    ${highTemp}°
                  </div>
                  <div class="temp-curve-low" style="background: ${lowbackground}; top: ${tempBounds.lowTop}px">
                    ${lowTemp}°
                  </div>
                `}
                
                <!-- 雨量填充矩形 -->
                ${rainfall > 0 ? html`
                  <div class="rainfall-fill" style="height: ${rainfallHeight + 10}px; opacity: ${0.3+rainfall / RAINFALL_MAX}"></div>
                ` : ''}
              </div>
              <div class="forecast-temp-null"></div>
            </div>
          `;
        })}
        
        <!-- 雨量标签行 - 10列网格 -->
        ${forecastDays.map(day => {
          const rainfall = parseFloat(day.native_precipitation) || 0;
          return html`
            <div class="forecast-rainfall-container">
              ${rainfall > 0 ? html`
                <div class="forecast-rainfall">
                  ${rainfall}mm
                </div>
              ` : ''}
            </div>
          `;
        })}
        
        <!-- 天气图标行 -->
        ${this._renderWeatherIcons(forecastDays)}
        
        <!-- 风向风级行 -->
        ${this._renderWindInfo(forecastDays)}
      </div>
    `;
  }

  render() {
    if (!this.entity || this.entity.state === 'unavailable') {
      return html`<div class="unavailable"></div>`;
    }
    // 获取自定义或默认的温度和湿度
    const customTemp = this._getCustomTemperature();
    const customHumidity = this._getCustomHumidity();
    const temperature = customTemp || this._formatTemperature(this.entity.attributes?.temperature);
    const humidity = customHumidity || this._formatTemperature(this.entity.attributes?.humidity);
    const condition = this.entity.attributes?.condition_cn || '未知';
    const windSpeed = this.entity.attributes?.wind_speed || 0;
    const windBearing = this.entity.attributes?.wind_bearing || 0;
    const pressure = this.entity.attributes?.pressure || 0;
    const visibility = this.entity.attributes?.visibility || 0;
    const warning = this.entity.attributes?.warning || [];
    const theme = this._evaluateTheme();
    const hasaqi = this.entity.attributes?.aqi && Object.keys(this.entity.attributes.aqi).length > 0;
    const hassairindices = this.entity.attributes?.air_indices && Object.keys(this.entity.attributes.air_indices).length > 0;
    const hasWarning = warning && Array.isArray(warning) && warning.length > 0;
    const warningColor = this._getWarningColor(warning);

    const update_time = this.entity.attributes?.update_time || '未知时间';
    const sunRise = this.entity.attributes?.sun.sunrise || '';
    const sunSet = this.entity.attributes?.sun.sunset || '';
    // 获取颜色
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = this.config.card_bg_color || (theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)');
    const secondaryColor = theme === 'on' ? 'rgb(110, 190, 240)' : 'rgb(110, 190, 240)';

    const cardWidth = this.config?.width || 260;
    
    const visualStyle = this.config.visual_style || 'button';
    const isDotMode = visualStyle === 'dot';
    
    return html`
      <div class="weather-card ${theme === 'on' ? 'dark-theme' : ''} ${isDotMode ? 'dot-mode' : ''}" style="background-color: ${bgColor}; color: ${fgColor}; width: ${cardWidth}px; max-width: ${cardWidth}px; margin: 0 auto;">
        <div class="main-content">
          <!-- 天气头部信息 -->
          <div class="weather-header">
            <!-- 左侧图标 -->
            <div class="weather-icon">
              <img src="${this._getWeatherIcon(condition)}" alt="${condition}">
            </div>
            
            <!-- 右侧内容区域 -->
            <div class="weather-right">
              <!-- 第一行：温度湿度 | 预警图标 -->
              <div class="weather-row">
                <div class="weather-temperature">
                  ${temperature}<font size="1px"><b> ℃&ensp;</b></font>
                  ${humidity}<font size="1px"><b> % </b></font>
                </div>
                <div class="weather-right-align">
                  
                </div>
              </div>
              
              <!-- 第二行：天气信息 + AQI -->
              <div class="weather-row">
                <div class="weather-info">
                  <span style="color: ${secondaryColor};">${condition} 
                    <span class="wind-direction">${this._getWindDirectionIcon(windBearing)}</span>
                    ${windSpeed}<span style="font-size: 0.6em;">km/h </span>
                    ${pressure}<span style="font-size: 0.6em;">hPa </span>
                    ${visibility}<span style="font-size: 0.6em;">km </span>
                  </span>
                  ${this._getAqiCategoryHtml()}
                </div>
              </div>

              <!-- 中间位置的右侧按钮（绝对定位于weather-right中） -->
              <div class="weather-right-buttons" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 10px">
                ${hassairindices ? html`
                  <button class="toggle-btn daily-mode" style="background: rgb(51, 122, 159);" @click="${() => this._toggleIndicesDetails()}">
                    指数
                  </button>
                ` : ''}
                <button class="toggle-btn daily-mode" style="background: ${this.entity?.attributes?.minutely_forecast && this.entity.attributes.minutely_forecast.length > 0 && this._hourlyModalMode === 'minutely' ? '#4CAF50' : '#9C27B0'}" @click="${() => this._toggleHourlyModal()}">
                  ${this.entity?.attributes?.minutely_forecast && this.entity.attributes.minutely_forecast.length > 0 && this._hourlyModalMode === 'minutely' ? '分钟' : '小时'}
                </button>
                ${hasWarning ? html`
                  <button class="toggle-btn daily-mode" style="background: ${warningColor};" @click="${() => this._toggleWarningModal()}">
                    ⚠ ${warning.length}
                  </button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- 预报内容 -->
          ${this._renderDailyForecast()}

        </div>

        <div class="update-time" style="display: flex; justify-content: space-between; align-items: center; font-size: 15px; padding: 8px 8px 0 8px;">
          <div>
            ${this._getRelativeTime(update_time)}  
          </div>
          
          <!-- 日出日落信息 - 放在右侧 -->
          ${sunRise && sunSet ? html`
            <div class="sunrise-sunset-container" style="display: flex; align-items: center; gap: 5px;">
              <div style="display: flex; align-items: center; font-size: 15px;">
                <ha-icon icon="mdi:weather-sunset-up" style="color: #FFA726; margin-right: 5px; --mdc-icon-size: 17px;"></ha-icon>
                <span>${sunRise} </span>
              </div>
              <div style="display: flex; align-items: center; font-size: 15px;">
                <ha-icon icon="mdi:weather-sunset-down" style="color: #FF7043; margin-right: 5px; --mdc-icon-size: 17px;"></ha-icon>
                <span style="margin-right: 5px;">${sunSet}  </span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 模态框渲染 -->
        ${this._showHourly ? html`
          <div class="modal-overlay" @click="${() => this._showHourly = false}">
            <div class="modal-content" style="background: ${this.config.card_bg_color || (theme === 'on' ? '#ffffff' : '#323232')}; color: ${fgColor};" @click="${(e) => e.stopPropagation()}">
              <div class="modal-header" style="border-bottom-color: rgba(128, 128, 128, 0.5);">
                <h3>${this._hourlyModalMode === 'minutely' ? '分钟天气预报' : '24小时天气预报'}</h3>
                <div style="display: flex; align-items: center;">
                    ${this.entity?.attributes?.minutely_forecast && this.entity.attributes.minutely_forecast.length > 0 ? html`
                    <button class="toggle-btn" style="padding: 5px 10px; font-size: 14px; margin-right: 10px; background: ${this._hourlyModalMode === 'minutely' ? '#4CAF50' : '#9C27B0'};" @click="${() => this._toggleHourlyModalMode()}">
                        ${this._hourlyModalMode === 'minutely' ? '分钟' : '小时'}
                    </button>
                    ` : ''}
                    <button class="modal-close-btn" style="color: ${theme === 'on' ? '#000' : '#fff'}" @click="${() => this._showHourly = false}">×</button>
                </div>
              </div>
              <div class="modal-body">
                <xiaoshi-hourly-weather-card .hass=${this.hass} .config=${this.config} .entity=${this.entity} .forecastMode=${this._hourlyModalMode}></xiaoshi-hourly-weather-card>
              </div>
            </div>
          </div>
        ` : ''}

        ${this._showWarning ? html`
          <div class="modal-overlay" @click="${() => this._showWarning = false}">
            <div class="modal-content" style="background: ${this.config.card_bg_color || (theme === 'on' ? '#ffffff' : '#323232')}; color: ${fgColor};" @click="${(e) => e.stopPropagation()}">
              <div class="modal-header" style="border-bottom-color: rgba(128, 128, 128, 0.5);">
                <h3>天气预警</h3>
                <button class="modal-close-btn" style="color: ${theme === 'on' ? '#000' : '#fff'}" @click="${() => this._showWarning = false}">×</button>
              </div>
              <div class="modal-body">
                <xiaoshi-warning-weather-card .hass=${this.hass} .config=${this.config}></xiaoshi-warning-weather-card>
              </div>
            </div>
          </div>
        ` : ''}

        ${this._showAqi ? html`
          <div class="modal-overlay" @click="${() => this._showAqi = false}">
            <div class="modal-content" style="background: ${this.config.card_bg_color || (theme === 'on' ? '#ffffff' : '#323232')}; color: ${fgColor};" @click="${(e) => e.stopPropagation()}">
              <div class="modal-header" style="border-bottom-color: rgba(128, 128, 128, 0.5);">
                <h3>空气质量详情</h3>
                <button class="modal-close-btn" style="color: ${theme === 'on' ? '#000' : '#fff'}" @click="${() => this._showAqi = false}">×</button>
              </div>
              <div class="modal-body">
                <xiaoshi-aqi-weather-card .hass=${this.hass} .config=${this.config}></xiaoshi-aqi-weather-card>
              </div>
            </div>
          </div>
        ` : ''}

        ${this._showIndices ? html`
          <div class="modal-overlay" @click="${() => this._showIndices = false}">
            <div class="modal-content" style="background: ${this.config.card_bg_color || (theme === 'on' ? '#ffffff' : '#323232')}; color: ${fgColor};" @click="${(e) => e.stopPropagation()}">
              <div class="modal-header" style="border-bottom-color: rgba(128, 128, 128, 0.5);">
                <h3>生活指数</h3>
                <button class="modal-close-btn" style="color: ${theme === 'on' ? '#000' : '#fff'}" @click="${() => this._showIndices = false}">×</button>
              </div>
              <div class="modal-body">
                <xiaoshi-indices-weather-card .hass=${this.hass} .config=${this.config}></xiaoshi-indices-weather-card>
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  _formatSunTime(datetime) {
    if (!datetime) return '';
    
    try {
      const date = new Date(datetime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.warn('时间格式化错误:', error);
      return datetime;
    }
  }

   _getRelativeTime(updateTime) {
    if (!updateTime || updateTime === '未知时间') {
      return '未知时间';
    }
    
    try {
      // 解析更新时间，支持多种格式
      let updateDate;
      if (updateTime.includes(' ')) {
        // 格式: "2025-12-18 20:28"
        const [datePart, timePart] = updateTime.split(' ');
        updateDate = new Date(`${datePart}T${timePart}:00`);
      } else if (updateTime.includes('T')) {
        // 格式: "2025-12-18T20:28:00"
        updateDate = new Date(updateTime);
      } else {
        return updateTime; // 无法解析，返回原始值
      }
      
      const now = new Date();
      const diffMs = now - updateDate;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let relativeTime = '';
      if (diffMinutes < 1) {
        relativeTime = '刚刚';
      } else if (diffMinutes < 60) {
        relativeTime = `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        relativeTime = `${diffHours}小时前`;
      } else {
        relativeTime = `${diffDays}天前`;
      }
      
      return `数据更新时间：: ${relativeTime}`;
    } catch (error) {
      console.warn('时间解析错误:', error);
      return `数据更新时间：${updateTime}`;
    }
  }

  _renderWeatherIcons(forecastDays) {
    return html`
      ${forecastDays.map(day => {
        // 如果是昨天，设置透明度 
        const weekday = this._getWeekday(day.datetime);
        const isYesterday = weekday !== '昨天' && weekday !== '前天';
        const opacity = isYesterday ? 1 : 0.5;
        return html`
          <div class="forecast-icon-container" style="opacity: ${opacity}">
            <div class="forecast-icon">
              <img src="${this._getWeatherIcon(day.text)}" alt="${day.text}">
            </div>
          </div>
        `;
      })}
        </div>
      </div>
    `;
  }

  _renderWindInfo(forecastDays) {
    const theme = this._evaluateTheme();
    const secondaryColor = 'rgb(110, 190, 240)';
    return html`
      ${forecastDays.map(day => {
        const windSpeedRaw = day.windscaleday || 0;
        let windSpeed = windSpeedRaw;

        // 如果是昨天，设置透明度 
        const weekday = this._getWeekday(day.datetime);
        const isYesterday = weekday !== '昨天' && weekday !== '前天';
        const opacity = isYesterday ? 1 : 0.5;
        // 如果风速是 "4-5" 格式，取最大值
        if (typeof windSpeedRaw === 'string' && windSpeedRaw.includes('-')) {
          const speeds = windSpeedRaw.split('-').map(s => parseFloat(s.trim()));
          if (speeds.length === 2 && !isNaN(speeds[0]) && !isNaN(speeds[1])) {
            windSpeed = Math.max(speeds[0], speeds[1]);
          }
        }
        
        const windDirection = day.wind_bearing || 0;
        
        return html`
          <div class="forecast-wind-container" style="opacity: ${opacity}">
            <div class="forecast-wind" style="color: ${secondaryColor};">
              <span class="wind-direction" >${this._getWindDirectionIcon(windDirection)}</span>
              <span>${windSpeed}级</span>
            </div>
          </div>
        `;
      })}
        </div>
      </div>
    `;
  }

  _getWindDirectionIcon(bearing) {
    // 0是北风，按顺时针方向增加
    const directions = [
      { range: [337.5, 360], icon: '↑', name: '北' },    // 337.5-360度
      { range: [0, 22.5], icon: '↑', name: '北' },        // 0-22.5度
      { range: [22.5, 67.5], icon: '↗', name: '东北' },    // 22.5-67.5度
      { range: [67.5, 112.5], icon: '→', name: '东' },     // 67.5-112.5度
      { range: [112.5, 157.5], icon: '↘', name: '东南' },   // 112.5-157.5度
      { range: [157.5, 202.5], icon: '↓', name: '南' },     // 157.5-202.5度
      { range: [202.5, 247.5], icon: '↙', name: '西南' },   // 202.5-247.5度
      { range: [247.5, 292.5], icon: '←', name: '西' },     // 247.5-292.5度
      { range: [292.5, 337.5], icon: '↖', name: '西北' }    // 292.5-337.5度
    ];

    const direction = directions.find(dir => {
      if (dir.range[0] <= dir.range[1]) {
        // 正常范围，如 22.5-67.5
        return bearing >= dir.range[0] && bearing < dir.range[1];
      } else if (dir.range[0] === 337.5 && dir.range[1] === 360) {
        // 337.5-360度特殊处理
        return bearing >= dir.range[0] && bearing <= 360;
      } else if (dir.range[0] === 0 && dir.range[1] === 22.5) {
        // 0-22.5度特殊处理
        return bearing >= dir.range[0] && bearing < dir.range[1];
      }
      return false;
    });

    return direction ? direction.icon : '↓';
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
  }

  getCardSize() {
    return 8;
  }

  // 鼠标滑动处理方法
  _handleMouseDown(e) {
    const container = e.target.closest('.forecast-container');
    const wrapper = e.target.closest('.forecast-container-wrapper');
    if (!container || !wrapper) return;
    
    this.isDragging = true;
    this.startX = e.pageX - wrapper.offsetLeft;
    this.scrollLeft = wrapper.scrollLeft || 0;
    this.scrollTarget = wrapper;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  }

  _handleMouseUp(e) {
    this.isDragging = false;
    if (this.scrollTarget) {
      const container = this.scrollTarget.querySelector('.forecast-container');
      if (container) {
        container.style.cursor = 'grab';
      }
      this.scrollTarget = null;
    }
  }

  _handleMouseMove(e) {
    if (!this.isDragging || !this.scrollTarget) return;
    
    e.preventDefault();
    const x = e.pageX - this.scrollTarget.offsetLeft;
    const walk = (x - this.startX) * 1.5; // 调整滑动速度
    
    // 使用requestAnimationFrame优化性能
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollLeft = this.scrollLeft - walk;
      }
    });
  }

  // 触摸滑动处理方法
  _handleTouchStart(e) {
    const container = e.target.closest('.forecast-container');
    const wrapper = e.target.closest('.forecast-container-wrapper');
    if (!container || !wrapper) return;
    
    this.startX = e.touches[0].pageX - wrapper.offsetLeft;
    this.scrollLeft = wrapper.scrollLeft || 0;
    this.scrollTarget = wrapper;
  }

  _handleTouchEnd(e) {
    this.scrollTarget = null;
  }

  _handleTouchMove(e) {
    if (!this.scrollTarget) return;
    
    e.preventDefault();
    const x = e.touches[0].pageX - this.scrollTarget.offsetLeft;
    const walk = (x - this.startX) * 1.5; // 调整滑动速度
    
    // 使用requestAnimationFrame优化性能
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollLeft = this.scrollLeft - walk;
      }
    });
  }
}

class XiaoshiWeatherPadCardV2 extends XiaoshiWeatherPadCard {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entity: { type: Object },
      selectedEntityIndex: { type: Number },
      forecastMode: { type: String },
      selectedIndexDetail: { type: Object },
      selectedWarningDetail: { type: Array },
      _entityDragStartX: { type: Number }
    };
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        width: auto;
        inline-size: auto;
        max-width: 96vw;
        margin: 0 auto;
        background: transparent;
        --weather-glass-bg: rgba(248, 252, 255, 0.54);
        --weather-glass-strong: rgb(127 194 229 / 72%);
        --weather-glass-soft: rgba(255, 255, 255, 0.28);
        --weather-border: rgba(255, 255, 255, 0.58);
        --weather-border-soft: rgba(255, 255, 255, 0.28);
        --weather-text: rgba(26, 43, 62, 0.94);
        --weather-muted: rgba(58, 77, 97, 0.78);
        --weather-faint: rgb(255 255 255 / 77%);
        --weather-blue: #4aa7ff;
        --weather-cyan: #56d5e9;
        --weather-orange: #ff9b54;
        --weather-green: #46c878;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif;
        color: var(--weather-text);
        font-weight: 350;
      }

      * {
        box-sizing: border-box;
      }

      button {
        font: inherit;
      }

      .weather-shell {
        position: relative;
        width: var(--weather-card-width, min(calc(96vw - 6px), 1254px));
        margin: 0 auto;
        overflow: hidden;
        border-radius: 28px;
        padding: 18px;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(225, 242, 255, 0.38)),
          radial-gradient(circle at 12% 0%, rgba(116, 204, 255, 0.24), transparent 38%),
          radial-gradient(circle at 88% 12%, rgba(255, 185, 112, 0.18), transparent 34%);
        border: 1px solid var(--weather-border);
        box-shadow: 0 28px 70px rgba(18, 38, 61, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.86);
        backdrop-filter: blur(30px) saturate(1.45);
        -webkit-backdrop-filter: blur(30px) saturate(1.45);
        isolation: isolate;
      }

      .weather-shell::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.44), transparent 35%, rgba(255, 255, 255, 0.18));
        z-index: -1;
      }

      .weather-shell.dark {
        --weather-glass-bg: rgba(24, 35, 52, 0.58);
        --weather-glass-strong: rgb(127 194 229 / 72%);
        --weather-glass-soft: rgba(255, 255, 255, 0.12);
        --weather-border: rgba(255, 255, 255, 0.24);
        --weather-border-soft: rgba(255, 255, 255, 0.14);
        --weather-text: rgba(248, 252, 255, 0.96);
        --weather-muted: rgba(223, 235, 247, 0.74);
        --weather-faint: rgb(255 255 255 / 77%);
        background: rgba(31, 148, 191, 0.6);
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .weather-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 16px;
        align-items: start;
      }

      .weather-main {
        min-width: 0;
      }

      .glass {
        background: var(--weather-glass-soft);
        border: 1px solid #145f864d;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 12px 26px rgba(21, 47, 76, 0.12);
        backdrop-filter: blur(18px) saturate(1.4);
        -webkit-backdrop-filter: blur(18px) saturate(1.4);
      }

      .entity-switcher {
        position: relative;
        display: flex;
        gap: 6px;
        width: fit-content;
        max-width: 100%;
        padding: 4px;
        margin-bottom: 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.26);
        border: 1px solid rgba(255, 255, 255, 0.34);
        touch-action: pan-y;
        overflow: hidden;
      }

      .switcher-indicator {
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 4px;
        border-radius: 999px;
        background: var(--weather-glass-strong);
        box-shadow: 0 8px 18px rgba(25, 66, 108, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.75);
        transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1);
        pointer-events: none;
      }

      .entity-pill,
      .segment {
        border: 0;
        cursor: pointer;
        color: var(--weather-muted);
        background: transparent;
        white-space: nowrap;
        transition: color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }

      .entity-pill {
        position: relative;
        z-index: 1;
        flex: 1 1 0;
        min-width: 96px;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 7px 13px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 350;
      }

      .entity-pill.active,
      .segment.active {
        color: var(--weather-text);
      }

      .entity-pill:active,
      .segment:active,
      .icon-button:active,
      .index-row:active {
        transform: scale(0.98);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 14px;
        align-items: start;
      }

      .current {
        display: grid;
        grid-template-columns: 82px minmax(0, 1fr);
        gap: 12px;
        min-width: 0;
      }

      .current-icon {
        width: 104px;
        height: 104px;
        padding: 2px;
      }

      .current-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 12px 20px rgba(255, 188, 70, 0.3));
      }

      .temp-line {
        display: flex;
        align-items: baseline;
        gap: 8px;
        min-width: 0;
      }

      .temperature {
        font-size: 72px;
        line-height: 0.95;
        letter-spacing: 0;
        font-weight: 350;
        font-variant-numeric: tabular-nums;
        color: rgba(255, 255, 255, 0.98);
        text-shadow: 0 10px 24px rgba(19, 30, 48, 0.22);
      }

      .condition {
        font-size: 30px;
        font-weight: 350;
        color: rgba(255, 255, 255, 0.98);
        text-shadow: 0 8px 20px rgba(19, 30, 48, 0.18);
      }

      .city-line,
      .meta-line {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        color: var(--weather-muted);
        font-size: 14px;
        line-height: 1.35;
      }

      .city-line {
        margin-top: 6px;
        color: var(--weather-text);
        font-weight: 350;
      }

      .city-line span,
      .meta-line span {
        min-width: 0;
        white-space: normal;
      }

      .right-summary {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 10px;
        min-width: 248px;
        width: 248px;
        max-width: 248px;
      }

      .sun-chip,
      .warning-chip,
      .summary-chip {
        width: 100%;
        border-radius: 22px;
        font-size: 12px;
        font-weight: 350;
        color: var(--weather-muted);
        letter-spacing: 0;
      }

      .sun-chip {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0;
        min-height: 72px;
        padding: 10px 0;
        background: rgba(255, 255, 255, 0.115);
        border-color: rgba(255, 255, 255, 0.18);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 8px 18px rgba(9, 26, 45, 0.1);
      }

      .warning-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 72px;
        padding: 10px 14px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: pointer;
        background: var(--warning-chip-bg, rgba(255, 255, 255, 0.135));
        color: var(--warning-chip-fg, rgba(248, 252, 255, 0.96));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 8px 18px rgba(9, 26, 45, 0.1);
      }

      .warning-chip:disabled {
        cursor: default;
        opacity: 0.85;
      }

      .warning-chip.has-warning {
        background: var(--warning-chip-bg, rgba(255, 137, 88, 0.13));
        border-color: var(--warning-chip-border, rgba(255, 145, 92, 0.26));
      }

      .sun-chip ha-icon {
        --mdc-icon-size: 28px;
        color: rgba(238, 246, 252, 0.88);
        opacity: 0.94;
      }

      .warning-chip ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.92;
        color: var(--warning-chip-fg, rgba(248, 252, 255, 0.96));
      }

      .sun-chip span,
      .warning-chip span {
        color: inherit;
        font-size: 11.5px;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      .sun-slot {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        min-width: 0;
        padding: 0 14px;
      }

      .sun-slot + .sun-slot {
        border-left: 1px solid rgba(255, 255, 255, 0.2);
        padding-left: 14px;
        margin-left: 0;
      }

      .sun-slot-label {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        color: rgba(234, 244, 252, 0.72);
        font-size: 11px;
      }

      .sun-slot-label span {
        color: inherit;
        font-size: 11px;
      }

      .sun-slot-copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        min-width: 0;
      }

      .sun-slot-time {
        color: rgba(255, 255, 255, 0.98);
        font-size: 20px;
        line-height: 1;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
      }

      .warning-chip-copy {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }

      .warning-chip-meta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        color: var(--warning-chip-fg, rgba(248, 252, 255, 0.96));
      }

      .warning-chip-meta span {
        white-space: nowrap;
      }

      .warning-chip-title {
        color: var(--warning-chip-fg, rgba(248, 252, 255, 0.94));
        font-size: 14px;
        line-height: 1.15;
      }

      .warning-chip-subtitle {
        color: var(--warning-chip-subtle, rgba(235, 242, 249, 0.72));
        font-size: 10.5px;
        line-height: 1.25;
      }

      .warning-chip-count {
        flex: 0 0 auto;
        align-self: center;
        min-width: 38px;
        padding: 7px 9px;
        border-radius: 999px;
        color: var(--warning-chip-fg, rgba(249, 252, 255, 0.96));
        background: var(--warning-chip-count-bg, rgba(255, 255, 255, 0.1));
        text-align: center;
        font-size: 12px;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      ha-icon {
        --mdc-icon-size: 16px;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(4, minmax(128px, 1fr));
        gap: 10px;
        margin: 14px 0;
      }

      .metric {
        min-width: 0;
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 16px;
      }

      .metric-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: var(--metric-color, var(--weather-cyan));
        background: transparent;
        box-shadow: none;
      }

      .metric-icon ha-icon {
        --mdc-icon-size: 17px;
      }

      .metric-label {
        font-size: 11px;
        color: var(--weather-faint);
        white-space: nowrap;
      }

      .metric-value {
        margin-top: 3px;
        font-size: 14px;
        font-weight: 350;
        color: var(--weather-text);
        white-space: normal;
        overflow-wrap: anywhere;
        font-variant-numeric: tabular-nums;
      }

      .forecast-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin: 10px 0 9px;
      }

      .segments {
        position: relative;
        display: flex;
        gap: 4px;
        padding: 4px;
        border-radius: 999px;
        overflow: hidden;
      }

      .segments-indicator {
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 4px;
        border-radius: 999px;
        background: var(--weather-glass-strong);
        box-shadow: 0 8px 18px rgba(25, 66, 108, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.75);
        transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1);
        pointer-events: none;
      }

      .segment {
        position: relative;
        z-index: 1;
        flex: 1 1 0;
        min-width: 72px;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 350;
      }

      .minutely-summary {
        flex: 1;
        min-width: 0;
        text-align: right;
        color: var(--weather-muted);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .forecast-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x;
        cursor: grab;
        animation: forecast-slide-in 240ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .forecast-scroll::-webkit-scrollbar {
        display: none;
      }

      .forecast-scroll:active {
        cursor: grabbing;
      }

      .forecast-scroll.dragging {
        cursor: grabbing;
        user-select: none;
        -webkit-user-select: none;
      }

      .forecast-grid {
        position: relative;
        display: grid;
        gap: 8px;
        min-width: max-content;
        padding-bottom: 2px;
      }

      .forecast-card {
        position: relative;
        display: grid;
        grid-template-rows: 22px 19px 132px 20px 40px 34px;
        width: 112px;
        min-height: 270px;
        padding: 10px 9px;
        border-radius: 18px;
        text-align: center;
        overflow: hidden;
        background: var(--weather-glass-soft);
        border: 1px solid #145f864d;
        transition: none;
      }

      .forecast-card.current-day {
        background: rgba(255, 255, 255, 0.5);
        border-color: rgba(255, 255, 255, 0.62);
      }

      .forecast-time,
      .forecast-date,
      .rain-label,
      .forecast-wind {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .forecast-time {
        font-size: 13px;
        font-weight: 350;
        color: rgba(255, 255, 255, 0.98);
      }

      .forecast-date {
        color: rgba(255, 255, 255, 0.92);
        font-size: 11px;
      }

      .temp-zone {
        position: relative;
        margin: 4px 0;
      }

      .rain-fill {
        position: absolute;
        left: 4px;
        right: 4px;
        bottom: 0;
        border-radius: 999px 999px 10px 10px;
        background: linear-gradient(179deg, rgb(50 200 74 / 20%), rgb(12 183 206 / 94%));
      }

      .temp-dot {
        position: absolute;
        left: 50%;
        width: 8px;
        height: 8px;
        margin-left: -4px;
        border-radius: 999px;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.44);
        z-index: 3;
      }

      .temp-dot.high,
      .temp-dot.hourly {
        background: var(--weather-orange);
      }

      .temp-dot.low {
        background: var(--weather-blue);
      }

      .temp-dot.minutely {
        background: var(--weather-green);
      }

      .temp-label {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        font-weight: 350;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }

      .temp-label.high,
      .temp-label.hourly {
        color: var(--weather-orange);
        top: -19px;
      }

      .temp-label.low {
        color: var(--weather-blue);
        top: 8px;
      }

      .temp-label.minutely {
        color: var(--weather-green);
        top: -19px;
      }

      .rain-label {
        align-self: center;
        justify-self: center;
        max-width: 100%;
        min-height: 18px;
        padding: 2px 7px;
        border-radius: 999px;
        color: rgba(0, 30, 39, 1);
        background: rgba(79, 203, 236, 0.2);
        font-size: 11px;
        font-weight: 350;
      }

      .forecast-scroll.mode-forward {
        animation-name: forecast-slide-forward;
      }

      .forecast-scroll.mode-backward {
        animation-name: forecast-slide-backward;
      }

      @keyframes forecast-slide-in {
        0% {
          transform: translateX(12px);
        }
        100% {
          transform: translateX(0);
        }
      }

      @keyframes forecast-slide-forward {
        0% {
          transform: translateX(18px);
        }
        100% {
          transform: translateX(0);
        }
      }

      @keyframes forecast-slide-backward {
        0% {
          transform: translateX(-18px);
        }
        100% {
          transform: translateX(0);
        }
      }

      .forecast-icon {
        width: 34px;
        height: 34px;
        justify-self: center;
        align-self: center;
      }

      .forecast-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .forecast-wind {
        color: var(--weather-muted);
        font-size: 12px;
        font-weight: 350;
        white-space: normal;
        line-height: 1.25;
      }

      .curve-canvas {
        position: absolute;
        top: 58px;
        left: 0;
        right: 0;
        width: 100%;
        height: 132px;
        pointer-events: none;
        z-index: 2;
      }

      .icon-button {
        width: 38px;
        height: 38px;
        padding: 0;
        border: 1px solid var(--weather-border-soft);
        border-radius: 15px;
        color: var(--weather-text);
        background: var(--weather-glass-strong);
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(21, 47, 76, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.64);
      }

      .inspector {
        position: relative;
        width: 100%;
        min-height: 0;
        z-index: 12;
        padding: 10px;
        border-radius: 22px;
        overflow: hidden;
        background:
          linear-gradient(155deg, rgba(236, 246, 255, 0.78), rgba(201, 220, 236, 0.72)),
          rgba(238, 247, 255, 0.76);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 18px 40px rgba(9, 28, 48, 0.2);
      }

      .weather-shell.dark .inspector {
        background:
          linear-gradient(77deg, rgb(49 87 129 / 72%), rgb(83 132 192 / 86%)),
          rgb(48 192 186 / 89%);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 42%), 0 18px 40px rgb(2 9 15 / 20%);
      }

      .inspector-content {
        display: grid;
        gap: 8px;
        height: 100%;
        overflow: hidden;
        scrollbar-width: none;
      }

      .inspector-content::-webkit-scrollbar {
        display: none;
      }

      .aqi-hero {
        position: relative;
        display: grid;
        grid-template-columns: 96px minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        padding: 14px 14px 10px;
        border-radius: 20px 20px 0 0;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08)),
          rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-bottom: 0;
      }

      .aqi-gauge {
        position: relative;
        display: grid;
        place-items: center;
        width: 92px;
        height: 92px;
      }

      .aqi-gauge::before {
        content: "";
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background:
          conic-gradient(from 218deg, var(--aqi-color, #46c878) 0deg var(--aqi-progress, 0deg), rgba(255, 255, 255, 0.16) var(--aqi-progress, 0deg) 360deg);
        -webkit-mask: radial-gradient(circle, transparent 0 56%, #000 57% 100%);
        mask: radial-gradient(circle, transparent 0 56%, #000 57% 100%);
        filter: drop-shadow(0 0 10px color-mix(in srgb, var(--aqi-color, #46c878) 42%, transparent));
      }

      .aqi-gauge::after {
        content: "";
        position: absolute;
        inset: 18px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.36);
      }

      .aqi-ring {
        position: relative;
        z-index: 1;
        display: grid;
        place-items: center;
        text-align: center;
      }

      .aqi-value-big {
        font-size: 30px;
        line-height: 1;
        font-weight: 350;
        color: var(--weather-text);
      }

      .aqi-unit {
        margin-top: 4px;
        color: var(--weather-muted);
        font-size: 12px;
        font-weight: 350;
      }

      .aqi-title {
        padding-right: 20px;
        font-size: 17px;
        font-weight: 350;
        white-space: nowrap;
      }

      .aqi-subtitle {
        margin-top: 6px;
        color: var(--weather-muted);
        font-size: 12px;
        line-height: 1.45;
      }

      .aqi-subtitle strong {
        display: block;
        color: var(--weather-text);
        font-size: 12px;
        font-weight: 350;
        white-space: nowrap;
      }

      .aqi-subtitle span {
        display: block;
      }

      .aqi-leaf {
        position: absolute;
        right: 14px;
        top: 16px;
        color: var(--aqi-color, #46c878);
        opacity: 0.8;
      }

      .aqi-source {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px 9px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-top: 0;
        border-radius: 0 0 18px 18px;
        color: var(--weather-faint);
        font-size: 11px;
      }

      .pollutants {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        margin-top: 0;
        padding: 6px 2px;
        border-left: 1px solid rgba(255, 255, 255, 0.18);
        border-right: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.06);
      }

      .pollutant {
        min-width: 0;
        padding: 6px 8px;
        border-radius: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.16);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      }

      .pollutant:nth-child(3n) {
        border-right: 0;
      }

      .pollutant:nth-last-child(-n + 3) {
        border-bottom: 0;
      }

      .pollutant-name {
        color: var(--weather-faint);
        font-size: 11px;
        font-weight: 350;
      }

      .pollutant-value {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin-top: 3px;
        font-size: 18px;
        font-weight: 350;
        font-variant-numeric: tabular-nums;
        color: rgba(255, 255, 255, 0.98);
      }

      .pollutant-unit {
        color: var(--aqi-color, #46c878);
        font-size: 10px;
        font-weight: 350;
      }

      .index-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: 8px;
      }

      .inspector-section-title {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin: 4px 2px 4px;
        color: var(--weather-text);
        font-size: 13px;
        font-weight: 350;
      }

      .inspector-section-title span:last-child {
        color: var(--weather-faint);
        font-size: 11px;
        font-weight: 350;
      }

      .index-row {
        width: 100%;
        min-height: 44px;
        padding: 7px 8px;
        border-radius: 14px;
        border: 1px solid var(--weather-border-soft);
        color: var(--weather-text);
        text-align: left;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.1);
      }

      .index-row-top {
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr) minmax(42px, auto);
        align-items: center;
        gap: 6px;
      }

      .index-icon {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        color: var(--index-color, var(--weather-cyan));
        background: color-mix(in srgb, var(--index-color, var(--weather-cyan)) 20%, transparent);
      }

      .index-icon ha-icon {
        --mdc-icon-size: 15px;
      }

      .index-name,
      .index-category {
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .index-name {
        font-size: 12px;
        font-weight: 350;
      }

      .index-category {
        max-width: none;
        color: var(--index-color, var(--weather-green));
        font-size: 11px;
        font-weight: 350;
      }

      .index-preview {
        display: none;
        margin-top: 5px;
        color: var(--weather-muted);
        font-size: 10px;
        line-height: 1.35;
      }

      .detail-overlay {
        position: absolute;
        inset: 0;
        z-index: 20;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(18, 31, 46, 0.22);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .detail-dialog {
        width: min(380px, 92%);
        max-height: 82%;
        overflow: auto;
        padding: 16px;
        border-radius: 24px;
        background: rgb(49 89 158 / 53%);
      }

      .detail-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .detail-title {
        font-size: 19px;
        font-weight: 350;
        color: rgba(241,241,241,0.94);
      }

      .detail-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }

      .detail-chip {
        padding: 5px 8px;
        border-radius: 999px;
        color: var(--weather-muted);
        font-size: 12px;
        font-weight: 350;
      }

      .detail-text {
        margin-top: 14px;
        color: var(--weather-text);
        font-size: 14px;
        line-height: 1.65;
      }

      .warning-dialog {
        width: min(520px, 94%);
        max-height: 82%;
      }

      .warning-list {
        display: grid;
        gap: 10px;
        margin-top: 14px;
      }

      .warning-item-v2 {
        padding: 12px 14px;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(255, 255, 255, 0.12);
      }

      .warning-item-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }

      .warning-item-title {
        color: var(--warning-color, #ff8a54);
        font-size: 14px;
        font-weight: 350;
      }

      .warning-item-time,
      .warning-item-text {
        color: var(--weather-muted);
        font-size: 12px;
        line-height: 1.5;
      }

      .empty-state {
        padding: 18px 10px;
        color: var(--weather-muted);
        text-align: center;
        font-size: 12px;
      }

      @media (max-width: 680px) {
        .weather-shell {
          width: 94vw;
          padding: 12px;
          border-radius: 24px;
        }

        .weather-layout {
          grid-template-columns: 1fr;
        }

        .hero {
          grid-template-columns: 1fr;
        }

        .right-summary {
          align-items: flex-start;
          min-width: 0;
          width: 100%;
          max-width: none;
        }

        .metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .inspector {
          width: 100%;
        }
      }
    `;
  }

  constructor() {
    super();
    this.selectedEntityIndex = 0;
    this.forecastMode = 'daily';
    this.selectedIndexDetail = null;
    this.selectedWarningDetail = null;
    this._entityDragStartX = 0;
    this._entityTransitionDirection = 'forward';
    this._forecastTransitionDirection = 'forward';
    this._forecastDragPointerId = null;
    this._forecastDragStartX = 0;
    this._forecastDragStartScrollLeft = 0;
    this._forecastDragTarget = null;
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._boundHandleResize = this._handleResize.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this._boundHandleKeydown);
    window.addEventListener('resize', this._boundHandleResize);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._boundHandleKeydown);
    window.removeEventListener('resize', this._boundHandleResize);
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass') || changedProperties.has('selectedEntityIndex')) {
      this._updateActiveEntity();
    }
    if (changedProperties.has('forecastMode') || changedProperties.has('entity') || changedProperties.has('hass')) {
      this.updateComplete.then(() => {
        requestAnimationFrame(() => {
          this._syncSegmentIndicators();
          this._drawForecastCurves();
        });
      });
    }
    if (changedProperties.has('selectedEntityIndex') || changedProperties.has('forecastMode') || changedProperties.has('config') || changedProperties.has('hass')) {
      this.updateComplete.then(() => {
        requestAnimationFrame(() => this._syncSegmentIndicators());
      });
    }
  }

  _handleResize() {
    requestAnimationFrame(() => {
      this._syncSegmentIndicators();
      this._drawForecastCurves();
    });
  }

  _handleKeydown(e) {
    if (e.key === 'Escape' && this.selectedIndexDetail) {
      this.selectedIndexDetail = null;
      return;
    }
    if (e.key === 'Escape' && this.selectedWarningDetail) {
      this.selectedWarningDetail = null;
    }
  }

  _getConfiguredEntities() {
    const configured = Array.isArray(this.config?.entities) && this.config.entities.length > 0
      ? this.config.entities
      : [this.config?.entity].filter(Boolean);
    return configured.filter(Boolean);
  }

  _getEntityName(entityId, index) {
    if (Array.isArray(this.config?.entity_names) && this.config.entity_names[index]) {
      return this.config.entity_names[index];
    }
    return this.hass?.states?.[entityId]?.attributes?.friendly_name || entityId || `天气 ${index + 1}`;
  }

  _updateActiveEntity() {
    if (!this.hass || !this.config) return;
    const entities = this._getConfiguredEntities();
    if (entities.length === 0) return;
    const defaultIndex = Number.isInteger(this.config.default_entity_index) ? this.config.default_entity_index : 0;
    if (!this._defaultIndexApplied) {
      this.selectedEntityIndex = Math.max(0, Math.min(defaultIndex, entities.length - 1));
      this._defaultIndexApplied = true;
    }
    if (this.selectedEntityIndex >= entities.length) {
      this.selectedEntityIndex = 0;
    }
    this.entity = this.hass.states[entities[this.selectedEntityIndex]];
  }

  _selectEntity(index) {
    const entities = this._getConfiguredEntities();
    if (index < 0 || index >= entities.length || index === this.selectedEntityIndex) return;
    this._entityTransitionDirection = index > this.selectedEntityIndex ? 'forward' : 'backward';
    this.selectedEntityIndex = index;
    this.selectedIndexDetail = null;
    this._updateActiveEntity();
  }

  _handleEntityPointerDown(e) {
    this._entityDragStartX = e.clientX || 0;
  }

  _handleEntityPointerUp(e) {
    const delta = (e.clientX || 0) - this._entityDragStartX;
    if (Math.abs(delta) < 36) return;
    const entities = this._getConfiguredEntities();
    const direction = delta < 0 ? 1 : -1;
    const next = Math.max(0, Math.min(this.selectedEntityIndex + direction, entities.length - 1));
    this._selectEntity(next);
  }

  _setForecastMode(mode) {
    if (mode === this.forecastMode) return;
    const order = ['daily', 'hourly', 'minutely'];
    this._forecastTransitionDirection = order.indexOf(mode) > order.indexOf(this.forecastMode) ? 'forward' : 'backward';
    this.forecastMode = mode;
    this.selectedIndexDetail = null;
  }

  _syncSegmentIndicators() {
    this._syncIndicator('.entity-switcher', '.entity-pill.active', '.switcher-indicator');
    this._syncIndicator('.segments', '.segment.active', '.segments-indicator');
  }

  _syncIndicator(containerSelector, activeSelector, indicatorSelector) {
    const root = this.renderRoot;
    if (!root) return;
    const container = root.querySelector(containerSelector);
    const active = root.querySelector(activeSelector);
    const indicator = root.querySelector(indicatorSelector);
    if (!container || !active || !indicator) return;
    const baseLeft = indicator.offsetLeft || 0;
    const left = active.offsetLeft - container.scrollLeft - baseLeft;
    const width = active.offsetWidth;
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }

  _handleForecastPointerDown(e) {
    const scroll = e.currentTarget;
    if (!scroll) return;
    this._forecastDragPointerId = e.pointerId;
    this._forecastDragStartX = e.clientX;
    this._forecastDragStartScrollLeft = scroll.scrollLeft;
    this._forecastDragTarget = scroll;
    scroll.classList.add('dragging');
    if (scroll.setPointerCapture) {
      scroll.setPointerCapture(e.pointerId);
    }
  }

  _handleForecastPointerMove(e) {
    if (this._forecastDragPointerId !== e.pointerId || !this._forecastDragTarget) return;
    const delta = e.clientX - this._forecastDragStartX;
    this._forecastDragTarget.scrollLeft = this._forecastDragStartScrollLeft - delta;
    e.preventDefault();
  }

  _handleForecastPointerEnd(e) {
    if (this._forecastDragPointerId !== e.pointerId || !this._forecastDragTarget) return;
    const scroll = this._forecastDragTarget;
    scroll.classList.remove('dragging');
    if (scroll.releasePointerCapture) {
      try {
        scroll.releasePointerCapture(e.pointerId);
      } catch (error) {
      }
    }
    this._forecastDragPointerId = null;
    this._forecastDragTarget = null;
  }

  _getHighestWarningLevel(warnings) {
    if (!Array.isArray(warnings) || warnings.length === 0) return '';
    const priority = ['红色', '橙色', '黄色', '蓝色'];
    let level = '';
    for (const item of warnings) {
      const currentLevel = item?.level || '';
      if (!currentLevel) continue;
      if (!level || priority.indexOf(currentLevel) < priority.indexOf(level)) {
        level = currentLevel;
      }
    }
    return level;
  }

  _getWarningChipTheme(warnings) {
    const level = this._getHighestWarningLevel(warnings);
    if (!level) {
      return {
        bg: 'rgba(255, 255, 255, 0.135)',
        border: 'rgba(255, 255, 255, 0.2)',
        fg: 'rgba(248, 252, 255, 0.96)',
        subtle: 'rgba(235, 242, 249, 0.72)',
        countBg: 'rgba(255, 255, 255, 0.1)'
      };
    }
    const bg = this._getWarningColorForLevel(level);
    const isYellow = level === '黄色';
    return {
      bg,
      border: isYellow ? 'rgba(92, 72, 8, 0.26)' : 'rgba(255, 255, 255, 0.22)',
      fg: isYellow ? 'rgba(40, 31, 6, 0.96)' : 'rgba(255, 255, 255, 0.98)',
      subtle: isYellow ? 'rgba(66, 54, 11, 0.8)' : 'rgba(244, 248, 252, 0.86)',
      countBg: isYellow ? 'rgba(255, 255, 255, 0.32)' : 'rgba(0, 0, 0, 0.14)'
    };
  }

  _formatValue(value, suffix = '', fallback = '--') {
    if (value === undefined || value === null || value === '') return fallback;
    return `${value}${suffix}`;
  }

  _formatToShanghaiTime(value) {
    if (!value) return '--';
    try {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return String(value).replace('T', ' ').replace('Z', '');
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(parsed).replace(/\//g, '-');
    } catch (error) {
      return String(value).replace('T', ' ').replace('Z', '');
    }
  }

  _formatTemp(value) {
    const formatted = this._formatTemperature(value);
    return formatted === undefined || formatted === null || formatted === '' ? '--' : formatted;
  }

  _getRelativeTime(updateTime) {
    if (!updateTime || updateTime === '未知时间') return '数据更新时间：未知';
    try {
      const normalized = String(updateTime).includes(' ')
        ? String(updateTime).replace(' ', 'T')
        : String(updateTime);
      const updateDate = new Date(normalized);
      if (Number.isNaN(updateDate.getTime())) return `数据更新时间：${updateTime}`;
      const diffMinutes = Math.max(0, Math.floor((Date.now() - updateDate.getTime()) / 60000));
      if (diffMinutes < 1) return '数据更新时间：刚刚';
      if (diffMinutes < 60) return `数据更新时间：${diffMinutes}分钟前`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `数据更新时间：${diffHours}小时前`;
      return `数据更新时间：${Math.floor(diffHours / 24)}天前`;
    } catch (error) {
      return `数据更新时间：${updateTime}`;
    }
  }

  _getForecast(mode = this.forecastMode) {
    const attrs = this.entity?.attributes || {};
    if (mode === 'hourly') return Array.isArray(attrs.hourly_forecast) ? attrs.hourly_forecast.slice(0, 24) : [];
    if (mode === 'minutely') return Array.isArray(attrs.minutely_forecast) ? attrs.minutely_forecast.slice(0, 24) : [];
    const columns = this.config?.columns || 7;
    return Array.isArray(attrs.daily_forecast) ? attrs.daily_forecast.slice(0, columns) : [];
  }

  _getTemperatureRange(data, mode = this.forecastMode) {
    const temps = [];
    data.forEach(item => {
      if (mode === 'daily') {
        temps.push(parseFloat(item.native_temperature), parseFloat(item.native_temp_low));
      } else {
        temps.push(parseFloat(item.native_temperature));
      }
    });
    const clean = temps.filter(value => !Number.isNaN(value));
    if (clean.length === 0) return { min: 0, max: 1, range: 1 };
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    return { min, max, range: Math.max(max - min, 1) };
  }

  _tempTop(value, range) {
    const temp = parseFloat(value);
    if (Number.isNaN(temp)) return 58;
    const top = ((range.max - temp) / range.range) * 96 + 14;
    return Math.max(8, Math.min(top, 108));
  }

  _formatForecastTime(datetime, mode) {
    if (!datetime) return '--';
    if (mode === 'daily') return this._getWeekday(datetime);
    const parts = String(datetime).split(' ');
    return parts[1] ? parts[1].slice(0, 5) : String(datetime).slice(11, 16);
  }

  _formatForecastDate(datetime, mode) {
    if (!datetime) return '';
    if (mode === 'daily') {
      const date = new Date(String(datetime).replace(/-/g, '/'));
      if (Number.isNaN(date.getTime())) return datetime;
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    const datePart = String(datetime).split(' ')[0] || '';
    const date = new Date(datePart.replace(/-/g, '/'));
    if (Number.isNaN(date.getTime())) return datePart;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  _isToday(datetime) {
    if (!datetime) return false;
    const date = new Date(String(datetime).split(' ')[0].replace(/-/g, '/'));
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }

  _isCurrentForecastItem(datetime, mode = this.forecastMode) {
    if (!datetime) return false;
    const raw = String(datetime);
    let date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      date = new Date(raw.replace(/-/g, '/').replace('T', ' '));
    }
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    if (mode === 'daily') {
      return date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();
    }
    if (mode === 'hourly') {
      return date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate() &&
        date.getHours() === now.getHours();
    }
    const itemStart = new Date(date);
    itemStart.setSeconds(0, 0);
    const itemEnd = new Date(itemStart.getTime() + 5 * 60 * 1000);
    return now >= itemStart && now < itemEnd;
  }

  _getAqiColor(category) {
    switch(category) {
      case '优': return '#46c878';
      case '良': return '#f3c74b';
      case '轻度污染': return '#ff9b54';
      case '中度污染': return '#ff6f4c';
      case '重度污染': return '#ef4e5d';
      case '严重污染': return '#9d62d9';
      default: return '#8aa1b5';
    }
  }

  _getAqiProgress(aqiValue) {
    const numeric = parseFloat(aqiValue);
    if (Number.isNaN(numeric) || numeric <= 0) return 0;
    return Math.min(numeric, 150) / 150 * 360;
  }

  _getRainfallMax(mode = this.forecastMode) {
    if (mode === 'daily') return 25;
    if (mode === 'hourly') return 5;
    return 1;
  }

  _getRainHeightPercent(rainfall, mode = this.forecastMode) {
    const amount = parseFloat(rainfall) || 0;
    if (amount <= 0) return 0;
    const max = this._getRainfallMax(mode);
    const percent = Math.min((amount / max) * 100, 100);
    return Math.min(10 + percent, 100);
  }

  _openIndexDetail(index) {
    this.selectedIndexDetail = index;
  }

  _openWarnings(warnings) {
    if (!Array.isArray(warnings) || warnings.length === 0) return;
    this.selectedWarningDetail = warnings;
  }

  _drawForecastCurves() {
    const data = this._getForecast();
    if (!this.shadowRoot || data.length < 2) return;
    const canvas = this.shadowRoot.querySelector('.curve-canvas');
    if (!canvas) return;
    const cards = [...this.shadowRoot.querySelectorAll('.forecast-card')];
    if (cards.length < 2) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const firstRect = cards[0].getBoundingClientRect();
    const lastRect = cards[cards.length - 1].getBoundingClientRect();
    const itemWidth = firstRect.width;
    const totalWidth = Math.max(rect.width, lastRect.left - firstRect.left + itemWidth);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(totalWidth * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${totalWidth}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, totalWidth, rect.height);
    const range = this._getTemperatureRange(data);
    const makePoints = key => data.map((item, index) => ({
      x: (cards[index].getBoundingClientRect().left - firstRect.left) + (cards[index].getBoundingClientRect().width / 2),
      y: this._tempTop(item[key], range)
    }));
    const draw = (points, color) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const midX = (current.x + next.x) / 2;
        ctx.bezierCurveTo(midX, current.y, midX, next.y, next.x, next.y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    if (this.forecastMode === 'daily') {
      draw(makePoints('native_temperature'), 'rgba(255, 155, 84, 0.86)');
      draw(makePoints('native_temp_low'), 'rgba(74, 167, 255, 0.82)');
    } else {
      draw(makePoints('native_temperature'), this.forecastMode === 'minutely' ? 'rgba(70, 200, 120, 0.86)' : 'rgba(255, 155, 84, 0.86)');
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;
    this._updateActiveEntity();
    if (!this.entity || this.entity.state === 'unavailable') {
      return html`<div class="weather-shell"><div class="empty-state">暂无天气数据</div></div>`;
    }

    const attrs = this.entity.attributes || {};
    const theme = this._evaluateTheme();
    const dark = theme !== 'on';
    const entities = this._getConfiguredEntities();
    const configuredWidth = this.config?.width;
    const condition = attrs.condition_cn || attrs.condition || this.entity.state || '未知';
    const warning = Array.isArray(attrs.warning) ? attrs.warning : [];
    const warningTheme = this._getWarningChipTheme(warning);
    const aqi = attrs.aqi || {};
    const aqiCategory = aqi.category || '未知';
    const aqiValue = aqi.aqi || aqi.value || attrs.aqis || '--';
    const sun = attrs.sun || {
      sunrise: attrs.sunrise,
      sunset: attrs.sunset
    };

    return html`
      <div class="weather-shell ${dark ? 'dark' : ''}" style="${configuredWidth ? `--weather-card-width: min(${configuredWidth}px, calc(94vw - 6px));` : ''}">
        <div class="weather-layout">
          <main class="weather-main">
            ${this._renderEntitySwitcher(entities)}
            <div class="hero">
              <div class="current">
                <div class="current-icon">
                  <img src="${this._getWeatherIcon(condition)}" alt="${condition}">
                </div>
                <div>
                  <div class="temp-line">
                    <div class="temperature">${this._formatTemp(attrs.temperature)}°</div>
                    <div class="condition">${condition}</div>
                  </div>
                  <div class="city-line">
                    <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                    <span>${attrs.city || attrs.friendly_name || this.entity.entity_id}</span>
                  </div>
                  <div class="meta-line">
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    <span>${this._getRelativeTime(attrs.update_time || this.entity.last_updated)}</span>
                  </div>
                </div>
              </div>
              <div class="right-summary">
                <div class="sun-chip glass">
                  <div class="sun-slot">
                    <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
                    <div class="sun-slot-copy">
                      <div class="sun-slot-label">
                        <span>日出</span>
                      </div>
                      <div class="sun-slot-time">${sun.sunrise || '--:--'}</div>
                    </div>
                  </div>
                  <div class="sun-slot">
                    <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
                    <div class="sun-slot-copy">
                      <div class="sun-slot-label">
                        <span>日落</span>
                      </div>
                      <div class="sun-slot-time">${sun.sunset || '--:--'}</div>
                    </div>
                  </div>
                </div>
                <button
                  class="warning-chip glass ${warning.length ? 'has-warning' : ''}"
                  style="--warning-chip-bg:${warningTheme.bg}; --warning-chip-border:${warningTheme.border}; --warning-chip-fg:${warningTheme.fg}; --warning-chip-subtle:${warningTheme.subtle}; --warning-chip-count-bg:${warningTheme.countBg};"
                  ?disabled=${!warning.length}
                  @click=${() => this._openWarnings(warning)}>
                  <div class="warning-chip-copy">
                    <div class="warning-chip-meta">
                      <ha-icon icon="${warning.length ? 'mdi:alert-circle-outline' : 'mdi:shield-check-outline'}"></ha-icon>
                      <span>${warning.length ? '天气预警' : '预警状态'}</span>
                    </div>
                    <div class="warning-chip-title">${warning.length ? `${warning[0].title || warning[0].typeName || '预警生效中'}` : '暂无预警'}</div>
                    <div class="warning-chip-subtitle">${warning.length ? '点击查看详细预警信息' : '当前天气状态稳定'}</div>
                  </div>
                  <div class="warning-chip-count">${warning.length ? warning.length : 0}</div>
                </button>
              </div>
            </div>

            ${this._renderMetrics(attrs)}

            <div class="forecast-header">
              <div class="segments glass">
                <div class="segments-indicator"></div>
                ${['daily', 'hourly', 'minutely'].map(mode => html`
                  <button class="segment ${this.forecastMode === mode ? 'active' : ''}" @click=${() => this._setForecastMode(mode)}>
                    ${mode === 'daily' ? '每日' : mode === 'hourly' ? '小时' : '分钟'}
                  </button>
                `)}
              </div>
              <div class="minutely-summary">${attrs.minutely_summary || '暂无分钟降水摘要'}</div>
            </div>

            ${this._renderForecast()}
          </main>
          ${this._renderInspector(attrs)}
        </div>
        ${this.selectedIndexDetail ? this._renderIndexDetailDialog(this.selectedIndexDetail) : ''}
        ${this.selectedWarningDetail ? this._renderWarningDialog(this.selectedWarningDetail) : ''}
      </div>
    `;
  }

  _renderEntitySwitcher(entities) {
    return html`
      <div class="entity-switcher"
        @pointerdown=${this._handleEntityPointerDown}
        @pointerup=${this._handleEntityPointerUp}>
        <div class="switcher-indicator"></div>
        ${entities.map((entityId, index) => html`
          <button class="entity-pill ${this.selectedEntityIndex === index ? 'active' : ''}" @click=${() => this._selectEntity(index)}>
            ${this._getEntityName(entityId, index)}
          </button>
        `)}
      </div>
    `;
  }

  _renderMetrics(attrs) {
    const metrics = [
      ['湿度', this._formatValue(attrs.humidity, '%'), 'mdi:water-percent', '#4aa7ff'],
      ['体感', this._formatValue(attrs.apparent_temperature, '°'), 'mdi:thermometer-lines', '#ff9b54'],
      ['露点', this._formatValue(attrs.dew_point, '°'), 'mdi:water-thermometer', '#56d5e9'],
      ['云量', this._formatValue(attrs.cloud_coverage, '%'), 'mdi:cloud-outline', '#a3b5c8'],
      ['风速', `${attrs.winddir || this._getWindDirectionIcon(attrs.wind_bearing || 0)} ${this._formatValue(attrs.wind_speed, 'km/h')}`, 'mdi:weather-windy', '#8fd0ff'],
      ['风级', this._formatValue(attrs.windscale, '级'), 'mdi:windsock', '#9ab7ff'],
      ['气压', this._formatValue(attrs.pressure, 'hPa'), 'mdi:gauge', '#8ec5ff'],
      ['能见度', this._formatValue(attrs.visibility, 'km'), 'mdi:eye-outline', '#68d3c4']
    ];
    return html`
      <div class="metrics">
        ${metrics.map(([label, value, icon, color]) => html`
          <div class="metric glass" style="--metric-color: ${color};">
            <div class="metric-icon"><ha-icon icon="${icon}"></ha-icon></div>
            <div>
              <div class="metric-label">${label}</div>
              <div class="metric-value">${value}</div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _renderForecast() {
    const data = this._getForecast();
    if (data.length === 0) {
      return html`<div class="empty-state glass">暂无${this.forecastMode === 'daily' ? '每日' : this.forecastMode === 'hourly' ? '小时' : '分钟'}预报数据</div>`;
    }
    const range = this._getTemperatureRange(data);
    const mode = this.forecastMode;
    const itemWidth = 112;
    return html`
      <div
        class="forecast-scroll mode-${this._forecastTransitionDirection}"
        @pointerdown=${this._handleForecastPointerDown}
        @pointermove=${this._handleForecastPointerMove}
        @pointerup=${this._handleForecastPointerEnd}
        @pointercancel=${this._handleForecastPointerEnd}>
        <div class="forecast-grid" style="grid-template-columns: repeat(${data.length}, ${itemWidth}px);">
          <canvas class="curve-canvas" style="width: ${data.length * itemWidth}px;"></canvas>
          ${data.map(item => this._renderForecastItem(item, range, mode))}
        </div>
      </div>
    `;
  }

  _renderForecastItem(item, range, mode) {
    const high = item.native_temperature;
    const low = mode === 'daily' ? item.native_temp_low : null;
    const rain = parseFloat(item.native_precipitation) || 0;
    const rainHeight = this._getRainHeightPercent(rain, mode);
    const text = item.text || item.condition || '';
    const windScale = item.windscaleday || item.windscale || '';
    const wind = `${this._getWindDirectionIcon(item.wind_bearing || 0)}${windScale ? ` ${windScale}级` : ''}`;

    return html`
      <div class="forecast-card glass ${this._isCurrentForecastItem(item.datetime, mode) ? 'current-day' : ''}">
        <div class="forecast-time">${this._formatForecastTime(item.datetime, mode)}</div>
        <div class="forecast-date">${this._formatForecastDate(item.datetime, mode)}</div>
        <div class="temp-zone">
          ${rain > 0 ? html`<div class="rain-fill" style="height: ${rainHeight}%;"></div>` : ''}
          <div class="temp-dot ${mode === 'minutely' ? 'minutely' : mode === 'daily' ? 'high' : 'hourly'}" style="top: ${this._tempTop(high, range)}px;">
            <span class="temp-label ${mode === 'minutely' ? 'minutely' : mode === 'daily' ? 'high' : 'hourly'}">${this._formatTemp(high)}°</span>
          </div>
          ${mode === 'daily' ? html`
            <div class="temp-dot low" style="top: ${this._tempTop(low, range)}px;">
              <span class="temp-label low">${this._formatTemp(low)}°</span>
            </div>
          ` : ''}
        </div>
        <div class="rain-label">${rain > 0 ? `${rain}mm` : '无雨'}</div>
        <div class="forecast-icon">
          <img src="${this._getWeatherIcon(text)}" alt="${text}">
        </div>
        <div class="forecast-wind">${wind || text}</div>
      </div>
    `;
  }

  _renderInspector(attrs) {
    return html`
      <aside class="inspector glass">
        <div class="inspector-content">
          ${this._renderAqiPanel(attrs.aqi || {}, attrs.aqis)}
          <div class="inspector-section-title">
            <span>生活指数</span>
            <span>点击查看详情</span>
          </div>
          ${this._renderIndicesPanel(attrs.air_indices || [])}
        </div>
      </aside>
    `;
  }

  _renderAqiPanel(aqi, fallbackAqi) {
    const category = aqi.category || '未知';
    const aqiValue = aqi.aqi || aqi.value || fallbackAqi || '--';
    const color = this._getAqiColor(category);
    const progress = this._getAqiProgress(aqiValue);
    const pollutants = [
      ['PM2.5', aqi.pm2p5, 'μg/m³'],
      ['PM10', aqi.pm10, 'μg/m³'],
      ['SO₂', aqi.so2, 'μg/m³'],
      ['NO₂', aqi.no2, 'μg/m³'],
      ['CO', aqi.co, 'mg/m³'],
      ['O₃', aqi.o3, 'μg/m³']
    ];
    return html`
      <div class="aqi-hero" style="--aqi-color: ${color}; --aqi-progress: ${progress}deg;">
        <ha-icon class="aqi-leaf" icon="mdi:leaf"></ha-icon>
        <div class="aqi-gauge">
          <div class="aqi-ring">
            <div class="aqi-value-big">${aqiValue}</div>
            <div class="aqi-unit">AQI</div>
          </div>
        </div>
        <div>
          <div class="aqi-title" style="color: ${color};">空气质量${category}</div>
          <div class="aqi-subtitle">
            <strong>空气清新，放心呼吸</strong>
            <span>等级 ${aqi.level || '--'} · 首要污染物 ${aqi.primary || 'NA'}</span>
          </div>
        </div>
      </div>
      <div class="pollutants">
        ${pollutants.map(([name, value, unit]) => html`
          <div class="pollutant">
            <div class="pollutant-name">${name}</div>
            <div class="pollutant-value">
              <span>${this._formatValue(value, '')}</span>
              <span class="pollutant-unit">${unit === 'mg/m³' ? 'mg/m³' : this._getPollutantLevelText(name, value, category)}</span>
            </div>
          </div>
        `)}
      </div>
      <div class="aqi-source">
        <span>数据来源：和风天气</span>
        <span>${aqi.pubTime ? this._formatForecastTime(aqi.pubTime.replace('T', ' '), 'hourly') : '实时'} 更新</span>
      </div>
    `;
  }

  _getPollutantLevelText(name, value, category) {
    if (value === undefined || value === null || value === '') return '--';
    if (name === 'CO') return 'mg/m³';
    return category === '优' || category === '良' ? category : 'μg/m³';
  }

  _renderIndicesPanel(indices) {
    if (!Array.isArray(indices) || indices.length === 0) {
      return html`<div class="empty-state">暂无生活指数数据</div>`;
    }
    return html`
      <div class="index-list">
        ${indices.map(index => html`
          <button class="index-row" style="--index-color: ${this._getIndexColor(index)};" @click=${() => this._openIndexDetail(index)}>
            <div class="index-row-top">
              <span class="index-icon"><ha-icon icon="${this._getIndexIcon(index)}"></ha-icon></span>
              <span class="index-name">${this._getCompactIndexName(index)}</span>
              <span class="index-category">${index.category || '--'}</span>
            </div>
            <div class="index-preview">${index.text || '暂无说明'}</div>
          </button>
        `)}
      </div>
    `;
  }

  _getIndexIcon(index) {
    const name = index?.name || '';
    if (name.includes('运动')) return 'mdi:run';
    if (name.includes('洗车')) return 'mdi:car-wash';
    if (name.includes('穿衣')) return 'mdi:tshirt-crew';
    if (name.includes('钓鱼')) return 'mdi:fish';
    if (name.includes('紫外') || name.includes('防晒')) return 'mdi:white-balance-sunny';
    if (name.includes('旅游')) return 'mdi:bag-suitcase';
    if (name.includes('过敏')) return 'mdi:leaf';
    if (name.includes('舒适')) return 'mdi:emoticon-happy';
    if (name.includes('感冒')) return 'mdi:pill';
    if (name.includes('污染') || name.includes('扩散')) return 'mdi:weather-windy';
    if (name.includes('空调')) return 'mdi:air-conditioner';
    if (name.includes('太阳镜')) return 'mdi:sunglasses';
    if (name.includes('化妆')) return 'mdi:bottle-tonic-plus';
    if (name.includes('晾晒')) return 'mdi:hanger';
    if (name.includes('交通')) return 'mdi:car';
    return 'mdi:circle-small';
  }

  _getCompactIndexName(index) {
    const name = index?.name || '指数';
    if (name.includes('空气污染扩散条件')) return '污染扩散';
    return name.replace(/指数$/u, '');
  }

  _getIndexColor(index) {
    const name = index?.name || '';
    if (name.includes('运动') || name.includes('过敏') || name.includes('舒适')) return '#55d66f';
    if (name.includes('洗车') || name.includes('交通')) return '#43b7ff';
    if (name.includes('穿衣') || name.includes('化妆')) return '#ffd35a';
    if (name.includes('钓鱼')) return '#65d5df';
    if (name.includes('紫外') || name.includes('防晒') || name.includes('太阳镜')) return '#ffca42';
    if (name.includes('旅游')) return '#a976ff';
    if (name.includes('感冒')) return '#78a9ff';
    if (name.includes('污染') || name.includes('空调')) return '#9bd4ff';
    if (name.includes('晾晒')) return '#b9b7ff';
    return '#56d5e9';
  }

  _renderIndexDetailDialog(index) {
    return html`
      <div class="detail-overlay" @click=${() => this.selectedIndexDetail = null}>
        <div class="detail-dialog glass" @click=${e => e.stopPropagation()}>
          <div class="detail-head">
            <div>
              <div class="detail-title">${index.name || '生活指数'}</div>
              <div class="detail-meta">
                <span class="detail-chip glass">${index.date || '今日'}</span>
                <span class="detail-chip glass">等级 ${index.level || '--'}</span>
                <span class="detail-chip glass">${index.category || '--'}</span>
              </div>
            </div>
            <button class="icon-button" title="关闭" @click=${() => this.selectedIndexDetail = null}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="detail-text">${index.text || '暂无详细说明。'}</div>
        </div>
      </div>
    `;
  }

  _renderWarningDialog(warnings) {
    return html`
      <div class="detail-overlay" @click=${() => this.selectedWarningDetail = null}>
        <div class="detail-dialog warning-dialog glass" @click=${e => e.stopPropagation()}>
          <div class="detail-head">
            <div>
              <div class="detail-title">天气预警</div>
              <div class="detail-meta">
                <span class="detail-chip glass">${warnings.length} 条预警</span>
              </div>
            </div>
            <button class="icon-button" title="关闭" @click=${() => this.selectedWarningDetail = null}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="warning-list">
            ${warnings.map(item => {
              const level = item.level || '预警';
              const typeName = item.typeName || item.type || '天气';
              const sender = item.sender || item.title || '气象台';
              const startTime = this._formatToShanghaiTime(item.startTime || item.pubTime || item.date || '--');
              const text = item.text || item.description || '暂无详细说明';
              const color = this._getWarningColor([item]) || '#ff8a54';
              return html`
                <div class="warning-item-v2" style="--warning-color: ${color};">
                  <div class="warning-item-head">
                    <div class="warning-item-title">${sender} ${typeName}${level}</div>
                    <div class="warning-item-time">${startTime}</div>
                  </div>
                  <div class="warning-item-text">${text}</div>
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    `;
  }

  setConfig(config) {
    const entities = Array.isArray(config.entities) ? config.entities : [];
    if (!config.entity && entities.length === 0) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
    this._defaultIndexApplied = false;
  }
}
customElements.define('xiaoshi-weather-pad-card', XiaoshiWeatherPadCardV2);

class XiaoshiHourlyWeatherCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entity: { type: Object },
      mode: { type: String },
      forecastMode: { type: String }
    };
  }
  // 温度计算常量
  static get TEMPERATURE_CONSTANTS() {
    return {
      BUTTON_HEIGHT_PX: 17,        // 温度矩形高度（px）
      CONTAINER_HEIGHT_PX: 125,      // 温度容器总高度（px）
      FORECAST_COLUMNS: 5,          // 预报列数
    };
  }

  static get ICON_PATH() {
    return '/qweather/icon';
  } 

  static get styles() {
    return css`
      :host {
        display: block;
      }

      /*主卡片样式*/
      .weather-card {
        position: relative;
        border-radius: 15px;
        padding: 8px;
        font-family: sans-serif;
        overflow: hidden;
      }

      /*主卡片样式*/
      .weather-card.dark-theme {
      }

      .main-content {
        position: relative;
      }

      /*天气头部*/
      .weather-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 0px;
        margin-bottom: 0px;
      }

      .weather-left {
        display: flex;
        align-items: center;
      }

      /*天气头部 图标*/
      .weather-icon {
        width: 50px;
        height: 50px;
        margin-right: 16px;
        margin-bottom: 0px;
      }

      /*天气头部 图标*/
      .weather-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /*天气头部 温度*/
      .weather-temperature {
        height: 30px;
        font-size: 23px;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0;
      }

      /*天气头部 天气信息*/
      .weather-info {
        height: 12px;
        font-size: 12px;
        margin-top: 0px;
        white-space: nowrap;
      }


      /*天气右侧容器*/
      .weather-right {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        position: relative;
        min-height: 50px;
        flex: 1;
        width: 100%;
      }

      /*天气温度样式*/
      .weather-temperature {
        height: 30px;
        font-size: 23px;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0;
      }

      /*天气信息样式*/
      .weather-info {
        height: 15px;
        font-size: 12px;
        margin-top: 0;
        margin-bottom: 0;
        white-space: nowrap;
      }

      .forecast-toggle-button {
        margin-top: auto;
      }

      /*小时天气温度样式*/
      .temp-curve-hourly {
        position: absolute;
        left: 0;
        right: 0;
        height: 17.5px;
        background: linear-gradient(to bottom, 
          rgba(156, 39, 176) 0%, 
          rgba(103, 58, 183) 100%);
        border-radius: 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      /*分钟天气温度样式（绿色）*/
      .temp-curve-minutely {
        position: absolute;
        left: 0;
        right: 0;
        height: 17.5px;
        background: linear-gradient(to bottom, 
          rgba(76, 175, 80) 0%, 
          rgba(56, 142, 60) 100%);
        border-radius: 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 105;
      }

      /*9日天气部分*/
      .forecast-container {
        display: grid;
        gap: 4px;
        margin-top: 10px;
        position: relative;
      }

      /*9日天气部分*/
      .forecast-day {
        grid-row: 1;
        text-align: center;
        position: relative;
        border-radius: 8px;
        padding: 5px;
        position: relative;
      }

      /*9日天气部分 星期*/
      .forecast-weekday {
        font-size: 11px;
        height: 14px;
        margin-top: -5px;
        margin-bottom: 1px;
        font-weight: 500;
        white-space: nowrap;
      }
      
      /*9日天气部分 日期*/
      .forecast-date {
        font-size: 8px;
        margin-bottom: 15px;
        margin-left: 0px;
        margin-right: 0px;
        height: 10px;
        white-space: nowrap;
      }

      /*9日天气部分 温度区域*/
      .forecast-temp-container {
        position: relative;
        height: 125px;
        margin-top: 0;
        margin-bottom: 0;
      }

      /*9日天气部分 温度区域*/
      .forecast-temp-null {
        position: relative;
        height: 10px;
      }

      /*9日天气部分 雨量容器*/
      .forecast-rainfall-container {
        text-align: center;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 12.5px;
        margin-top: -10px;
        margin-bottom: 0;
      }

      /*9日天气部分 雨量标签*/
      .forecast-rainfall {
        background: rgba(80, 177, 200);
        color: white;
        font-size: 7px;
        font-weight: bold;
        height: 12.5px;
        min-width: 80% ;
        border-radius: 6px;
        width: fit-content;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        padding: 0 2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }
 
      /*雨量填充矩形*/
      .rainfall-fill {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(80, 177, 200, 0.8);
        border-radius: 6px;
        z-index: 1;
        margin: 0 -5px;
        bottom: -15px;
        transition: all 0.3s ease;
      }

      /*9日天气部分 图标*/
      .forecast-icon-container {
        text-align: center;
        position: relative;
      }

      /*9日天气部分 图标*/
      .forecast-icon {
        width: 25px;
        height: 25px;
        margin: 0px auto;
        margin-top: 0;
      }

      /*9日天气部分 图标*/
      .forecast-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      /*9日天气部分 风速*/
      .forecast-wind-container {
        grid-row: 4;
        text-align: center;
        position: relative;
        height: 15px;
        margin-top: -5px;
      }

      /*9日天气部分 风速*/
      .forecast-wind {
        font-size: 10px;
        margin-top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5px;
        height: 15px;
      }

      /*9日天气部分 风速*/
      .wind-direction {
        font-size: 9px;
      }

      /*9日天气部分 温度曲线 Canvas*/
      .temp-line-canvas {
        position: absolute;
        left: 0;
        width: 100%;
        pointer-events: none;
        z-index: 100;
      }

      .temp-line-canvas-high {
        top: 37.5px;
        height: 125px; 
      }

      .temp-line-canvas-low {
        top: 37.5px;
        height: 125px; 
      }

      .temp-line-canvas-hourly {
        position: absolute !important;
        top: 37.5px !important;
        left: 0 !important;
        right: 0 !important;
        height: 125px !important;
        width: 100% !important;
        pointer-events: none !important;
        z-index: 100;
      }
      
      .temp-line-canvas-minutely {
        position: absolute !important;
        top: 42.5px !important; /* 比小时曲线整体下移5px */
        left: 0 !important;
        right: 0 !important;
        height: 125px !important;
        width: 100% !important;
        pointer-events: none !important;
        z-index: 100;
      }

      /* 圆点模式样式 */
      .dot-mode .temp-curve-high,
      .dot-mode .temp-curve-low {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        left: calc(50% - 2.5px);
        margin-top: -2.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .dot-mode .temp-curve-hourly {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        left: calc(50% - 2.5px);
        margin-top: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .dot-mode .temp-curve-hourly {
        background: rgba(156, 39, 176);
      }

      .dot-mode .temp-curve-minutely {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        left: calc(50% - 2.5px);
        margin-top: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        background: rgba(76, 175, 80);
      }

      /* 圆点上方的温度文字 */
      .dot-mode .temp-text {
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(123, 123, 123, 0.3);
      }

      .dot-mode .temp-curve-hourly .temp-text {
        color: rgba(193, 65, 215, 1);
      }

      .dot-mode .temp-curve-minutely .temp-text {
        color: rgba(76, 175, 80, 1);
      }
      .unavailable {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 0;
        min-height: 0;
        max-height: 0;
        margin: 0;
        padding: 0;
      }


      /*24小时天气弹窗样式 */
      .hourly-modal-content {
        background-color: rgba(50, 50, 50);
        border-radius: 12px;
        max-width: 80vw;
        max-height: 80vh;
        overflow: hidden;
        margin: 0 auto;
        padding: 0px;
      }

      .hourly-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-left: 25px;
        margin-right: 10px;
        height: 60px;
        font-size: 20px;
      }

      .hourly-modal-header h3 {
        margin: 0;
        font-weight: bold;
        font-size: 20px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: rgba(255, 100, 0);
        padding: 0;
        margin-right: 10px;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .close-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: rgba(255, 0, 0);
      }

      .hourly-modal-body {
        padding: 0 2px;
        overflow: hidden;
      }

      /* 小时预报容器滑动支持 */
      .hourly-modal-body .forecast-container {
        overflow-x: auto;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        user-select: none; /* 防止文本选中 */
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE/Edge */
      }

      /* 小时预报容器wrapper隐藏滚动条 */
      .hourly-modal-body .forecast-container-wrapper {
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
      }

      /* 隐藏滚动条但保留滚动功能 */
      .hourly-modal-body .forecast-container::-webkit-scrollbar,
      .hourly-modal-body .forecast-container-wrapper::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
        width: 0;
        height: 0;
      }

    `;
  }

  constructor() {
    super();
    this.showWarningDetails = false;
    this.warningTimer = null;
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.scrollTarget = null;
    this.rafId = null;
  }

  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string') {
          // 处理Home Assistant模板语法 [[[ return theme() ]]]
          if (this.config.theme.includes('[[[') && this.config.theme.includes(']]]')) {
              // 提取模板中的JavaScript代码
              const match = this.config.theme.match(/\[\[\[\s*(.*?)\s*\]\]\]/);
              if (match && match[1]) {
                  const code = match[1].trim();
                  // 如果代码以return开头，直接执行
                  if (code.startsWith('return')) {
                      return (new Function(code))();
                  }
                  // 否则包装在return中执行
                  return (new Function(`return ${code}`))();
              }
          }
          // 处理直接的JavaScript函数字符串
          if (this.config.theme.includes('return') || this.config.theme.includes('=>')) {
              return (new Function(`return ${this.config.theme}`))();
          }
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // 处理通过属性传递的数据
    this._parseAttributeData();
    this._updateEntities();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      // 处理通过属性传递的数据
      this._parseAttributeData();
      this._updateEntities();
    }
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this.entity = this.hass.states[this.config.entity];
  }

  _getInstanceId() {
    if (!this._instanceId) {
      this._instanceId = Math.random().toString(36).substr(2, 9);
    }
    return this._instanceId;
  }

  _getWeatherIcon(condition) {
    const sunState = this.hass?.states['sun.sun']?.state || 'above_horizon';
    const isDark = this._evaluateTheme() === 'on';
    const iconPath = XiaoshiWeatherPadCard.ICON_PATH;
    
    const iconMap = {
      '晴': isDark ? 
        (sunState === 'above_horizon' ? `${iconPath}/晴-白天-暗黑.svg` : `${iconPath}/晴-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/晴-白天.svg` : `${iconPath}/晴-夜晚.svg`),
      '少云': isDark ?
        (sunState === 'above_horizon' ? `${iconPath}/少云-白天-暗黑.svg` : `${iconPath}/少云-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/少云-白天.svg` : `${iconPath}/少云-夜晚.svg`),
      '多云': isDark ?
        (sunState === 'above_horizon' ? `${iconPath}/多云-白天-暗黑.svg` : `${iconPath}/多云-夜晚-暗黑.svg`) :
        (sunState === 'above_horizon' ? `${iconPath}/多云-白天.svg` : `${iconPath}/多云-夜晚.svg`),
      '阴': isDark ? `${iconPath}/阴-暗黑.svg` : `${iconPath}/阴.svg`,
      '雨夹雪': isDark ? `${iconPath}/雨夹雪-暗黑.svg` : `${iconPath}/雨夹雪.svg`,
      '小雨': isDark ? `${iconPath}/小雨-暗黑.svg` : `${iconPath}/小雨.svg`,
      '小雪': isDark ? `${iconPath}/小雪-暗黑.svg` : `${iconPath}/小雪.svg`,
      'clear-night': isDark ? `${iconPath}/晴-夜晚-暗黑.svg` : `${iconPath}/晴-夜晚.svg`,
      'cloudy': isDark ? `${iconPath}/多云-暗黑.svg` : `${iconPath}/多云.svg`,
      'partlycloudy': isDark ? `${iconPath}/少云-暗黑.svg` : `${iconPath}/少云.svg`,
      'sunny': isDark ? `${iconPath}/晴-白天-暗黑.svg` : `${iconPath}/晴-白天.svg`,
      'rainy': isDark ? `${iconPath}/小雨-暗黑.svg` : `${iconPath}/小雨.svg`,
      'snowy': isDark ? `${iconPath}/小雪-暗黑.svg` : `${iconPath}/小雪.svg`,
      'snowy-rainy': isDark ? `${iconPath}/雨夹雪-暗黑.svg` : `${iconPath}/雨夹雪.svg`
    };

    return iconMap[condition] || (isDark ? `${iconPath}/${condition}-暗黑.svg` : `${iconPath}/${condition}.svg`);
  }

  _formatTemperature(temp) {
    if (temp === undefined || temp === null) return '--';
    return temp.toString().includes('.') ? temp : temp;
  }

  _getAqiCategoryHtml() {
    const summary = this.entity?.attributes?.minutely_summary;
    if (!summary) return '';
    return html`<span style="font-weight: bold;"> ${summary}</span>`;
  }

  _getMinutelyForecast() {
    if (!this.entity?.attributes?.minutely_forecast) return [];
    return this.entity.attributes.minutely_forecast.slice(0, 24);
  }

  _getMinutelyTemperatureExtremes() {
    let temperatures = [];
    const minutelyForecast = this._getMinutelyForecast();
    if (minutelyForecast.length === 0) {
      return { minTemp: 0, maxTemp: 0, range: 0, allEqual: true };
    }
    temperatures = minutelyForecast.map(item => parseFloat(item.native_temperature) || 0);
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const range = maxTemp - minTemp;
    const allEqual = temperatures.every(temp => temp === temperatures[0]);
    return { minTemp, maxTemp, range, allEqual };
  }

  _formatMinutelyTime(datetime) {
    const date = new Date(datetime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  _formatMinutelyDate(datetime) {
    const date = new Date(datetime);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}月${day}日`;
  }

  _renderMinutelyForecast() {
    const minutelyForecast = this._getMinutelyForecast();
    const extremes = this._getMinutelyTemperatureExtremes();
    const theme = this._evaluateTheme();
    const secondaryColor = 'rgb(110, 190, 240)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // 构造分钟曲线点：与温度点同一坐标系，确保曲线穿过每个点中心
    const { BUTTON_HEIGHT_PX, CONTAINER_HEIGHT_PX } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
    const actualMinutes = minutelyForecast.length || 1;
    const positions = (() => {
      const { minTemp, maxTemp, range, allEqual } = extremes;
      const availableHeight = CONTAINER_HEIGHT_PX - BUTTON_HEIGHT_PX;
      if (allEqual || range === 0) {
        const middlePosition = availableHeight / 2;
        return minutelyForecast.map(() => middlePosition);
      }
      const unitPosition = availableHeight / range;
      return minutelyForecast.map(minute => {
        const tempVal = parseFloat(minute.native_temperature) || 0;
        return (maxTemp - tempVal) * unitPosition;
      });
    })();
    
    // 根据用户要求：dot模式下调2.5px，button模式上调3px
    // 基础偏移：dot模式为2.5 (半径)，button模式为 BUTTON_HEIGHT_PX / 1.7 (约10px)
    // 叠加修正：dot + 2.5, button - 3
    const isDotMode = this.config?.visual_style === 'dot';
    const centerOffset = isDotMode 
      ? (2.5 + 2.5)
      : ((BUTTON_HEIGHT_PX / 1.7) - 3);
    const DOT_SHIFT_PX = 5;
    const points = minutelyForecast.map((_, index) => {
      const x = (index * 100) / actualMinutes + (100 / actualMinutes) / 2;
      const extraShift = isDotMode ? DOT_SHIFT_PX : 0;
      const y = Math.max(0, Math.min(positions[index] + centerOffset + extraShift, CONTAINER_HEIGHT_PX));
      return { x, y };
    });
    
    const instanceId = this._getInstanceId();
    const canvasId = `minutely-temp-canvas-${instanceId}`;
    
    this.updateComplete.then(() => {
      setTimeout(() => {
        this._drawTemperatureCurve(canvasId, points, 'rgba(76, 175, 80)');
      }, 50);
    });
    
    return html`
      <div class="forecast-container-wrapper" style="position: relative; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; touch-action: pan-x;">
        <div class="forecast-container" 
             style="display: grid; grid-template-columns: repeat(${minutelyForecast.length}, minmax(50px, 1fr)); gap: 2px; width: ${minutelyForecast.length * 50+(minutelyForecast.length-1)*2 }px;">
          <canvas class="temp-line-canvas temp-line-canvas-high temp-line-canvas-minutely" 
                  id="minutely-temp-canvas-${this._getInstanceId()}"></canvas>
        
        ${minutelyForecast.map((minute, index) => {
          const timeStr = this._formatMinutelyTime(minute.datetime);
          const dateStr = this._formatMinutelyDate(minute.datetime);
          const temp = this._formatTemperature(minute.native_temperature);
          
          const rainfall = parseFloat(minute.native_precipitation) || 0;
          
          const pointY = points[index]?.y ?? (CONTAINER_HEIGHT_PX / 2 + centerOffset + (isDotMode ? DOT_SHIFT_PX : 0));
          
          const RAINFALL_MAX = 1; // 最大雨量1mm
          const rainfallHeight = Math.min((rainfall / RAINFALL_MAX) * 125, 125);
          const topForDot = pointY - centerOffset;

          return html`
            <div class="forecast-day" style="background: ${backgroundColor};">
              <div class="forecast-weekday">${timeStr}</div>
              <div class="forecast-date" style="color: ${secondaryColor};">${dateStr}</div>
              
              <div class="forecast-temp-container">
                ${this.config.visual_style === 'dot' ? html`
                  <div class="temp-curve-minutely" style="top: ${topForDot}px">
                    <div class="temp-text">${temp}°</div>
                  </div>
                ` : html`
                  <div class="temp-curve-minutely" style="top: ${topForDot}px">
                    ${temp}°
                  </div>
                `}
                
                ${rainfall > 0 ? html`
                  <div class="rainfall-fill" style="height: ${rainfallHeight + 10}px; opacity: ${0.3+rainfall / RAINFALL_MAX}"></div>
                ` : ''}
              </div>
              <div class="forecast-temp-null"></div>
            </div>
          `;
        })}
        
        <!-- 雨量标签行 -->
        ${minutelyForecast.map(minute => {
          const rainfall = parseFloat(minute.native_precipitation) || 0;
          return html`
            <div class="forecast-rainfall-container">
              ${rainfall > 0 ? html`
                <div class="forecast-rainfall">
                  ${rainfall}mm
                </div>
              ` : ''}
            </div>
          `;
        })}
        
        <!-- 天气图标行 -->
        ${this._renderHourlyWeatherIcons(minutelyForecast)}
        
        <!-- 风向风级行 -->
        ${this._renderHourlyWindInfo(minutelyForecast)}
        </div>
      </div>
    `;
  }

  _getHourlyTemperatureExtremes() {
    let temperatures = [];
    
    // 小时预报专用温度极值计算
    const hourlyForecast = this._getHourlyForecast();
    if (hourlyForecast.length === 0) {
      return { minTemp: 0, maxTemp: 0, range: 0, allEqual: true };
    }
    temperatures = hourlyForecast.map(hour => parseFloat(hour.native_temperature) || 0);

    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const range = maxTemp - minTemp;
    
    // 检查是否所有温度都相等
    const allEqual = temperatures.every(temp => temp === temperatures[0]);
    
    return { minTemp, maxTemp, range, allEqual };
  }

  _generateHourlyTemperatureLine(hourlyData, extremes) {
    if (hourlyData.length === 0) return { points: [], curveHeight: 0, curveTop: 0 };
    
    const { BUTTON_HEIGHT_PX, CONTAINER_HEIGHT_PX } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
    const { minTemp, maxTemp, range } = extremes;
    
    const actualColumns = hourlyData.length;
    // 小时天气只有一个温度，使用实际可用高度计算
    const availableHeight = CONTAINER_HEIGHT_PX - BUTTON_HEIGHT_PX;
    
    // 计算每个小时的温度位置
    let positions;
    if (range === 0) {
      // 如果所有温度相等，将位置设置在中间
      const middlePosition = availableHeight / 2;
      positions = hourlyData.map(() => middlePosition);
    } else {
      const unitPosition = availableHeight / range;
      positions = hourlyData.map(hour => {
        const temp = parseFloat(hour.native_temperature) || 0;
        return (maxTemp - temp) * unitPosition;
      });
    }
    
    // 计算曲线范围
    const curveTop = Math.min(...positions);
    const curveBottom = Math.max(...positions) + BUTTON_HEIGHT_PX;
    const curveHeight = curveBottom - curveTop;

    // 生成点坐标 - 需要覆盖整个可滚动区域
    const actualHours = hourlyData.length;
    // 为了确保曲线覆盖整个可滚动区域，我们需要计算基于实际小时数的X坐标
    // 使用实际小时数作为总列数，确保曲线跨越整个可滚动宽度
    const points = hourlyData.map((data, index) => {
      const y = positions[index] - curveTop + BUTTON_HEIGHT_PX / 1.7;
      // X坐标计算：每个小时占据相等的空间，曲线覆盖所有小时数据
      const x = (index * 100) / actualHours + (100 / actualHours) / 2;
      return { x, y };
    });
    
    return { points, curveHeight, curveTop };
  }

  _getHourlyForecast() {
    if (!this.entity?.attributes?.hourly_forecast) return [];
    return this.entity.attributes.hourly_forecast.slice(0, 24);
  }

  _getCustomTemperature() {
    if (!this.config?.use_custom_entities || !this.config?.temperature_entity || !this.hass?.states[this.config.temperature_entity]) {
      return null;
    }
    
    const temp = this.hass.states[this.config.temperature_entity].state;
    const tempValue = parseFloat(temp);
    
    if (isNaN(tempValue)) {
      return null;
    }
    
    // 保留1位小数
    return tempValue.toFixed(1);
  }

  _getCustomHumidity() {
    if (!this.config?.use_custom_entities || !this.config?.humidity_entity || !this.hass?.states[this.config.humidity_entity]) {
      return null;
    }
    
    const humidity = this.hass.states[this.config.humidity_entity].state;
    const humidityValue = parseFloat(humidity);
    
    if (isNaN(humidityValue)) {
      return null;
    }
    
    // 保留1位小数
    return humidityValue.toFixed(1);
  }

  _formatSunTime(datetime) {
    if (!datetime) return '';
    
    try {
      const date = new Date(datetime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.warn('时间格式化错误:', error);
      return datetime;
    }
  }

  _parseAttributeData() {
    // 从hass-hass属性解析数据
    const hassAttr = this.getAttribute('hass-hass');
    if (hassAttr && !this.hass) {
      try {
        this.hass = JSON.parse(decodeURIComponent(hassAttr));
      } catch (e) {
        console.error('Failed to parse hass attribute:', e);
      }
    }

    // 从hass-config属性解析配置数据
    const configAttr = this.getAttribute('hass-config');
    if (configAttr && !this.config) {
      try {
        this.config = JSON.parse(decodeURIComponent(configAttr));
      } catch (e) {
        console.error('Failed to parse config attribute:', e);
      }
    }
  }

  _formatHourlyTime(datetime) {
    const [datePart, timePart] = datetime.split(' ');
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  }

  _formatHourlyDate(datetime) {
    const [datePart, timePart] = datetime.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${month}月${day}日`;
  }

  getHourlyWeatherData() {
    if (!this.entity?.attributes?.hourly_forecast) return [];
    
    return this.entity.attributes.hourly_forecast.slice(0, 24).map(hour => ({
      time: this._formatHourlyTime(hour.datetime),
      temp: hour.native_temperature || hour.temperature || '--',
      condition: hour.text || '晴',
      icon: hour.text || '晴',
      rain: hour.native_precipitation || hour.precipitation || 0,
      wind: hour.windscale || hour.wind_speed || 0
    }));
  }

  _toggleHourlyClose() {
    // 关闭小时天气弹窗
    if (window.browser_mod) {
      window.browser_mod.service('close_popup');
    } else {
      // 如果没有 browser_mod，尝试查找并关闭弹窗
      const modal = this.closest('.browser-mod-popup, .mdc-dialog, ha-dialog');
      if (modal) {
        modal.remove();
      }
    }
  }

  render() {
    const forecastData = this.forecastMode === 'minutely' ? this._getMinutelyForecast() : this._getHourlyForecast();
    
    if (!forecastData || forecastData.length === 0) {
      const theme = this._evaluateTheme();
      const backgroundColor = theme === 'on' ? 'rgba(255, 255, 255)' : 'rgba(50, 50, 50)';
      const textColor = theme === 'on' ? 'rgba(0, 0, 0)' : 'rgba(250, 250, 250)';
      const closeBtnColor = theme === 'on' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 100, 0)';
      const title = this.forecastMode === 'minutely' ? '分钟天气预报' : '24小时天气预报';
      const noDataText = this.forecastMode === 'minutely' ? '暂无分钟天气数据' : '暂无小时天气数据';
      
      return html`
          <div class="hourly-modal-content" style="background-color: ${backgroundColor}; color: ${textColor};" @click="${(e) => e.stopPropagation()}">
            <div class="hourly-modal-header">
              <h3 style="color: ${textColor};">${title}</h3>
              <button class="close-btn" style="color: ${closeBtnColor};" @click="${() => this._toggleHourlyClose()}">×</button>
            </div>
            <div class="hourly-modal-body">
              <p style="color: ${textColor};">${noDataText}</p>
            </div>
          </div>
      `;
    }

    // 获取自定义或默认的温度和湿度
    const customTemp = this._getCustomTemperature();
    const customHumidity = this._getCustomHumidity();
    const temperature = customTemp || this._formatTemperature(this.entity.attributes?.temperature);
    const humidity = customHumidity || this._formatTemperature(this.entity.attributes?.humidity);
    const condition = this.entity.attributes?.condition_cn || '未知';
    const windSpeed = this.entity.attributes?.wind_speed || 0;
    const theme = this._evaluateTheme();

    // 根据主题设置颜色
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = this.config.card_bg_color || 'transparent';
    const secondaryColor = theme === 'on' ? 'rgb(66, 165, 245)' : 'rgb(110, 190, 240)';
    const modalBgColor = theme === 'on' ? 'rgba(255, 255, 255)' : 'rgba(50, 50, 50)';
    const closeBtnColor = theme === 'on' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 100, 0)';

    const visualStyle = this.config.visual_style || 'button';
    const isDotMode = visualStyle === 'dot';

    return html`      
      <div class="weather-card ${theme === 'on' ? 'dark-theme' : ''} ${isDotMode ? 'dot-mode' : ''}" style="background-color: ${bgColor}; color: ${fgColor}; width: 100%; margin: 0;">
        <div class="main-content">
          <!-- 天气头部信息 -->
          <div class="weather-header" style="align-items: center; justify-content: space-between;">
            <div class="weather-left" style="flex: 1;">
              <div class="weather-icon">
                <img src="${this._getWeatherIcon(condition)}" alt="${condition}">
              </div>
              <div class="weather-details">
                <div class="weather-temperature">
                  ${temperature}<font size="1px"><b> ℃&ensp;</b></font>
                  ${humidity}<font size="1px"><b> % </b></font>
                </div>
                <div class="weather-info">
                  <span style="color: ${secondaryColor};">${condition}   
                    ${windSpeed}<span style="font-size: 0.6em;">km/h </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="weather-right-align" style="flex-shrink: 0;">
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px">
                <!-- 指数 -->
                ${this._getAqiCategoryHtml()}
              </div>
            </div>
          </div>
          
          <!-- 小时/分钟预报 -->
          ${this.forecastMode === 'minutely' ? this._renderMinutelyForecast() : this._renderHourlyForecast()}
        </div>   
      </div>
    `;
  }

  _renderHourlyForecast() {
    const hourlyForecast = this._getHourlyForecast();
    const extremes = this._getHourlyTemperatureExtremes();
    const theme = this._evaluateTheme();
    const secondaryColor = 'rgb(110, 190, 240)';
    const backgroundColor = theme === 'on' ? 'rgba(120, 120, 120, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // 生成温度曲线坐标（小时天气只有一个温度）
    const tempData = this._generateHourlyTemperatureLine(hourlyForecast, extremes, true);
    
    // 使用组件实例ID + Canvas ID，避免多实例冲突
    const instanceId = this._getInstanceId();
    const canvasId = `hourly-temp-canvas-${instanceId}`;
    
    // 在DOM更新完成后绘制曲线
    this.updateComplete.then(() => {
      setTimeout(() => {
        this._drawTemperatureCurve(canvasId, tempData.points, 'rgba(156, 39, 176)');
      }, 50);
    });
    
    return html`
      <div class="forecast-container-wrapper" style="position: relative; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; touch-action: pan-x;">
        <div class="forecast-container" 
             style="display: grid; grid-template-columns: repeat(${hourlyForecast.length}, minmax(50px, 1fr)); gap: 2px; width: ${hourlyForecast.length * 50+(hourlyForecast.length-1)*2 }px;">
          <!-- 小时温度连接线 Canvas - 绝对定位覆盖整个可滚动区域 -->
          <canvas class="temp-line-canvas temp-line-canvas-high temp-line-canvas-hourly" 
                  id="hourly-temp-canvas-${this._getInstanceId()}"></canvas>
        
        ${hourlyForecast.map((hour, index) => {
          const timeStr = this._formatHourlyTime(hour.datetime);
          const dateStr = this._formatHourlyDate(hour.datetime);
          const temp = this._formatTemperature(hour.native_temperature);
          
          // 获取雨量信息
          const rainfall = parseFloat(hour.native_precipitation) || 0;
          
          // 计算温度位置（简化版）
          const { minTemp, maxTemp, range, allEqual } = extremes;
          const { BUTTON_HEIGHT_PX, CONTAINER_HEIGHT_PX } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
          // 使用实际可用高度：容器高度减去按钮高度
          const availableHeight = CONTAINER_HEIGHT_PX - BUTTON_HEIGHT_PX;
          
          let finalTopPosition;
          if (allEqual) {
            // 如果所有温度相等，将位置设置在中间
            finalTopPosition = availableHeight / 2;
          } else {
            const unitPosition = range === 0 ? 0 : availableHeight / range;
            const tempValue = parseFloat(hour.native_temperature) || 0;
            const topPosition = (maxTemp - tempValue) * unitPosition;
            // 最高温度应该显示在顶部(position: 0)，最低温度在底部(position: availableHeight)
            finalTopPosition = Math.max(0, Math.min(topPosition, availableHeight));
          }
          
          // 计算雨量矩形高度和位置
          const RAINFALL_MAX = 5; // 最大雨量5mm
          const rainfallHeight = Math.min((rainfall / RAINFALL_MAX) * 125, 125);

          return html`
            <div class="forecast-day" style="background: ${backgroundColor};">
              <!-- 时间（hh:mm） -->
              <div class="forecast-weekday">${timeStr}</div>
              
              <!-- 日期（mm月dd日） -->
              <div class="forecast-date" style="color: ${secondaryColor};">${dateStr}</div>
              
              <!-- 温度（紫色） -->
              <div class="forecast-temp-container">
                ${this.config.visual_style === 'dot' ? html`
                  <!-- 圆点模式 -->
                  <div class="temp-curve-hourly" style="top: ${finalTopPosition}px">
                    <div class="temp-text">${temp}°</div>
                  </div>
                ` : html`
                  <!-- 按钮模式 -->
                  <div class="temp-curve-hourly" style="top: ${finalTopPosition}px">
                    ${temp}°
                  </div>
                `}
                
                <!-- 雨量填充矩形 -->
                ${rainfall > 0 ? html`
                  <div class="rainfall-fill" style="height: ${rainfallHeight + 10}px; opacity: ${0.3+rainfall / RAINFALL_MAX}"></div>
                ` : ''}
              </div>
              <div class="forecast-temp-null"></div>
            </div>
          `;
        })}
        
        <!-- 雨量标签行 - 10列网格 -->
        ${hourlyForecast.map(hour => {
          const rainfall = parseFloat(hour.native_precipitation) || 0;
          return html`
            <div class="forecast-rainfall-container">
              ${rainfall > 0 ? html`
                <div class="forecast-rainfall">
                  ${rainfall}mm
                </div>
              ` : ''}
            </div>
          `;
        })}
        
        <!-- 天气图标行 -->
        ${this._renderHourlyWeatherIcons(hourlyForecast)}
        
        <!-- 风向风级行 -->
        ${this._renderHourlyWindInfo(hourlyForecast)}
      </div>
    `;
  }

  _drawTemperatureCurve(canvasId, points, color) {
    
    requestAnimationFrame(() => {
      // 先在shadow DOM中查找，再在document中查找
      let canvas = this.shadowRoot?.getElementById(canvasId) || document.getElementById(canvasId);
      
      if (!canvas) {
        // 通过类名查找
        const className = canvasId.includes('high') ? 'temp-line-canvas-high' : 'temp-line-canvas-low';
        canvas = this.shadowRoot?.querySelector(`.${className}`) || document.querySelector(`.${className}`);
      }
      
      if (!canvas) {
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      // 设置Canvas实际尺寸
      let targetWidth = rect.width;
      
      // 对于小时温度曲线，确保Canvas覆盖整个可滚动宽度
      if (canvasId.includes('hourly')) {
        const hourlyData = this._getHourlyForecast();
        const contentWidth = hourlyData.length * 50; // 每小时50px
        targetWidth = Math.max(rect.width, contentWidth);
      }
      
      canvas.width = rect.width *3;
      canvas.height = rect.height *3;
      
      if (points.length < 2) {
        return;
      }
      
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 设置线条样式
      ctx.strokeStyle = color;
      ctx.lineWidth = 6; // 固定线宽
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 开始绘制路径
      ctx.beginPath();
      
      const { CONTAINER_HEIGHT_PX } = XiaoshiWeatherPadCard.TEMPERATURE_CONSTANTS;
      
      // 转换所有点为Canvas坐标
      const canvasPoints = points.map((point, index) => {
        const x = (point.x / 100) * canvas.width;
        const y = (point.y / CONTAINER_HEIGHT_PX) * canvas.height;
        return { x, y };
      });
      
      if (canvasPoints.length < 2) {
        // 如果只有两个点，直接画直线
        if (canvasPoints.length === 2) {
          ctx.beginPath();
          ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
          ctx.lineTo(canvasPoints[1].x, canvasPoints[1].y);
          ctx.stroke();
        }
        return;
      }
      
      // 开始绘制平滑曲线，确保通过所有原始点
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      
      // 使用更保守的样条算法，减少曲线过度弯曲
      const tension = 0.2; // 减小张力系数，避免过度弯曲
      
      for (let i = 0; i < canvasPoints.length - 1; i++) {
        const p0 = canvasPoints[Math.max(0, i - 1)];
        const p1 = canvasPoints[i];
        const p2 = canvasPoints[i + 1];
        const p3 = canvasPoints[Math.min(canvasPoints.length - 1, i + 2)];
        
        // 计算控制点，限制控制点距离，避免过度弯曲
        const dx1 = (p2.x - p0.x) * tension;
        const dy1 = (p2.y - p0.y) * tension;
        const dx2 = (p3.x - p1.x) * tension;
        const dy2 = (p3.y - p1.y) * tension;
        
        // 限制控制点的垂直距离，防止曲线超出边界
        const maxControlDistance = Math.abs(p2.x - p1.x) * 0.3;
        const limitedDy1 = Math.max(-maxControlDistance, Math.min(maxControlDistance, dy1));
        const limitedDy2 = Math.max(-maxControlDistance, Math.min(maxControlDistance, dy2));
        
        const cp1x = p1.x + dx1;
        const cp1y = p1.y + limitedDy1;
        const cp2x = p2.x - dx2;
        const cp2y = p2.y - limitedDy2;
        
        // 如果是第一段，使用二次贝塞尔
        if (i === 0) {
          ctx.quadraticCurveTo(cp1x, cp1y, p2.x, p2.y);
        } else {
          // 使用三次贝塞尔曲线，确保通过原始点
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
      }
      
      ctx.stroke();
    });
  }

  _handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }


  firstUpdated() {
    this._drawTempCurve();
  }

  updated() {
    this._drawTempCurve();
  }

  _drawTempCurve() {
    const hourlyData = this.getHourlyWeatherData();
    if (!hourlyData || hourlyData.length === 0) return;

    const canvas = this.shadowRoot?.getElementById('temp-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // 设置canvas实际尺寸
    canvas.width = canvas.offsetWidth * 3;
    canvas.height = canvas.offsetHeight * 3;
    // canvas.style.width = canvas.offsetWidth + 'px';
    // canvas.style.height = canvas.offsetHeight + 'px';



    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const itemWidth = 160; // 140px + 20px gap
    const startX = (width - hourlyData.length * itemWidth) / 2 + 70;

    // 获取温度范围
    const temps = hourlyData.map(h => parseInt(h.temp) || 0);
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const tempRange = maxTemp - minTemp || 1;

    // 绘制温度曲线
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    hourlyData.forEach((hour, index) => {
      const temp = parseInt(hour.temp) || 0;
      const x = startX + index * itemWidth;
      const y = height - ((temp - minTemp) / tempRange) * (height - 60) - 30;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制温度点
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    hourlyData.forEach((hour, index) => {
      const temp = parseInt(hour.temp) || 0;
      const x = startX + index * itemWidth;
      const y = height - ((temp - minTemp) / tempRange) * (height - 60) - 30;
      
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _renderWeatherIcons(forecastDays) {
    return html`
      ${forecastDays.map(day => {
        return html`
          <div class="forecast-icon-container">
            <div class="forecast-icon">
              <img src="${this._getWeatherIcon(day.text)}" alt="${day.text}">
            </div>
          </div>
        `;
      })}
        </div>
      </div>
    `;
  }

  _renderHourlyWeatherIcons(hourlyForecast) {
    return html`
      ${hourlyForecast.map(hour => {
        return html`
          <div class="forecast-icon-container">
            <div class="forecast-icon">
              <img src="${this._getWeatherIcon(hour.text)}" alt="${hour.text}">
            </div>
          </div>
        `;
      })}
        </div>
      </div>
    `;
  }

  _renderWindInfo(forecastDays) {
    const theme = this._evaluateTheme();
    const secondaryColor = 'rgb(110, 190, 240)';
    return html`
      ${forecastDays.map(day => {
        const windSpeedRaw = day.windscaleday || 0;
        let windSpeed = windSpeedRaw;
        
        // 如果风速是 "4-5" 格式，取最大值
        if (typeof windSpeedRaw === 'string' && windSpeedRaw.includes('-')) {
          const speeds = windSpeedRaw.split('-').map(s => parseFloat(s.trim()));
          if (speeds.length === 2 && !isNaN(speeds[0]) && !isNaN(speeds[1])) {
            windSpeed = Math.max(speeds[0], speeds[1]);
          }
        }
        
        const windDirection = day.wind_bearing || 0;
        
        return html`
          <div class="forecast-wind-container">
            <div class="forecast-wind" style="color: ${secondaryColor};">
              <span class="wind-direction" >${this._getWindDirectionIcon(windDirection)}</span>
              <span>${windSpeed}级</span>
            </div>
          </div>
        `;
      })}
        </div>
      </div>
    `;
  }

  _renderHourlyWindInfo(hourlyForecast) {
    const theme = this._evaluateTheme();
    const secondaryColor = 'rgb(110, 190, 240)';
    return html`
      ${hourlyForecast.map(hour => {
        const windSpeedRaw = hour.windscaleday || 0;
        let windSpeed = windSpeedRaw;
        
        // 如果风速是 "4-5" 格式，取最大值
        if (typeof windSpeedRaw === 'string' && windSpeedRaw.includes('-')) {
          const speeds = windSpeedRaw.split('-').map(s => parseFloat(s.trim()));
          if (speeds.length === 2 && !isNaN(speeds[0]) && !isNaN(speeds[1])) {
            windSpeed = Math.max(speeds[0], speeds[1]);
          }
        }
        
        const windDirection = hour.wind_bearing || 0;
        
        return html`
          <div class="forecast-wind-container">
            <div class="forecast-wind" style="color: ${secondaryColor};">
              <span class="wind-direction">${this._getWindDirectionIcon(windDirection)}</span>
              <span>${windSpeed}级</span>
            </div>
          </div>
        `;
      })}
        </div>
      </div>
    `;
  }

  _getWindDirectionIcon(bearing) {
    // 0是北风，按顺时针方向增加
    const directions = [
      { range: [337.5, 360], icon: '↑', name: '北' },    // 337.5-360度
      { range: [0, 22.5], icon: '↑', name: '北' },        // 0-22.5度
      { range: [22.5, 67.5], icon: '↗', name: '东北' },    // 22.5-67.5度
      { range: [67.5, 112.5], icon: '→', name: '东' },     // 67.5-112.5度
      { range: [112.5, 157.5], icon: '↘', name: '东南' },   // 112.5-157.5度
      { range: [157.5, 202.5], icon: '↓', name: '南' },     // 157.5-202.5度
      { range: [202.5, 247.5], icon: '↙', name: '西南' },   // 202.5-247.5度
      { range: [247.5, 292.5], icon: '←', name: '西' },     // 247.5-292.5度
      { range: [292.5, 337.5], icon: '↖', name: '西北' }    // 292.5-337.5度
    ];

    const direction = directions.find(dir => {
      if (dir.range[0] <= dir.range[1]) {
        // 正常范围，如 22.5-67.5
        return bearing >= dir.range[0] && bearing < dir.range[1];
      } else if (dir.range[0] === 337.5 && dir.range[1] === 360) {
        // 337.5-360度特殊处理
        return bearing >= dir.range[0] && bearing <= 360;
      } else if (dir.range[0] === 0 && dir.range[1] === 22.5) {
        // 0-22.5度特殊处理
        return bearing >= dir.range[0] && bearing < dir.range[1];
      }
      return false;
    });

    return direction ? direction.icon : '↓';
  }


  setConfig(config) {
    if (!config.entity) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
  }

  getCardSize() {
    return 8;
  }

  // 鼠标滑动处理方法
  _handleMouseDown(e) {
    const container = e.target.closest('.forecast-container');
    const wrapper = e.target.closest('.forecast-container-wrapper');
    if (!container || !wrapper) return;
    
    this.isDragging = true;
    this.startX = e.pageX - wrapper.offsetLeft;
    this.scrollLeft = wrapper.scrollLeft || 0;
    this.scrollTarget = wrapper;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  }

  _handleMouseUp(e) {
    this.isDragging = false;
    if (this.scrollTarget) {
      const container = this.scrollTarget.querySelector('.forecast-container');
      if (container) {
        container.style.cursor = 'grab';
      }
      this.scrollTarget = null;
    }
  }

  _handleMouseMove(e) {
    if (!this.isDragging || !this.scrollTarget) return;
    
    e.preventDefault();
    const x = e.pageX - this.scrollTarget.offsetLeft;
    const walk = (x - this.startX) * 1.5; // 调整滑动速度
    
    // 使用requestAnimationFrame优化性能
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollLeft = this.scrollLeft - walk;
      }
    });
  }

  // 触摸滑动处理方法
  _handleTouchStart(e) {
    const container = e.target.closest('.forecast-container');
    const wrapper = e.target.closest('.forecast-container-wrapper');
    if (!container || !wrapper) return;
    
    this.startX = e.touches[0].pageX - wrapper.offsetLeft;
    this.scrollLeft = wrapper.scrollLeft || 0;
    this.scrollTarget = wrapper;
  }

  _handleTouchEnd(e) {
    this.scrollTarget = null;
  }

  _handleTouchMove(e) {
    if (!this.scrollTarget) return;
    
    e.preventDefault();
    const x = e.touches[0].pageX - this.scrollTarget.offsetLeft;
    const walk = (x - this.startX) * 1.5; // 调整滑动速度
    
    // 使用requestAnimationFrame优化性能
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollLeft = this.scrollLeft - walk;
      }
    });
  }
}
customElements.define('xiaoshi-hourly-weather-card', XiaoshiHourlyWeatherCard);

class XiaoshiWarningWeatherCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entity: { type: Object }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .close-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: rgba(255, 0, 0);
      }

      /*预警弹窗样式*/
      .warning-modal-content {
        border-radius: 12px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 0 auto;
        color: white;
      }

      .warning-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 10px;
      }

      .warning-modal-header h2 {
        margin: 20px 20px 5px 20px;
        color: #FFA726;
        font-size: 20px;
        font-weight: bold;
      }

      .warning-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: rgba(255, 100, 0);
        margin-right: 10px;
        padding: 5px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .warning-close-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: rgba(255, 0, 0);
      }

      .warning-item {
        background: rgba(127, 127, 127, 0.15);
        border-radius: 8px;
        padding: 15px;
        margin: 12px 20px;
        border-left: 4px solid #FFA726;
        transition: all 0.2s ease;
      }

      .warning-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .warning-title {
        font-weight: bold;
        font-size: 15px;
        flex: 1;
      }

      .warning-time {
        font-size: 12px;
        white-space: nowrap;
        margin-left: 10px;
      }

      .warning-text {
        font-size: 13px;
        line-height: 1.5;
      }

    `;
  }

  constructor() {
    super();
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.scrollTarget = null;
    this.rafId = null;
  }
  
  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string') {
          // 处理Home Assistant模板语法 [[[ return theme() ]]]
          if (this.config.theme.includes('[[[') && this.config.theme.includes(']]]')) {
              // 提取模板中的JavaScript代码
              const match = this.config.theme.match(/\[\[\[\s*(.*?)\s*\]\]\]/);
              if (match && match[1]) {
                  const code = match[1].trim();
                  // 如果代码以return开头，直接执行
                  if (code.startsWith('return')) {
                      return (new Function(code))();
                  }
                  // 否则包装在return中执行
                  return (new Function(`return ${code}`))();
              }
          }
          // 处理直接的JavaScript函数字符串
          if (this.config.theme.includes('return') || this.config.theme.includes('=>')) {
              return (new Function(`return ${this.config.theme}`))();
          }
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // 处理通过属性传递的数据
    this._parseAttributeData();
    this._updateEntities();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      // 处理通过属性传递的数据
      this._parseAttributeData();
      this._updateEntities();
    }
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this.entity = this.hass.states[this.config.entity];
  }

  _parseAttributeData() {
    // 从hass-hass属性解析数据
    const hassAttr = this.getAttribute('hass-hass');
    if (hassAttr && !this.hass) {
      try {
        this.hass = JSON.parse(decodeURIComponent(hassAttr));
      } catch (e) {
        console.error('Failed to parse hass attribute:', e);
      }
    }

    // 从hass-config属性解析配置数据
    const configAttr = this.getAttribute('hass-config');
    if (configAttr && !this.config) {
      try {
        this.config = JSON.parse(decodeURIComponent(configAttr));
      } catch (e) {
        console.error('Failed to parse config attribute:', e);
      }
    }
  }

  _getWarningColorForLevel(level) {
    if (level == "红色") return "rgb(255,50,50)";
    if (level == "橙色") return "rgb(255,100,0)";
    if (level == "黄色") return "rgb(255,200,0)";
    if (level == "蓝色") return "rgb(50,150,200)";
    
    return "#FFA726"; // 默认颜色
  }

  _getWarningColor(warning) {
    if (!warning || warning.length === 0) return "#FFA726"; // 默认颜色
    
    let level = "";
    const priority = ["红色", "橙色", "黄色", "蓝色"];
    
    for (let i = 0; i < warning.length; i++) {
      const currentLevel = warning[i].level;
      if (priority.indexOf(currentLevel) < priority.indexOf(level) || level == "") {
        level = currentLevel;
      }
    }
    
    return this._getWarningColorForLevel(level);
  }

  _formatDateTimeToBeijing(datetime) {
    try {
      const d = new Date(datetime);
      const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).formatToParts(d);
      const get = (t) => parts.find(p => p.type === t)?.value || '';
      return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
    } catch {
      return datetime ? datetime.slice(0, 16) : '';
    }
  }

  _formatDateToBeijing(datetime) {
    try {
      const d = new Date(datetime);
      const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(d);
      const get = (t) => parts.find(p => p.type === t)?.value || '';
      return `${get('year')}-${get('month')}-${get('day')}`;
    } catch {
      return datetime ? datetime.slice(0, 10) : '';
    }
  }

  _toggleWarningClose() {
    // 关闭小时天气弹窗
    if (window.browser_mod) {
      window.browser_mod.service('close_popup');
    } else {
      // 如果没有 browser_mod，尝试查找并关闭弹窗
      const modal = this.closest('.browser-mod-popup, .mdc-dialog, ha-dialog');
      if (modal) {
        modal.remove();
      }
    }
  }

  render() {
    if (!this.entity?.attributes?.warning || this.entity.attributes.warning.length === 0) {
      return html`
          <div class="warning-modal-content" >
            <div class="warning-modal-header">
              <h2>天气预警</h2>
              <button class="warning-close-btn" @click="${() => this._toggleWarningClose()}">×</button>
            </div>
            <div class="warning-modal-body">
              <p>暂无预警信息</p>
            </div>
          </div>
      `;
    }

    const warning = this.entity.attributes.warning;
    const theme = this._evaluateTheme();
    const warningColor = this._getWarningColor(warning); // 获取最高预警级别的颜色
    
    // 根据主题设置颜色
    const backgroundColor = theme === 'on' ? 'rgba(255, 255, 255)' : 'rgba(50, 50, 50)';
    const textColor = theme === 'on' ? 'rgba(0, 0, 0)' : 'rgba(250, 250, 250)';
    const secondaryTextColor = theme === 'on' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const closeBtnColor = theme === 'on' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 100, 0)';

    return html`
      <div class="warning-modal-body" style="background: transparent; color: ${textColor}; padding: 0;">
        ${warning.map((warningItem, index) => {
          const typeName = warningItem.typeName ?? "";
          const level = warningItem.level ?? "";
          const sender = warningItem.sender ?? "";
          const startTime = warningItem.startTime ? this._formatDateTimeToBeijing(warningItem.startTime) : "";
          const endTime = warningItem.endTime ? this._formatDateTimeToBeijing(warningItem.endTime) : "";
          const text = warningItem.text ?? "";
          
          // 获取当前预警项的颜色
          const itemWarningColor = this._getWarningColorForLevel(level);

          return html`
            <div class="warning-item" style="border-left-color: ${itemWarningColor};">
              <div class="warning-item-header">
                <div class="warning-title" style="color: ${itemWarningColor};">
                  ${sender}: 【${typeName}】${level}预警
                </div>
                <div class="warning-time" style="color: ${secondaryTextColor};">
                  ${startTime} ~ ${endTime}
                </div>
              </div>
              <div class="warning-text" style="color: ${secondaryTextColor};">
                ${text}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
  }


  getCardSize() {
    return 8;
  }

  // 鼠标滑动处理方法
  _handleMouseDown(e) {
    const container = e.target.closest('.forecast-container');
    const wrapper = e.target.closest('.forecast-container-wrapper');
    if (!container || !wrapper) return;
    
    this.isDragging = true;
    this.startX = e.pageX - wrapper.offsetLeft;
    this.scrollLeft = wrapper.scrollLeft || 0;
    this.scrollTarget = wrapper;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  }

  _handleMouseUp(e) {
    this.isDragging = false;
    if (this.scrollTarget) {
      const container = this.scrollTarget.querySelector('.forecast-container');
      if (container) {
        container.style.cursor = 'grab';
      }
      this.scrollTarget = null;
    }
  }

  _handleMouseMove(e) {
    if (!this.isDragging || !this.scrollTarget) return;
    
    e.preventDefault();
    const x = e.pageX - this.scrollTarget.offsetLeft;
    const walk = (x - this.startX) * 1.5; // 调整滑动速度
    
    // 使用requestAnimationFrame优化性能
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollLeft = this.scrollLeft - walk;
      }
    });
  }

  // 触摸滑动处理方法
  _handleTouchStart(e) {
    const container = e.target.closest('.forecast-container');
    const wrapper = e.target.closest('.forecast-container-wrapper');
    if (!container || !wrapper) return;
    
    this.startX = e.touches[0].pageX - wrapper.offsetLeft;
    this.scrollLeft = wrapper.scrollLeft || 0;
    this.scrollTarget = wrapper;
  }

  _handleTouchEnd(e) {
    this.scrollTarget = null;
  }

  _handleTouchMove(e) {
    if (!this.scrollTarget) return;
    
    e.preventDefault();
    const x = e.touches[0].pageX - this.scrollTarget.offsetLeft;
    const walk = (x - this.startX) * 1.5; // 调整滑动速度
    
    // 使用requestAnimationFrame优化性能
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollLeft = this.scrollLeft - walk;
      }
    });
  }

}
customElements.define('xiaoshi-warning-weather-card', XiaoshiWarningWeatherCard);

class XiaoshiAqiWeatherCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entity: { type: Object }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .aqi-card {
        position: relative;
        border-radius: 15px;
        padding: 16px;
        font-family: sans-serif;
        overflow: hidden;
      }

      .aqi-card.dark-theme {
        background: rgba(50, 50, 50);
      }

      .aqi-card.light-theme {
        background: rgba(255, 255, 255);
      }

      .aqi-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: -10px;
        margin-bottom: 25px;
        border-bottom: 1px solid rgba(150, 150, 150, 0.4);
        padding-bottom: 10px;
      }

      .aqi-modal-header h2 {
        margin: 20px 20px 5px 20px;
        font-size: 20px;
        font-weight: bold;
      }      

      .aqi-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: rgba(255, 100, 0);
        margin-right: 10px;
        padding: 5px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .aqi-close-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: rgba(255, 0, 0);
      }

      /* AQI总览 */
      .aqi-overview {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        padding: 8px;
        border-radius: 12px;
      }

      .aqi-main-value {
        text-align: center;
      }

      .aqi-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .aqi-category {
        font-size: 18px;
        margin-top: 4px;
      }

      /* 污染物网格 */
      .pollutants-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .pollutant-item {
        text-align: center;
        padding: 8px;
        border-radius: 8px;
      }

      .pollutant-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .pollutant-value {
        font-size: 14px;
      }
    `;
  }

  constructor() {
    super();
  }

  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string') {
          // 处理Home Assistant模板语法 [[[ return theme() ]]]
          if (this.config.theme.includes('[[[') && this.config.theme.includes(']]]')) {
              // 提取模板中的JavaScript代码
              const match = this.config.theme.match(/\[\[\[\s*(.*?)\s*\]\]\]/);
              if (match && match[1]) {
                  const code = match[1].trim();
                  // 如果代码以return开头，直接执行
                  if (code.startsWith('return')) {
                      return (new Function(code))();
                  }
                  // 否则包装在return中执行
                  return (new Function(`return ${code}`))();
              }
          }
          // 处理直接的JavaScript函数字符串
          if (this.config.theme.includes('return') || this.config.theme.includes('=>')) {
              return (new Function(`return ${this.config.theme}`))();
          }
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // 处理通过属性传递的数据
    this._parseAttributeData();
    this._updateEntities();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      // 处理通过属性传递的数据
      this._parseAttributeData();
      this._updateEntities();
    }
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this.entity = this.hass.states[this.config.entity];
  }

  _parseAttributeData() {
    // 从hass-hass属性解析数据
    const hassAttr = this.getAttribute('hass-hass');
    if (hassAttr && !this.hass) {
      try {
        this.hass = JSON.parse(decodeURIComponent(hassAttr));
      } catch (e) {
        console.error('Failed to parse hass attribute:', e);
      }
    }

    // 从hass-config属性解析配置数据
    const configAttr = this.getAttribute('hass-config');
    if (configAttr && !this.config) {
      try {
        this.config = JSON.parse(decodeURIComponent(configAttr));
      } catch (e) {
        console.error('Failed to parse config attribute:', e);
      }
    }
  }

  _getAqiColor(category) {
    switch(category) {
      case '优': return '#4CAF50'; // 绿色
      case '良': return '#FFC107'; // 黄色
      case '轻度污染': return '#FF9800'; // 橙色
      case '中度污染': return '#FF5722'; // 深橙色
      case '重度污染': return '#F44336'; // 红色
      case '严重污染': return '#9C27B0'; // 紫色
      default: return '#9E9E9E'; // 灰色
    }
  }

  _toggleAqiClose() {
    // 关闭小时天气弹窗
    if (window.browser_mod) {
      window.browser_mod.service('close_popup');
    } else {
      // 如果没有 browser_mod，尝试查找并关闭弹窗
      const modal = this.closest('.browser-mod-popup, .mdc-dialog, ha-dialog');
      if (modal) {
        modal.remove();
      }
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;
 
    this.entity = this.hass.states[this.config.entity];
    
    if (!this.entity || !this.entity.attributes?.aqi) {
      return html`<div class="aqi-card">暂无空气质量数据</div>`;
    }

    const aqi = this.entity.attributes.aqi;
    const theme = this._evaluateTheme();
    const isDark = theme === 'on';
    
    const textcolor = isDark ? 'rgba(0, 0, 0)' : 'rgba(255, 255, 255)';
    const themeClass = isDark ? 'light-theme' : 'dark-theme';
    
    // 获取AQI数值和等级
    const aqiValue = aqi.aqi || aqi.value || 0;
    const category = aqi.category || '未知';
    const level = aqi.level || '未知';
    const pm25 = aqi.pm2p5 || 0;
    const pm10 = aqi.pm10 || 0;
    const so2 = aqi.so2 || 0;
    const no2 = aqi.no2 || 0;
    const co = aqi.co || 0;
    const o3 = aqi.o3 || 0;
    
    const aqiColor = this._getAqiColor(category);

    return html`
      <div class="aqi-card ${themeClass}" style="padding: 0;">
        <!-- AQI总览 -->
        <div class="aqi-overview">
          <div class="aqi-main-value">
            <div class="aqi-value" style="color: ${aqiColor};">${aqiValue}</div>
            <div class="aqi-category" style="color: ${aqiColor};">${category} (${level}级)</div>
          </div>
        </div>
        
        <!-- 污染物详情 -->
        <div class="pollutants-grid">
          <div class="pollutant-item">
            <div class="pollutant-name" style="color: ${textcolor};">PM2.5</div>
            <div class="pollutant-value" style="color: ${textcolor};">${pm25} μg/m³</div>
          </div>
          
          <div class="pollutant-item">
            <div class="pollutant-name" style="color: ${textcolor};">PM10</div>
            <div class="pollutant-value" style="color: ${textcolor};">${pm10} μg/m³</div>
          </div>
          
          <div class="pollutant-item">
            <div class="pollutant-name" style="color: ${textcolor};">SO₂</div>
            <div class="pollutant-value" style="color: ${textcolor};">${so2} μg/m³</div>
          </div>
          
          <div class="pollutant-item">
            <div class="pollutant-name" style="color: ${textcolor};">NO₂</div>
            <div class="pollutant-value" style="color: ${textcolor};">${no2} μg/m³</div>
          </div>
          
          <div class="pollutant-item">
            <div class="pollutant-name" style="color: ${textcolor};">CO</div>
            <div class="pollutant-value" style="color: ${textcolor};">${co} mg/m³</div>
          </div>
          
          <div class="pollutant-item">
            <div class="pollutant-name" style="color: ${textcolor};">O₃</div>
            <div class="pollutant-value" style="color: ${textcolor};">${o3} μg/m³</div>
          </div>
        </div>
      </div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}
customElements.define('xiaoshi-aqi-weather-card', XiaoshiAqiWeatherCard);

class XiaoshiIndicesWeatherCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entity: { type: Object }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .indices-card {
        position: relative;
        border-radius: 15px;
        padding: 16px;
        font-family: sans-serif;
        overflow: hidden;
      }

      .indices-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: -10px;
        margin-bottom: 25px;
        border-bottom: 1px solid rgba(150, 150, 150, 0.4);
        padding-bottom: 10px;
      }

      .indices-modal-header h2 {
        margin: 20px 20px 5px 20px;
        font-size: 20px;
        font-weight: bold;
      }      

      .indices-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: rgba(255, 100, 0);
        margin-right: 10px;
        padding: 5px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      .indices-close-btn:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: rgba(255, 0, 0);
      }

      /* 指数网格 */
      .indices-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
        /* 隐藏滚动条但保留功能 */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none;  /* IE and Edge */
      }

      .indices-grid::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }

      .index-item {
        padding: 12px;
        border-radius: 8px;
      }

      .index-header {
        margin-bottom: 4px;
      }

      .index-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 2px;
      }

      .index-level {
        font-size: 12px;
      }

      .index-description {
        font-size: 10px;
        opacity: 0.8;
        line-height: 1.4;
      }
    `;
  }

  constructor() {
    super();
  }

  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string') {
          // 处理Home Assistant模板语法 [[[ return theme() ]]]
          if (this.config.theme.includes('[[[') && this.config.theme.includes(']]]')) {
              // 提取模板中的JavaScript代码
              const match = this.config.theme.match(/\[\[\[\s*(.*?)\s*\]\]\]/);
              if (match && match[1]) {
                  const code = match[1].trim();
                  // 如果代码以return开头，直接执行
                  if (code.startsWith('return')) {
                      return (new Function(code))();
                  }
                  // 否则包装在return中执行
                  return (new Function(`return ${code}`))();
              }
          }
          // 处理直接的JavaScript函数字符串
          if (this.config.theme.includes('return') || this.config.theme.includes('=>')) {
              return (new Function(`return ${this.config.theme}`))();
          }
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // 处理通过属性传递的数据
    this._parseAttributeData();
    this._updateEntities();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      // 处理通过属性传递的数据
      this._parseAttributeData();
      this._updateEntities();
    }
  }

  _updateEntities() {
    if (!this.hass || !this.config) return;

    this.entity = this.hass.states[this.config.entity];
  }

  _parseAttributeData() {
    // 从hass-hass属性解析数据
    const hassAttr = this.getAttribute('hass-hass');
    if (hassAttr && !this.hass) {
      try {
        this.hass = JSON.parse(decodeURIComponent(hassAttr));
      } catch (e) {
        console.error('Failed to parse hass attribute:', e);
      }
    }

    // 从hass-config属性解析配置数据
    const configAttr = this.getAttribute('hass-config');
    if (configAttr && !this.config) {
      try {
        this.config = JSON.parse(decodeURIComponent(configAttr));
      } catch (e) {
        console.error('Failed to parse config attribute:', e);
      }
    }
  }

  _toggleIndicesClose() {
    // 关闭小时天气弹窗
    if (window.browser_mod) {
      window.browser_mod.service('close_popup');
    } else {
      // 如果没有 browser_mod，尝试查找并关闭弹窗
      const modal = this.closest('.browser-mod-popup, .mdc-dialog, ha-dialog');
      if (modal) {
        modal.remove();
      }
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;
    
    this.entity = this.hass.states[this.config.entity];
    
    if (!this.entity || !this.entity.attributes?.air_indices) {
      return html`<div class="indices-card">暂无天气指数数据</div>`;
    }

    const indices = this.entity.attributes.air_indices;
    const theme = this._evaluateTheme();
    const isDark = theme === 'on';
    
    const textcolor = isDark ? 'rgba(0, 0, 0)' : 'rgba(255, 255, 255)';
    const textcolor2 = isDark ? 'rgba(23, 140, 5, 1)' : 'rgba(10, 231, 47, 1)';
    const backgroundColor = isDark ? 'rgba(255, 255, 255)' : 'rgba(50, 50, 50)';
    const backgroundColor2 = isDark ? 'rgba(50, 50, 50,0.1)' : 'rgba(255, 255, 255,0.1)';

    return html`
      <div class="indices-grid" style="background: transparent;">
        ${indices.map(index => html`
          <div class="index-item" style="background: ${backgroundColor2};">
            <div class="index-header">
              <span class="index-name" style="color: ${textcolor2};">${index.name} </span>
              <span class="index-level" style="color: ${textcolor};">等级:${index.level} ${index.category}</span>
            </div>

            <div class="index-description" style="color: ${textcolor};">
              ${index.text}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('需要指定天气实体');
    }
    this.config = config;
  }

  getCardSize() {
    return 4;
  }
}
customElements.define('xiaoshi-indices-weather-card', XiaoshiIndicesWeatherCard);

window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: "xiaoshi-weather-phone-card",
    name: "消逝天气卡片（手机端）",
    preview: true
  },
  {
    type: "xiaoshi-weather-pad-card",
    name: "消逝天气卡片（平板端）",
    preview: true
  }
);

