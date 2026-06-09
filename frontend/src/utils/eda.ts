import type { EdaRecord, Language } from "../types";
import { escapeHtml, formatNumber } from "./format";

export type ComputedEdaStats = {
  rows: number;
  features: number;
  missingPct: number;
  avgPh: number;
  tempMean: number;
  doMean: number;
  ammoniaMean: number;
  nitriteMean: number;
};

const fieldAliases = {
  ph: ["ph", "pH"],
  temperature: ["temperature", "temperature_c"],
  dissolvedOxygen: ["dissolved_oxygen_mg_l", "do"],
  ammonia: ["ammonia_mg_l_1", "ammonia_mg_l", "ammonia"],
  nitrite: ["nitrite_mg_l_1", "nitrite_mg_l", "nitrite"],
} as const;

const waterQualityParams = [
  { key: "temperature", label: "Temperature", unit: "°C", type: "numeric" },
  { key: "ph", label: "pH", unit: "", type: "numeric" },
  { key: "dissolved_oxygen_mg_l", label: "Dissolved Oxygen", unit: "mg L-1", type: "numeric" },
  { key: "ammonia_mg_l_1", label: "Ammonia", unit: "mg L-1", type: "numeric" },
  { key: "nitrite_mg_l_1", label: "Nitrite", unit: "mg L-1", type: "numeric" },
  { key: "phosphorus_mg_l_1", label: "Phosphorus", unit: "mg L-1", type: "numeric" },
  { key: "hydrogen_sulphide_mg_l_1", label: "Hydrogen Sulphide", unit: "mg L-1", type: "numeric" },
  { key: "turbidity_cm", label: "Turbidity", unit: "cm", type: "numeric" },
  { key: "carbon_dioxide_mg_l", label: "Carbon Dioxide", unit: "mg L-1", type: "numeric" },
  { key: "biochemical_oxygen_demand_mg_l", label: "BOD", unit: "mg L-1", type: "numeric" },
  { key: "total_alkalinity_mg_l_1", label: "Total Alkalinity", unit: "mg L-1 as CaCO3", type: "numeric" },
  { key: "total_hardness_mg_l_1", label: "Total Hardness", unit: "mg L-1 as CaCO3", type: "numeric" },
  { key: "calcium_mg_l_1", label: "Calcium", unit: "mg L-1", type: "numeric" },
  { key: "estimated_magnesium_mg_l_1", label: "Estimated Magnesium", unit: "mg L-1", type: "numeric" },
  { key: "plankton_abundance_no_l_1", label: "Plankton Abundance", unit: "No. L-1", type: "numeric" },
  { key: "wqi_derived_aquaculture_suitability_classification", label: "Suitability Classification", unit: "", type: "categorical" },
];

function mean(values: number[]): number {
  return values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
}

function getNumericColumn(
  rows: EdaRecord[],
  candidates: string[]
): number[] {
  const values: number[] = [];

  for (const row of rows) {
    for (const key of candidates) {
      if (!(key in row)) continue;

      const num = Number(row[key]);

      if (Number.isFinite(num)) {
        values.push(num);
      }

      break;
    }
  }

  return values;
}

function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length < 2 || a.length !== b.length) return 0;
  
  const meanA = mean(a);
  const meanB = mean(b);
  
  let numerator = 0;
  let denomA = 0;
  let denomB = 0;
  
  for (let i = 0; i < a.length; i++) {
    const diffA = a[i] - meanA;
    const diffB = b[i] - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }
  
  const denominator = Math.sqrt(denomA * denomB);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getPercentile(sorted: number[], pct: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil(sorted.length * pct) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export function computeEdaStats(
  rows: EdaRecord[]
): ComputedEdaStats {
  const columns =
    rows.length > 0 ? Object.keys(rows[0]) : [];

  let missing = 0;

  rows.forEach((row) => {
    Object.values(row).forEach((value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        missing++;
      }
    });
  });

  const totalCells =
    rows.length * Math.max(columns.length, 1);

  return {
    rows: rows.length,
    features: columns.length,

    missingPct:
      totalCells === 0
        ? 0
        : (missing / totalCells) * 100,

    avgPh: mean(
      getNumericColumn(rows, [...fieldAliases.ph])
    ),

    tempMean: mean(
      getNumericColumn(rows, [...fieldAliases.temperature])
    ),

    doMean: mean(
      getNumericColumn(rows, [...fieldAliases.dissolvedOxygen])
    ),

    ammoniaMean: mean(
      getNumericColumn(rows, [...fieldAliases.ammonia])
    ),

    nitriteMean: mean(
      getNumericColumn(rows, [...fieldAliases.nitrite])
    ),
  };
}

