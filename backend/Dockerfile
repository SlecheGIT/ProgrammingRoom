FROM node:24.14-slim

WORKDIR /app

# Instalar dependências globais úteis (opcional)
RUN npm install -g nodemon

COPY package*.json ./
RUN npm install

# Copiar o resto dos arquivos do backend
COPY . .

EXPOSE 3000

# O comando de start default será sobrescrito pelo docker-compose (npm run dev)
CMD ["npm", "start"]