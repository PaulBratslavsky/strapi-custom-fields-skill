import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { {{ICON_NAME}} } from "@strapi/icons";

export default {
  register(app: any) {
    app.customFields.register({
      name: "{{FIELD_NAME}}",
      pluginId: PLUGIN_ID,
      type: "text",
      intlLabel: {
        id: getTranslation("{{FIELD_NAME}}.label"),
        defaultMessage: "{{DISPLAY_NAME}}",
      },
      intlDescription: {
        id: getTranslation("{{FIELD_NAME}}.description"),
        defaultMessage: "{{DESCRIPTION}}",
      },
      icon: {{ICON_NAME}},
      components: {
        Input: async () =>
          import("./components/custom-field/{{COMPONENT_NAME}}").then((m) => ({
            default: m.{{COMPONENT_NAME}},
          })),
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          );
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
