FROM alpine:latest
RUN apk add --no-cache nodejs npm

WORKDIR /pairProgramme

COPY . /pairProgramme

RUN npm install

EXPOSE 80

ENTRYPOINT ["npm"] 

CMD ["start"]