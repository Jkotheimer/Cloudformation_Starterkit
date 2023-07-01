FROM public.ecr.aws/lambda/nodejs:18-x86_64

COPY src/ package*.json ./

RUN npm install -g npm
RUN npm install

CMD [ "index.getInfo" ]

