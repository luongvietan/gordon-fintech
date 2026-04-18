import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CalculatorInputs,
  CalculatorOutputs,
  formatDollars,
  formatDollarsExact,
  formatYears,
} from './calculator';
import { SPECIALTIES } from './specialties';

// Wise palette (duplicated as jsPDF RGB tuples — it can't read CSS vars).
const COLOR = {
  near_black: [14, 15, 12] as [number, number, number],
  warm_dark: [69, 71, 69] as [number, number, number],
  gray: [134, 134, 133] as [number, number, number],
  wise_green: [159, 232, 112] as [number, number, number],
  dark_green: [22, 51, 0] as [number, number, number],
  light_mint: [226, 246, 213] as [number, number, number],
  light_surface: [232, 235, 230] as [number, number, number],
  off_white: [252, 251, 247] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  positive: [5, 77, 40] as [number, number, number],
  danger: [208, 50, 56] as [number, number, number],
};

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setText(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

// ─────────────────────────────────────────────────────────────
//  Page geometry
// ─────────────────────────────────────────────────────────────
const PAGE = {
  width: 210, // A4 portrait mm
  height: 297,
  margin: 16,
};

/** Draw the brand header on the current page. */
function drawHeader(doc: jsPDF) {
  // Dark bar across top
  setFill(doc, COLOR.near_black);
  doc.rect(0, 0, PAGE.width, 26, 'F');

  // Wordmark chip
  setFill(doc, COLOR.wise_green);
  doc.roundedRect(PAGE.margin, 8, 10, 10, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(doc, COLOR.dark_green);
  doc.text('M', PAGE.margin + 5, 14.8, { align: 'center' });

  // Wordmark
  doc.setFontSize(13);
  setText(doc, COLOR.white);
  doc.text('MedDebt Calculator', PAGE.margin + 14, 15.2);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setText(doc, [180, 182, 180]);
  doc.text('Personal debt projection report', PAGE.margin + 14, 20.2);

  // Right-side date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  setText(doc, [220, 222, 220]);
  doc.text(today, PAGE.width - PAGE.margin, 15.2, { align: 'right' });
}

/** Draw the page footer (appears on every page). */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  setDraw(doc, [230, 230, 228]);
  doc.setLineWidth(0.2);
  doc.line(PAGE.margin, PAGE.height - 12, PAGE.width - PAGE.margin, PAGE.height - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setText(doc, COLOR.gray);
  doc.text(
    'Educational estimate only · Not financial advice · medschooldebtcalculator.com',
    PAGE.margin,
    PAGE.height - 7,
  );
  doc.text(
    `Page ${pageNum} / ${totalPages}`,
    PAGE.width - PAGE.margin,
    PAGE.height - 7,
    { align: 'right' },
  );
}

// ─────────────────────────────────────────────────────────────
//  Content blocks
// ─────────────────────────────────────────────────────────────

/** Section eyebrow (small uppercase gray). */
function drawEyebrow(doc: jsPDF, text: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setText(doc, COLOR.gray);
  doc.text(text.toUpperCase(), PAGE.margin, y);
  return y + 3.5;
}

/** Big display heading, weight-900 feel. */
function drawHeadline(doc: jsPDF, text: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setText(doc, COLOR.near_black);
  doc.text(text, PAGE.margin, y);
  return y + 8;
}

interface Kpi {
  label: string;
  value: string;
  sub?: string;
  accent?: 'lime' | 'dark' | 'default';
}

/** Render a 4-up KPI row. */
function drawKpis(doc: jsPDF, kpis: Kpi[], startY: number): number {
  const gap = 3;
  const usable = PAGE.width - PAGE.margin * 2;
  const w = (usable - gap * (kpis.length - 1)) / kpis.length;
  const h = 28;

  kpis.forEach((kpi, i) => {
    const x = PAGE.margin + i * (w + gap);

    if (kpi.accent === 'lime') {
      setFill(doc, COLOR.wise_green);
      doc.roundedRect(x, startY, w, h, 3, 3, 'F');
      setText(doc, COLOR.dark_green);
    } else if (kpi.accent === 'dark') {
      setFill(doc, COLOR.near_black);
      doc.roundedRect(x, startY, w, h, 3, 3, 'F');
      setText(doc, COLOR.white);
    } else {
      setFill(doc, COLOR.white);
      setDraw(doc, [221, 222, 219]);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, startY, w, h, 3, 3, 'FD');
      setText(doc, COLOR.near_black);
    }

    // Label
    const labelColor =
      kpi.accent === 'lime'
        ? COLOR.dark_green
        : kpi.accent === 'dark'
        ? [190, 192, 190]
        : COLOR.gray;
    setText(doc, labelColor as [number, number, number]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(kpi.label.toUpperCase(), x + 4, startY + 6);

    // Value
    setText(
      doc,
      kpi.accent === 'lime'
        ? COLOR.dark_green
        : kpi.accent === 'dark'
        ? COLOR.white
        : COLOR.near_black,
    );
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(kpi.value, x + 4, startY + 15);

    // Sub
    if (kpi.sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setText(
        doc,
        kpi.accent === 'lime'
          ? [40, 80, 0]
          : kpi.accent === 'dark'
          ? [180, 182, 180]
          : COLOR.warm_dark,
      );
      doc.text(kpi.sub, x + 4, startY + 22);
    }
  });

  return startY + h + 6;
}

/** Two-column spec/values summary block. */
function drawSummaryGrid(
  doc: jsPDF,
  title: string,
  rows: Array<[string, string]>,
  y: number,
): number {
  y = drawEyebrow(doc, title, y);
  y += 1;

  const usable = PAGE.width - PAGE.margin * 2;
  const colW = usable / 2 - 2;
  const rowH = 7.5;
  const cols = 2;
  const rowsPerCol = Math.ceil(rows.length / cols);

  setDraw(doc, [228, 230, 226]);
  doc.setLineWidth(0.2);

  rows.forEach((row, i) => {
    const col = Math.floor(i / rowsPerCol);
    const rowInCol = i % rowsPerCol;
    const x = PAGE.margin + col * (colW + 4);
    const yy = y + rowInCol * rowH;

    // Divider
    if (rowInCol < rowsPerCol - 1) {
      doc.line(x, yy + rowH - 0.5, x + colW, yy + rowH - 0.5);
    }

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, COLOR.warm_dark);
    doc.text(row[0], x, yy + 5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setText(doc, COLOR.near_black);
    doc.text(row[1], x + colW, yy + 5, { align: 'right' });
  });

  return y + rowsPerCol * rowH + 4;
}

/** Centered callout band (e.g. opportunity cost). */
function drawCallout(
  doc: jsPDF,
  label: string,
  value: string,
  body: string,
  y: number,
  variant: 'lime' | 'dark' = 'dark',
): number {
  const h = 30;
  const w = PAGE.width - PAGE.margin * 2;

  if (variant === 'lime') {
    setFill(doc, COLOR.wise_green);
    setText(doc, COLOR.dark_green);
  } else {
    setFill(doc, COLOR.near_black);
    setText(doc, COLOR.white);
  }
  doc.roundedRect(PAGE.margin, y, w, h, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setText(
    doc,
    variant === 'lime' ? [40, 80, 0] : [180, 182, 180],
  );
  doc.text(label.toUpperCase(), PAGE.margin + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  setText(doc, variant === 'lime' ? COLOR.dark_green : COLOR.white);
  doc.text(value, PAGE.margin + 6, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  setText(
    doc,
    variant === 'lime' ? [40, 80, 0] : [200, 202, 200],
  );
  const wrapped = doc.splitTextToSize(body, w - 12);
  doc.text(wrapped, PAGE.margin + 6, y + 24);

  return y + h + 6;
}

// ─────────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────────
export function downloadResultsPdf(
  inputs: CalculatorInputs,
  outputs: CalculatorOutputs,
  filename?: string,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  // ── HEADER ──────────────────────────────────────────
  drawHeader(doc);

  let y = 40;

  // ── TITLE ───────────────────────────────────────────
  y = drawEyebrow(doc, 'Your results', y);
  y = drawHeadline(doc, 'Med school debt projection', y + 2);

  // Short summary line
  const specialty =
    SPECIALTIES.find(
      (s) =>
        s.attendingSalary === inputs.attendingSalary &&
        s.residencyYears === inputs.residencyYears,
    )?.label ?? 'Custom specialty';

  const presetLabel =
    inputs.scenarioPreset === 'aggressive'
      ? 'Aggressive payoff'
      : inputs.scenarioPreset === 'pslf-optimized'
      ? 'PSLF-optimized'
      : inputs.scenarioPreset === 'minimum'
      ? 'Minimum payment'
      : 'Custom scenario';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setText(doc, COLOR.warm_dark);
  doc.text(
    `${specialty} · ${formatDollarsExact(inputs.totalDebt)} at ${inputs.interestRate}% · ${presetLabel}`,
    PAGE.margin,
    y,
  );
  y += 9;

  // ── KPI ROW ─────────────────────────────────────────
  y = drawKpis(
    doc,
    [
      {
        label: 'Monthly payment',
        value: formatDollars(outputs.monthlyPaymentAttending),
        sub: `Residency ~${formatDollars(outputs.monthlyPaymentResidency)}`,
      },
      {
        label: 'Time to payoff',
        value: formatYears(outputs.payoffYears),
        sub: outputs.pslfEligible
          ? `PSLF: ${formatYears(outputs.pslfYearsToForgiveness)}`
          : undefined,
      },
      {
        label: 'Total interest',
        value: formatDollars(outputs.totalInterestPaid),
        sub: `Total paid ${formatDollars(outputs.standardTotalPaid)}`,
        accent: 'dark',
      },
      {
        label: 'Net-worth crossover',
        value:
          outputs.netWorthCrossoverYear !== null
            ? `Yr ${outputs.netWorthCrossoverYear}`
            : '—',
        sub: 'First year back in the black',
        accent: 'lime',
      },
    ],
    y,
  );

  // ── PSLF CALLOUT (if eligible) ──────────────────────
  if (outputs.pslfEligible) {
    y = drawCallout(
      doc,
      'PSLF Forgiveness',
      `${formatDollars(outputs.pslfForgiven)} forgiven · ${formatDollars(outputs.pslfSavings)} saved vs. standard`,
      '120 qualifying monthly payments at a 501(c)(3) / government employer. Tax-free at the federal level.',
      y,
      'lime',
    );
  }

  // ── OPPORTUNITY COST ────────────────────────────────
  y = drawCallout(
    doc,
    'Opportunity cost',
    formatDollars(outputs.opportunityCost),
    `If the ${formatDollars(outputs.extraDollarsPaid)} you paid above IDR minimums had been invested at ${inputs.investmentReturn}% instead, it would grow to roughly this over the payoff horizon.`,
    y,
    'dark',
  );

  // ── INPUT SUMMARY ───────────────────────────────────
  y = drawSummaryGrid(
    doc,
    'Inputs used',
    [
      ['Total debt', formatDollarsExact(inputs.totalDebt)],
      ['Interest rate', `${inputs.interestRate}%`],
      ['Loan type', inputs.loanType === 'federal' ? 'Federal' : 'Private'],
      [
        'PSLF enabled',
        inputs.pslfEnabled && inputs.loanType === 'federal' ? 'Yes' : 'No',
      ],
      ['Specialty', specialty],
      ['Residency length', `${inputs.residencyYears} years`],
      ['Attending salary', formatDollarsExact(inputs.attendingSalary)],
      ['Salary growth', `${inputs.salaryGrowthRate}% / year`],
      [
        'Residency living',
        `${formatDollarsExact(inputs.livingExpensesResidency)} / mo`,
      ],
      [
        'Attending living',
        `${formatDollarsExact(inputs.livingExpensesAttending)} / mo`,
      ],
      ['Effective tax rate', `${inputs.taxRate}%`],
      ['CPI inflation', `${inputs.inflationRate.toFixed(1)}%`],
      ['Expected market return', `${inputs.investmentReturn.toFixed(1)}%`],
      [
        'Monthly payment override',
        inputs.monthlyPaymentOverride
          ? formatDollarsExact(inputs.monthlyPaymentOverride)
          : 'Auto (10-yr amortization)',
      ],
    ],
    y + 2,
  );

  // ── YEAR-BY-YEAR TABLE ──────────────────────────────
  y = drawEyebrow(doc, 'Year-by-year snapshot (standard repayment)', y + 4);

  const tableRows = outputs.standardSchedule.map((row) => [
    row.label,
    row.annualIncome > 0 ? formatDollarsExact(row.annualIncome) : '—',
    row.annualPayment > 0 ? formatDollarsExact(row.annualPayment) : '—',
    formatDollarsExact(row.balance),
    formatDollarsExact(row.netWorth),
    row.phase.charAt(0).toUpperCase() + row.phase.slice(1),
  ]);

  autoTable(doc, {
    startY: y + 2,
    margin: { left: PAGE.margin, right: PAGE.margin },
    head: [['Year', 'Income', 'Paid', 'Balance', 'Net worth', 'Phase']],
    body: tableRows,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
      lineColor: [235, 237, 233],
      lineWidth: 0.1,
      textColor: COLOR.near_black,
    },
    headStyles: {
      fillColor: COLOR.near_black,
      textColor: COLOR.white,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    bodyStyles: {
      fillColor: COLOR.white,
    },
    alternateRowStyles: {
      fillColor: COLOR.off_white,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'left', textColor: COLOR.warm_dark, fontSize: 7.5 },
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawHeader(doc);
      }
    },
  });

  // ── FOOTERS ON EVERY PAGE ───────────────────────────
  // jsPDF-autotable might have added pages — iterate over them all.
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  // ── SAVE ────────────────────────────────────────────
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(filename ?? `meddebt-report-${stamp}.pdf`);
}
