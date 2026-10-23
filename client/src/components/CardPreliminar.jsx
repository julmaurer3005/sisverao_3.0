import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Camera, Copy, Check } from 'lucide-react';

export default function CardPreliminar({ data }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!data) return <div className="text-muted">Carregando dados do preliminar...</div>;

  const { operacao_numero, data: dataRef, norte, total_norte, sul, total_sul, aguas_internas, total_dia, acumulado } = data;
  const opNumero = operacao_numero || 10;

  // Formata data para o cabeçalho (ex: "20 de outubro")
  const formatDateHeader = (dStr) => {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    if (!dStr) {
      const now = new Date();
      return `${now.getDate()} de ${meses[now.getMonth()]}`;
    }
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        return `${d} de ${meses[m - 1]}`;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `preliminar-14h-${dataRef || 'cbmrs'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem do preliminar:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    let text = `🚨 *${opNumero}ª Operação Verão: ${formatDateHeader(dataRef)}*\n*(PRELIMINAR DA MANHÃ - 14h)*\n\n`;
    text += `*LITORAL NORTE*\n`;
    norte.forEach(item => {
      text += `• ${item.balneario}: ${item.qtd}\n`;
    });
    text += `👉 *Total Lit NORTE: ${total_norte}*\n\n`;
    
    text += `*LITORAL SUL*\n`;
    sul.forEach(item => {
      text += `• ${item.balneario}: ${item.qtd}\n`;
    });
    text += `👉 *Total Lit SUL: ${total_sul}*\n\n`;

    text += `💧 *ÁGUAS INTERNAS: ${aguas_internas}*\n`;
    text += `📊 *TOTAL DO DIA: ${total_dia}*\n\n`;
    
    text += `📈 *ACUMULADO ATÉ O DIA (${dataRef ? dataRef.split('-').reverse().join('/') : ''})*\n`;
    text += `• Norte: ${acumulado?.norte || 0}\n`;
    text += `• Sul: ${acumulado?.sul || 0}\n`;
    text += `• AI: ${acumulado?.ai || 0}\n`;
    text += `🏆 *TOTAL ACUMULADO: ${acumulado?.total || 0}*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      {/* Botões de Ação */}
      <div style={{ display: 'flex', gap: '0.5rem', width: '340px', justifyContent: 'space-between' }}>
        <button
          onClick={handleDownloadImage}
          disabled={downloading}
          className="btn-secondary"
          style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem' }}
          title="Baixar imagem PNG para o WhatsApp"
        >
          <Camera size={14} />
          {downloading ? 'Gerando...' : 'Baixar Imagem'}
        </button>
        <button
          onClick={handleCopyText}
          className="btn-secondary"
          style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem' }}
          title="Copiar texto formatado com emojis"
        >
          {copied ? <Check size={14} color="#2ec4b6" /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar Texto'}
        </button>
      </div>

      {/* Widget Visual 14h Fiel ao Modelo */}
      <div ref={cardRef} className="card-preliminar-14h">
        <div className="preliminar-header">
          {opNumero}ª Operação Verão: {formatDateHeader(dataRef)}
          <div className="preliminar-subtitle">(PRELIMINAR DA MANHÃ)</div>
        </div>

        <table className="preliminar-table">
          <thead>
            <tr>
              <th style={{ width: '70%' }}>BALNEÁRIO</th>
              <th className="th-right">DIA</th>
            </tr>
          </thead>
          <tbody>
            {/* Litoral Norte */}
            {norte && norte.map((item, idx) => (
              <tr key={item.balneario} className={idx % 2 === 0 ? 'row-even' : ''}>
                <td style={{ paddingLeft: '0.75rem' }}>{item.balneario}</td>
                <td className="td-qty">{item.qtd}</td>
              </tr>
            ))}
            <tr className="preliminar-total-norte">
              <td>Total Lit NORTE</td>
              <td className="td-qty">{total_norte}</td>
            </tr>

            {/* Litoral Sul */}
            {sul && sul.map((item, idx) => (
              <tr key={item.balneario} className={idx % 2 === 0 ? 'row-even' : ''}>
                <td style={{ paddingLeft: '0.75rem' }}>{item.balneario}</td>
                <td className="td-qty">{item.qtd}</td>
              </tr>
            ))}
            <tr className="preliminar-total-sul">
              <td>Total Lit SUL</td>
              <td className="td-qty">{total_sul}</td>
            </tr>

            {/* Águas Internas */}
            <tr className="preliminar-ai">
              <td>ÁGUAS INTERNAS</td>
              <td className="td-qty">{aguas_internas}</td>
            </tr>

            {/* Total do Dia */}
            <tr className="preliminar-total-dia">
              <td>Total DIA</td>
              <td className="td-qty">{total_dia}</td>
            </tr>
          </tbody>
        </table>

        {/* Quadro Acumulado até o Dia */}
        <div className="preliminar-acum-header">
          <span>ACUMULADO ATÉ O DIA</span>
          <span>{dataRef ? dataRef.split('-').reverse().join('/') : ''}</span>
        </div>

        <table className="preliminar-table">
          <thead>
            <tr style={{ background: '#111e2e' }}>
              <th>Litoral</th>
              <th className="th-right">Qtde</th>
            </tr>
          </thead>
          <tbody>
            <tr className="preliminar-acum-row" style={{ background: '#5c3a21' }}>
              <td>Norte</td>
              <td className="td-qty">{acumulado?.norte || 0}</td>
            </tr>
            <tr className="preliminar-acum-row" style={{ background: '#734928' }}>
              <td>Sul</td>
              <td className="td-qty">{acumulado?.sul || 0}</td>
            </tr>
            <tr className="preliminar-acum-row" style={{ background: '#8a5830' }}>
              <td>AI</td>
              <td className="td-qty">{acumulado?.ai || 0}</td>
            </tr>
            <tr className="preliminar-acum-total">
              <td>Total</td>
              <td className="td-qty">{acumulado?.total || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
