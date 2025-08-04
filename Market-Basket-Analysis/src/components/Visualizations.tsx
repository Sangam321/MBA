import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Activity, BarChart3, PieChart as PieChartIcon, Radar as RadarIcon, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

interface Rule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
}

interface AnalysisData {
  frequent_itemsets: Array<{
    itemset: string[];
    support: number;
  }>;
  association_rules: Rule[];
  item_frequency: Record<string, number>;
  total_transactions: number;
}

interface VisualizationsProps {
  data: AnalysisData;
  onBackToResults?: () => void;
}


const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

const Visualizations: React.FC<VisualizationsProps> = ({ data, onBackToResults }) => {

  const itemFrequencyData = Object.entries(data.item_frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([item, frequency]) => ({
      item: item.length > 15 ? item.substring(0, 15) + '...' : item,
      frequency: Number(frequency),
      fullName: item,
    }));

  const pieData = Object.entries(data.item_frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([item, frequency]) => ({
      name: item.length > 12 ? item.substring(0, 12) + '...' : item,
      value: Number(frequency),
      fullName: item,
    }));

  const scatterData = data.association_rules.map((rule) => ({
    x: Number(rule.confidence) * 100,
    y: Number(rule.lift),
    rule: `${rule.antecedents.join(', ')} → ${rule.consequents.join(', ')}`,
    support: Number(rule.support) * 100,
  }));

  const supportBins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1.0];
  const supportDistribution = supportBins.slice(0, -1).map((bin, index) => {
    const nextBin = supportBins[index + 1];
    const count = data.association_rules.filter(
      (rule) => rule.support >= bin && rule.support < nextBin,
    ).length;
    return {
      range: `${(bin * 100).toFixed(0)}-${(nextBin * 100).toFixed(0)}%`,
      count,
    };
  });

  const pivotData = data.frequent_itemsets
    .filter((itemset) => itemset.itemset.length >= 2)
    .slice(0, 10)
    .map((itemset) => ({
      name: itemset.itemset.join(' + '),
      support: Number(itemset.support) * 100,
      count: Math.round(Number(itemset.support) * data.total_transactions),
    }));

  const bubbleData = data.association_rules.map((rule) => ({
    x: Number(rule.confidence) * 100,
    y: Number(rule.lift),
    z: Number(rule.support) * 1000, // size
    rule: `${rule.antecedents.join(', ')} → ${rule.consequents.join(', ')}`,
    support: Number(rule.support) * 100,
  }));

  const confidenceBins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const radialData = confidenceBins.slice(0, -1).map((bin, index) => {
    const nextBin = confidenceBins[index + 1];
    const count = data.association_rules.filter(
      (rule) => rule.confidence >= bin && rule.confidence < nextBin,
    ).length;
    return {
      range: `${(bin * 100).toFixed(0)}-${(nextBin * 100).toFixed(0)}%`,
      count,
      fill: COLORS[index % COLORS.length],
    };
  });

  const liftHistogramData = Array.from({ length: 10 }, (_, i) => {
    const min = i;
    const max = i + 1;
    const count = data.association_rules.filter((r) => r.lift >= min && r.lift < max).length;
    return { range: `${min}-${max}`, count };
  });

  const pairLiftData = data.association_rules
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 12)
    .map((r) => ({
      pair: `${r.antecedents.join('+')}→${r.consequents.join('+')}`,
      lift: r.lift,
    }));


  const cumulativeData = itemFrequencyData.map((item, idx, arr) => ({
    ...item,
    cumulative: arr.slice(0, idx + 1).reduce((sum, v) => sum + v.frequency, 0),
  }));
  const topRules = data.association_rules
    .slice()
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 10);

  const lengthCounts: Record<number, number> = {};
  data.association_rules.forEach((r) => {
    const len = r.antecedents.length + r.consequents.length;
    lengthCounts[len] = (lengthCounts[len] || 0) + 1;
  });
  const ruleLengthData = Object.entries(lengthCounts)
    .map(([len, count]) => ({ length: Number(len), count }))
    .sort((a, b) => a.length - b.length);

  const chartConfig = {
    frequency: { label: 'Frequency', color: '#3b82f6' },
    confidence: { label: 'Confidence', color: '#ef4444' },
    lift: { label: 'Lift', color: '#10b981' },
    count: { label: 'Count', color: '#f59e0b' },
    support: { label: 'Support', color: '#8b5cf6' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">


          <div className="text-center">
            <h1 className="text-3xl font-semibold text-slate-800 mb-2">Data Visualizations</h1>
            <p className="text-lg text-slate-600">Interactive charts and graphs for deeper insights</p>
          </div>

          <div className="w-[140px]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Item Frequency Distribution</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Most frequently purchased items across all transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={itemFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="item" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [
                      value,
                      'Frequency',
                      props.payload?.fullName || props.payload?.item,
                    ]}
                  />
                  <Bar dataKey="frequency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <PieChartIcon className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Top Items Distribution</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Proportional breakdown of top selling items
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [
                      value,
                      'Frequency',
                      props.payload?.fullName || props.payload?.name,
                    ]}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Confidence vs Lift Analysis</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Quality assessment of association rules
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="x" name="Confidence" unit="%" />
                  <YAxis dataKey="y" name="Lift" />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name === 'x' ? 'Confidence (%)' : name === 'y' ? 'Lift' : name,
                    ]}
                  />
                  <Scatter dataKey="y" fill="#10b981" />
                </ScatterChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <RadarIcon className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Frequent Itemset Support</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Support levels for most common item combinations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <RadarChart outerRadius={90} data={pivotData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Support"
                    dataKey="support"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => [`${v}%`, 'Support']} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Rule Strength Analysis</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Comprehensive view of confidence, lift and support metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <ScatterChart data={bubbleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="x" name="Confidence" unit="%" />
                  <YAxis dataKey="y" name="Lift" />
                  <ZAxis dataKey="z" range={[60, 400]} name="Support Size" />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => {
                      if (name === 'x') return [`${value}%`, 'Confidence'];
                      if (name === 'y') return [value, 'Lift'];
                      if (name === 'z') return [`${(Number(value) / 10).toFixed(1)}%`, 'Support'];
                      return [value, name];
                    }}
                  />
                  <Scatter dataKey="z" fill="#06b6d4" />
                </ScatterChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Lift Distribution</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Statistical distribution of lift values across association rules
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={liftHistogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Top Association Pairs</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Strongest item associations ranked by lift value
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={pairLiftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="pair" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="lift" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Cumulative Item Frequency</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Pareto analysis showing cumulative contribution of items
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="item" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="cumulative" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Support Distribution</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Distribution of support values across all association rules
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={supportDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <PieChartIcon className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Confidence Distribution</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Radial visualization of rule confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <RadialBarChart innerRadius="10%" outerRadius="90%" data={radialData} startAngle={180} endAngle={-180}>
                  <RadialBar label={{ position: 'insideStart', fill: '#fff' }} background dataKey="count" />
                  <Legend />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [value, 'Count', props.payload?.range || '']}
                  />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>


          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Top Association Rules</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Detailed metrics for highest performing rules (Top 10)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="py-3 pr-4 font-semibold text-slate-700">Rule</th>
                      <th className="py-3 pr-4 font-semibold text-slate-700">Support (%)</th>
                      <th className="py-3 pr-4 font-semibold text-slate-700">Confidence (%)</th>
                      <th className="py-3 font-semibold text-slate-700">Lift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRules.map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 text-slate-800 font-medium">{r.antecedents.join(', ')} → {r.consequents.join(', ')}</td>
                        <td className="py-3 pr-4 text-slate-600">{(r.support * 100).toFixed(2)}</td>
                        <td className="py-3 pr-4 text-slate-600">{(r.confidence * 100).toFixed(2)}</td>
                        <td className="py-3 text-[#4169E1] font-semibold">{r.lift.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bonus: Rule Length Distribution */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Rule Length Distribution</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Analysis of rule complexity by total item count
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={ruleLengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="length" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#84cc16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;