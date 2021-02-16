function checkUserExists(user) {
  db.ref(`users/${user.uid}`).once("value", snapshot => {
    if (snapshot.exists()) {
      // console.log("[checkUserExists] user exists");
      userExists = true;
    } else {
      // console.log("[checkUserExists] user doesn't exist");
      createUser(user);
    }
  });
}
function createUser(user) {
  db.ref(`users/${user.uid}`).set({
    name: user.displayName,
    email: user.email,
    photoUrl: user.photoURL,
    emailVerified: user.emailVerified,
    uid: user.uid
  });
  userExists = true;
  // console.log("[createUser] user created");
}