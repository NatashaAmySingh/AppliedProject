const express = require('express');
const app = express();
require('dotenv').config();
const PORT = 3000;
const cors = require('cors');
app.use(cors({
  origin: "http://127.0.0.1:8080",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/requests', require('./routes/requests'));
app.use('/documents', require('./routes/documents'));
app.use('/notifications', require('./routes/notifications'));
app.use('/audit', require('./routes/audit'));
app.use('/meta', require('./routes/meta'));


app.get('/', (req, res) => {
  console.log(req)

  res.json("Backend Is Operational")
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
