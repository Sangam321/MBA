import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const Visualizations: React.FC<VisualizationsProps> = ({ data }) => {
  // Top items (bar)
  const itemFrequencyData = Object.entries(data.item_frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([item, frequency]) => ({
      item: item.length > 15 ? item.substring(0, 15) + '...' : item,
      frequency: Number(frequency),
      fullName: item,
    }));

  // Top items (pie)
  const pieData = Object.entries(data.item_frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([item, frequency]) => ({
      name: item.length > 12 ? item.substring(0, 12) + '...' : item,
      value: Number(frequency),
      fullName: item,
    }));

  // Scatter (confidence vs lift)
  const scatterData = data.association_rules.map((rule) => ({
    x: Number(rule.confidence) * 100,
    y: Number(rule.lift),
    rule: `${rule.antecedents.join(', ')} → ${rule.consequents.join(', ')}`,
    support: Number(rule.support) * 100,
  }));

  // Support distribution (bar)
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

  // Frequent itemsets radar
  const pivotData = data.frequent_itemsets
    .filter((itemset) => itemset.itemset.length >= 2)
    .slice(0, 10)
    .map((itemset) => ({
      name: itemset.itemset.join(' + '),
      support: Number(itemset.support) * 100,
      count: Math.round(Number(itemset.support) * data.total_transactions),
    }));

  // Bubble-like scatter (size by support)
  const bubbleData = data.association_rules.map((rule) => ({
    x: Number(rule.confidence) * 100,
    y: Number(rule.lift),
    z: Number(rule.support) * 1000, // size
    rule: `${rule.antecedents.join(', ')} → ${rule.consequents.join(', ')}`,
    support: Number(rule.support) * 100,
  }));

  // Radial confidence distribution
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

  // NEW 1: Lift distribution histogram (0-10)
  const liftHistogramData = Array.from({ length: 10 }, (_, i) => {
    const min = i;
    const max = i + 1;
    const count = data.association_rules.filter((r) => r.lift >= min && r.lift < max).length;
    return { range: `${min}-${max}`, count };
  });

  // NEW 2: Antecedent → Consequent lift Top-12 (bar)
  const pairLiftData = data.association_rules
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 12)
    .map((r) => ({
      pair: `${r.antecedents.join('+')}→${r.consequents.join('+')}`,
      lift: r.lift,
    }));

  // NEW 3: Cumulative item frequency (Pareto)
  const cumulativeData = itemFrequencyData.map((item, idx, arr) => ({
    ...item,
    cumulative: arr.slice(0, idx + 1).reduce((sum, v) => sum + v.frequency, 0),
  }));

  // NEW 4: Top association rules table (Top-10 by lift)
  const topRules = data.association_rules
    .slice()
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 10);

  // Bonus: Rule length distribution (keeps even count of cards)
  const lengthCounts: Record<number, number> = {};
  data.association_rules.forEach((r) => {
    const len = r.antecedents.length + r.consequents.length;
    lengthCounts[len] = (lengthCounts[len] || 0) + 1;
  });
  const ruleLengthData = Object.entries(lengthCounts)
    .map(([len, count]) => ({ length: Number(len), count }))
    .sort((a, b) => a.length - b.length);

  const chartConfig = {
    frequency: { label: 'Frequency', color: 'hsl(var(--chart-1))' },
    confidence: { label: 'Confidence', color: 'hsl(var(--chart-2))' },
    lift: { label: 'Lift', color: 'hsl(var(--chart-3))' },
    count: { label: 'Count', color: 'hsl(var(--chart-4))' },
    support: { label: 'Support', color: 'hsl(var(--chart-5))' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Item Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Item Frequency Distribution</CardTitle>
          <CardDescription>Most frequently purchased items</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={itemFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
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
              <Bar dataKey="frequency" fill="var(--color-frequency)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie */}
      <Card>
        <CardHeader>
          <CardTitle>Top Items Distribution</CardTitle>
          <CardDescription>Proportion of top selling items</CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* Scatter: Confidence vs Lift */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence vs Lift Analysis</CardTitle>
          <CardDescription>Association rules quality visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Confidence" unit="%" />
              <YAxis dataKey="y" name="Lift" />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'x' ? 'Confidence (%)' : name === 'y' ? 'Lift' : name,
                ]}
              />
              <Scatter dataKey="y" fill="var(--color-lift)" />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Radar: Frequent Itemset Support */}
      <Card>
        <CardHeader>
          <CardTitle>Frequent Itemset Support</CardTitle>
          <CardDescription>Support levels for item combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <RadarChart outerRadius={90} data={pivotData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Support"
                dataKey="support"
                stroke="var(--color-support)"
                fill="var(--color-support)"
                fillOpacity={0.6}
              />
              <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => [`${v}%`, 'Support']} />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bubble-like Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Strength Analysis</CardTitle>
          <CardDescription>Bubble chart showing confidence, lift and support</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ScatterChart data={bubbleData}>
              <CartesianGrid strokeDasharray="3 3" />
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
              <Scatter dataKey="z" fill="var(--color-support)" />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* NEW: Lift Distribution Histogram */}
      <Card>
        <CardHeader>
          <CardTitle>Lift Distribution</CardTitle>
          <CardDescription>Distribution of lift values for association rules</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={liftHistogramData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-lift)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* NEW: Antecedent → Consequent Lift (Top-12) */}
      <Card>
        <CardHeader>
          <CardTitle>Antecedent → Consequent (Top by Lift)</CardTitle>
          <CardDescription>Pairs with strongest associations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={pairLiftData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pair" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="lift" fill="var(--color-lift)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* NEW: Cumulative Item Frequency (Pareto) */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Item Frequency</CardTitle>
          <CardDescription>Pareto-style cumulative contribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="cumulative" stroke="var(--color-frequency)" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Support Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Support Distribution</CardTitle>
          <CardDescription>Distribution of rule support values</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={supportDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Radial Confidence Histogram */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Distribution</CardTitle>
          <CardDescription>Radial histogram of rule confidence</CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* NEW: Top Association Rules (Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Association Rules</CardTitle>
          <CardDescription>Highest lift rules (Top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-3">Rule</th>
                  <th className="py-2 pr-3">Support (%)</th>
                  <th className="py-2 pr-3">Confidence (%)</th>
                  <th className="py-2">Lift</th>
                </tr>
              </thead>
              <tbody>
                {topRules.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-3">{r.antecedents.join(', ')} → {r.consequents.join(', ')}</td>
                    <td className="py-2 pr-3">{(r.support * 100).toFixed(2)}</td>
                    <td className="py-2 pr-3">{(r.confidence * 100).toFixed(2)}</td>
                    <td className="py-2">{r.lift.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bonus: Rule Length Distribution (keeps even # of cards) */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Length Distribution</CardTitle>
          <CardDescription>Total items per rule (antecedent + consequent)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={ruleLengthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="length" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Visualizations;
