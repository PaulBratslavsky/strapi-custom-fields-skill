import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { Play } from "@strapi/icons";

export default {
  register(app: any) {
    app.customFields.register({
      name: "rickroll",
      pluginId: PLUGIN_ID,
      type: "string",
      intlLabel: {
        id: getTranslation("rickroll.label"),
        defaultMessage: "Rick Roll",
      },
      intlDescription: {
        id: getTranslation("rickroll.description"),
        defaultMessage: "Never gonna give you up",
      },
      icon: Play,
      components: {
        Input: async () =>
          import("./components/custom-field/RickRollField").then((m) => ({
            default: m.RickRollField,
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
