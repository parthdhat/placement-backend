const bcrypt = require('bcrypt');

bcrypt.hash('your_admin_password_here', 10, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Generated Hash:', hash);
});
