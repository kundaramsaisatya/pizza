const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport')


function authController() {
    const _getRedirectUrl = (req)=>{
        return req.user.role === 'admin' ? '/admin/orders' : '/customers/orders'
    }
    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req,res,next){
            //(strategy,function)
            passport.authenticate('local',(err,user,info)=>{

                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }

                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                    }
                    req.flash('success','Successfully Logged In')
                    return res.redirect(_getRedirectUrl(req))
                })

            })(req,res,next)
        },

        register(req, res) {
            res.render('auth/register');
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body;

            // Validate request
            if (!name || !email || !password) {
                req.flash('error', "All fields are required");
                return res.redirect('/register');
            }

            try {
                console.log("Checking if user exists...");

                // Check if user exists
                const userExists = await User.exists({ email: email });
                if (userExists) {
                    req.flash('error', 'Email already exists');
                    return res.redirect('/register');
                }

                console.log("Hashing password...");

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                console.log("Creating new user...");

                // Create new user
                const user = new User({
                    name,
                    email,
                    password: hashedPassword
                });

                await user.save();
                // console.log("User created successfully, redirecting to home...");
                // res.redirect('/');
                // Automatically log in the user
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', 'Something went wrong during login after registration. Please try to log in manually.');
                        return res.redirect('/login');
                    }
                    req.flash('success', 'Registration successful and you are logged in!');
                    return res.redirect('/')
                });
            } catch (err) {
                console.error("Error during registration:", err);
                req.flash('error', 'Something went wrong during registration. Please try again.');
                res.redirect('/register');
            }
        },

        logout(req, res, next) {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
                req.flash('success', 'Successfully Logged out');
                res.redirect('/');

            });
        }
    };
}

module.exports = authController;
