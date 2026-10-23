const { db } = require('./connection');

function seedCatalogAndIndicadores() {
  console.log('🏛️ Atualizando catálogo completo de balneários dos 13 BBMs...');

  const insertBaln = db.prepare(`
    INSERT INTO balnearios (nome, cidade, ciagv, bbm, litoral, ordem_exibicao)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(nome, cidade, bbm) DO UPDATE SET
      litoral = excluded.litoral,
      ordem_exibicao = excluded.ordem_exibicao
  `);

  // 1. Catálogo Litoral Norte (12 Balneários)
  const norte = [
    'TORRES', 'ARROIO DO SAL', 'CAPÃO NOVO', 'CAPÃO DA CANOA', 'XANGRI-LÁ',
    'IMBÉ NORTE', 'IMBÉ SUL', 'TRAMANDAÍ', 'NOVA TRAMANDAÍ', 'CIDREIRA', 'BALNEÁRIO PINHAL', 'QUINTÃO'
  ];
  norte.forEach((nome, i) => {
    insertBaln.run(nome, nome, '3ª CIAGV', '9º BBM', 'Norte', i + 1);
  });

  // 2. Catálogo Litoral Sul (5 Balneários)
  const sul = [
    { nome: 'TAVARES', cid: 'TAVARES' },
    { nome: 'SÃO JOSÉ DO NORTE', cid: 'SÃO JOSÉ DO NORTE' },
    { nome: 'CASSINO', cid: 'RIO GRANDE' },
    { nome: 'HERMENEGILDO', cid: 'SANTA VITÓRIA DO PALMAR' },
    { nome: 'BARRA DO CHUÍ', cid: 'SANTA VITÓRIA DO PALMAR' }
  ];
  sul.forEach((item, i) => {
    insertBaln.run(item.nome, item.cid, '4ª CIAGV', '3º BBM', 'Sul', 50 + i);
  });

  // 3. Catálogo Oficial dos 13 BBMs de Águas Internas (37 balneários das Imagens 2 e 3)
  const aguasInternas = [
    // 1º BBM
    { bbm: '1º BBM', cidade: 'PORTO ALEGRE', nome: 'BELÉM NOVO', ordem: 101 },
    { bbm: '1º BBM', cidade: 'PORTO ALEGRE', nome: 'LAMI', ordem: 102 },

    // 3º BBM
    { bbm: '3º BBM', cidade: 'PELOTAS', nome: 'LARANJAL', ordem: 103 },
    { bbm: '3º BBM', cidade: 'SÃO LOURENÇO DO SUL', nome: 'SÃO LOURENÇO DO SUL', ordem: 104 },
    { bbm: '3º BBM', cidade: 'RIO GRANDE', nome: 'PRAIA DA CAPILHA', ordem: 105 },

    // 4º BBM
    { bbm: '4º BBM', cidade: 'NOVA PALMA', nome: 'PRAIA ATÍLIO ALÉSSIO', ordem: 106 },
    { bbm: '4º BBM', cidade: 'RESTINGA SECA', nome: 'PASSO DAS TUNAS', ordem: 107 },
    { bbm: '4º BBM', cidade: 'LAVRAS DO SUL', nome: 'PAREDÃO', ordem: 108 },
    { bbm: '4º BBM', cidade: 'SÃO PEDRO DO SUL', nome: 'PASSO DO JULIÃO2', ordem: 109 },
    { bbm: '4º BBM', cidade: 'TOROPI', nome: 'PASSO DO ANGICO', ordem: 110 },
    { bbm: '4º BBM', cidade: 'CACHOEIRA DO SUL', nome: 'PRAIA NOVA', ordem: 111 },

    // 6º BBM
    { bbm: '6º BBM', cidade: 'ARAMBARÉ', nome: 'PLATAFORMA', ordem: 112 },
    { bbm: '6º BBM', cidade: 'ARAMBARÉ', nome: 'CARAMURU', ordem: 113 },
    { bbm: '6º BBM', cidade: 'ARAMBARÉ', nome: 'CENTRAL (CALÇADÃO)', ordem: 114 },
    { bbm: '6º BBM', cidade: 'ARAMBARÉ', nome: 'TERMINAL TURÍSTICO', ordem: 115 },
    { bbm: '6º BBM', cidade: 'ARAMBARÉ', nome: 'COSTA DOCE', ordem: 116 },
    { bbm: '6º BBM', cidade: 'RIO PARDO', nome: 'INGAZEIROS (RIO JACUÍ)', ordem: 117 },
    { bbm: '6º BBM', cidade: 'RIO PARDO', nome: 'PORTO FERREIRA', ordem: 118 },
    { bbm: '6º BBM', cidade: 'RIO PARDO', nome: 'SANTA VITÓRIA (RIO JACUÍ)', ordem: 119 },
    { bbm: '6º BBM', cidade: 'VALE VERDE', nome: 'MONTE ALEGRE', ordem: 120 },
    { bbm: '6º BBM', cidade: 'BARRA DO RIBEIRO', nome: 'PRAIA DA PICADA', ordem: 121 },
    { bbm: '6º BBM', cidade: 'CRISTAL', nome: 'CRISTAL', ordem: 122 },
    { bbm: '6º BBM', cidade: 'GENERAL CÂMERA', nome: 'CACHOEIRINHA', ordem: 123 },
    { bbm: '6º BBM', cidade: 'SÃO JERONIMO', nome: 'PRAIA DO ENCONTRO', ordem: 124 },
    { bbm: '6º BBM', cidade: 'TAPES', nome: 'PINWEST', ordem: 125 },

    // 7º BBM
    { bbm: '7º BBM', cidade: 'SERAFINA CORRÊA', nome: 'CAMPING CARREIRO', ordem: 126 },

    // 8º BBM
    { bbm: '8º BBM', cidade: 'VIAMÃO', nome: 'ITAPUÃ', ordem: 127 },

    // 9º BBM
    { bbm: '9º BBM', cidade: 'BALNEÁRIO PINHAL', nome: 'LAGOA RONDINHA', ordem: 128 },
    { bbm: '9º BBM', cidade: 'CAPÃO DA CANOA', nome: 'PARQUE NAÚTICO', ordem: 129 },
    { bbm: '9º BBM', cidade: 'CIDREIRA', nome: 'LAGOA FORTALEZA', ordem: 130 },
    { bbm: '9º BBM', cidade: 'OSÓRIO', nome: 'LAGOA PEIXOTO', ordem: 131 },
    { bbm: '9º BBM', cidade: 'MOSTARDAS', nome: 'BACUPARI', ordem: 132 },
    { bbm: '9º BBM', cidade: 'SANTO ANTÔNIO DA PATRULHA', nome: 'LAGOA DOS BARROS', ordem: 133 },

    // 10º BBM
    { bbm: '10º BBM', cidade: 'ROSÁRIO DO SUL', nome: 'AREIAS BRANCAS', ordem: 134 },
    { bbm: '10º BBM', cidade: 'DOM PEDRITO', nome: 'RIO SANTA MARIA', ordem: 135 },
    { bbm: '10º BBM', cidade: 'CACEQUI', nome: 'SÃO SIMÃO', ordem: 136 },

    // 11º BBM
    { bbm: '11º BBM', cidade: 'ROQUE GONZALES', nome: 'CAMPING PÚBLICO', ordem: 137 },

    // 12º BBM
    { bbm: '12º BBM', cidade: 'SALTO DO JACUÍ', nome: 'MAIA FILHO', ordem: 138 },

    // 13º BBM
    { bbm: '13º BBM', cidade: 'JAGUARI', nome: 'FERNANDO SCHILING', ordem: 139 },
    { bbm: '13º BBM', cidade: 'SÃO FRANCISCO DE ASSIS', nome: 'JACAQUÁ', ordem: 140 },
    { bbm: '13º BBM', cidade: 'MANOEL VIANA', nome: 'RAINHA DO SOL', ordem: 141 }
  ];

  db.exec('BEGIN TRANSACTION;');
  aguasInternas.forEach(ai => {
    insertBaln.run(ai.nome, ai.cidade, '1ª CIAGV', ai.bbm, 'AI', ai.ordem);
  });
  db.exec('COMMIT;');
  console.log('✅ Catálogo completo dos 13 BBMs de Águas Internas cadastrado.');
}

module.exports = { seedCatalogAndIndicadores };

if (require.main === module) {
  seedCatalogAndIndicadores();
}
