# The package job tests this exact server configuration against the site artifact.
# A registry digest can be supplied through --build-arg NGINX_IMAGE=... for a fixed base.
ARG NGINX_IMAGE=nginx:stable-alpine
FROM ${NGINX_IMAGE}
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html
COPY site/ /usr/share/nginx/html/
USER 101:101
EXPOSE 8080
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
