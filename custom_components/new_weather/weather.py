"""Bridge weather entity that mirrors QWeather and preserves current-hour forecast."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime
import logging

from homeassistant.components.weather import (
    ATTR_FORECAST_CONDITION,
    ATTR_FORECAST_NATIVE_PRECIPITATION,
    ATTR_FORECAST_NATIVE_PRESSURE,
    ATTR_FORECAST_NATIVE_TEMP,
    ATTR_FORECAST_PRECIPITATION_PROBABILITY,
    ATTR_FORECAST_TIME,
    ATTR_FORECAST_WIND_BEARING,
    ATTR_FORECAST_NATIVE_WIND_SPEED,
    Forecast,
    WeatherEntity,
    WeatherEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_ATTRIBUTION,
    CONF_NAME,
    UnitOfLength,
    UnitOfPressure,
    UnitOfSpeed,
    UnitOfTemperature,
)
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import dt as dt_util

from .const import ATTR_HOURLY_FORECAST, CONF_SOURCE_ENTITY, DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    """Set up New Weather bridge entity."""
    entity = NewWeatherBridgeEntity(hass, entry)
    async_add_entities([entity], True)


class NewWeatherBridgeEntity(WeatherEntity):
    """Mirror a source weather entity and enhance its hourly forecast."""

    _attr_native_precipitation_unit = UnitOfLength.MILLIMETERS
    _attr_native_pressure_unit = UnitOfPressure.HPA
    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_native_visibility_unit = UnitOfLength.KILOMETERS
    _attr_native_wind_speed_unit = UnitOfSpeed.KILOMETERS_PER_HOUR

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self._entry = entry
        self._source_entity_id = entry.data[CONF_SOURCE_ENTITY]
        self._attr_name = entry.data[CONF_NAME]
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}"
        self._source_state = None
        self._extra_attrs: dict = {}
        self._hourly_forecast: list[dict] = []
        self._previous_hourly_forecast: list[dict] = []
        self._attr_supported_features = (
            WeatherEntityFeature.FORECAST_DAILY
            | WeatherEntityFeature.FORECAST_HOURLY
            | WeatherEntityFeature.FORECAST_TWICE_DAILY
        )

    async def async_added_to_hass(self) -> None:
        """Subscribe to source entity changes."""
        self._refresh_from_source()
        self.async_on_remove(
            async_track_state_change_event(
                self.hass,
                [self._source_entity_id],
                self._async_source_changed,
            )
        )

    @callback
    def _async_source_changed(self, event: Event) -> None:
        self._source_state = event.data.get("new_state")
        self._refresh_from_source()
        self.async_write_ha_state()

    def _refresh_from_source(self) -> None:
        self._source_state = self._source_state or self.hass.states.get(self._source_entity_id)
        if self._source_state is None:
            _LOGGER.debug("Source weather entity %s is not available yet", self._source_entity_id)
            return

        attrs = dict(self._source_state.attributes)
        raw_hourly = deepcopy(attrs.get(ATTR_HOURLY_FORECAST) or [])
        self._hourly_forecast = self._with_current_hour(raw_hourly)
        attrs[ATTR_HOURLY_FORECAST] = self._hourly_forecast
        attrs["source_entity"] = self._source_entity_id
        attrs[ATTR_ATTRIBUTION] = attrs.get(ATTR_ATTRIBUTION, "数据来源和风天气")
        self._extra_attrs = attrs
        self._previous_hourly_forecast = deepcopy(self._hourly_forecast)

    @property
    def should_poll(self) -> bool:
        return False

    async def async_update(self) -> None:
        self._refresh_from_source()

    @property
    def condition(self):
        return self._source_state.state if self._source_state else None

    @property
    def native_temperature(self):
        return self._attr("temperature")

    @property
    def humidity(self):
        return self._attr("humidity")

    @property
    def native_pressure(self):
        return self._attr("pressure")

    @property
    def native_wind_speed(self):
        return self._attr("wind_speed")

    @property
    def wind_bearing(self):
        return self._attr("wind_bearing")

    @property
    def extra_state_attributes(self):
        return self._extra_attrs

    def _attr(self, key: str, default=None):
        if not self._source_state:
            return default
        return self._source_state.attributes.get(key, default)

    async def async_forecast_daily(self) -> list[Forecast] | None:
        return self._extra_attrs.get("daily_forecast")

    async def async_forecast_hourly(self) -> list[Forecast] | None:
        return self._hourly_forecast

    async def async_forecast_twice_daily(self) -> list[Forecast] | None:
        return self._extra_attrs.get("twice_daily_forecast")

    def _with_current_hour(self, hourly: list[dict]) -> list[dict]:
        current_key = dt_util.now().strftime("%Y-%m-%d %H")
        if any(self._forecast_hour_key(item.get(ATTR_FORECAST_TIME)) == current_key for item in hourly):
            return hourly

        preserved = next(
            (
                item
                for item in self._previous_hourly_forecast
                if self._forecast_hour_key(item.get(ATTR_FORECAST_TIME)) == current_key
            ),
            None,
        )
        snapshot = preserved or self._build_current_hour_snapshot()
        if snapshot is None:
            return hourly
        return [snapshot, *hourly]

    def _build_current_hour_snapshot(self) -> dict | None:
        temp = self.native_temperature
        if temp is None:
            return None

        return {
            ATTR_FORECAST_TIME: dt_util.now().strftime("%Y-%m-%d %H:00"),
            ATTR_FORECAST_NATIVE_TEMP: temp,
            ATTR_FORECAST_CONDITION: self.condition,
            ATTR_FORECAST_NATIVE_PRECIPITATION: 0.0,
            ATTR_FORECAST_NATIVE_WIND_SPEED: self.native_wind_speed or 0,
            ATTR_FORECAST_WIND_BEARING: self.wind_bearing or 0,
            ATTR_FORECAST_PRECIPITATION_PROBABILITY: 0,
            ATTR_FORECAST_NATIVE_PRESSURE: self.native_pressure or 0,
            "text": self._attr("condition_cn", ""),
            "humidity": self.humidity or 0,
            "cloud_coverage": self._attr("cloud_coverage"),
            "windscaleday": str(self._attr("windscale", "0") or "0"),
        }

    @staticmethod
    def _forecast_hour_key(value) -> str | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return dt_util.as_local(value).strftime("%Y-%m-%d %H")
        text = str(value)
        for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S"):
            try:
                parsed = datetime.strptime(text.replace("Z", "+0000"), fmt)
                if parsed.tzinfo is not None:
                    parsed = dt_util.as_local(parsed)
                return parsed.strftime("%Y-%m-%d %H")
            except ValueError:
                continue
        try:
            parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
            return dt_util.as_local(parsed).strftime("%Y-%m-%d %H")
        except ValueError:
            return None
