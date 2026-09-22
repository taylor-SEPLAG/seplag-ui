# Etapa 2: Configuração do Nginx
FROM nginx:alpine

WORKDIR /app

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos de build da SPA para o diretório padrão do Nginx
COPY dist-app /usr/share/nginx/html/seplagui

# Expor a porta que o Nginx vai rodar
EXPOSE 80

# Comando para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]

