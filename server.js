//create variable
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser');
const cors = require("cors")
//config dotenv
dotenv.config({path:'./config/config.env'});

//connect MONGOOSE
connectDB();

//Route files
const dentists = require('./routes/dentists');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

const corsOptions = {
    origin: '*', // อนุญาตให้ทุกโดเมนเข้าถึง
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // อนุญาตให้ใช้งานเฉพาะ method นี้
    allowedHeaders: ['Content-Type', 'Authorization'], // อนุญาตให้ใช้งานเฉพาะ headers นี้
    credentials: true, // อนุญาตให้เซิร์ฟเวอร์ส่ง cookies และ HTTP authentication กลับไป
    preflightContinue: false // ไม่อนุญาตให้เซิร์ฟเวอร์ส่งคำขอ preflight ไปยังหน้าเพจอื่น
  };

//Body parser
const app = express(); 
app.use(express.json());
app.use(cors(corsOptions))
//Cookie parser
app.use(cookieParser());

//Mount routers
app.use('/api/v1/dentists', dentists);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log('Server running in ',process.env.PORT,' mode on port ',PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});