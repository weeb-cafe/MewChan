FROM node:12-alpine
WORKDIR /opt/appbuild
COPY . .
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps curl \
&& curl -L https://unpkg.com/@pnpm/self-installer | node \
&& pnpm install \
&& apk del .build-deps
RUN pnpm run build
RUN rm -rf packages/**/src packages/**/lib

FROM node:12-alpine
LABEL name "Reika Bot"
LABEL version "0.1.0"
LABEL maintainer "didinele <didinele.dev@gmail.com>"
ENV DISCORD_TOKEN= \
	COMMAND_PREFIX= \
	OWNER= \
	DB_URL= \
	NODE_ENV= \
  LOGGER_HOST= \
  LOGGER_ID= \
  LOGGER_TOKEN=
WORKDIR /usr/reika
COPY --from=0 /opt/appbuild/package.json /opt/appbuild/pnpm-lock.yaml /opt/appbuild/pnpm-workspace.yaml ./
COPY --from=0 /opt/appbuild/packages/bot ./packages/bot
COPY --from=0 /opt/appbuild/packages/common ./packages/common
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps curl \
&& curl -L https://unpkg.com/@pnpm/self-installer | node \
&& pnpm install --prod \
&& apk del .build-deps
CMD ["node", "packages/bot/bin/index.js"]
