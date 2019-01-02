FROM ubuntu:18.04

ARG PLATFORM="mac"

# Update packages & install native dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     curl gnupg build-essential ca-certificates \
  && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

 # Install node js
RUN apt-get update \
  && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
  && apt-get install -y --no-install-recommends \
      nodejs \
  && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create app directory
RUN mkdir -p /opt/blockdx-ui/dist-native
WORKDIR /opt/blockdx-ui/
VOLUME /opt/blockdx-ui/dist-native

# Install app dependencies
COPY package.json /opt/blockdx-ui/
RUN npm install --no-audit

# Bundle app source
COPY . /opt/blockdx-ui/

ARG GIT_BRANCH=""
RUN echo GIT_BRANCH=$GIT_BRANCH > /opt/blockdx-ui/electron-builder.env

ENTRYPOINT ["npm"]
CMD ["run", "build-gitlab-mac"]
