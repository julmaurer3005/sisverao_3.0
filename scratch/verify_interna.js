const { db } = require('../server/src/db/connection');

db.prepare("UPDATE balnearios SET cidade = 'GENERAL CÂMARA' WHERE id = 102").run();

// The 59 columns and their respective municipality in exact alphabetical order:
const internaCols = [
  { col: 61, nome: 'CARAMURU', cidade: 'ARAMBARÉ', bbm: '6º BBM' },
  { col: 62, nome: 'CENTRAL (CALÇADÃO)', cidade: 'ARAMBARÉ', bbm: '6º BBM' },
  { col: 63, nome: 'COSTA DOCE', cidade: 'ARAMBARÉ', bbm: '6º BBM' },
  { col: 64, nome: 'PLATAFORMA', cidade: 'ARAMBARÉ', bbm: '6º BBM' },
  { col: 65, nome: 'TERMINAL TURÍSTICO', cidade: 'ARAMBARÉ', bbm: '6º BBM' },
  { col: 66, nome: 'LAGOA CERQUINHA', cidade: 'BALNEÁRIO PINHAL', bbm: '9º BBM' },
  { col: 67, nome: 'LAGOA RONDINHA', cidade: 'BALNEÁRIO PINHAL', bbm: '9º BBM' },
  { col: 68, nome: 'CAMPING MUNICIPAL', cidade: 'BARRA DO RIBEIRO', bbm: '6º BBM' },
  { col: 69, nome: 'PRAIA DA PICADA', cidade: 'BARRA DO RIBEIRO', bbm: '6º BBM' },
  { col: 70, nome: 'PAREDAO', cidade: 'CAÇAPAVA DO SUL', bbm: '4º BBM' },
  { col: 71, nome: 'SÃO SIMÃO', cidade: 'CACEQUI', bbm: '10º BBM' },
  { col: 72, nome: 'PRAIA NOVA', cidade: 'CACHOEIRA DO SUL', bbm: '4º BBM' },
  { col: 73, nome: 'PRAIA DA USINA', cidade: 'CANDIOTA', bbm: '10º BBM' },
  { col: 74, nome: 'PRAINHA DA LAGOA', cidade: 'CAPÃO DA CANOA', bbm: '9º BBM' },
  { col: 75, nome: 'LAGOA FORTALEZA', cidade: 'CIDREIRA', bbm: '9º BBM' },
  { col: 76, nome: 'CRISTAL', cidade: 'CRISTAL', bbm: '6º BBM' },
  { col: 77, nome: 'MAIA FILHO', cidade: 'SALTO DO JACUÍ', bbm: '12º BBM' },
  { col: 78, nome: 'RIO SANTA MARIA', cidade: 'DOM PEDRITO', bbm: '10º BBM' },
  { col: 79, nome: 'CACHOEIRINHA', cidade: 'GENERAL CÂMARA', bbm: '6º BBM' },
  { col: 80, nome: 'SANTO AMARO', cidade: 'GENERAL CÂMARA', bbm: '6º BBM' },
  { col: 81, nome: 'FERNANDO SCHILING', cidade: 'JAGUARI', bbm: '13º BBM' },
  { col: 82, nome: 'PAREDÃO', cidade: 'LAVRAS DO SUL', bbm: '4º BBM' },
  { col: 83, nome: 'RAINHA DO SOL', cidade: 'MANOEL VIANA', bbm: '13º BBM' },
  { col: 84, nome: 'WALDIR BATAGLIN', cidade: 'MATA', bbm: '4º BBM' },
  { col: 85, nome: 'BACUPARI', cidade: 'MOSTARDAS', bbm: '9º BBM' },
  { col: 86, nome: 'PRAIA ATÍLIO ALÉSSIO', cidade: 'NOVA PALMA', bbm: '4º BBM' },
  { col: 87, nome: 'PRAIA NOVA ? 3', cidade: 'NOVA PALMA', bbm: '4º BBM' },
  { col: 88, nome: 'LAGOA BARROS', cidade: 'OSÓRIO', bbm: '9º BBM' },
  { col: 89, nome: 'LAGOA PEIXOTO', cidade: 'OSÓRIO', bbm: '9º BBM' },
  { col: 90, nome: 'LARANJAL', cidade: 'PELOTAS', bbm: '3º BBM' },
  { col: 91, nome: 'BELÉM NOVO', cidade: 'PORTO ALEGRE', bbm: '1º BBM' },
  { col: 92, nome: 'LAMI', cidade: 'PORTO ALEGRE', bbm: '1º BBM' },
  { col: 93, nome: 'PASSO DAS TUNAS', cidade: 'RESTINGA SÊCA', bbm: '4º BBM' },
  { col: 94, nome: 'PRAIA DA CAPILHA', cidade: 'RIO GRANDE', bbm: '3º BBM' },
  { col: 95, nome: 'INGAZEIROS (RIO JACUÍ)', cidade: 'RIO PARDO', bbm: '6º BBM' },
  { col: 96, nome: 'PORTO FERREIRA', cidade: 'RIO PARDO', bbm: '6º BBM' },
  { col: 97, nome: 'SANTA VITÓRIA (RIO JACUÍ)', cidade: 'RIO PARDO', bbm: '6º BBM' },
  { col: 98, nome: 'CAMPING PÚBLICO', cidade: 'ROQUE GONZALES', bbm: '11º BBM' },
  { col: 99, nome: 'AREIAS BRANCAS', cidade: 'ROSÁRIO DO SUL', bbm: '10º BBM' },
  { col: 100, nome: 'PASSO DO VERDE', cidade: 'SANTA MARIA', bbm: '4º BBM' },
  { col: 101, nome: 'LAGO BATUVA', cidade: 'SANTANA DO LIVRAMENTO', bbm: '10º BBM' },
  { col: 102, nome: 'LAGOA DOS BARROS', cidade: 'SANTO ANTÔNIO DA PATRULHA', bbm: '9º BBM' },
  { col: 103, nome: 'JACAQUÁ', cidade: 'SÃO FRANCISCO DE ASSIS', bbm: '13º BBM' },
  { col: 104, nome: 'PRAIA DO ENCONTRO', cidade: 'SÃO JERÔNIMO', bbm: '6º BBM' },
  { col: 105, nome: 'SÃO LOURENÇO DO SUL', cidade: 'SÃO LOURENÇO DO SUL', bbm: '3º BBM' },
  { col: 106, nome: 'PASSO DO JULIÃO2', cidade: 'SÃO PEDRO DO SUL', bbm: '4º BBM' },
  { col: 107, nome: 'PASSO DO VERDE', cidade: 'SÃO SEPÉ', bbm: '4º BBM' },
  { col: 108, nome: 'PASSO DO ÚMBU', cidade: 'SÃO VICENTE DO SUL', bbm: '4º BBM' },
  { col: 109, nome: 'CAMPING CARREIRO', cidade: 'SERAFINA CORRÊA', bbm: '7º BBM' },
  { col: 110, nome: 'CENTRAL (CAMPING)', cidade: 'TAPES', bbm: '6º BBM' },
  { col: 111, nome: 'JACAREZINHO', cidade: 'TAPES', bbm: '6º BBM' },
  { col: 112, nome: 'PINWEST', cidade: 'TAPES', bbm: '6º BBM' },
  { col: 113, nome: 'REBELLO', cidade: 'TAPES', bbm: '6º BBM' },
  { col: 114, nome: 'PASSO DO ANGICO', cidade: 'TOROPI', bbm: '4º BBM' },
  { col: 115, nome: 'MONTE ALEGRE', cidade: 'VALE VERDE', bbm: '6º BBM' },
  { col: 116, nome: 'ITAPUÃ', cidade: 'VIAMÃO', bbm: '8º BBM' },
  { col: 117, nome: 'PRAIA DA PEDREIRA', cidade: 'VIAMÃO', bbm: '8º BBM' },
  { col: 118, nome: 'PRAIA DAS POMBAS', cidade: 'VIAMÃO', bbm: '8º BBM' },
  { col: 119, nome: 'PRAIA DE FORA', cidade: 'VIAMÃO', bbm: '8º BBM' }
];

function norm(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

const allBalns = db.prepare('SELECT id, nome, cidade, bbm, litoral FROM balnearios').all();

console.log('Resolving IDs for all 59 columns:');
internaCols.forEach(item => {
  let b = allBalns.find(x => norm(x.nome) === norm(item.nome) && norm(x.cidade) === norm(item.cidade));
  if (!b && norm(item.nome).includes('PRAINHA DA LAGOA')) {
    b = allBalns.find(x => x.id === 108); // Parque Naútico
  }
  if (!b) {
    console.log(`Need insert: ${item.cidade} - ${item.nome} (${item.bbm})`);
  } else {
    item.balneario_id = b.id;
    console.log(`Col ${item.col} (${item.cidade} - ${item.nome}) -> ID ${b.id}`);
  }
});
