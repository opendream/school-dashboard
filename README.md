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

MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
