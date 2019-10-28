# school-dashboard

##### Firebase setup
1. Setup firebase project. 
2. Setup firebase web config at config folders.
3. Authenticate menu 
   - Enable provider: Email/Password
   - Add user with Email/Password
   - Get User UID
4. Set up firebase collection
   - Change rule 
   ```
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. firebase init 
  
######  Admin USER setup
- Add collection 'Users' 
- Add User UID from (3) as document-id
- Add fields [name, role=admin] 

######  Staff USER setup
- Add collection 'Users' 
- Add User UID from (3) as document-id
- Add fields [name, role=teacher, organizationId] 

##### Project setup
```
$ npm install
$ npm run start
```


##### Deploy project 
```
$ npm run build
$ firebase deploy
```