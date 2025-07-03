const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  calculations: [
    {
      date: { type: Date, default: Date.now },
      inputs: {
        voltage: Number,
        current: Number,
        th: Number,
        tc: Number,
        seebeck: Number,
        thermalConductivity: Number,
        electricalConductivity: Number,
      },
      outputs: {
        deltaT: Number,
        Qc: Number,
        COP: Number,
        power: Number,
        ZT: Number,
      },
      chartData: { type: Object }
    }
  ],
  tlmCalculations: [
    {
      date: { type: Date, default: Date.now },
      inputs: { type: Array },
      outputs: { type: Array },
      chartData: { type: Object }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
