FROM node:22-slim
WORKDIR /app
COPY package.json ./
COPY . .
ENV NODE_ENV=production PORT=10000 DB_FILE=/data/roofworth.sqlite TRUST_PROXY=1
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 10000
HEALTHCHECK CMD node -e "fetch('http://localhost:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
