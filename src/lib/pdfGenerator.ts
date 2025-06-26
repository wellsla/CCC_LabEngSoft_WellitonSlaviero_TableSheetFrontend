
import { jsPDF } from 'jspdf';
import type { Character } from '@/services/character';
import { getGameDetails } from '@/services/game';
import { getGameClassDetails } from '@/services/class';
import { getGameRaceDetails } from '@/services/race';

async function fetchData(character: Character) {
  const [game, gameClass, gameRace] = await Promise.all([
    getGameDetails(character.game_id),
    getGameClassDetails(character.class_id),
    getGameRaceDetails(character.race_id),
  ]);

  return {
    gameName: game?.name || 'N/A',
    className: gameClass?.name || 'N/A',
    raceName: gameRace?.name || 'N/A',
  };
}

export async function generateCharacterPdf(character: Character): Promise<void> {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
  });

  const { gameName, className, raceName } = await fetchData(character);

  // --- Constants ---
  const FONT = 'Helvetica';
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 30;
  const contentW = pageW - margin * 2;
  const gap = 8;
  let y = margin;

  // --- Helper to draw styled boxes ---
  const drawBox = (x: number, yPos: number, w: number, h: number) => {
    doc.setDrawColor(200, 200, 200); // Light grey border
    doc.setLineWidth(1);
    doc.rect(x, yPos, w, h);
  };

  // --- 1. Header (Red bar with Name) ---
  doc.setFillColor(206, 49, 17); // Red color from image
  doc.rect(margin, y, contentW, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(28);
  doc.text(character.name, margin + 10, y + 28);
  y += 40 + gap;

  // --- 2. Sub-Header (Class, Race, Game) ---
  const subHeaderY = y;
  const subHeaderH = 45;
  drawBox(margin, subHeaderY, contentW, subHeaderH);

  const thirdW = contentW / 3;
  const subHeaderLabelY = subHeaderY + 15;
  const subHeaderValueY = subHeaderY + 32;

  doc.setFont(FONT, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('CLASSE & NÍVEL', margin + 10, subHeaderLabelY);
  doc.text('RAÇA', margin + thirdW + 10, subHeaderLabelY);
  doc.text('JOGO', margin + thirdW * 2 + 10, subHeaderLabelY);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont(FONT, 'bold');
  doc.text(`${className} / ${character.level}`, margin + 10, subHeaderValueY);
  doc.text(raceName, margin + thirdW + 10, subHeaderValueY);
  doc.text(gameName, margin + thirdW * 2 + 10, subHeaderValueY);

  y = subHeaderY + subHeaderH + 15;
  let yL = y;
  let yR = y;

  // --- 3. Left Column: Stats ---
  const leftColW = contentW * 0.33;
  
  const drawStatBox = (statName: string, value: number, yPos: number) => {
    const boxH = 48;
    drawBox(margin, yPos, leftColW, boxH);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont(FONT, 'normal');
    doc.text(statName.toUpperCase(), margin + leftColW / 2, yPos + 12, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.setFont(FONT, 'bold');
    doc.text(String(value), margin + leftColW / 2, yPos + 32, { align: 'center' });

    drawBox(margin + leftColW / 2 - 15, yPos + 36, 30, 10);
    return yPos + boxH + gap;
  };

  const stats = [
    { name: 'FORÇA', value: character.strength },
    { name: 'DESTREZA', value: character.dexterity },
    { name: 'CONSTITUIÇÃO', value: character.constitution },
    { name: 'INTELIGÊNCIA', value: character.intelligence },
    { name: 'SABEDORIA', value: character.wisdom },
    { name: 'CARISMA', value: character.charisma },
  ];
  stats.forEach((stat) => {
    yL = drawStatBox(stat.name, stat.value, yL);
  });
  const leftColumnBottom = yL - gap;

  // --- 4. Right Column ---
  const rightColX = margin + leftColW + 15;
  const rightColW = contentW - leftColW - 15;

  // --- 4a. Top Right (Portrait & Combat) ---
  const portraitSize = rightColW * 0.4 > 120 ? 120 : rightColW * 0.4;
  drawBox(rightColX, yR, portraitSize, portraitSize);
  if (character.portrait_url) {
    try {
      doc.addImage(character.portrait_url, 'auto', rightColX + 2, yR + 2, portraitSize - 4, portraitSize - 4);
    } catch (e) {
      doc.setFontSize(10).text('Retrato', rightColX + portraitSize / 2, yR + portraitSize / 2, { align: 'center' });
      console.error('Could not add image to PDF', e);
    }
  } else {
    doc.setFontSize(10).text('Retrato', rightColX + portraitSize / 2, yR + portraitSize / 2, { align: 'center' });
  }

  const combatStatsX = rightColX + portraitSize + gap;
  const combatStatsW = rightColW - portraitSize - gap;
  const combatStatH = (portraitSize - gap * 2) / 3;

  const drawCombatStat = (label: string, value: string | number, x: number, yPos: number, w: number, h: number) => {
    drawBox(x, yPos, w, h);
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.setFont(FONT, 'bold');
    doc.text(String(value), x + w / 2, yPos + h / 2 + 6, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.setFont(FONT, 'normal');
    doc.text(label.toUpperCase(), x + w / 2, yPos + h - 5, { align: 'center' });
  };
  
  drawCombatStat('CLASSE DE ARMADURA', character.armor_class, combatStatsX, yR, combatStatsW, combatStatH);
  drawCombatStat('INICIATIVA', `+${character.initiative}`, combatStatsX, yR + combatStatH + gap, combatStatsW, combatStatH);
  drawCombatStat('DESLOCAMENTO', `${character.speed}m`, combatStatsX, yR + (combatStatH + gap) * 2, combatStatsW, combatStatH);

  yR += portraitSize + gap;

  // --- 4b. Middle Right (HP) ---
  const drawLargeValueBox = (label: string, value: string | number, yPos: number, boxHeight: number) => {
    drawBox(rightColX, yPos, rightColW, boxHeight);
    
    doc.setFontSize(26);
    doc.setTextColor(0);
    doc.setFont(FONT, 'bold');
    const textMetrics = doc.getTextDimensions(String(value));
    const textY = yPos + (boxHeight / 2) + (textMetrics.h / 2) - 5;
    doc.text(String(value), rightColX + rightColW / 2, textY, { align: 'center' });
    
    const titleBarH = 14;
    const titleBarY = yPos + boxHeight - titleBarH;
    doc.setFillColor(230, 230, 230);
    doc.rect(rightColX, titleBarY, rightColW, titleBarH, 'F');
    doc.setFontSize(8);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(100);
    doc.text(label.toUpperCase(), rightColX + rightColW / 2, titleBarY + 9, { align: 'center' });

    return yPos + boxHeight + gap;
  };
  
  const hpBoxHeight = 45;
  yR = drawLargeValueBox('PONTOS DE VIDA MÁXIMOS', character.max_hit_points, yR, hpBoxHeight);
  yR = drawLargeValueBox('PONTOS DE VIDA ATUAIS', character.current_hit_points, yR, hpBoxHeight);

  // --- 4c. Bottom Right (Description & Notes) ---
  const availableHeight = leftColumnBottom - yR;
  const hasDescription = character.description && character.description.trim() !== '';
  const hasNotes = character.notes && character.notes.trim() !== '';

  const drawLongTextBox = (title: string, text: string | undefined, yPos: number, boxHeight: number) => {
    drawBox(rightColX, yPos, rightColW, boxHeight);
    const titleBarH = 14;
    const contentH = boxHeight - titleBarH;
    
    if (text) {
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.setFont(FONT, 'normal');
      
      const textLines = doc.splitTextToSize(text, rightColW - 10);
      const lineHeight = doc.getLineHeight(text) / doc.internal.scaleFactor;
      const maxLines = Math.floor((contentH - 10) / lineHeight);
      const visibleLines = textLines.slice(0, maxLines);
      
      doc.text(visibleLines, rightColX + 5, yPos + 12);
    }
    
    const titleBarY = yPos + boxHeight - titleBarH;
    doc.setFillColor(230, 230, 230);
    doc.rect(rightColX, titleBarY, rightColW, titleBarH, 'F');
    doc.setFontSize(8);
    doc.setFont(FONT, 'bold');
    doc.setTextColor(100);
    doc.text(title.toUpperCase(), rightColX + rightColW / 2, titleBarY + 9, { align: 'center' });
  };

  if (availableHeight > 40) { // Only draw if there's meaningful space
    let descHeight, notesHeight;
    if (hasDescription && hasNotes) {
      descHeight = (availableHeight - gap) / 2;
      notesHeight = (availableHeight - gap) / 2;
      drawLongTextBox('DESCRIÇÃO E PERSONALIDADE', character.description, yR, descHeight);
      yR += descHeight + gap;
      drawLongTextBox('NOTAS E EQUIPAMENTOS', character.notes, yR, notesHeight);
    } else if (hasDescription) {
      descHeight = availableHeight;
      drawLongTextBox('DESCRIÇÃO E PERSONALIDADE', character.description, yR, descHeight);
    } else if (hasNotes) {
      notesHeight = availableHeight;
      drawLongTextBox('NOTAS E EQUIPAMENTOS', character.notes, yR, notesHeight);
    } else { // Draw both as empty if no content
      descHeight = (availableHeight - gap) / 2;
      notesHeight = (availableHeight - gap) / 2;
      drawLongTextBox('DESCRIÇÃO E PERSONALIDADE', '', yR, descHeight);
      yR += descHeight + gap;
      drawLongTextBox('NOTAS E EQUIPAMENTOS', '', yR, notesHeight);
    }
  }


  doc.save(`${character.name.replace(/ /g, '_')}_ficha.pdf`);
}
