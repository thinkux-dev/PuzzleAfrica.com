const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const validator = require('validator');
const fs = require('fs')

const cors = require('cors')

dotenv.config();
const PORT = process.env.PORT;

const app = express();

const corsConfig = {
  origin: "*",
  Credential: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
};
app.options("", cors(corsConfig))
app.use(cors(corsConfig))

// View engine setup
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts/'),
  extname: 'handlebars',
  helpers: {
    uppercase: (str) => str.toUpperCase(),
  },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));
// Serve the app.js file
app.use('/app.js', express.static(path.join(__dirname, 'app.js')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.render('contact');
});

app.post('/subscribe', (req, res) => {
  const { senderEmail, message } = req.body;

  // Validate email address
  if (!validator.isEmail(senderEmail)) {
    return res.status(400).send('Invalid email address');
  }

  const output = `
    <p>You have a new Subscribe request</p>
    <h3>Contact Email</h3>
    <ul>
      <li>Email: ${senderEmail}</li>
    </ul>
  `;
  // const senderEmail = req.body.email;

  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    // Specify your email service details (SMTP, etc.)
    host: 'smtp.gmail.com',
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Use either port 465 (SSL) or 587 (TLS)
    port: 465,
    secure: true, // Use false if you are using port 587 (TLS)
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Define the email options
  let mailOptions = {
    // from: '"Bob-Daawid" <bobdaawid@gmail.com>'
    from: `"Puzzle Product Subscription" <${senderEmail}>`,
    to: 'puzzleafrica@gmail.com',
    subject: 'Subscription Confirmation',
    html: output,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending email');
    }
    console.log('Email sent:', info.response);
   
    // You can respond to the client indicating success or failure
    res.render('contact', {msg:'Subscription successful!'});
  });
});

// Handle click event on YouTube image
// website.get('/video', (req, res) => {
//   const range = req.headers.range;

//   if(!range) {
//     res.status(400).send("Requires Range header");
//   }

//   const videoPath = 'public/successfulcompany.mp4';
//   const videoSize = fs.statSync('public/successfulcompany.mp4').size;

//   // Parse Range
//   // Example: 'bytes=32324-'
//   const CHUNCK_SIZE = 100 ** 6; // 10MB
//   const start = Number(range.replace(/\D/g, ""));;
//   const end = Math.min(start + CHUNCK_SIZE, videoSize - 1);

//   const contentLength = end - start + 1;
//   const headers = {
//     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//     "Accept-Ranges": "bytes",
//     "Content-Length": contentLength,
//     "Content-Type": "video/mp4",
//   };

//   res.writeHead(206, headers);

//   const videoStream = fs.createReadStream(videoPath, { start, end });

//   videoStream.pipe(res);
// });

app.listen(PORT, () => console.log('Server started...'));