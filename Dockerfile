FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npx prisma migrate dev --name init  
# RUN npx prisma generate 

# RUN npm run build

EXPOSE 4200

# COPY entrypoint.sh /usr/src/app/entrypoint.sh
# RUN chmod +x /usr/src/app/entrypoint.sh

# ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# CMD ["npm", "run", "start:dev"]