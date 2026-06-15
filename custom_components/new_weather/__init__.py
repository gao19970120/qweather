"""Independent weather card resources and bridge entity."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.const import CONF_NAME
from homeassistant.helpers import entity_registry as er

try:
    from homeassistant.components.http.static import StaticPathConfig
except ImportError:
    from homeassistant.components.http import StaticPathConfig

from .const import CONF_SOURCE_ENTITY, DEFAULT_NAME, DOMAIN, PLATFORMS

_LOGGER = logging.getLogger(__name__)


async def _async_setup_card_resource(hass: HomeAssistant) -> None:
    www_path = Path(__file__).parent / "www"
    await hass.http.async_register_static_paths([
        StaticPathConfig("/new_weather", str(www_path), False)
    ])
    add_extra_js_url(hass, "/new_weather/new-weather-card.js?v=1.0.0")


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the New Weather bridge from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    await _async_setup_card_resource(hass)
    await _async_ensure_bridge_entries(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a New Weather config entry."""
    result = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return result


async def _async_ensure_bridge_entries(hass: HomeAssistant) -> None:
    """Auto-create bridge entries for qweather weather entities that do not have one yet."""
    registry = er.async_get(hass)
    qweather_entities = sorted(
        {
            entry.entity_id
            for entry in registry.entities.values()
            if entry.platform == "qweather"
            and entry.entity_id
            and entry.entity_id.startswith("weather.")
            and entry.disabled_by is None
        }
    )
    existing_sources = {
        entry.data.get(CONF_SOURCE_ENTITY)
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.data.get(CONF_SOURCE_ENTITY)
    }

    for source_entity in qweather_entities:
        if source_entity in existing_sources:
            continue
        bridge_name = _build_bridge_name(source_entity)
        _LOGGER.info("Auto-creating new_weather bridge for %s", source_entity)
        await hass.config_entries.flow.async_init(
            DOMAIN,
            context={"source": "import"},
            data={
                CONF_NAME: bridge_name,
                CONF_SOURCE_ENTITY: source_entity,
            },
        )
        existing_sources.add(source_entity)


def _build_bridge_name(source_entity: str) -> str:
    suffix = (source_entity or "").split(".", 1)[-1]
    return f"new_weather_{suffix}" if suffix else DEFAULT_NAME
