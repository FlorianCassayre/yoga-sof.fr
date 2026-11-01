FROM node:26-slim

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

WORKDIR /app

COPY --chown=node:node --chmod=755 scripts/entrypoint.sh /entrypoint.sh

COPY --chown=node:node build/seed /seed

COPY --chown=node:node apps/public/.next/standalone ./public
COPY --chown=node:node apps/public/.next/static ./public/apps/public/.next/static
COPY --chown=node:node apps/public/public ./public/apps/public/public

COPY --chown=node:node apps/admin/.next/standalone ./admin
COPY --chown=node:node apps/admin/.next/static ./admin/apps/admin/.next/static
COPY --chown=node:node apps/admin/public ./admin/apps/admin/public

USER node

ENTRYPOINT ["/entrypoint.sh"]
CMD ["public"]
