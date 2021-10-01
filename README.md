# README

### About

This repository is my submit for exercises on [Full Stack Open 2021](https://fullstackopen.com/). All my submits for the course can be found [here](https://github.com/kosvi/HY_FullStack). (this repository is for the part4/osa4)

## Howto

To run this app, you have to create file `.env` to project root with following content: 

```
MONGODB_URI=<mongo-url>
MONGODB_URI_TEST=<mongo-url-for-tests>
PORT=<port-number>
SECRET=<secret-for-tokens>
```
App can then be run in development mode with command: `npm run dev`

You can also find tools under `tools` directory. Here is short description of all the available tools:

**addBlog.js**

First run `ln -s ../.env` to make `.env` available for this script. After that you can use this script to add blogs to database with command `node addBlog.js`
