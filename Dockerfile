FROM ubuntu:18.04

# Update packages & install native dependencies
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y curl gnupg build-essential
RUN dpkg --add-architecture i386
RUN apt-get update
RUN apt-get install -y wine32

# Install node js
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --no-audit

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "run", "build-native-all" ]
