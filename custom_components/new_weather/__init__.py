"""Independent weather card resources and bridge entity."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

try:
    from homeassistant.components.http.static import StaticPathConfig
except ImportError:
    from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN, PLATFORMS

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
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a New Weather config entry."""
    result = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return result
