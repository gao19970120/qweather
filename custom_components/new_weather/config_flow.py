"""Config flow for New Weather."""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.helpers import entity_registry as er

from .const import CONF_SOURCE_ENTITY, DEFAULT_NAME, DEFAULT_SOURCE_ENTITY, DOMAIN


class NewWeatherConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for New Weather."""

    VERSION = 1

    async def async_step_import(self, import_data):
        """Create or update a bridge entry from auto-discovery."""
        await self.async_set_unique_id(import_data[CONF_SOURCE_ENTITY])
        self._abort_if_unique_id_configured()
        return self.async_create_entry(
            title=import_data[CONF_NAME],
            data=import_data,
        )

    async def async_step_user(self, user_input=None):
        """Create a bridge weather entity from a source weather entity."""
        if user_input is not None:
            await self.async_set_unique_id(user_input[CONF_SOURCE_ENTITY])
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=user_input[CONF_NAME],
                data=user_input,
            )

        entity_ids = _get_qweather_weather_entities(self.hass)
        default_source = DEFAULT_SOURCE_ENTITY if DEFAULT_SOURCE_ENTITY in entity_ids else (entity_ids[0] if entity_ids else DEFAULT_SOURCE_ENTITY)
        default_name = _build_bridge_name(default_source)
        schema = vol.Schema({
            vol.Required(CONF_NAME, default=default_name or DEFAULT_NAME): str,
            vol.Required(CONF_SOURCE_ENTITY, default=default_source): vol.In(entity_ids) if entity_ids else str,
        })
        return self.async_show_form(step_id="user", data_schema=schema)


def _get_qweather_weather_entities(hass) -> list[str]:
    registry = er.async_get(hass)
    entity_ids = [
        entry.entity_id
        for entry in registry.entities.values()
        if entry.platform == "qweather"
        and entry.entity_id
        and entry.entity_id.startswith("weather.")
        and entry.disabled_by is None
    ]
    return sorted(set(entity_ids))


def _build_bridge_name(source_entity: str) -> str:
    suffix = (source_entity or DEFAULT_SOURCE_ENTITY).split(".", 1)[-1]
    return f"new_weather_{suffix}" if suffix else DEFAULT_NAME
