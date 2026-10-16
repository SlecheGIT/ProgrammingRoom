FROM node:24.14-slim

WORKDIR /app

COPY package*.json ./

# Evitar falha caso o package.json não exista no momento do primeiro build
RUN if [ -f "package.json" ]; then npm install; fi

# Copiar os arquivos
COPY . .

EXPOSE 5173

# O comando no docker-compose é npm run dev
CMD ["npm", "run", "dev"]