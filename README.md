# Amelie
 Amelie Suite is a set of software co-designed for people suffering from Rett's syndrome characterized by an innovative way of interaction between care-giver and care-receiver, both equipped with an instrument on their own device, and through the use of an eyetracker (which allows you to track the look of the subject and to determine which point on the screen is watching).


Amelie is an open source software and accessible to everyone, co-designed by designers, developers, university researchers, families and therapists. Amelie promotes communication and cognitive enhancement for learning and improving interaction and understanding skills.
The system integrates different technologies (mobile applications, cloud services and adaptive algorithms) to provide an innovative, comprehensive and easy-to-use service.


The software was born from an idea of Associazione Italiana Rett - AIRETT Onlus and Opendot S.r.l., and was designed and developed by Opendot S.r.l., with the essential contribution of Associazione Italiana Rett - AIRETT Onlus.

This repository hosts the frontend for the desktop PC platform, providing the visual interface for the care-recevier.


# Amelie communicator
Frontend for the Amelie software suite

- shows pages and cards coming from the mobile App
- shows games
- shows the user's gaze position in real-time
- talks to the Rails server through API calls and the websocket on port 3001
- talks to the airett-driver through port 4000

 # Deployment
 The communicator frontend has been developed with Webpack, React.js, Redux and P5.js. In order to test or build the project, you need to install [node.js and npm package manager](https://nodejs.org)

 **common steps**
 - download the repo
 - open a shell or prompt in the project directory
 - run ```npm install``` to install the packages

 **test**
 - run ```npm start```
 - you can browse the project at http://localhost:3000

  **build**

 - run ```npm run build```
 - you can find the built project as a static website in the "dist" folder

