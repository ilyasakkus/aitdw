import * as admin from 'firebase-admin';

admin.auth().setCustomUserClaims(uid, { admin: true }); 