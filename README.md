# WeOutline

[http://weoutline.com](http://weoutline.com)

WeOutline is a shared whiteboard, designed to work among distributed teams

# How to run it on your local machine

1. Install NodeJS, preferable version 6.x
2. Clone the repository, then install package dependencies using Yarn or NPM:
     ```bash
     $ npm i
     or
     $ yarn
     ```

3. Run the following command to build project on each code change:
     ```bash
     npm run watch
     ```

4. Run a static web server in the `dist` directory. For example:
     ```bash
     $ brew install mongoose
     $ mongoose -p 8080  -document_root dist
     ```

License: LGPL v3
