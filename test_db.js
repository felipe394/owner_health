const { db } = require('./backend/src/config/database');
(async () => {
  try {
    const prof = await db('profissionais').select('*').limit(5);
    console.log('Profissionais:', prof);
    
    // Also check what id is activeProfileId! I can't check that from DB, but I can check the user.
    const user = await db('usuarios').where({ email: 'multi@ownerhealth.com.br' }).first();
    console.log('Usuario multi:', user);
    
    if (user) {
      const profUser = await db('profissionais').where({ usuario_id: user.id }).first();
      console.log('Prof by usuario_id:', profUser);
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
})();
