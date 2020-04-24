var BNO055 = require('bno055');
var async = require('async');
var imu = new BNO055({device: "/dev/i2c-50"});
imu.beginNDOF(function() {
  console.info('imu running');
  setInterval(function() {
    async.series({
      euler: imu.getEuler.bind(imu),
      linearAcceleration: imu.getLinearAcceleration.bind(imu)
    },
    function(err, results) {
      var rot = results.euler;
      var accel = results.linearAcceleration;
      var data = {
        heading: Math.round(rot.heading),
        roll:    Math.round(rot.roll),
        pitch:   Math.round(rot.pitch),
        x:       Math.round(accel.x),
        y:       Math.round(accel.y),
        z:       Math.round(accel.z),
      };
      console.info( 'imu: ', JSON.stringify(data) );
    });
  }, 250);
});
