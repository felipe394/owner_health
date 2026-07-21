const { getContext } = require('./backend/src/middleware/context');
const dbHelper = require('./backend/src/utils/dbHelper');

(async () => {
  const reqs = await dbHelper.query('patient_anamnesis_requests', 'select', {});
  console.log("REQUESTS: ", reqs);

  const secs = await dbHelper.query('patient_anamnesis_sections', 'select', {});
  console.log("SECTIONS: ", secs);
})();
