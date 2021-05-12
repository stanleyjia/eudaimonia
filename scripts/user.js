function checkUserExists(user) {
  db.ref(`users/${user.uid}`).once("value", snapshot => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      if (("extension" in val) && (val.extension == false)) {
        // user exists (created from extension)
        // console.log("[checkUserExists] user exists");
        userExists = true;
      } else {
        // console.log("[checkUserExists] user was created from dashboard");
        createUser(user);
      }

    } else {
      // console.log("[checkUserExists] user doesn't exist");
      createUser(user);
    }
  });
}
function createUser(user) {
  db.ref(`users/${user.uid}`).update({
    name: user.displayName,
    email: user.email,
    photoUrl: user.photoURL,
    emailVerified: user.emailVerified,
    uid: user.uid,
    extension: true
  });
  userExists = true;
  // console.log("[createUser] user created");
}