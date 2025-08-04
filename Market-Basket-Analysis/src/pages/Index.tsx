import AnalysisResults from '@/components/AnalysisResults';
import FileUpload from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Visualizations from '@/components/Visualizations';
import { BarChart3, Layers3, Lightbulb, Map, PackagePlus, TrendingUp, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';

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
function titleCase(s: string) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}

function pct(x: number, digits = 2) {
  return (x * 100).toFixed(digits) + '%';
}

function topNByValue<T extends Record<string, number>>(obj: T, n: number) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

const Recommendations = ({ data }: { data: AnalysisData }) => {

  const { topItem, top5, totalUnits } = useMemo(() => {
    const entries = Object.entries(data.item_frequency);
    const totalUnits = entries.reduce((s, [, c]) => s + Number(c), 0);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return {
      topItem: sorted[0] ? { name: sorted[0][0], units: sorted[0][1] } : null,
      top5: sorted.slice(0, 5),
      totalUnits,
    };
  }, [data]);
  const topRulesByLift = useMemo(() => {
    const MIN_SUPPORT = 0.005;
    const MIN_CONFIDENCE = 0.1;
    return data.association_rules
      .filter(r => r.support >= MIN_SUPPORT && r.confidence >= MIN_CONFIDENCE)
      .slice()
      .sort((a, b) => b.lift - a.lift)
      .slice(0, 10);
  }, [data]);

  const coLocationSentences = useMemo(() => {
    return topRulesByLift.map((r, i) => {
      const A = r.antecedents.join(', ');
      const C = r.consequents.join(', ');
      return (
        <li key={i} className="mb-2 font-light">
          When shoppers buy <strong className="font-medium">{A}</strong>, they are <strong className="font-medium">{r.lift.toFixed(2)}×</strong> more likely to also buy <strong className="font-medium">{C}</strong>{' '}
          (support {pct(r.support, 2)}, confidence {pct(r.confidence, 1)}). Place <strong className="font-medium">{C}</strong> near <strong className="font-medium">{A}</strong> to boost attach rate.
        </li>
      );
    });
  }, [topRulesByLift]);
  const bundleSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const lines: string[] = [];
    topRulesByLift.forEach(r => {
      const key = [...r.antecedents, ...r.consequents].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      const items = [...r.antecedents, ...r.consequents];
      if (items.length >= 2) {
        lines.push(
          `Create a themed display/bundle for: ${items.map(titleCase).join(' + ')} (lift up to ${r.lift.toFixed(2)}).`
        );
      }
    });
    return lines.slice(0, 6);
  }, [topRulesByLift]);

  const layoutHeuristics = useMemo(() => {
    const tips: string[] = [];
    if (topItem) {
      tips.push(`"${titleCase(topItem.name)}" is your highest-selling product (${topItem.units.toLocaleString()} units, ~${pct(topItem.units / Math.max(totalUnits, 1), 1)} of units). Keep it at eye level and fully faced; use it as an anchor for cross-merch.`);
    }

    const anchorNames = top5.map(([name]) => name);
    if (anchorNames.length) {
      tips.push(
        `Use anchors: ${anchorNames.map(titleCase).join(', ')}. Surround each anchor with 2–3 high-lift complements (from rules) to drive add-to-basket.`
      );
    }
    tips.push(
      'Endcaps: feature top bundles and seasonal themes (e.g., "Taco Night", "Pasta Night") to raise visibility and impulse pickup.'
    );
    tips.push(
      'Checkout zone: place low-price, high-velocity add-ons (snacks, candy, small dairy, bottled drinks) for impulse conversion.'
    );
    tips.push(
      'Pathing: position essentials deeper in-store so shoppers traverse complementary aisles; place related categories adjacently.'
    );
    tips.push(
      'Margin mix: next to best sellers, place 1–2 higher-margin complements (e.g., premium variants, toppings, sauces).'
    );
    tips.push(
      'Private label strategy: co-locate private label right next to national brand best sellers to capture trade-down without losing the sale.'
    );
    tips.push(
      'Signage: translate association rules into micro-signs ("Most customers who buy Yogurt also add Curd"). Keep copy short and specific.'
    );
    return tips;
  }, [top5, topItem, totalUnits]);

  return (
    <div className="space-y-6 font-sans">
      <Card className="font-sans">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Key Findings
          </CardTitle>
          <CardDescription className="font-sans">Top sellers and quick wins from your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topItem ? (
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground font-light">Highest-selling product</div>
              <div className="text-xl font-semibold">{titleCase(topItem.name)}</div>
              <div className="text-sm font-sans">
                Units: <strong className="font-medium">{topItem.units.toLocaleString()}</strong> • Share of units:{' '}
                <strong className="font-medium">{pct(topItem.units / Math.max(totalUnits, 1), 2)}</strong>
              </div>
              <div className="mt-2 text-sm font-light">
                Recommendation: Keep <strong className="font-medium">{titleCase(topItem.name)}</strong> at eye level and in high-traffic zones.
                Use it as an anchor to promote complementary items from the rules below.
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground font-light">No item frequency found.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center mb-2">
                <PackagePlus className="h-4 w-4 mr-2" />
                <span className="font-semibold">Top 5 Selling Products</span>
              </div>
              <ol className="list-decimal ml-5 text-sm space-y-1 font-light">
                {top5.map(([name, units]) => (
                  <li key={name}>
                    <span className="font-medium">{titleCase(name)}</span> — <span className="text-muted-foreground">{units.toLocaleString()} units</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center mb-2">
                <Layers3 className="h-4 w-4 mr-2" />
                <span className="font-semibold">Quick Wins</span>
              </div>
              <ul className="list-disc ml-5 text-sm space-y-1 font-light">
                <li>Face up top sellers and ensure 0 stockouts during peak hours.</li>
                <li>Co-locate high-lift consequents next to anchors (see below).</li>
                <li>Promote bundles as "Buy Together & Save" or recipe kits.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Map className="h-5 w-5 mr-2 text-primary" />
            Co-Location & Cross-Sell (from Association Rules)
          </CardTitle>
          <CardDescription className="font-sans">Turn high-lift rules into shelf adjacency</CardDescription>
        </CardHeader>
        <CardContent>
          {coLocationSentences.length ? (
            <ul className="list-disc ml-5 text-sm font-light">{coLocationSentences}</ul>
          ) : (
            <div className="text-sm text-muted-foreground font-light">No strong rules found to suggest co-location.</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
            Bundle & Themed Displays
          </CardTitle>
          <CardDescription className="font-sans">Convert patterns into shoppable ideas</CardDescription>
        </CardHeader>
        <CardContent>
          {bundleSuggestions.length ? (
            <ul className="list-disc ml-5 text-sm space-y-1 font-light">
              {bundleSuggestions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground font-light">No bundle suggestions available.</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Store-Wide Placement Strategies
          </CardTitle>
          <CardDescription className="font-sans">Best practices informed by your data</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-5 text-sm space-y-1 font-light">
            {layoutHeuristics.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Top Association Rules (by Lift)</CardTitle>
          <CardDescription className="font-sans">Reference for decisions (Top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          {topRulesByLift.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-light">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-3 font-medium">Rule</th>
                    <th className="py-2 pr-3 font-medium">Support</th>
                    <th className="py-2 pr-3 font-medium">Confidence</th>
                    <th className="py-2 font-medium">Lift</th>
                  </tr>
                </thead>
                <tbody>
                  {topRulesByLift.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3">
                        {r.antecedents.join(', ')} → {r.consequents.join(', ')}
                      </td>
                      <td className="py-2 pr-3">{pct(r.support, 2)}</td>
                      <td className="py-2 pr-3">{pct(r.confidence, 2)}</td>
                      <td className="py-2">{r.lift.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground font-light">No rules to display.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: AnalysisData = await response.json();
      setAnalysisData(data);

      toast({
        title: 'Analysis Complete',
        description: `Found ${data.association_rules.length} association rules from ${data.total_transactions} transactions.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Please make sure your Flask backend is running on localhost:5000',
        variant: 'destructive',
      });

      const demoData: AnalysisData = {
        frequent_itemsets: [
          { itemset: ['whole milk'], support: 0.255 },
          { itemset: ['other vegetables'], support: 0.193 },
          { itemset: ['rolls/buns'], support: 0.183 },
          { itemset: ['yogurt'], support: 0.139 },
          { itemset: ['whole milk', 'other vegetables'], support: 0.074 },
        ],
        association_rules: [
          { antecedents: ['yogurt', 'whole milk'], consequents: ['curd'], support: 0.0101, confidence: 0.1797, lift: 3.37 },
          { antecedents: ['curd'], consequents: ['yogurt', 'whole milk'], support: 0.0101, confidence: 0.1889, lift: 3.37 },
          { antecedents: ['citrus fruit', 'other vegetables'], consequents: ['root vegetables'], support: 0.0104, confidence: 0.3592, lift: 3.30 },
          { antecedents: ['root vegetables'], consequents: ['citrus fruit', 'other vegetables'], support: 0.0104, confidence: 0.0951, lift: 3.30 },
          { antecedents: ['yogurt', 'other vegetables'], consequents: ['whipped/sour cream'], support: 0.0102, confidence: 0.2342, lift: 3.27 },
          { antecedents: ['butter'], consequents: ['whole milk'], support: 0.027, confidence: 0.497, lift: 1.946 },
          { antecedents: ['yogurt'], consequents: ['whole milk'], support: 0.056, confidence: 0.402, lift: 1.571 },
        ],
        item_frequency: {
          'whole milk': 2513,
          'other vegetables': 1903,
          'rolls/buns': 1809,
          'soda': 1715,
          'yogurt': 1372,
          'bottled water': 1087,
          'root vegetables': 1072,
          'tropical fruit': 1032,
          'shopping bags': 969,
          'sausage': 924,
          'curd': 400,
        },
        total_transactions: 9835,
      };
      setAnalysisData(demoData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Market Basket Analysis</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Discover hidden patterns in customer purchase behavior using the FP-Growth algorithm.
            Upload your transaction data to get insights, visualizations, and store-ready recommendations.
          </p>
        </div>
        {!analysisData ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center font-bold">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">1. Upload Data</h3>
                    <p className="text-sm text-muted-foreground font-light">Upload your CSV transaction data</p>
                  </div>
                  <div className="text-center p-4">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">2. Analyze</h3>
                    <p className="text-sm text-muted-foreground font-light">FP-Growth algorithm finds patterns</p>
                  </div>
                  <div className="text-center p-4">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">3. Get Insights</h3>
                    <p className="text-sm text-muted-foreground font-light">View recommendations & visualizations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results" className="font-medium">Analysis Results</TabsTrigger>
              <TabsTrigger value="visualizations" className="font-medium">Visualizations</TabsTrigger>
              <TabsTrigger value="recommendations" className="font-medium">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="mt-6">
              <AnalysisResults data={analysisData} />
            </TabsContent>

            <TabsContent value="visualizations" className="mt-6">
              <Visualizations data={analysisData} />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <Recommendations data={analysisData} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;