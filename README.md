README File for TabMe - A Guitar Tablature Creator

Please download the necessary requirements onto your system, and follow the step-by-step instructions to running the local server
and accessing the website.

Requirements to run application:
  - Node.js: https://nodejs.org/en/download/
  - Git Bash: https://gitforwindows.org/
  - MongoDB Server: https://www.mongodb.com/download-center/community
  
Instructions:
1. Donwload Node.js
2. Download Git Bash
3. Enter Git Bash and run the command 'git clone https://github.com/hashimh/TabMe-UP815459.git'
4. Sign Into Git
5. When the repository has been cloned, run the command 'cd TabMe-UP815459'
6. Run the command 'git checkout mongodb' to access the correct branch
7. Run the command 'cd server'
8. Run the command 'node server', this should result in the following Git Bash outputs:
           "App listening on port 8080"
           "Connected to database"
9. Finally, to access the website go onto a web browser and type in the following URL: 'localhost:8080'.

If any errors occur with the database connection, please check if 'MongoDB Sever' is an running service under Windows Services, as
this is required for the application to function correctly.
MongoDB's 'Compass' software will allow the database to be viewed.
