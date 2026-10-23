const { db } = require('../server/src/db/connection');

console.log('--- Verificando chaves estrangeiras e tabelas ---');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
  if (t.sql && t.sql.includes('balneario')) {
    console.log(`Tabela com balneario: ${t.name}`);
  }
});

const mapMerge = [
  { oldId: 11, newId: 83, nome: 'SÃO LOURENÇO DO SUL' },
  { oldId: 16, newId: 111, nome: 'BACUPARI' },
  { oldId: 26, newId: 82, nome: 'LARANJAL' },
  { oldId: 29, newId: 84, nome: 'PRAIA DA CAPILHA' },
  { oldId: 30, newId: 103, nome: 'PRAIA DO ENCONTRO' },
  { oldId: 31, newId: 86, nome: 'PASSO DAS TUNAS' }
];

db.exec('BEGIN TRANSACTION;');
try {

  for (const m of mapMerge) {
    console.log(`\nMesclando ${m.nome}: ${m.oldId} -> ${m.newId}`);
    
    // 1. Guaritas
    const gUpdate = db.prepare('UPDATE OR IGNORE guaritas SET balneario_id = ? WHERE balneario_id = ?').run(m.newId, m.oldId);
    console.log(`  Guaritas atualizadas: ${gUpdate.changes}`);
    db.prepare('DELETE FROM guaritas WHERE balneario_id = ?').run(m.oldId);

    // 2. Salvamentos
    const sUpdate = db.prepare('UPDATE salvamentos SET balneario_id = ? WHERE balneario_id = ?').run(m.newId, m.oldId);
    console.log(`  Salvamentos atualizados: ${sUpdate.changes}`);

    // 3. Indicadores diários
    const iUpdate = db.prepare('UPDATE OR IGNORE indicadores_diarios SET balneario_id = ? WHERE balneario_id = ?').run(m.newId, m.oldId);
    console.log(`  Indicadores atualizados: ${iUpdate.changes}`);
    db.prepare('DELETE FROM indicadores_diarios WHERE balneario_id = ?').run(m.oldId);

    // 4. Deletar balneario duplicado
    const bDelete = db.prepare('DELETE FROM balnearios WHERE id = ?').run(m.oldId);
    console.log(`  Balneário duplicado excluído: ${bDelete.changes}`);
  }
  db.exec('COMMIT;');
  console.log('\n✅ Mesclagem concluída com sucesso!');
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('\n❌ Erro durante mesclagem, rollback realizado:', err);
}

