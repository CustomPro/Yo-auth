FROM ubuntu:18.04

# Install app dependencies
RUN apt-get update && apt-get install -y curl wget gnupg
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs build-essential

# Create app directory
RUN mkdir -p /home/projects/yoxxy-authorisation

# Set work directory
WORKDIR /home/projects/yoxxy-authorisation

# Bundle app source
COPY . /home/projects/yoxxy-authorisation

RUN npm install;

EXPOSE 3000:3000

CMD ["node", "app.js"]
