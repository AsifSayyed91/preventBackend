const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stateRoutes = require('./routes/stateRoutes');
const districtRoutes = require('./routes/districtRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const patientRoutes = require('./routes/patientRoutes');
const healthReportRoutes = require("./routes/healthReportRoutes");


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/states', stateRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/users', userRoutes);
app.use('/location', locationRoutes);
app.use('/patient', patientRoutes);
app.use("/api/reports", healthReportRoutes);


const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
