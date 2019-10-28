# School-Dashboard

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
  
######  Admin USER Setup
- Add collection 'Users' 
- Add User UID from (3) as document-id
- Add fields [name, role=admin] 

######  Staff USER Setup
- Add collection 'Users' 
- Add User UID from (3) as document-id
- Add fields [name, role=teacher, organizationId] 

######  Firestore Index Setup
- Add indexes follow this file.
https://github.com/opendream/school-dashboard/blob/master/dbIndex.csv

##### Project Setup
```
$ npm install
$ npm run start
```

##### Deploy project 
```
$ npm run build
$ firebase deploy
```
