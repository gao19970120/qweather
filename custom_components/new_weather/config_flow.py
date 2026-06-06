"""Config flow for New Weather."""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_NAME

from .const import CONF_SOURCE_ENTITY, DEFAULT_NAME, DEFAULT_SOURCE_ENTITY, DOMAIN


class NewWeatherConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for New Weather."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Create a bridge weather entity from a source weather entity."""
        if user_input is not None:
            await self.async_set_unique_id(user_input[CONF_SOURCE_ENTITY])
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=user_input[CONF_NAME],
                data=user_input,
            )

        schema = vol.Schema({
            vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
            vol.Required(CONF_SOURCE_ENTITY, default=DEFAULT_SOURCE_ENTITY): str,
        })
        return self.async_show_form(step_id="user", data_schema=schema)
