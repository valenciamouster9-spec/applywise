const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '200kb' }));
app.use(express.static('public'));
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log('ApplyWise running on http://localhost:' + PORT);
});