import * as Joi from 'joi';

export const configValidationScheme = Joi.object({
  STAGE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  STRIPE_API_KEY: Joi.string().required(),
  STRIPE_API_VERSION: Joi.string().required(),
  STRIPE_PRICE_ID_LIMITED: Joi.string().required(),
  STRIPE_PRICE_ID_UNLIMITED: Joi.string().required(),
  STRIPE_PRICE_ID_TUTOR: Joi.string().required(),
  PRICE_OF_LIMITED: Joi.string().required(),
  PRICE_OF_UNLIMITED: Joi.string().required(),
  PRICE_OF_TUTOR: Joi.string().required(),
  LINE_MESSAGING_API_ACCESS_TOKEN: Joi.string().required(),
  LINE_MESSAGING_API_CHANNEL_SECRET: Joi.string().required(),
  LINE_LOGIN_CHANNEL_SECRET: Joi.string().required(),
});
