import type { Core } from "@strapi/strapi";

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: "rickroll",
    plugin: "strapi-plugin-rickroll",
    type: "string",
  });
};

export default register;
