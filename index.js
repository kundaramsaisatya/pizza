require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3300;
const path = require('path');
const session = require('express-session');
const uuid = require('uuid'); 
const flash = require('connect-flash');
const MongoDbStore = require('connect-mongo');
const mongoose = require('mongoose');
const passport = require('passport');
const Emitter = require("events");
const bodyParser = require('body-parser');
const cors = require('cors');
// DB connection
const url = process.env.MONGO_URI || 'mongodb://localhost:27017/pizza';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database Connected Successfully"))
    .catch(err => console.log('DB Connection Error:', err));

const connection = mongoose.connection;

// Session Store
const mongoStore = MongoDbStore.create({
    client: connection.getClient(),
    collectionName: 'sessions'
});

// Event Emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

// Session Config
app.use(session({
    genid: (req) => {
        return uuid.v4(); // Generate a new UUID for each session
    },
    secret: process.env.SESSION_SECRET || 'superman',
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

// CORS
app.use(cors());

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Assets
app.use(express.static('public'));

// Set template engine
app.set('views', path.resolve('./resources/views'));
app.set('view engine', 'ejs');

// Routes
require('./routes/web')(app);

// Server
const server = app.listen(PORT, () => console.log(`Server started on: ${PORT}`));

// socket.io
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    // Join room based on orderId
    socket.on('join', (orderId) => {
        socket.join(orderId);
    });
});

// Customer events
eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data);
});

// Admin events
eventEmitter.on('orderPlaced', (placedOrder) => {
    io.to('adminRoom').emit('orderPlaced', placedOrder);
});