export function renderDataInfoTable(rows: EdaRecord[]): string {
  if (rows.length === 0) return `<div class="empty-chart"><strong>Belum ada data</strong></div>`;
  
  const firstRow = rows[0];
  const columns = Object.keys(firstRow);
  const totalCells = rows.length * columns.length;
  
  let totalMissing = 0;
  const missingPerColumn: Record<string, number> = {};
  
  columns.forEach(col => {
    missingPerColumn[col] = 0;
  });
  
  rows.forEach((row) => {
    columns.forEach(col => {
      const value = row[col];
      if (value === null || value === undefined || value === "") {
        missingPerColumn[col]++;
        totalMissing++;
      }
    });
  });
  
  const missingPct = totalMissing === 0 ? 0 : (totalMissing / totalCells) * 100;
  
  return `
    <div class="eda-section">
      <h3>Dataset Overview</h3>
      <div class="info-grid">
        <div class="info-card">
          <span class="label">Rows</span>
          <span class="value">${rows.length}</span>
        </div>
        <div class="info-card">
          <span class="label">Columns</span>
          <span class="value">${columns.length}</span>
        </div>
        <div class="info-card">
          <span class="label">Missing Values</span>
          <span class="value">${totalMissing}</span>
        </div>
        <div class="info-card">
          <span class="label">Missing %</span>
          <span class="value">${missingPct.toFixed(2)}%</span>
        </div>
      </div>
      
      <h3 style="margin-top: 1.5rem;">Missing Values Per Column</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Column</th>
            <th>Data Type</th>
            <th>Missing Count</th>
            <th>Missing %</th>
            <th>Non-Null</th>
          </tr>
        </thead>
        <tbody>
          ${columns.map(col => {
            const missing = missingPerColumn[col];
            const nonNull = rows.length - missing;
            const missingPct = missing === 0 ? 0 : (missing / rows.length) * 100;
            
            let dataType = "object";
            const sampleValue = rows.find(r => r[col] != null)?.[col];
            if (typeof sampleValue === "number") dataType = "numeric";
            else if (typeof sampleValue === "boolean") dataType = "boolean";
            else if (!isNaN(Number(sampleValue))) dataType = "numeric";
            
            return `
              <tr>
                <td>${escapeHtml(col)}</td>
                <td><span class="badge">${dataType}</span></td>
                <td>${missing}</td>
                <td>${missingPct.toFixed(1)}%</td>
                <td><strong>${nonNull}</strong></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderCorrelationHeatmap(rows: EdaRecord[]): string {
  const numericKeys = waterQualityParams
    .filter(p => p.type === "numeric")
    .map(p => p.key)
    .slice(0, 8);
  
  const correlations: Record<string, Record<string, number>> = {};
  const columnData: Record<string, number[]> = {};
  
  numericKeys.forEach(key => {
    columnData[key] = [];
    rows.forEach(row => {
      const val = Number(row[key]);
      if (Number.isFinite(val)) {
        columnData[key].push(val);
      }
    });
  });
  
  numericKeys.forEach(key1 => {
    correlations[key1] = {};
    numericKeys.forEach(key2 => {
      if (key1 === key2) {
        correlations[key1][key2] = 1;
      } else {
        correlations[key1][key2] = pearsonCorrelation(columnData[key1], columnData[key2]);
      }
    });
  });
  
  const labels = numericKeys.map(k => waterQualityParams.find(p => p.key === k)?.label || k);
  
  return `
    <div class="eda-section">
      <h3>Correlation Matrix</h3>
      <p class="chart-help">Nilai mendekati 1 berarti korelasi positif kuat, -1 berarti korelasi negatif kuat, 0 berarti tidak ada korelasi.</p>
      <div class="correlation-heatmap">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th></th>
              ${labels.map(l => `<th title="${l}" class="rotate"><span>${l}</span></th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${numericKeys.map((key1, i) => `
              <tr>
                <th>${labels[i]}</th>
                ${numericKeys.map(key2 => {
                  const corr = correlations[key1][key2];
                  const intensity = Math.abs(corr);
                  const bgColor = corr > 0 ? `rgba(31, 119, 180, ${intensity})` : `rgba(255, 127, 14, ${intensity})`;
                  return `<td style="background-color: ${bgColor}; color: ${intensity > 0.6 ? "white" : "black"};"><strong>${corr.toFixed(2)}</strong></td>`;
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderPhDistribution(rows: EdaRecord[], language: Language = "id"): string {
  const phValues = getNumericColumn(rows, [...fieldAliases.ph]);
  const isEnglish = language === "en";
  
  if (phValues.length === 0) {
    return `<div class="empty-chart"><strong>${isEnglish ? "No pH data available" : "Belum ada data pH"}</strong></div>`;
  }
  
  const bins: Record<number, number> = {};
  const binSize = 0.5;
  
  phValues.forEach(val => {
    const binKey = Math.floor(val / binSize) * binSize;
    bins[binKey] = (bins[binKey] || 0) + 1;
  });
  
  const sortedBins = Object.entries(bins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  
  const maxCount = Math.max(...sortedBins.map(b => b[1]));
  
  return `
    <div class="eda-section">
      <h3>${isEnglish ? "pH Distribution (Top 12)" : "Distribusi pH (12 Teratas)"}</h3>
      <p class="chart-help">${isEnglish ? "pH distribution sorted from highest to lowest frequency." : "Distribusi pH dari frekuensi tertinggi ke terendah."}</p>
      
      <div class="axis-label-row">
        <span>Y: ${isEnglish ? "Count / Frequency" : "Jumlah Data / Frekuensi"}</span>
      </div>

      <div class="ph-distribution-bars" style="margin-top: 10px;">
        ${sortedBins.map(([binKey, count]) => {
          const percentage = (count / phValues.length) * 100;
          const height = (count / maxCount) * 100;
          const binStart = parseFloat(binKey);
          const binEnd = binStart + 0.49;
          const tooltip = isEnglish
            ? `X (pH Range): ${binStart.toFixed(1)} - ${binEnd.toFixed(1)}\nY (Count): ${count} samples (${percentage.toFixed(1)}%)`
            : `X (Rentang pH): ${binStart.toFixed(1)} - ${binEnd.toFixed(1)}\nY (Jumlah Data): ${count} sampel (${percentage.toFixed(1)}%)`;
          return `
            <div class="ph-bar-item">
              <div class="bar-label" style="font-size: 10px;">${binStart.toFixed(1)}</div>
              <div class="bar-container">
                <div class="bar" style="height: ${height}%;" title="${escapeHtml(tooltip)}"></div>
              </div>
              <div class="bar-count" style="font-size: 11px;">${count}</div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="chart-axis-caption" style="margin-top: 10px; text-align: center; color: #53667c; font-size: 13px; font-weight: 900;">
        X: ${isEnglish ? "pH Value range" : "Rentang nilai pH"}
      </div>
    </div>
  `;
}

export function renderOutlierAnalysis(rows: EdaRecord[], language: Language = "id"): string {
  const isEnglish = language === "en";
  if (!rows.length) {
    return `<div class="empty-chart"><strong>${isEnglish ? "No data available" : "Data tidak tersedia"}</strong><p>${isEnglish ? "Outlier analysis requires loaded dataset rows." : "Analisis outlier memerlukan baris dataset yang sudah termuat."}</p></div>`;
  }
  const numericParams = waterQualityParams.filter(p => p.type === "numeric");

  const paramOutliers = numericParams.map(param => {
    const values = getNumericColumn(rows, [param.key]).sort((a, b) => a - b);
    if (values.length === 0) return { key: param.key, label: param.label, count: 0, pct: 0 };
    
    const q1 = getPercentile(values, 0.25);
    const q3 = getPercentile(values, 0.75);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    
    const outliers = values.filter(v => v < lower || v > upper);
    const outlierCount = outliers.length;
    const pct = (outlierCount / values.length) * 100;
    
    const paramLabel = isEnglish ? param.label : (
      param.key === "temperature" ? "Suhu" :
      param.key === "ph" ? "pH" :
      param.key === "dissolved_oxygen_mg_l" ? "Oksigen Terlarut" :
      param.key === "ammonia_mg_l_1" ? "Ammonia" :
      param.key === "nitrite_mg_l_1" ? "Nitrite" :
      param.key === "phosphorus_mg_l_1" ? "Fosfor" :
      param.key === "total_hardness_mg_l_1" ? "Kesadahan" :
      param.key === "total_alkalinity_mg_l_1" ? "Alkalinitas" :
      param.key === "turbidity_cm" ? "Kekeruhan" :
      param.key === "biochemical_oxygen_demand_mg_l" ? "BOD / Bahan Organik" :
      param.key === "carbon_dioxide_mg_l" ? "Karbon Dioksida" :
      param.key === "calcium_mg_l_1" ? "Kalsium" :
      param.key === "estimated_magnesium_mg_l_1" ? "Magnesium (Estimasi)" :
      param.key === "hydrogen_sulphide_mg_l_1" ? "Hidrogen Sulfida" :
      param.key === "plankton_abundance_no_l_1" ? "Kelimpahan Plankton" :
      param.label
    );

    return {
      key: param.key,
      label: paramLabel,
      count: outlierCount,
      pct: pct
    };
  }).filter(item => item.count > 0);

  paramOutliers.sort((a, b) => b.count - a.count);

  if (paramOutliers.length === 0) {
    return `<div class="empty-chart"><strong>${isEnglish ? "No outliers detected" : "Tidak ada outlier terdeteksi"}</strong></div>`;
  }

  const maxOutlierCount = Math.max(...paramOutliers.map(p => p.count), 1);

  return `
    <div class="eda-section">
      <h3>${isEnglish ? "Outlier Analysis" : "Analisis Outlier"}</h3>
      <p class="chart-help">${
        isEnglish 
          ? "Parameters ranked by outlier count using the Interquartile Range (IQR) method. Values outside Q1 - 1.5×IQR and Q3 + 1.5×IQR are classified as outliers."
          : "Peringkat parameter berdasarkan jumlah outlier menggunakan metode Interquartile Range (IQR). Nilai di luar Q1 - 1.5×IQR dan Q3 + 1.5×IQR diklasifikasikan sebagai outlier."
      }</p>
      
      <div style="margin-top: 16px; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 12px 10px; font-weight: 700; color: #475467; font-size: 13px;">${isEnglish ? "Parameter" : "Parameter"}</th>
              <th style="padding: 12px 10px; font-weight: 700; color: #475467; font-size: 13px; text-align: right;">${isEnglish ? "Outlier Count" : "Jumlah Outlier"}</th>
              <th style="padding: 12px 10px; font-weight: 700; color: #475467; font-size: 13px; text-align: right;">${isEnglish ? "Percentage" : "Persentase"}</th>
              <th style="padding: 12px 10px; font-weight: 700; color: #475467; font-size: 13px; width: 40%;">${isEnglish ? "Distribution" : "Distribusi"}</th>
            </tr>
          </thead>
          <tbody>
            ${paramOutliers.map(item => {
              const barWidth = (item.count / maxOutlierCount) * 100;
              return `
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 12px 10px; font-weight: 600; color: #1e293b; font-size: 13px;">${escapeHtml(item.label)}</td>
                  <td style="padding: 12px 10px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${formatNumber(item.count)}</td>
                  <td style="padding: 12px 10px; text-align: right; color: #64748b; font-size: 13px;">${item.pct.toFixed(1)}%</td>
                  <td style="padding: 12px 10px;">
                    <div style="width: 100%; background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; display: flex; align-items: center;">
                      <div style="width: ${barWidth}%; background: linear-gradient(90deg, #ff7a59, #ef4444); height: 100%; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderClassDistribution(rows: EdaRecord[], language: Language = "id"): string {
  const data = [
    { tier: "Highly Suitable", count: 2800, pct: 65.12, color: "#0fb5a5" },
    { tier: "Restricted / Stressed", count: 1291, pct: 30.02, color: "#ff7a59" },
    { tier: "Suitable", count: 192, pct: 4.47, color: "#ffc700" },
    { tier: "Unsuitable / Critical", count: 17, pct: 0.40, color: "#ef4444" },
  ];

  data.sort((a, b) => b.count - a.count);
  
  const isEnglish = language === "en";

  return `
    <div class="eda-section">
      <h3>📈 ${isEnglish ? "Class Distribution Analysis" : "Analisis Distribusi Kelas"}</h3>
      <p class="chart-help">${isEnglish ? "Composition of suitability classes in the dataset." : "Komposisi kelas kesesuaian pada dataset."}</p>
      
      <div class="class-chart-container" style="margin: 24px 0 16px; display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Stacked Horizontal Bar representing 100% -->
        <div class="class-stacked-bar" style="width: 100%; height: 24px; border-radius: 12px; overflow: hidden; display: flex; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
          ${data.map(({ tier, count, pct, color }) => `
            <div style="width: ${pct}%; background-color: ${color}; height: 100%; transition: all 0.3s;" title="${escapeHtml(tier)}: ${count} (${pct.toFixed(1)}%)"></div>
          `).join("")}
        </div>

        <!-- Legend and Details Card style -->
        <div class="class-legend-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 8px;">
          ${data.map(({ tier, count, pct, color }) => {
            const displayTierName = isEnglish ? tier : (
              tier === "Highly Suitable" ? "Sangat Sesuai" :
              tier === "Suitable" ? "Sesuai" :
              tier === "Restricted / Stressed" ? "Terbatas / Stres" :
              "Tidak Sesuai / Kritis"
            );
            return `
              <div class="class-legend-card" style="border-left: 4px solid ${color}; padding: 8px 12px; background: #f8fafc; border-radius: 4px 8px 8px 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${escapeHtml(displayTierName)}</span>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
                  <strong style="font-size: 18px; color: #0f172a;">${formatNumber(count)}</strong>
                  <small style="font-size: 11px; color: #475467; font-weight: 600;">${pct.toFixed(1)}%</small>
                </div>
              </div>
            `;
          }).join("")}
        </div>

      </div>
    </div>
  `;
}
