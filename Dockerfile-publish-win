FROM electronuserland/builder:wine

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
CMD ["run", "publish-native-win"]
