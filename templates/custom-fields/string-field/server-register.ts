import type { Core } from "@strapi/strapi";

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: "{{FIELD_NAME}}",
    plugin: "{{PKG_NAME}}",
    type: "string",
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
};

export default register;
