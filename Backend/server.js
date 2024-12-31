const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const http = require('http');
const app = require('./app');
app.use(cors());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})